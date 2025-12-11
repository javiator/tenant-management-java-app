variable "aws_region" {
  description = "AWS Region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "ec2-demo"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# --- Database Variables ---

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "tenant"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "tenantdb"
}

# --- Application Variables ---

variable "gemini_api_key" {
  description = "API Key for Google Gemini AI"
  type        = string
  sensitive   = true
}

variable "gemini_model" {
  description = "Gemini Model ID to use (e.g., gemini-1.5-flash)"
  type        = string
  default     = "gemini-2.5-flash"
}
