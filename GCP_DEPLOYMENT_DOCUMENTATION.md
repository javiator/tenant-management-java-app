# Tenant Management System - GCP Cloud Run Deployment

## Complete Documentation

**Version**: 1.0  
**Last Updated**: December 2025  
**Deployment Type**: Cloud Run + Cloud SQL (Shared-Core)  
**Estimated Cost**: $18-22/month

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Infrastructure Components](#infrastructure-components)
3. [Networking & Security](#networking--security)
4. [Initial Deployment](#initial-deployment)
5. [Application Usage](#application-usage)
6. [Code Updates & Redeployment](#code-updates--redeployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Cost Management](#cost-management)
10. [Disaster Recovery](#disaster-recovery)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS (443)
                       │
        ┌──────────────▼──────────────┐
        │   Google Cloud Load Balancer │
        │   (Managed by Cloud Run)     │
        └──────────────┬──────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         │                           │
┌────────▼────────┐         ┌────────▼────────┐
│  Cloud Run      │         │  Cloud Run      │
│  Frontend       │         │  Backend        │
│  (React/Nginx)  │────────▶│  (Spring Boot)  │
│  Port: 8080     │  /api/* │  Port: 8080     │
└─────────────────┘         └────────┬────────┘
                                     │
                                     │ Cloud SQL Proxy
                                     │ (Unix Socket)
                                     │
                            ┌────────▼────────┐
                            │   Cloud SQL     │
                            │   PostgreSQL 16 │
                            │   db-f1-micro   │
                            └─────────────────┘
```

### Technology Stack

**Frontend:**
- React 18
- Material-UI (MUI)
- Nginx (Alpine)
- Port: 8080

**Backend:**
- Java 21
- Spring Boot 3.3.4
- PostgreSQL Driver
- Cloud SQL Socket Factory
- Port: 8080

**Database:**
- PostgreSQL 16
- Cloud SQL (Managed)
- 10GB SSD Storage

**Infrastructure:**
- Terraform (IaC)
- Google Cloud Build (CI/CD)
- Artifact Registry (Docker images)
- Cloud Run (Serverless compute)

---

## Infrastructure Components

### 1. Cloud SQL Database

**Instance Details:**
- **Name**: `tenant-db-{random-suffix}`
- **Type**: `db-f1-micro` (0.6 GB RAM, shared CPU)
- **Version**: PostgreSQL 16
- **Region**: `us-central1`
- **Storage**: 10GB SSD, auto-resize enabled
- **Networking**: Public IP with Cloud SQL Proxy

**Database Configuration:**
- **Database Name**: `tenantdb`
- **User**: `tenant`
- **Password**: Stored in `terraform.tfvars` (git-ignored)

**Connection Method:**
Cloud Run uses the built-in Cloud SQL Proxy via Unix socket:
```
jdbc:postgresql:///tenantdb?cloudSqlInstance=PROJECT:REGION:INSTANCE&socketFactory=com.google.cloud.sql.postgres.SocketFactory
```

### 2. Cloud Run Services

#### Backend Service

**Configuration:**
- **Name**: `tenant-backend`
- **Image**: `us-central1-docker.pkg.dev/PROJECT_ID/tenant-repo/backend:BUILD_ID`
- **CPU**: 1 vCPU
- **Memory**: 512 MB (default)
- **Concurrency**: 80 (default)
- **Min Instances**: 0 (scales to zero)
- **Max Instances**: 10

**Environment Variables:**
```bash
SPRING_PROFILES_ACTIVE=prod
GEMINI_API_KEY=<from terraform.tfvars>
POSTGRES_USER=tenant
POSTGRES_PASSWORD=<from terraform.tfvars>
POSTGRES_DB=tenantdb
POSTGRES_URL=jdbc:postgresql:///tenantdb?cloudSqlInstance=...&socketFactory=...
```

**Annotations:**
```yaml
run.googleapis.com/cloudsql-instances: PROJECT:REGION:INSTANCE
run.googleapis.com/client-name: terraform
```

#### Frontend Service

**Configuration:**
- **Name**: `tenant-frontend`
- **Image**: `us-central1-docker.pkg.dev/PROJECT_ID/tenant-repo/frontend:BUILD_ID`
- **CPU**: 1 vCPU
- **Memory**: 256 MB (default)
- **Concurrency**: 100 (default)
- **Min Instances**: 0 (scales to zero)
- **Max Instances**: 10

**Environment Variables:**
```bash
BACKEND_URL=https://tenant-backend-PROJECT_ID.us-central1.run.app
```

**Nginx Configuration:**
- Listens on port 8080
- Serves static React build from `/usr/share/nginx/html`
- Proxies `/api/*` requests to backend
- Health check endpoint at `/health`

### 3. Artifact Registry

**Repository Details:**
- **Name**: `tenant-repo`
- **Format**: Docker
- **Region**: `us-central1`
- **Images Stored**:
  - `backend:BUILD_ID`
  - `frontend:BUILD_ID`

### 4. Terraform State Storage

**GCS Bucket:**
- **Name**: `tf-state-gen-lang-client-0681882406`
- **Location**: `us-central1`
- **Purpose**: Remote Terraform state storage
- **Versioning**: Enabled

---

## Networking & Security

### Network Architecture

**Public Access:**
- Both Cloud Run services are publicly accessible
- HTTPS enforced automatically by Cloud Run
- SSL/TLS certificates managed by Google

**Database Access:**
- Cloud SQL has a public IP but is NOT directly accessible
- Access only via Cloud SQL Proxy (built into Cloud Run)
- No VPC Connector required (cost optimization)

**IAM Permissions:**
- Cloud Run services: `allUsers` with `roles/run.invoker` (unauthenticated access)
- Cloud SQL: Accessed via service account with Cloud SQL Client role

### Security Features

1. **Secrets Management:**
   - Database password stored in `terraform.tfvars` (git-ignored)
   - Gemini API key stored in `terraform.tfvars` (git-ignored)
   - Passed as environment variables to Cloud Run

2. **Network Security:**
   - All traffic encrypted in transit (HTTPS/TLS)
   - Cloud SQL Proxy provides encrypted connection to database
   - No direct database access from internet

3. **Container Security:**
   - Minimal base images (Alpine Linux)
   - Non-root user execution
   - Read-only root filesystem where possible

### Firewall Rules

**Default VPC:**
- Uses Google Cloud's default VPC network
- No custom firewall rules required
- Cloud Run manages ingress/egress automatically

---

## Initial Deployment

### Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed and authenticated
3. **Terraform** installed (v1.0+)
4. **Git** repository cloned locally

### Step 1: Authenticate with Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set active project
gcloud config set project gen-lang-client-0681882406

# Enable Application Default Credentials for Terraform
gcloud auth application-default login
```

### Step 2: Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  compute.googleapis.com
```

### Step 3: Configure Secrets

Edit `infrastructure/terraform-gcp-cloudrun/terraform.tfvars`:

```hcl
db_password    = "your-secure-database-password"
gemini_api_key = "your-gemini-api-key"
```

**Important:** This file is git-ignored. Never commit it to version control.

### Step 4: Initialize Terraform

```bash
cd infrastructure/terraform-gcp-cloudrun
terraform init
```

Expected output:
```
Initializing the backend...
Successfully configured the backend "gcs"!
Terraform has been successfully initialized!
```

### Step 5: Plan Infrastructure

```bash
terraform plan
```

Review the plan. You should see:
- 10 resources to be created
- Cloud SQL instance, database, and user
- 2 Cloud Run services (backend, frontend)
- Artifact Registry repository
- IAM bindings

### Step 6: Apply Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This takes approximately 10-15 minutes.

**Note:** Cloud Run services will initially deploy with a "Hello World" placeholder image.

### Step 7: Build and Deploy Application

From the project root:

```bash
cd ../..  # Return to project root
gcloud builds submit --config=cloudbuild.yaml .
```

This process:
1. Builds backend Docker image (~3 minutes)
2. Builds frontend Docker image (~3 minutes)
3. Pushes images to Artifact Registry
4. Deploys backend to Cloud Run (~1 minute)
5. Deploys frontend to Cloud Run (~1 minute)

Total time: ~8-10 minutes

### Step 8: Verify Deployment

```bash
# Get service URLs
terraform output

# Test backend
curl https://tenant-backend-1084884913897.us-central1.run.app/actuator/health

# Test frontend
curl https://tenant-frontend-1084884913897.us-central1.run.app/
```

---

## Application Usage

### Accessing the Application

**Frontend URL:**
```
https://tenant-frontend-1084884913897.us-central1.run.app
```

**Backend API URL:**
```
https://tenant-backend-1084884913897.us-central1.run.app
```

### Application Features

#### 1. Dashboard
- Overview of properties, tenants, and transactions
- Recent activity feed
- Quick actions (Add Property, Add Tenant, etc.)
- AI Chat assistant

#### 2. Properties Management
- View all properties
- Add new properties
- Edit property details
- Delete properties
- View transactions per property

#### 3. Tenants Management
- View all tenants
- Add new tenants
- Edit tenant information
- Delete tenants
- View tenant transaction history

#### 4. Transactions Management
- View all transactions
- Add new transactions (rent, utilities, maintenance, etc.)
- Edit transactions
- Delete transactions
- Export to CSV
- Filter by tenant or property

#### 5. AI Chat Assistant
- Ask questions about properties, tenants, or transactions
- Get insights and summaries
- Powered by Google Gemini API

### API Endpoints

**Base URL:** `https://tenant-backend-1084884913897.us-central1.run.app/api`

**Properties:**
- `GET /api/properties?page=1&per_page=15` - List properties
- `POST /api/properties` - Create property
- `GET /api/properties/{id}` - Get property
- `PUT /api/properties/{id}` - Update property
- `DELETE /api/properties/{id}` - Delete property

**Tenants:**
- `GET /api/tenants?page=1&per_page=15` - List tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/{id}` - Get tenant
- `PUT /api/tenants/{id}` - Update tenant
- `DELETE /api/tenants/{id}` - Delete tenant

**Transactions:**
- `GET /api/transactions?page=1&per_page=15` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/{id}` - Get transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

**Chat:**
- `POST /api/chat` - Send message to AI assistant

**Health:**
- `GET /actuator/health` - Application health check

---

## Code Updates & Redeployment

### Making Code Changes

#### Backend Changes

1. **Modify Java code** in `backend/src/`
2. **Update dependencies** in `backend/pom.xml` if needed
3. **Test locally** using Docker Compose:
   ```bash
   docker-compose up
   ```

#### Frontend Changes

1. **Modify React code** in `frontend/src/`
2. **Update dependencies** in `frontend/package.json` if needed
3. **Test locally**:
   ```bash
   cd frontend
   npm start
   ```

### Deployment Methods

#### Method 1: Manual Build (Recommended)

From project root:

```bash
gcloud builds submit --config=cloudbuild.yaml .
```

**What happens:**
1. Cloud Build creates a new build
2. Backend image is built and tagged with `BUILD_ID`
3. Frontend image is built and tagged with `BUILD_ID`
4. Images are pushed to Artifact Registry
5. Backend is deployed to Cloud Run
6. Frontend is deployed to Cloud Run

**Duration:** 8-10 minutes

**Cost:** Free (within Cloud Build free tier: 120 build-minutes/day)

#### Method 2: Automated GitHub Trigger (Optional)

**Setup:**

1. Connect GitHub repository to Cloud Build:
   ```bash
   gcloud builds triggers create github \
     --name="deploy-on-push" \
     --repo-name=tenant-management-java-app \
     --repo-owner=javiator \
     --branch-pattern="^main$" \
     --build-config=cloudbuild.yaml
   ```

2. Push code to `main` branch:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

3. Build triggers automatically

**Note:** The Cloud Build trigger resource in Terraform currently has configuration issues. Use manual setup via `gcloud` command above.

### Rollback Procedure

If a deployment fails or introduces issues:

1. **Check previous revisions:**
   ```bash
   gcloud run revisions list --service=tenant-backend --region=us-central1
   ```

2. **Route traffic to previous revision:**
   ```bash
   gcloud run services update-traffic tenant-backend \
     --region=us-central1 \
     --to-revisions=REVISION_NAME=100
   ```

3. **Or redeploy previous image:**
   ```bash
   gcloud run deploy tenant-backend \
     --image=us-central1-docker.pkg.dev/PROJECT_ID/tenant-repo/backend:PREVIOUS_BUILD_ID \
     --region=us-central1
   ```

### Database Migrations

**Flyway** handles database migrations automatically.

**Migration files location:**
```
backend/src/main/resources/db/migration/
```

**Naming convention:**
```
V{version}__{description}.sql
```

Example:
```
V1__initial_schema.sql
V2__add_tenant_email.sql
V3__add_transaction_indexes.sql
```

**Migration process:**
1. Add new migration file
2. Deploy backend (Flyway runs migrations on startup)
3. Check logs for migration status:
   ```bash
   gcloud run services logs read tenant-backend --region=us-central1 --limit=50
   ```

---

## Monitoring & Maintenance

### Viewing Logs

#### Backend Logs

```bash
# Recent logs
gcloud run services logs read tenant-backend \
  --region=us-central1 \
  --limit=50

# Follow logs in real-time
gcloud run services logs tail tenant-backend \
  --region=us-central1

# Filter by severity
gcloud logging read \
  'resource.type="cloud_run_revision" AND resource.labels.service_name="tenant-backend" AND severity>=ERROR' \
  --limit=20
```

#### Frontend Logs

```bash
# Recent logs
gcloud run services logs read tenant-frontend \
  --region=us-central1 \
  --limit=50

# Nginx access logs
gcloud logging read \
  'resource.type="cloud_run_revision" AND resource.labels.service_name="tenant-frontend"' \
  --limit=20
```

#### Database Logs

```bash
# Cloud SQL logs
gcloud sql operations list --instance=tenant-db-{suffix}

# Query logs (if enabled)
gcloud logging read \
  'resource.type="cloudsql_database"' \
  --limit=20
```

### Metrics & Monitoring

#### Cloud Run Metrics

Access via Google Cloud Console:
```
https://console.cloud.google.com/run?project=gen-lang-client-0681882406
```

**Key Metrics:**
- Request count
- Request latency (p50, p95, p99)
- Error rate
- Container instance count
- CPU utilization
- Memory utilization
- Billable time

#### Cloud SQL Metrics

Access via Google Cloud Console:
```
https://console.cloud.google.com/sql/instances?project=gen-lang-client-0681882406
```

**Key Metrics:**
- CPU utilization
- Memory utilization
- Disk utilization
- Connections
- Queries per second
- Replication lag (if applicable)

### Setting Up Alerts

#### Budget Alerts

1. Go to Billing → Budgets & alerts
2. Create budget: $25/month
3. Set alerts at 50%, 90%, 100%

#### Uptime Checks

```bash
# Create uptime check for backend
gcloud monitoring uptime-checks create \
  --display-name="Backend Health Check" \
  --resource-type=uptime-url \
  --monitored-resource=https://tenant-backend-1084884913897.us-central1.run.app/actuator/health \
  --check-interval=300s

# Create uptime check for frontend
gcloud monitoring uptime-checks create \
  --display-name="Frontend Health Check" \
  --resource-type=uptime-url \
  --monitored-resource=https://tenant-frontend-1084884913897.us-central1.run.app/ \
  --check-interval=300s
```

### Backup Strategy

#### Database Backups

**Automated Backups:**
- Enabled by default on Cloud SQL
- Daily backups retained for 7 days
- Backup window: 3:00 AM UTC

**Manual Backup:**
```bash
gcloud sql backups create \
  --instance=tenant-db-{suffix} \
  --description="Pre-deployment backup"
```

**List Backups:**
```bash
gcloud sql backups list --instance=tenant-db-{suffix}
```

**Restore from Backup:**
```bash
gcloud sql backups restore BACKUP_ID \
  --backup-instance=tenant-db-{suffix} \
  --backup-id=BACKUP_ID
```

#### Export Database

```bash
# Export to Cloud Storage
gcloud sql export sql tenant-db-{suffix} \
  gs://BUCKET_NAME/backup-$(date +%Y%m%d).sql \
  --database=tenantdb
```

---

## Troubleshooting

### Common Issues

#### 1. Service Not Starting

**Symptoms:**
- Cloud Run shows "Container failed to start"
- Health checks failing

**Diagnosis:**
```bash
gcloud run services describe tenant-backend --region=us-central1
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="tenant-backend" AND severity>=ERROR' --limit=20
```

**Common Causes:**
- Port mismatch (ensure container listens on port 8080)
- Missing environment variables
- Database connection failure
- Application startup errors

**Solutions:**
- Check `Dockerfile` EXPOSE directive
- Verify environment variables in `backend.tf`
- Test database connectivity
- Review application logs

#### 2. Database Connection Errors

**Symptoms:**
- Backend logs show "Connection refused" or "Unknown host"
- API returns 500 errors

**Diagnosis:**
```bash
# Check Cloud SQL instance status
gcloud sql instances describe tenant-db-{suffix}

# Check Cloud SQL Admin API
gcloud services list --enabled | grep sqladmin
```

**Solutions:**
- Ensure Cloud SQL Admin API is enabled:
  ```bash
  gcloud services enable sqladmin.googleapis.com
  ```
- Verify `POSTGRES_URL` environment variable format
- Check Cloud SQL instance is running
- Verify `postgres-socket-factory` dependency in `pom.xml`

#### 3. Frontend 502 Bad Gateway

**Symptoms:**
- Frontend loads but API calls fail with 502
- Nginx logs show upstream errors

**Diagnosis:**
```bash
# Check frontend logs
gcloud run services logs read tenant-frontend --region=us-central1 --limit=50

# Test backend directly
curl https://tenant-backend-1084884913897.us-central1.run.app/actuator/health
```

**Solutions:**
- Verify `BACKEND_URL` environment variable
- Check Nginx proxy configuration in `nginx.conf`
- Ensure `proxy_ssl_server_name on;` is set
- Verify backend is running and healthy

#### 4. Build Failures

**Symptoms:**
- `gcloud builds submit` fails
- Cloud Build shows errors

**Diagnosis:**
```bash
# List recent builds
gcloud builds list --limit=5

# Get build details
gcloud builds describe BUILD_ID
```

**Common Causes:**
- Maven build errors (backend)
- npm build errors (frontend)
- Docker build errors
- Missing dependencies

**Solutions:**
- Test builds locally:
  ```bash
  cd backend && docker build -t test-backend .
  cd frontend && docker build -t test-frontend .
  ```
- Check `pom.xml` and `package.json` for errors
- Verify Dockerfile syntax

#### 5. Terraform Errors

**Symptoms:**
- `terraform apply` fails
- Resource creation errors

**Diagnosis:**
```bash
terraform plan
terraform show
```

**Common Causes:**
- Missing API enablement
- Insufficient permissions
- Resource naming conflicts
- State file issues

**Solutions:**
- Enable required APIs
- Check IAM permissions
- Use unique resource names
- Refresh state: `terraform refresh`

### Performance Issues

#### Slow Response Times

**Diagnosis:**
```bash
# Check Cloud Run metrics
gcloud run services describe tenant-backend --region=us-central1

# Check database performance
gcloud sql operations list --instance=tenant-db-{suffix}
```

**Solutions:**
1. **Increase Cloud Run resources:**
   ```bash
   gcloud run services update tenant-backend \
     --region=us-central1 \
     --memory=1Gi \
     --cpu=2
   ```

2. **Optimize database queries:**
   - Add indexes
   - Use query caching
   - Optimize JPA queries

3. **Enable Cloud Run minimum instances (reduces cold starts):**
   ```bash
   gcloud run services update tenant-backend \
     --region=us-central1 \
     --min-instances=1
   ```
   **Note:** Adds ~$5/month to costs

#### High Database CPU

**Solutions:**
1. **Upgrade Cloud SQL tier:**
   ```bash
   gcloud sql instances patch tenant-db-{suffix} \
     --tier=db-g1-small
   ```
   **Note:** Increases cost to ~$25/month

2. **Add database indexes:**
   - Create migration file with indexes
   - Deploy backend to apply migrations

---

## Cost Management

### Current Cost Breakdown

**Monthly Estimate: $18-22**

| Component | Configuration | Monthly Cost |
|-----------|--------------|--------------|
| Cloud SQL Instance | db-f1-micro | $7.67 |
| Cloud SQL Storage | 10GB SSD | $1.70 |
| Cloud Run - Backend | 512MB, 0-10 instances | $0-5 |
| Cloud Run - Frontend | 256MB, 0-10 instances | $0-5 |
| Artifact Registry | Storage | $0.50 |
| Networking | Egress | $1-3 |
| **Total** | | **$18-22** |

### Cost Optimization Tips

1. **Use Cloud Run scale-to-zero:**
   - Already configured (min-instances=0)
   - No cost when idle

2. **Optimize container images:**
   - Use multi-stage builds (already implemented)
   - Minimize layer count
   - Use Alpine base images (already implemented)

3. **Database optimization:**
   - Keep db-f1-micro tier for low traffic
   - Monitor storage usage
   - Clean up old data periodically

4. **Build optimization:**
   - Use Cloud Build free tier (120 minutes/day)
   - Cache dependencies in Docker builds

5. **Monitoring:**
   - Set budget alerts
   - Review billing reports monthly
   - Use cost breakdown by service

### Viewing Costs

```bash
# Via Console
https://console.cloud.google.com/billing?project=gen-lang-client-0681882406

# Via CLI
gcloud billing accounts list
gcloud billing projects describe gen-lang-client-0681882406
```

---

## Disaster Recovery

### Backup Procedures

#### 1. Database Backup

**Automated:**
- Daily backups at 3:00 AM UTC
- 7-day retention

**Manual:**
```bash
# Create backup
gcloud sql backups create \
  --instance=tenant-db-{suffix} \
  --description="Manual backup $(date +%Y%m%d)"

# Export to Cloud Storage
gsutil mb gs://tenant-backups-$(date +%Y%m%d)
gcloud sql export sql tenant-db-{suffix} \
  gs://tenant-backups-$(date +%Y%m%d)/backup.sql \
  --database=tenantdb
```

#### 2. Terraform State Backup

```bash
# State is automatically versioned in GCS
gsutil ls -a gs://tf-state-gen-lang-client-0681882406/terraform/state/

# Download current state
gsutil cp gs://tf-state-gen-lang-client-0681882406/terraform/state/default.tfstate ./backup-state.tfstate
```

#### 3. Application Code Backup

- Code is version-controlled in Git
- Docker images are stored in Artifact Registry
- Keep multiple image versions

### Recovery Procedures

#### Scenario 1: Database Corruption

```bash
# 1. List available backups
gcloud sql backups list --instance=tenant-db-{suffix}

# 2. Restore from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance=tenant-db-{suffix}

# 3. Verify data
gcloud sql connect tenant-db-{suffix} --user=postgres
```

#### Scenario 2: Accidental Service Deletion

```bash
# 1. Re-apply Terraform
cd infrastructure/terraform-gcp-cloudrun
terraform apply

# 2. Redeploy application
cd ../..
gcloud builds submit --config=cloudbuild.yaml .
```

#### Scenario 3: Complete Infrastructure Loss

```bash
# 1. Restore Terraform state (if needed)
gsutil cp gs://tf-state-gen-lang-client-0681882406/terraform/state/default.tfstate ./

# 2. Re-create infrastructure
terraform init
terraform apply

# 3. Restore database from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance=tenant-db-{suffix}

# 4. Deploy application
gcloud builds submit --config=cloudbuild.yaml .
```

### Testing Recovery

**Recommended Schedule:**
- Test database restore: Quarterly
- Test full infrastructure recovery: Annually
- Document recovery time objectives (RTO): < 4 hours
- Document recovery point objectives (RPO): < 24 hours

---

## Appendix

### A. Environment Variables Reference

#### Backend Environment Variables

| Variable | Description | Source | Required |
|----------|-------------|--------|----------|
| `SPRING_PROFILES_ACTIVE` | Spring Boot profile | Hardcoded | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | terraform.tfvars | Yes |
| `POSTGRES_USER` | Database username | Hardcoded | Yes |
| `POSTGRES_PASSWORD` | Database password | terraform.tfvars | Yes |
| `POSTGRES_DB` | Database name | Hardcoded | Yes |
| `POSTGRES_URL` | JDBC connection string | Computed | Yes |

#### Frontend Environment Variables

| Variable | Description | Source | Required |
|----------|-------------|--------|----------|
| `BACKEND_URL` | Backend API URL | Computed from backend service | Yes |

### B. Port Reference

| Service | Container Port | External Port | Protocol |
|---------|---------------|---------------|----------|
| Backend | 8080 | 443 (HTTPS) | HTTP/2 |
| Frontend | 8080 | 443 (HTTPS) | HTTP/2 |
| Database | 5432 | N/A (Unix socket) | PostgreSQL |

### C. File Structure

```
tenant-management-java-app/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-prod.properties
│   │   │       └── db/migration/
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── infrastructure/
│   └── terraform-gcp-cloudrun/
│       ├── provider.tf
│       ├── variables.tf
│       ├── database.tf
│       ├── backend.tf
│       ├── frontend.tf
│       ├── artifact_registry.tf
│       ├── cloudbuild.tf
│       ├── outputs.tf
│       ├── network.tf
│       ├── terraform.tfvars (git-ignored)
│       └── DEPLOYMENT_GUIDE.md
├── cloudbuild.yaml
├── docker-compose.yml
├── .gitignore
├── .gcloudignore
└── GCP_DEPLOYMENT_DOCUMENTATION.md (this file)
```

### D. Useful Commands Cheat Sheet

```bash
# Terraform
terraform init
terraform plan
terraform apply
terraform destroy
terraform output
terraform refresh

# Cloud Run
gcloud run services list
gcloud run services describe SERVICE_NAME --region=us-central1
gcloud run services update SERVICE_NAME --region=us-central1 [OPTIONS]
gcloud run services delete SERVICE_NAME --region=us-central1
gcloud run revisions list --service=SERVICE_NAME --region=us-central1

# Cloud SQL
gcloud sql instances list
gcloud sql instances describe INSTANCE_NAME
gcloud sql databases list --instance=INSTANCE_NAME
gcloud sql backups list --instance=INSTANCE_NAME
gcloud sql connect INSTANCE_NAME --user=postgres

# Cloud Build
gcloud builds submit --config=cloudbuild.yaml .
gcloud builds list
gcloud builds describe BUILD_ID
gcloud builds log BUILD_ID

# Logging
gcloud logging read 'FILTER' --limit=N
gcloud run services logs read SERVICE_NAME --region=us-central1
gcloud run services logs tail SERVICE_NAME --region=us-central1

# Artifact Registry
gcloud artifacts repositories list
gcloud artifacts docker images list us-central1-docker.pkg.dev/PROJECT_ID/tenant-repo
```

### E. Support & Resources

**Google Cloud Documentation:**
- [Cloud Run](https://cloud.google.com/run/docs)
- [Cloud SQL](https://cloud.google.com/sql/docs)
- [Cloud Build](https://cloud.google.com/build/docs)
- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

**Application Documentation:**
- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://react.dev/)
- [Material-UI](https://mui.com/)

**Community:**
- [Google Cloud Community](https://www.googlecloudcommunity.com/)
- [Stack Overflow - google-cloud-platform](https://stackoverflow.com/questions/tagged/google-cloud-platform)

---

## Conclusion

This documentation provides comprehensive guidance for deploying, managing, and maintaining the Tenant Management System on Google Cloud Platform using Cloud Run and Cloud SQL.

**Key Takeaways:**
- ✅ Cost-effective serverless deployment (~$18-22/month)
- ✅ Automatic scaling (0 to production)
- ✅ Fully managed infrastructure
- ✅ Simple deployment workflow
- ✅ Production-ready with backups and monitoring

For questions or issues, refer to the troubleshooting section or consult the Google Cloud documentation.

**Last Updated**: December 2025  
**Version**: 1.0
