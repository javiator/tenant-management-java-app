# AWS Elastic Beanstalk Deployment Guide

## Overview
This guide documents the deployment of the Tenant Management System using **AWS Elastic Beanstalk (Docker Platform)**. This approach uses a `docker-compose.yml` file to orchestrate the Backend and Frontend containers on instances managed by Elastic Beanstalk.

## Architecture
-   **VPC**: `beanstalk-env-vpc` with Public and Private Subnets.
-   **Database**: RDS PostgreSQL 16.6 (`db.t4g.micro`) in Private Subnets.
-   **Compute**: Elastic Beanstalk Environment `beanstalk-env` running **Docker on Amazon Linux 2023**.
    -   Instance Type: `t3.medium` (Managed by Auto Scaling).
    -   Load Balancer: Application Load Balancer (ALB).
-   **CI/CD**: AWS CodePipeline + CodeBuild.
    -   Source: GitHub (`feature/aws-beanstalk-deployment`).
    -   Build: CodeBuild builds Docker images, pushes to ECR, and generates `docker-compose.yml`.
    -   Deploy: CodePipeline deploys the `docker-compose.yml` to Elastic Beanstalk.

## Deployment Steps

### 1. Prerequisites
-   AWS CLI configured.
-   Terraform installed.
-   GitHub connection ARN available.

### 2. Infrastructure Provisioning (Terraform)
The infrastructure is defined in `infrastructure/terraform-beanstalk`.

```bash
cd infrastructure/terraform-beanstalk
terraform init
terraform apply
```

This creates:
-   VPC & Networking.
-   RDS Database (Username/Password set in `terraform.tfvars`).
-   ECR Repositories.
-   Elastic Beanstalk Application & Environment.
-   CodePipeline & CodeBuild Project.

### 3. Application Configuration
-   **Environment Variables**: Configured in `beanstalk.tf` -> `aws:elasticbeanstalk:application:environment`.
    -   `SPRING_PROFILES_ACTIVE=prod`
    -   `SPRING_DATASOURCE_URL`, `USERNAME`, `PASSWORD`
    -   `GEMINI_API_KEY`, `GEMINI_MODEL`
-   **Docker Compose**: The `buildspec-beanstalk.yml` dynamically generates a `docker-compose.yml` with the correct ECR image URIs during the build phase. This file is then passed to Elastic Beanstalk.

## Verification
-   **Environment URL**: `http://beanstalk-env.eba-bbgvurme.us-east-1.elasticbeanstalk.com` (Example)
-   **Health Check**: Access root URL or `/health` endpoint of frontend.

## Key Files
-   `infrastructure/terraform-beanstalk/`: Terraform configuration.
-   `buildspec-beanstalk.yml`: Build instructions for CodeBuild.
-   `docker-compose-beanstalk.yml`: Template for the Docker Compose file used by Beanstalk.

## Troubleshooting
-   **Logs**:
    -   Go to Elastic Beanstalk Console -> `beanstalk-env` -> Logs -> Request Last 100 Lines.
    -   Full logs available in S3 (if configured) or CloudWatch Logs (if enabled).
-   **Database Connectivity**:
    -   The EC2 instances are in Public/Private subnets (depending on config) but access RDS via the `db-sg` allowing traffic from `beanstalk-ec2-sg`.
