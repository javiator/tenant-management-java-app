# Service Account for Cloud Build
resource "google_service_account" "cloudbuild" {
  account_id   = "cloud-build-sa"
  display_name = "Cloud Build Service Account"
  description  = "Service account for Cloud Build deployments"
}

# Grant Cloud Build permissions
resource "google_project_iam_member" "cloudbuild_builder" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = "serviceAccount:${google_service_account.cloudbuild.email}"
}

# Grant Cloud Run Admin permissions
resource "google_project_iam_member" "cloudbuild_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.cloudbuild.email}"
}

# Grant Service Account User permissions (to deploy as other service accounts)
resource "google_project_iam_member" "cloudbuild_sa_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.cloudbuild.email}"
}

# Grant Artifact Registry Writer permissions
resource "google_project_iam_member" "cloudbuild_artifact_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cloudbuild.email}"
}

# Grant Storage Admin permissions (for build artifacts and logs)
resource "google_project_iam_member" "cloudbuild_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.cloudbuild.email}"
}

# Grant Logging Writer permissions
resource "google_project_iam_member" "cloudbuild_logging_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloudbuild.email}"
}

# Grant Viewer permissions (to read project resources)
resource "google_project_iam_member" "cloudbuild_viewer" {
  project = var.project_id
  role    = "roles/viewer"
  member  = "serviceAccount:${google_service_account.cloudbuild.email}"
}
