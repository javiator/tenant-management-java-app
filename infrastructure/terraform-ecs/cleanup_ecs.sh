#!/bin/bash
set -e

# Configuration
REGION="us-east-1"
ENV_TAG="ecs-demo"
CLUSTER_NAME="cluster-ecs-demo"
VPC_NAME="vpc-ecs-demo"
DB_ID="tenantdb"

echo "WARNING: This script will delete ALL resources associated with the ECS Demo environment."
echo "Resources to be deleted:"
echo "- ECS Cluster: $CLUSTER_NAME"
echo "- VPC: $VPC_NAME (and dependencies)"
echo "- RDS: $DB_ID"
echo "- CodePipeline: pipeline-$ENV_TAG"
echo "- ECR Repositories"
echo ""
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo "--- 1. Deleting ECR Repositories ---"
aws ecr delete-repository --repository-name tenant-management-backend --force --region $REGION || echo "Backend repo not found"
aws ecr delete-repository --repository-name tenant-management-frontend --force --region $REGION || echo "Frontend repo not found"

echo "--- 2. Deleting CodePipeline & CodeBuild ---"
aws codepipeline delete-pipeline --name pipeline-$ENV_TAG --region $REGION || echo "Pipeline not found"
aws codebuild delete-project --name build-$ENV_TAG --region $REGION || echo "Project not found"
# Cleanup S3 Bucket (Find bucket by name pattern)
BUCKET=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'codepipeline-$ENV_TAG')].Name" --output text)
if [ ! -z "$BUCKET" ]; then
    echo "Emptying and deleting S3 bucket: $BUCKET"
    aws s3 rb s3://$BUCKET --force
fi

echo "--- 3. Deleting ECS Services & Cluster ---"
# Scale down services to 0
aws ecs update-service --cluster $CLUSTER_NAME --service backend-service --desired-count 0 --region $REGION || echo "Backend service not found"
aws ecs update-service --cluster $CLUSTER_NAME --service frontend-service --desired-count 0 --region $REGION || echo "Frontend service not found"
echo "Waiting for services to drain..."
sleep 10
# Delete services
aws ecs delete-service --cluster $CLUSTER_NAME --service backend-service --force --region $REGION || echo "Backend serv not found"
aws ecs delete-service --cluster $CLUSTER_NAME --service frontend-service --force --region $REGION || echo "Frontend serv not found"
# Delete Cluster
aws ecs delete-cluster --cluster $CLUSTER_NAME --region $REGION || echo "Cluster not found"

echo "--- 4. Deleting Load Balancer ---"
ALB_ARN=$(aws elbv2 describe-load-balancers --names alb-$ENV_TAG --query "LoadBalancers[0].LoadBalancerArn" --output text --region $REGION || echo "")
if [ ! -z "$ALB_ARN" ]; then
    aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN --region $REGION
    echo "Deleted ALB: $ALB_ARN"
    sleep 5 # Wait for deletion
fi
# Target Groups
TG_BACKEND=$(aws elbv2 describe-target-groups --names tg-backend-$ENV_TAG --query "TargetGroups[0].TargetGroupArn" --output text --region $REGION || echo "")
if [ ! -z "$TG_BACKEND" ]; then aws elbv2 delete-target-group --target-group-arn $TG_BACKEND --region $REGION; fi
TG_FRONTEND=$(aws elbv2 describe-target-groups --names tg-frontend-$ENV_TAG --query "TargetGroups[0].TargetGroupArn" --output text --region $REGION || echo "")
if [ ! -z "$TG_FRONTEND" ]; then aws elbv2 delete-target-group --target-group-arn $TG_FRONTEND --region $REGION; fi

echo "--- 5. Deleting RDS ---"
# We need to find the Instance Identifier if 'tenantdb' is the DB Name not ID.
# In rds.tf: db_name="tenantdb", but identifier defaults to terraform-xxxx usually unless specified.
# However, we can search by tag? The best way is to list by engine.
DB_INSTANCE=$(aws rds describe-db-instances --query "DBInstances[?DBName=='tenantdb'].DBInstanceIdentifier" --output text --region $REGION)
if [ ! -z "$DB_INSTANCE" ]; then
    echo "Deleting RDS Instance: $DB_INSTANCE"
    aws rds delete-db-instance --db-instance-identifier $DB_INSTANCE --skip-final-snapshot --delete-automated-backups --region $REGION
    echo "Waiting for RDS deletion (this takes time, running in background)..."
    # We won't wait here to keep script fast
fi

echo "--- 6. Deleting VPC ---"
# This is tricky because of dependencies (IGW, NAT, Subnets, ENIs).
# We will use a simple strategy: Find VPC by tag, then delete dependencies.
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Environment,Values=$ENV_TAG" --query "Vpcs[0].VpcId" --output text --region $REGION)

if [ "$VPC_ID" != "None" ] && [ ! -z "$VPC_ID" ]; then
    echo "Found VPC: $VPC_ID. Attempting cleanup..."
    
    # Delete NAT Gateways
    NAT_GWS=$(aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$VPC_ID" --query "NatGateways[*].NatGatewayId" --output text --region $REGION)
    for nat in $NAT_GWS; do
        echo "Deleting NAT Gateway: $nat"
        aws ec2 delete-nat-gateway --nat-gateway-id $nat --region $REGION
    done
    
    echo "Waiting for NAT Gateways to delete (required for VPC delete)..."
    sleep 30 
    
    # Delete Subnets
    SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[*].SubnetId" --output text --region $REGION)
    for sub in $SUBNETS; do
        aws ec2 delete-subnet --subnet-id $sub --region $REGION || echo "Failed to delete subnet $sub (might have ENIs)"
    done

    # Delete IGW
    IGWS=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --query "InternetGateways[*].InternetGatewayId" --output text --region $REGION)
    for igw in $IGWS; do
        aws ec2 detach-internet-gateway --internet-gateway-id $igw --vpc-id $VPC_ID --region $REGION
        aws ec2 delete-internet-gateway --internet-gateway-id $igw --region $REGION
    done

    # Finally Delete VPC
    aws ec2 delete-vpc --vpc-id $VPC_ID --region $REGION || echo "Could not delete VPC $VPC_ID yet (dependencies exist). Please delete manually via Console."
fi

echo "--- Cleanup Initiated ---"
echo "Note: RDS and VPC might take longer to fully delete. Check AWS Console to confirm."
