resource "aws_ecr_repository" "backend" {
  name                 = "tenant-management-backend-${var.environment}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_repository" "frontend" {
  name                 = "tenant-management-frontend-${var.environment}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}
