resource "aws_db_subnet_group" "default" {
  name       = "main"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "Main DB subnet group"
  }
}

resource "aws_db_instance" "default" {
  allocated_storage    = 20
  db_name              = "tenantdb"
  engine               = "postgres"
  engine_version       = "16.6"
  instance_class       = "db.t3.micro"
  username             = "tenant"
  password             = "tenant123" # CHANGE THIS IN PRODUCTION (use Secrets Manager)
  parameter_group_name = "default.postgres16"
  skip_final_snapshot  = true

  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.default.name
}

output "db_endpoint" {
  value = aws_db_instance.default.endpoint
}
