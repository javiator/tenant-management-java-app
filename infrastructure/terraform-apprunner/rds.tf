resource "aws_db_subnet_group" "main" {
  name       = "${var.environment}-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "${var.environment}-db-subnet-group"
  }
}

resource "aws_db_instance" "default" {
  identifier        = "${var.environment}-db"
  engine            = "postgres"
  engine_version    = "16.6"
  instance_class    = "db.t4g.micro"
  allocated_storage = 20
  storage_type      = "gp3"

  username = var.db_username
  password = var.db_password
  db_name  = "tenant_db"

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  skip_final_snapshot = true
  publicly_accessible = false

  tags = {
    Name = "${var.environment}-db"
  }
}

# Variable declarations specifically for RDS
variable "db_username" {
  description = "Database administrator username"
  type        = string
  sensitive   = true
  default     = "postgres" # Default for dev/demo
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
  # default     = "..." # Should be passed via TF_VAR or .tfvars
}
