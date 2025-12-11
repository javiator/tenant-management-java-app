variable "aws_region" {
  description = "AWS Region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., ecs-demo, prod)"
  type        = string
  default     = "ecs-demo"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "gemini_api_key" {
  description = "API Key for Google Gemini AI"
  type        = string
  sensitive   = true
}
