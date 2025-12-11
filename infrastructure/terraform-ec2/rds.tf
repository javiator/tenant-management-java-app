resource "aws_db_subnet_group" "default" {
  name       = "main-subnet-group-${var.environment}"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "Main DB subnet group"
  }
}

resource "aws_db_instance" "default" {
  identifier           = "tenantdb-${var.environment}"
  allocated_storage    = 20
  db_name              = var.db_name
  engine               = "postgres"
  engine_version       = "16.6"
  instance_class       = "db.t3.micro"
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.postgres16"
  skip_final_snapshot  = true
  publicly_accessible  = false

  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.default.name

  tags = {
    Name = "tenantdb-${var.environment}"
  }
}

output "db_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.default.endpoint
}
