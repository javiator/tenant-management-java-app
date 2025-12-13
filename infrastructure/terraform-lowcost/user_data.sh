#!/bin/bash
dnf update -y
dnf install -y docker ruby wget
systemctl enable --now docker
usermod -aG docker ec2-user

# Install CodeDeploy Agent
cd /home/ec2-user
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
./install auto
systemctl enable --now codedeploy-agent

# Install Docker Compose
dnf install -y docker-compose-plugin

# Create project dir
mkdir -p /home/ec2-user/app
chown ec2-user:ec2-user /home/ec2-user/app
