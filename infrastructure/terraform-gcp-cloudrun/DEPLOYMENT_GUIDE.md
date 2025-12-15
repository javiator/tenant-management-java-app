# GCP Deployment Guide

This guide explains how to deploy the Tenant Management System to Google Cloud using Terraform and Cloud Build.

## Prerequisites

1.  **GCP Project**: `gen-lang-client-0681882406` (or updated ID).
2.  **GCS Bucket for State**: You must create a bucket for Terraform state.
    ```bash
    gsutil mb -p gen-lang-client-0681882406 -l us-central1 gs://tf-state-gen-lang-client-0681882406
    ```
3.  **Authentication**: Terraform requires Application Default Credentials.
    ```bash
    gcloud auth application-default login
    ```
4.  **Update `provider.tf`**: Uncomment the backend configuration and set the bucket name (Already done).

## Deployment Steps

### 1. Initialize Terraform

Navigate to the terraform directory:
```bash
cd infrastructure/terraform-gcp-cloudrun
terraform init
```

### 2. Plan Infrastructure

**Secrets Configuration**:
A `terraform.tfvars` file has been created with placeholder values.
1.  Open `infrastructure/terraform-gcp-cloudrun/terraform.tfvars`.
2.  Replace `CHANGE_ME` with your actual secrets.
    *(This file is git-ignored to prevent accidental commits)*

```bash
terraform plan
```

### 3. Apply Infrastructure

Create the resources (Cloud SQL, Cloud Run Services, Artifact Registry).

```bash
terraform apply
```

> **Note**: The Cloud Run services will initially deploy a placeholder "Hello World" image.

### 4. Trigger Build & Deploy

Once infrastructure is up, trigger the Cloud Build pipeline to build and deploy the actual application code.

Manual Trigger (from project root):
```bash
gcloud builds submit --config=cloudbuild.yaml .
```
*(Note: Cloud Build might require enabling the Cloud SQL Admin API if not already enabled)*

## Outputs

After `terraform apply`, you will see:
-   `backend_url`: URL of the backend API.
-   `frontend_url`: URL of the React frontend.
