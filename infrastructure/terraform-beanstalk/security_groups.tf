# --- 1. Beanstalk EC2 Security Group ---
resource "aws_security_group" "beanstalk_ec2_sg" {
  name        = "beanstalk-ec2-sg-${var.environment}"
  description = "Security Group for Beanstalk EC2 instances"
  vpc_id      = aws_vpc.main.id

  # Allow all outbound traffic (to reach RDS and Internet if needed)
  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "beanstalk-ec2-sg-${var.environment}"
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
    security_groups = [aws_security_group.beanstalk_ec2_sg.id]
    description     = "Allow Postgres from Beanstalk EC2"
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
