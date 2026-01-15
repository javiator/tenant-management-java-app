# EFS for persistent PostgreSQL data across instance replacements
resource "aws_efs_file_system" "db_data" {
  encrypted = true

  tags = {
    Name        = "${var.environment}-db-data"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Mount targets in each AZ
resource "aws_efs_mount_target" "db_data" {
  count           = 3
  file_system_id  = aws_efs_file_system.db_data.id
  subnet_id       = aws_subnet.public[count.index].id
  security_groups = [aws_security_group.efs_sg.id]
}

# Security group for EFS
resource "aws_security_group" "efs_sg" {
  name        = "${var.environment}-efs-sg"
  description = "Allow NFS traffic from instances"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.instance_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.environment}-efs-sg"
    Environment = var.environment
  }
}
