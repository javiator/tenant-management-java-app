variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project Name"
  type        = string
  default     = "tenant-management"
}

variable "environment" {
  description = "Environment Name"
  type        = string
  default     = "apprunner-demo"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "github_repo_id" {
  description = "GitHub Repository ID (Owner/Repo)"
  type        = string
  default     = "javiator/tenant-management-java-app"
}

variable "github_branch_name" {
  description = "GitHub Branch Name to trigger pipeline"
  type        = string
  default     = "feature/aws-apprunner-deployment"
}


variable "gemini_model" {
  description = "Gemini Model ID to use (e.g., gemini-1.5-flash)"
  type        = string
  default     = "gemini-1.5-flash"
}
