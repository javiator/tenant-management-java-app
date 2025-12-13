# AWS Low-Cost Development Environment Guide

## Overview
This approach provides a highly cost-effective development environment by consolidating all application components onto a **single EC2 instance**. Instead of paying for managed services like RDS, ALB, or NAT Gateways, we run the database, backend, and frontend as containers Orchestrated by Docker Compose on one `t3.small` server.

## Architecture

![Low-Cost Architecture](generated-diagrams/lowcost_architecture.png)

### Key Components
1.  **Single EC2 Instance**: A `t3.small` instance hosts the entire stack.
    -   Host OS: Amazon Linux 2023
    -   Runtime: Docker Engine + Docker Compose
2.  **Containerized Database**: PostgreSQL 16 runs as a Docker container, persisting data to an EBS volume mapping. This eliminates the ~$15/month minimum cost of an RDS instance.
3.  **Public Subnet Access**: The instance sits in a Public Subnet, accessible via **Instance Connect** or SSH. We rely on Security Groups (firewalls) restricted to our IP (or open ports 80/443 for web access) rather than expensive Load Balancers.
4.  **CI/CD**: Full automation via CodePipeline:
    -   **CodeBuild**: Builds Docker images and pushes to ECR.
    -   **CodeDeploy**: Triggers an on-instance script to pull new images and restart `docker-compose`.
    -   **SSM Parameter Store**: Securely stores secrets (DB Password, API Keys) which are injected at runtime.

## Cost Analysis (Estimated)

| Component | Specification | Approx. Monthly Cost (Region: us-east-1) |
| :--- | :--- | :--- |
| **Compute** | EC2 `t3.small` (2 vCPU, 2GB RAM) | ~$15.00 |
| **Storage** | EBS Volume (gp3, 30GB) | ~$2.40 |
| **Database** | Self-Hosted in Docker | **$0.00** (Included in Compute) |
| **Network** | Public IPv4 Address | ~$3.60 ($0.005/hr) |
| **CI/CD** | CodePipeline (1 Active) | ~$1.00 (Often Free Tier eligible) |
| **Registry** | ECR (Storage + Transfer) | ~$0.50 (Based on usage) |
| **Total** | | **~$22.50 / Month** |

*Comparison*: A "standard" setup with Managed RDS (`db.t3.micro`), 2 App Runner instances, and NAT Gateway easily exceeds **$100/month**. This approach reduces cost by ~75% for development purposes.

## Deployment Instructions

### 1. Prerequisites
-   **GitHub Connection**: Ensure the AWS Connector for GitHub is active.
-   **Secrets**: Update `terraform.tfvars` with:
    -   `db_password`: Secure password for the containerized DB.
    -   `gemini_api_key`: Your AI service key.

### 2. Infrastructure
Provision the environment using Terraform:
```bash
cd infrastructure/terraform-lowcost
terraform init
terraform apply
```

### 3. CI/CD Flow
1.  **Push to Git**: Changes to `feature/aws-lowcost-deployment` trigger the pipeline.
2.  **Build**: CodeBuild creates images for Backend and Frontend.
3.  **Deploy**: CodeDeploy notifies the EC2 instance.
    -   The `start_server.sh` script runs on the instance.
    -   It fetches secrets from SSM.
    -   It pulls the latest images from ECR.
    -   It restarts `docker compose up -d`.

### 4. Verification
1.  **Find Instance IP**: Get the public IP of the `lowcost-env-app-server` from the AWS Console.
2.  **Access App**:
    -   Frontend: `http://<EC2-PUBLIC-IP>:3000` (Port 80 mapped to 3000)
    -   Backend API: `http://<EC2-PUBLIC-IP>:8080/api/...`
3.  **Check Logs**: SSH into the instance to inspect container logs:
    ```bash
    docker logs tenant-backend
    docker logs tenant-db
    ```

## Trade-offs
-   **Single Point of Failure**: If the EC2 instance dies, the app and DB are down.
-   **Data Durability**: Data is persisted to EBS. Snapshots should be automated for backups.
-   **Scaling**: Manual vertical scaling (resize instance) only. No auto-scaling.
-   **Maintenance**: OS updates and Docker management are user responsibilities.

This environment is **ideal for development, testing, and demos**, but **not recommended for production** without redundancy and backups.
