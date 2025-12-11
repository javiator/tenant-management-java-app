#!/bin/bash
set -e

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="tenant-management-tf-state-$ACCOUNT_ID"

echo "Using AWS Account: $ACCOUNT_ID"
echo "Region: $REGION"

# 1. Create S3 Bucket
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo "Bucket $BUCKET_NAME already exists."
else
    echo "Creating bucket $BUCKET_NAME..."
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
    
    # Enable Versioning (Vital for recovery if state gets corrupted)
    aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" --versioning-configuration Status=Enabled
    
    # Enable Encryption
    aws s3api put-bucket-encryption --bucket "$BUCKET_NAME" --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'
    
    # Block Public Access (Security Best Practice)
    aws s3api put-public-access-block --bucket "$BUCKET_NAME" --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
fi

echo ""
echo "✅ S3 Backend Ready: $BUCKET_NAME"
echo "Skipping DynamoDB Locking as requested."
echo ""

# 3. Generate backend.tf
mkdir -p infrastructure/terraform-ec2

cat > infrastructure/terraform-ec2/backend.tf <<EOF
terraform {
  backend "s3" {
    bucket  = "$BUCKET_NAME"
    key     = "ec2-demo/terraform.tfstate"
    region  = "$REGION"
    encrypt = true
    # dynamodb_table = "..." (Locking disabled)
  }
}
EOF

echo "Generated infrastructure/terraform-ec2/backend.tf"
