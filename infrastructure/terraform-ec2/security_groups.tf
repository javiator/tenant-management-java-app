# --- 1. Load Balancer Security Group ---
resource "aws_security_group" "alb_sg" {
  name        = "alb-sg-${var.environment}"
  description = "Controls access to the Application Load Balancer"
  vpc_id      = module.vpc.vpc_id

  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP from Anywhere"
  }

  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS from Anywhere"
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "alb-sg-${var.environment}"
  }
}

# --- 2. Application (EC2) Security Group ---
resource "aws_security_group" "app_sg" {
  name        = "app-sg-${var.environment}"
  description = "Controls access to the EC2 instances"
  vpc_id      = module.vpc.vpc_id

  # Ingress: Allow traffic ONLY from the ALB
  ingress {
    protocol        = "tcp"
    from_port       = 80
    to_port         = 80
    security_groups = [aws_security_group.alb_sg.id]
    description     = "Allow 80 (Nginx) from ALB"
  }

  # Ingress: Allow SSH from nowhere (for now/SSM is preferred) or specific Admin IP
  # leaving empty for security (use SSM Session Manager)

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "app-sg-${var.environment}"
  }
}

# --- 3. Database Security Group ---
resource "aws_security_group" "db_sg" {
  name        = "db-sg-${var.environment}"
  description = "Controls access to the RDS Database"
  vpc_id      = module.vpc.vpc_id

  # Ingress: Allow traffic ONLY from the App SG
  ingress {
    protocol        = "tcp"
    from_port       = 5432
    to_port         = 5432
    security_groups = [aws_security_group.app_sg.id]
    description     = "Allow Postgres from App SG"
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
