variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "tenant-management"
}

variable "environment" {
  default = "lowcost-env"
}

variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "github_repo_owner" {
  default = "javiator"
}

variable "github_repo_name" {
  default = "tenant-management-java-app"
}

variable "github_branch_name" {
  default = "feature/aws-lowcost-deployment"
}

variable "github_repo_id" {
  default = "javiator/tenant-management-java-app"
}

variable "db_password" {
  sensitive = true
}

variable "gemini_api_key" {
  sensitive = true
}

variable "instance_type" {
  default = "t3.small" # 2GB RAM for Java + DB + Frontend
}
