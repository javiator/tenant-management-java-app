resource "google_cloudbuild_trigger" "default" {
  name        = "tenant-management-deploy"
  description = "Manual Build and Deploy for Tenant Management App (feature/gcp-cloudrun-deployment)"

  # Use custom service account with proper permissions
  service_account = google_service_account.cloudbuild.id

  # Manual trigger only - no automatic triggers on push
  # User must manually trigger via Console or CLI
  disabled = false

  # GitHub repository configuration (for manual trigger source)
  github {
    owner = "javiator"
    name  = "tenant-management-java-app"

    # This push block with inverted regex makes it manual-only
    # It will never match any branch, so it won't auto-trigger
    push {
      invert_regex = true
      branch       = ".*" # Inverted: matches nothing, manual only
    }
  }

  # Specify the branch to use when manually triggered
  source_to_build {
    ref       = "refs/heads/feature/gcp-cloudrun-deployment"
    repo_type = "GITHUB"
  }

  filename = "cloudbuild.yaml"

  # Use Cloud Logging only (no storage bucket required)
  included_files = ["**"]

  substitutions = {
    _GEMINI_API_KEY = var.gemini_api_key
    _DB_PASSWORD    = var.db_password
    _REGION         = var.region
  }

  # Ensure service account is created first
  depends_on = [
    google_service_account.cloudbuild,
    google_project_iam_member.cloudbuild_builder,
    google_project_iam_member.cloudbuild_run_admin,
    google_project_iam_member.cloudbuild_sa_user,
    google_project_iam_member.cloudbuild_artifact_writer,
    google_project_iam_member.cloudbuild_logging_writer
  ]
}
