resource "aws_apprunner_vpc_connector" "main" {
  vpc_connector_name = "${var.environment}-vpc-connector"
  subnets            = [aws_subnet.private_1.id, aws_subnet.private_2.id]
  security_groups    = [aws_security_group.connector_sg.id]

  tags = {
    Name = "${var.environment}-vpc-connector"
  }
}

# --- Backend Service ---
resource "aws_apprunner_service" "backend" {
  service_name = "${var.environment}-backend"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_access_role.arn
    }

    image_repository {
      image_identifier      = "383226947124.dkr.ecr.us-east-1.amazonaws.com/tenant-management-backend:latest"
      image_repository_type = "ECR"
      image_configuration {
        port = "8080"
        runtime_environment_variables = {
          SPRING_PROFILES_ACTIVE     = "prod"
          SPRING_DATASOURCE_URL      = "jdbc:postgresql://${aws_db_instance.default.endpoint}/${aws_db_instance.default.db_name}"
          SPRING_DATASOURCE_USERNAME = var.db_username
          SPRING_DATASOURCE_PASSWORD = var.db_password
          GEMINI_API_KEY             = var.gemini_api_key
          GEMINI_MODEL               = var.gemini_model
        }
      }
    }
    auto_deployments_enabled = true
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.main.arn
    }
  }

  instance_configuration {
    cpu               = "1024" # 1 vCPU
    memory            = "2048" # 2 GB
    instance_role_arn = aws_iam_role.apprunner_instance_role.arn
  }

  tags = {
    Name = "${var.environment}-backend"
  }
}

# --- Frontend Service ---
resource "aws_apprunner_service" "frontend" {
  service_name = "${var.environment}-frontend"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_access_role.arn
    }

    image_repository {
      image_identifier      = "383226947124.dkr.ecr.us-east-1.amazonaws.com/tenant-management-frontend:latest"
      image_repository_type = "ECR"
      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          BACKEND_URL = "https://${aws_apprunner_service.backend.service_url}"
          # Note: App Runner requires HTTPS for the service URL
        }
      }
    }
    auto_deployments_enabled = true
  }

  # Frontend doesn't need VPC access technically if it's just serving static files and calling backend via public URL
  # BUT if we want to secure it, we can. For now, public access to backend is fine.

  instance_configuration {
    cpu               = "1024" # 1 vCPU
    memory            = "2048" # 2 GB
    instance_role_arn = aws_iam_role.apprunner_instance_role.arn
  }

  tags = {
    Name = "${var.environment}-frontend"
  }
}

variable "gemini_api_key" {
  description = "API Key for Gemini Service"
  type        = string
  sensitive   = true
}
