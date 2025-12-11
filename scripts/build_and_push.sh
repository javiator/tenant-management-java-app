#!/bin/bash
set -e

# Usage: ./scripts/build_and_push.sh <aws_region> <aws_account_id>

REGION=${1:-us-east-1}
ACCOUNT_ID=$2

if [ -z "$ACCOUNT_ID" ]; then
    echo "Usage: $0 <aws_region> <aws_account_id>"
    echo "Example: $0 us-east-1 123456789012"
    exit 1
fi

echo "Logging in to ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

echo "Building Backend..."
docker build -t tenant-management-backend ./backend
docker tag tenant-management-backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/tenant-management-backend:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/tenant-management-backend:latest

echo "Building Frontend..."
docker build -t tenant-management-frontend ./frontend
docker tag tenant-management-frontend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/tenant-management-frontend:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/tenant-management-frontend:latest

echo "Done! Images pushed."
