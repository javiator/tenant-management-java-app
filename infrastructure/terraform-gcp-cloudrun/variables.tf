variable "project_id" {
  description = "The GCP Project ID"
  type        = string
  default     = "gen-lang-client-0681882406"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "db_password" {
  description = "Password for the database user"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "API Key for Google Gemini"
  type        = string
  sensitive   = true
}
