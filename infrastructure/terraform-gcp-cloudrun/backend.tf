resource "google_cloud_run_service" "backend" {
  name     = "tenant-backend"
  location = var.region

  template {
    spec {
      containers {
        # Initial placeholder image. Cloud Build will deploy the actual image.
        image = "us-docker.pkg.dev/cloudrun/container/hello"

        env {
          name  = "SPRING_PROFILES_ACTIVE"
          value = "prod"
        }
        env {
          name  = "GEMINI_API_KEY"
          value = var.gemini_api_key
        }
        env {
          name  = "GEMINI_MODEL"
          value = "gemini-2.5-flash"
        }
        env {
          name  = "POSTGRES_USER"
          value = "tenant"
        }
        env {
          name  = "POSTGRES_PASSWORD"
          value = var.db_password
        }
        env {
          name  = "POSTGRES_DB"
          value = "tenantdb"
        }
        env {
          name = "POSTGRES_URL"
          # Using Localhost because Cloud SQL Proxy is automatically handled by Cloud Run
          value = "jdbc:postgresql:///tenantdb?cloudSqlInstance=${var.project_id}:${var.region}:${google_sql_database_instance.default.name}&socketFactory=com.google.cloud.sql.postgres.SocketFactory"
        }
      }
    }

    metadata {
      annotations = {
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.default.connection_name
        "run.googleapis.com/client-name"        = "terraform"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Allow unauthenticated access (for demo simplicity, restrict for real prod)
resource "google_cloud_run_service_iam_member" "backend_public" {
  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
