#!/bin/bash
apt-get update -y
apt-get install -y ca-certificates curl gnupg ruby wget unzip nfs-common

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Install Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker
usermod -aG docker ubuntu

# Mount EFS
mkdir -p /mnt/efs
EFS_ID=$(aws efs describe-file-systems --query "FileSystems[?Tags[?Key=='Environment' && Value=='${environment}']].FileSystemId" --output text --region ${region})
mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport $EFS_ID.efs.${region}.amazonaws.com:/ /mnt/efs

# Create directories on EFS
mkdir -p /mnt/efs/postgres
mkdir -p /mnt/efs/app
chown -R 999:999 /mnt/efs/postgres
chown -R ubuntu:ubuntu /mnt/efs/app

# Add to fstab for auto-mount on reboot
echo "$EFS_ID.efs.${region}.amazonaws.com:/ /mnt/efs nfs4 nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport,_netdev 0 0" >> /etc/fstab

# Symlink for CodeDeploy compatibility
ln -sf /mnt/efs/app /home/ubuntu/app

# Install CodeDeploy Agent
cd /home/ubuntu
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
./install auto
systemctl enable --now codedeploy-agent

# Auto-start application if already deployed on EFS
if [ -f /mnt/efs/app/docker-compose-lowcost.yml ]; then
  echo "Application found on EFS, starting containers..."
  cd /mnt/efs/app
  
  # Fetch secrets from SSM
  DB_PASSWORD=$(aws ssm get-parameter --name "/${environment}/db_password" --with-decryption --query 'Parameter.Value' --output text --region ${region})
  GEMINI_API_KEY=$(aws ssm get-parameter --name "/${environment}/gemini_api_key" --with-decryption --query 'Parameter.Value' --output text --region ${region})
  
  # Create .env file
  cat <<EOF > .env
DB_PASSWORD=$DB_PASSWORD
GEMINI_API_KEY=$GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
AWS_REGION=${region}
AWS_LOG_GROUP=/app/${environment}
EOF
  
  # Login to ECR
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.${region}.amazonaws.com
  
  # Start containers
  docker compose -f docker-compose-lowcost.yml up -d
  
  echo "Application started successfully"
fi
