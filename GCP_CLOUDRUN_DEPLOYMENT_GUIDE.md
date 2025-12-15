# GCP Cloud Run Deployment Guide

## Quick Start Guide for Cloud Run Deployment

This guide provides step-by-step instructions to deploy the Tenant Management System to Google Cloud Run.

**Estimated Time**: 1-2 hours
**Cost**: $18-22/month

---

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed ([Install Guide](https://cloud.google.com/sdk/docs/install))
3. **Docker** installed (for local testing)
4. **Git** repository access

---

## Step 1: Initial Setup (15 minutes)

### 1.1 Install gcloud CLI

```bash
# For Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# For macOS
brew install --cask google-cloud-sdk

# Verify installation
gcloud --version
```

### 1.2 Authenticate and Create Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project
gcloud projects create tenant-management-prod --name="Tenant Management"

# Set as active project
gcloud config set project tenant-management-prod

# Enable billing (required - do this via console)
# Visit: https://console.cloud.google.com/billing
```

### 1.3 Enable Required APIs

```bash
# Enable all required services
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  compute.googleapis.com
```

---

## Step 2: Create Cloud SQL Database (20 minutes)

### 2.1 Create PostgreSQL Instance

```bash
# Create Cloud SQL instance (db-f1-micro for lowest cost)
gcloud sql instances create tenant-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=03:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04

# This takes 5-10 minutes to complete
```

### 2.2 Set Database Password

```bash
# Set root password
gcloud sql users set-password postgres \
  --instance=tenant-db \
  --password=YOUR_SECURE_PASSWORD_HERE
```

### 2.3 Create Application Database

```bash
# Create the database
gcloud sql databases create tenantdb \
  --instance=tenant-db

# Create application user
gcloud sql users create tenantuser \
  --instance=tenant-db \
  --password=YOUR_APP_PASSWORD_HERE
```

---

## Step 3: Store Secrets (10 minutes)

### 3.1 Create Secrets in Secret Manager

```bash
# Store database password
echo -n "YOUR_APP_PASSWORD_HERE" | \
  gcloud secrets create db-password --data-file=-

# Store Gemini API key
echo -n "YOUR_GEMINI_API_KEY" | \
  gcloud secrets create gemini-api-key --data-file=-

# Verify secrets
gcloud secrets list
```

---

## Step 4: Prepare Application Code (15 minutes)

### 4.1 Update Backend Configuration

Create `backend/src/main/resources/application-cloudrun.properties`:

```properties
# Cloud Run Profile
spring.profiles.active=cloudrun

# Database Configuration
spring.datasource.url=jdbc:postgresql:///${DB_NAME}?cloudSqlInstance=${INSTANCE_CONNECTION_NAME}&socketFactory=com.google.cloud.sql.postgres.SocketFactory
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Flyway
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true

# Gemini API
gemini.api.key=${GEMINI_API_KEY}

# Server
server.port=8080
```

### 4.2 Update Backend pom.xml

Add Cloud SQL dependency to `backend/pom.xml`:

```xml
<dependency>
    <groupId>com.google.cloud.sql</groupId>
    <artifactId>postgres-socket-factory</artifactId>
    <version>1.15.0</version>
</dependency>
```

### 4.3 Create Backend Dockerfile (if not exists)

`backend/Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 4.4 Create Frontend Dockerfile (if not exists)

`frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Step 5: Deploy Backend to Cloud Run (20 minutes)

### 5.1 Build and Deploy Backend

```bash
cd backend

# Get Cloud SQL instance connection name
INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe tenant-db \
  --format='value(connectionName)')

# Deploy to Cloud Run
gcloud run deploy tenant-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
  --set-env-vars="SPRING_PROFILES_ACTIVE=cloudrun,DB_NAME=tenantdb,DB_USER=tenantuser,INSTANCE_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME" \
  --set-secrets="DB_PASSWORD=db-password:latest,GEMINI_API_KEY=gemini-api-key:latest"

# This takes 5-10 minutes
```

### 5.2 Get Backend URL

```bash
# Get the backend service URL
BACKEND_URL=$(gcloud run services describe tenant-backend \
  --region us-central1 \
  --format='value(status.url)')

echo "Backend URL: $BACKEND_URL"
```

---

## Step 6: Deploy Frontend to Cloud Run (15 minutes)

### 6.1 Update Frontend Environment

Update `frontend/.env.production`:

```env
REACT_APP_API_URL=YOUR_BACKEND_URL_HERE/api
```

Or build with environment variable:

```bash
cd frontend

# Build with backend URL
gcloud run deploy tenant-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --port 80 \
  --set-env-vars="REACT_APP_API_URL=$BACKEND_URL/api"
```

### 6.2 Get Frontend URL

```bash
# Get the frontend service URL
FRONTEND_URL=$(gcloud run services describe tenant-frontend \
  --region us-central1 \
  --format='value(status.url)')

echo "Frontend URL: $FRONTEND_URL"
echo "Visit: $FRONTEND_URL"
```

---

## Step 7: Setup CI/CD with Cloud Build (Optional, 20 minutes)

### 7.1 Create cloudbuild.yaml

Create `cloudbuild.yaml` in project root:

```yaml
steps:
  # Build Backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/tenant-backend', './backend']
  
  # Build Frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/tenant-frontend', './frontend']
  
  # Push Backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/tenant-backend']
  
  # Push Frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/tenant-frontend']
  
  # Deploy Backend
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'tenant-backend'
      - '--image=gcr.io/$PROJECT_ID/tenant-backend'
      - '--region=us-central1'
      - '--platform=managed'
  
  # Deploy Frontend
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'tenant-frontend'
      - '--image=gcr.io/$PROJECT_ID/tenant-frontend'
      - '--region=us-central1'
      - '--platform=managed'

images:
  - 'gcr.io/$PROJECT_ID/tenant-backend'
  - 'gcr.io/$PROJECT_ID/tenant-frontend'
```

### 7.2 Connect GitHub Repository

```bash
# Create build trigger
gcloud builds triggers create github \
  --name="deploy-on-push" \
  --repo-name=tenant-management-java-app \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

---

## Step 8: Verify Deployment (10 minutes)

### 8.1 Test Backend API

```bash
# Test health endpoint
curl $BACKEND_URL/actuator/health

# Test API endpoint
curl $BACKEND_URL/api/properties
```

### 8.2 Test Frontend

```bash
# Open in browser
echo "Visit: $FRONTEND_URL"
```

### 8.3 Check Logs

```bash
# Backend logs
gcloud run services logs read tenant-backend \
  --region us-central1 \
  --limit 50

# Frontend logs
gcloud run services logs read tenant-frontend \
  --region us-central1 \
  --limit 50
```

---

## Step 9: Cost Optimization (5 minutes)

### 9.1 Set Appropriate Limits

```bash
# Update backend with optimized settings
gcloud run services update tenant-backend \
  --region us-central1 \
  --min-instances 0 \
  --max-instances 5 \
  --cpu 1 \
  --memory 512Mi \
  --concurrency 80

# Update frontend with optimized settings
gcloud run services update tenant-frontend \
  --region us-central1 \
  --min-instances 0 \
  --max-instances 3 \
  --cpu 1 \
  --memory 256Mi \
  --concurrency 100
```

### 9.2 Enable Budget Alerts

```bash
# Create budget alert (via console)
# Visit: https://console.cloud.google.com/billing/budgets
# Set budget to $25/month with alerts at 50%, 90%, 100%
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check Cloud SQL instance status
gcloud sql instances describe tenant-db

# Test connection from Cloud Shell
gcloud sql connect tenant-db --user=postgres
```

### Service Not Starting

```bash
# Check service status
gcloud run services describe tenant-backend --region us-central1

# View detailed logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=tenant-backend" --limit 50
```

### Cold Start Issues

```bash
# Set minimum instances to 1 (adds ~$5/month)
gcloud run services update tenant-backend \
  --region us-central1 \
  --min-instances 1
```

---

## Cleanup (if needed)

```bash
# Delete Cloud Run services
gcloud run services delete tenant-backend --region us-central1
gcloud run services delete tenant-frontend --region us-central1

# Delete Cloud SQL instance
gcloud sql instances delete tenant-db

# Delete secrets
gcloud secrets delete db-password
gcloud secrets delete gemini-api-key

# Delete project (removes everything)
gcloud projects delete tenant-management-prod
```

---

## Cost Monitoring

### View Current Costs

```bash
# Via console
# Visit: https://console.cloud.google.com/billing

# Or use CLI
gcloud billing accounts list
```

### Expected Monthly Costs

| Component | Cost |
|-----------|------|
| Cloud Run - Backend | $0-5 (free tier) |
| Cloud Run - Frontend | $0-5 (free tier) |
| Cloud SQL (db-f1-micro) | $7.67 |
| Cloud SQL Storage (10GB) | $1.70 |
| Networking | $1-3 |
| Container Registry | $0.50 |
| **Total** | **$18-22/month** |

---

## Next Steps

1. ✅ Setup custom domain (optional)
2. ✅ Configure Cloud CDN for static assets
3. ✅ Setup monitoring and alerting
4. ✅ Implement automated backups
5. ✅ Configure CORS policies
6. ✅ Setup staging environment

---

## Support Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)

---

## Summary

You now have a fully deployed, production-ready application on Google Cloud Run with:

- ✅ Serverless backend and frontend
- ✅ Managed PostgreSQL database
- ✅ Automatic HTTPS/SSL
- ✅ Auto-scaling (0 to production)
- ✅ CI/CD pipeline (optional)
- ✅ Cost: $18-22/month

**Deployment Time**: 1-2 hours
**Maintenance**: Zero (fully managed)
**Scalability**: Automatic
