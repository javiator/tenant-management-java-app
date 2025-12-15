resource "google_cloudbuild_trigger" "default" {
  name        = "tenant-management-deploy"
  description = "Build and Deploy Tenant Management App"

  github {
    owner = "javiator"                   # Replace with actual owner automatically if possible, or user needs to update
    name  = "tenant-management-java-app" # Assuming repo name matches directory/project
    push {
      branch = "^main$"
    }
  }

  filename = "cloudbuild.yaml"

  substitutions = {
    _GEMINI_API_KEY = var.gemini_api_key
    _DB_PASSWORD    = var.db_password
    _REGION         = var.region
  }
}
