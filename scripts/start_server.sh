#!/bin/bash
set -e

REGION="us-east-1"
ENV_NAME="lowcost-env"

# Deploy to EFS location (symlinked to /home/ubuntu/app)
cd /home/ubuntu/app

echo "Fetching parameters from SSM..."
DB_PASSWORD=$(aws ssm get-parameter --name "/$ENV_NAME/db_password" --with-decryption --query "Parameter.Value" --output text --region $REGION)
GEMINI_API_KEY=$(aws ssm get-parameter --name "/$ENV_NAME/gemini_api_key" --with-decryption --query "Parameter.Value" --output text --region $REGION)

echo "Changing ownership of app directory..."
chown -R ubuntu:ubuntu /home/ubuntu/app

echo "Creating .env file..."
cat <<EOF > .env
DB_PASSWORD=$DB_PASSWORD
GEMINI_API_KEY=$GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
AWS_REGION=$REGION
AWS_LOG_GROUP=/app/$ENV_NAME
EOF

echo "Logging into ECR..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

echo "Starting Application..."
docker compose -f docker-compose-lowcost.yml pull
docker compose -f docker-compose-lowcost.yml up -d --remove-orphans

echo "Pruning old images..."
docker image prune -a -f --filter "until=24h"
