# --- 1. App Runner VPC Connector Security Group ---
resource "aws_security_group" "connector_sg" {
  name        = "connector-sg-${var.environment}"
  description = "Security Group for App Runner VPC Connector"
  vpc_id      = aws_vpc.main.id

  # Allow all outbound traffic (to reach RDS and Internet if needed)
  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "connector-sg-${var.environment}"
  }
}

# --- 2. Database Security Group ---
resource "aws_security_group" "db_sg" {
  name        = "db-sg-${var.environment}"
  description = "Controls access to the RDS Database"
  vpc_id      = aws_vpc.main.id

  # Ingress: Allow traffic ONLY from the VPC Connector SG
  ingress {
    protocol        = "tcp"
    from_port       = 5432
    to_port         = 5432
    security_groups = [aws_security_group.connector_sg.id]
    description     = "Allow Postgres from App Runner Connector"
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "db-sg-${var.environment}"
  }
}
