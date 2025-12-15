resource "google_sql_database_instance" "default" {
  name             = "tenant-db-${random_id.db_name_suffix.hex}"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier = "db-f1-micro"

    # Public IP enabled (default)
    ip_configuration {
      ipv4_enabled = true
    }
  }

  deletion_protection = false # Set to true for production
}

resource "random_id" "db_name_suffix" {
  byte_length = 4
}

resource "google_sql_database" "database" {
  name     = "tenantdb"
  instance = google_sql_database_instance.default.name
}

resource "google_sql_user" "users" {
  name     = "tenant"
  instance = google_sql_database_instance.default.name
  password = var.db_password
}
