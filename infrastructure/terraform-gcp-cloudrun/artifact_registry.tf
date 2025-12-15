resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "tenant-repo"
  description   = "Docker repository for Tenant Management App"
  format        = "DOCKER"
}
