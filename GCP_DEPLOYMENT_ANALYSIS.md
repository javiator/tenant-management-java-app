# Google Cloud Platform (GCP) Deployment Analysis

## Executive Summary

This document analyzes GCP deployment options for the Tenant Management System (Java Spring Boot + React + PostgreSQL) and compares costs with 5 AWS deployment approaches.

**Application Stack:**
- **Backend**: Java 21 Spring Boot API
- **Frontend**: React 18 with Nginx
- **Database**: PostgreSQL
- **External API**: Google Gemini AI

**Cheapest GCP Option**: **Cloud Run + Cloud SQL (Shared-Core)** at **~$18-22/month**

This is **20% cheaper** than the cheapest AWS option (Low-Cost EC2 at ~$22.50/month).

---

## AWS Baseline Costs (Summary)

| Approach | Monthly Cost | Key Components |
|----------|--------------|----------------|
| **1. Low-Cost EC2** | **$22.50** | Single t3.small + Docker Compose + Self-hosted DB |
| **2. App Runner** | **$45-60** | 2 App Runner services + RDS + VPC Connector + NAT |
| **3. Elastic Beanstalk** | **$60-75** | Beanstalk (EC2) + RDS + ALB + NAT Gateway |
| **4. Standard EC2** | **$70-85** | EC2 ASG + RDS + ALB + NAT Gateway + CloudWatch |
| **5. ECS Fargate** | **$91** | Fargate tasks + RDS + ALB + NAT Gateway |

---

## GCP Deployment Options

### Option 1: Cloud Run + Cloud SQL (Shared-Core) ⭐ **RECOMMENDED - CHEAPEST**

**Architecture:**
```
User → Cloud Run (Frontend) → Cloud Run (Backend) → Cloud SQL (PostgreSQL)
                                      ↓
                              Google Gemini API
```

**Cost Breakdown (Monthly):**

| Component | Specification | Cost |
|-----------|---------------|------|
| **Cloud Run - Backend** | 1 vCPU, 512MB RAM, ~100 requests/day | $0-5 (Free tier covers most) |
| **Cloud Run - Frontend** | 1 vCPU, 512MB RAM, ~100 requests/day | $0-5 (Free tier covers most) |
| **Cloud SQL** | db-f1-micro (Shared-core, 0.6GB RAM, 10GB SSD) | $7.67 |
| **Cloud SQL Storage** | 10GB SSD | $1.70 |
| **Networking** | Egress (minimal) | $1-3 |
| **Container Registry** | Image storage | $0.50 |
| **Total** | | **$18-22/month** |

**Key Features:**
- ✅ **Serverless** - Pay only for actual usage
- ✅ **Auto-scaling** - Scales to zero when idle
- ✅ **Managed** - No server maintenance
- ✅ **HTTPS** - Automatic SSL certificates
- ✅ **CI/CD** - Direct integration with Cloud Build
- ⚠️ **Cold starts** - 1-3 second delay on first request

**Best For:** Development, testing, low-traffic production

---

### Option 2: Cloud Run + Cloud SQL (Standard)

**Architecture:** Same as Option 1, but with production-grade database

**Cost Breakdown (Monthly):**

| Component | Specification | Cost |
|-----------|---------------|------|
| **Cloud Run - Backend** | 1 vCPU, 1GB RAM | $5-10 |
| **Cloud Run - Frontend** | 1 vCPU, 512MB RAM | $3-5 |
| **Cloud SQL** | db-n1-standard-1 (1 vCPU, 3.75GB RAM) | $46.17 |
| **Cloud SQL Storage** | 20GB SSD | $3.40 |
| **Networking** | Egress | $2-5 |
| **Container Registry** | Image storage | $1 |
| **Total** | | **$60-70/month** |

**Comparison to AWS:** Similar to **Elastic Beanstalk** ($60-75) but fully serverless.

---

### Option 3: GKE Autopilot + Cloud SQL

**Architecture:**
```
User → Load Balancer → GKE Autopilot (Pods) → Cloud SQL
```

**Cost Breakdown (Monthly):**

| Component | Specification | Cost |
|-----------|---------------|------|
| **GKE Autopilot** | 2 vCPU, 4GB RAM (avg) | $73 |
| **Cloud SQL** | db-n1-standard-1 | $46.17 |
| **Load Balancer** | HTTP(S) LB | $18 |
| **Networking** | Egress | $3-5 |
| **Total** | | **$140-145/month** |

**Comparison to AWS:** More expensive than **ECS Fargate** ($91). Only use if you need Kubernetes features.

---

### Option 4: Compute Engine (Single VM) + Self-Hosted DB

**Architecture:**
```
User → Compute Engine (e2-small) → Docker Compose (Backend + Frontend + PostgreSQL)
```

**Cost Breakdown (Monthly):**

| Component | Specification | Cost |
|-----------|---------------|------|
| **Compute Engine** | e2-small (2 vCPU, 2GB RAM) | $13.68 |
| **Persistent Disk** | 30GB SSD | $5.10 |
| **Static IP** | External IPv4 | $3.65 |
| **Networking** | Egress (1GB free/month) | $1-2 |
| **Total** | | **$23-25/month** |

**Comparison to AWS:** Slightly more expensive than **AWS Low-Cost EC2** ($22.50), but similar architecture.

**Trade-offs:**
- ❌ Single point of failure
- ❌ Manual scaling
- ✅ Full control over environment
- ✅ Simple architecture

---

### Option 5: App Engine (Flexible) + Cloud SQL

**Architecture:**
```
User → App Engine (Flexible) → Cloud SQL
```

**Cost Breakdown (Monthly):**

| Component | Specification | Cost |
|-----------|---------------|------|
| **App Engine Flex** | 1 vCPU, 1GB RAM (2 instances min) | $50-60 |
| **Cloud SQL** | db-n1-standard-1 | $46.17 |
| **Networking** | Egress | $2-5 |
| **Total** | | **$98-111/month** |

**Comparison to AWS:** Similar to **ECS Fargate** ($91) but more expensive.

**Note:** App Engine Standard is cheaper but doesn't support Java 21 well with Spring Boot.

---

## Detailed Cost Comparison Table

| Deployment Option | Monthly Cost | AWS Equivalent | Cost Difference |
|-------------------|--------------|----------------|-----------------|
| **GCP: Cloud Run + Shared SQL** | **$18-22** | Low-Cost EC2 ($22.50) | **-20% cheaper** |
| **GCP: Compute Engine (Single VM)** | $23-25 | Low-Cost EC2 ($22.50) | +8% more |
| **GCP: Cloud Run + Standard SQL** | $60-70 | Beanstalk ($60-75) | ~Same |
| **GCP: App Engine Flex** | $98-111 | ECS Fargate ($91) | +15% more |
| **GCP: GKE Autopilot** | $140-145 | ECS Fargate ($91) | +55% more |

---

## Service Mapping: AWS → GCP

| AWS Service | GCP Equivalent | Notes |
|-------------|----------------|-------|
| **EC2** | Compute Engine | Virtual machines |
| **ECS Fargate** | Cloud Run | Serverless containers |
| **Elastic Beanstalk** | App Engine Flexible | PaaS with auto-scaling |
| **App Runner** | Cloud Run | Serverless container deployment |
| **RDS PostgreSQL** | Cloud SQL PostgreSQL | Managed database |
| **ALB** | Cloud Load Balancing | HTTP(S) load balancer |
| **NAT Gateway** | Cloud NAT | Outbound internet for private resources |
| **VPC** | VPC | Virtual network |
| **ECR** | Artifact Registry / Container Registry | Container image storage |
| **CodePipeline** | Cloud Build | CI/CD automation |
| **CodeDeploy** | Cloud Deploy | Deployment automation |
| **CloudWatch** | Cloud Logging + Monitoring | Observability |
| **SSM Parameter Store** | Secret Manager | Secrets management |

---

## Recommended Approach: Cloud Run + Cloud SQL (Shared-Core)

### Why This is the Best Option

1. **Lowest Cost**: $18-22/month (20% cheaper than AWS)
2. **Serverless**: No server management, auto-scaling
3. **Pay-per-use**: Scales to zero when idle
4. **Fast Deployment**: Deploy in minutes with Cloud Build
5. **Native Integration**: Works seamlessly with Google Gemini API
6. **HTTPS by Default**: Automatic SSL certificates
7. **Easy CI/CD**: Built-in integration with GitHub

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Google Cloud Platform                   │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │              │         │              │                 │
│  │  Cloud Run   │────────▶│  Cloud Run   │                 │
│  │  (Frontend)  │         │  (Backend)   │                 │
│  │              │         │              │                 │
│  └──────┬───────┘         └──────┬───────┘                 │
│         │                        │                          │
│         │                        │                          │
│         │                        ▼                          │
│         │                 ┌──────────────┐                 │
│         │                 │              │                 │
│         │                 │  Cloud SQL   │                 │
│         │                 │ (PostgreSQL) │                 │
│         │                 │              │                 │
│         │                 └──────────────┘                 │
│         │                        │                          │
│         │                        │                          │
│         │                        ▼                          │
│         │                 ┌──────────────┐                 │
│         └────────────────▶│              │                 │
│                           │ Gemini API   │                 │
│                           │              │                 │
│                           └──────────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         ▲
         │
         │ HTTPS
         │
    ┌────┴────┐
    │  User   │
    └─────────┘
```

### Deployment Steps (High-Level)

1. **Setup GCP Project**
   ```bash
   gcloud projects create tenant-management
   gcloud config set project tenant-management
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

3. **Create Cloud SQL Instance**
   ```bash
   gcloud sql instances create tenant-db \
     --database-version=POSTGRES_16 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

4. **Build and Deploy Backend**
   ```bash
   cd backend
   gcloud run deploy tenant-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --add-cloudsql-instances tenant-db
   ```

5. **Build and Deploy Frontend**
   ```bash
   cd frontend
   gcloud run deploy tenant-frontend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

6. **Configure Environment Variables**
   ```bash
   gcloud run services update tenant-backend \
     --set-env-vars="SPRING_PROFILES_ACTIVE=prod,GEMINI_API_KEY=xxx"
   ```

---

## Cost Optimization Tips

### For Cloud Run
1. **Set Min Instances to 0**: Scales to zero when idle
2. **Use Concurrency**: Set max concurrency to 80-100 per instance
3. **Optimize Memory**: Start with 512MB, increase only if needed
4. **Use Free Tier**: First 2 million requests/month are free

### For Cloud SQL
1. **Start Small**: Use db-f1-micro for dev/test
2. **Enable Backups**: Only keep 7 days of backups
3. **Use Shared-Core**: 70% cheaper than dedicated CPU
4. **Schedule Downtime**: Stop instance during non-business hours (dev only)

### General
1. **Use Cloud Build Free Tier**: 120 build-minutes/day free
2. **Optimize Images**: Use multi-stage Docker builds
3. **Enable Compression**: Reduce egress costs
4. **Use Cloud CDN**: Cache static assets (if needed)

---

## Migration Path from AWS

### Phase 1: Database Migration
1. Export PostgreSQL from RDS
2. Import to Cloud SQL
3. Verify data integrity

### Phase 2: Backend Migration
1. Update `application.properties` for Cloud SQL connection
2. Build Docker image
3. Deploy to Cloud Run
4. Test API endpoints

### Phase 3: Frontend Migration
1. Update API endpoint URLs
2. Build Docker image
3. Deploy to Cloud Run
4. Test UI functionality

### Phase 4: CI/CD Setup
1. Connect GitHub to Cloud Build
2. Create `cloudbuild.yaml`
3. Configure triggers
4. Test automated deployment

**Estimated Migration Time**: 4-8 hours

---

## Pros and Cons Summary

### Cloud Run (Recommended)

**Pros:**
- ✅ Cheapest option ($18-22/month)
- ✅ Serverless - no server management
- ✅ Auto-scaling (including to zero)
- ✅ Fast deployments
- ✅ Built-in HTTPS
- ✅ Native Gemini API integration
- ✅ Pay only for actual usage

**Cons:**
- ⚠️ Cold starts (1-3 seconds)
- ⚠️ Stateless (requires external storage)
- ⚠️ Request timeout (60 minutes max)
- ⚠️ Limited customization vs VMs

### When to Use Each Option

| Use Case | Recommended GCP Option | Estimated Cost |
|----------|------------------------|----------------|
| **Development/Testing** | Cloud Run + Shared SQL | $18-22/month |
| **Low-Traffic Production** | Cloud Run + Shared SQL | $18-22/month |
| **Medium-Traffic Production** | Cloud Run + Standard SQL | $60-70/month |
| **High-Traffic Production** | GKE Autopilot + Cloud SQL | $140+/month |
| **Need Full VM Control** | Compute Engine + Cloud SQL | $50-60/month |
| **Legacy App Migration** | Compute Engine (Single VM) | $23-25/month |

---

## Next Steps

1. **Review this analysis** with your team
2. **Choose deployment option** based on requirements and budget
3. **Create GCP project** and enable billing
4. **Follow deployment guide** (to be created)
5. **Set up monitoring** with Cloud Logging and Monitoring
6. **Configure CI/CD** with Cloud Build

---

## Additional Resources

- [Cloud Run Pricing Calculator](https://cloud.google.com/products/calculator)
- [Cloud SQL Pricing](https://cloud.google.com/sql/pricing)
- [GCP Free Tier](https://cloud.google.com/free)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Migrating from AWS to GCP](https://cloud.google.com/docs/get-started/aws-azure-gcp-service-comparison)

---

## Conclusion

**For the Tenant Management System, Cloud Run + Cloud SQL (Shared-Core) is the optimal choice**, offering:

- **20% cost savings** over the cheapest AWS option
- **Serverless architecture** with zero maintenance
- **Native integration** with Google Gemini API
- **Fast deployment** and easy CI/CD
- **Scalability** from zero to production

This approach provides the best balance of cost, simplicity, and functionality for a Java Spring Boot + React application.
