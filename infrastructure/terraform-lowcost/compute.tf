data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_iam_role" "ec2_role" {
  name = "ec2-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_ecr_ro" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "codedeploy_instance" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforAWSCodeDeploy" # Deprecated but still common, or create custom?
  # Custom policy is better usually, but for speed let's check if there is a managed policy.
}

# Custom policy for CodeDeploy to access S3 (artifacts)
resource "aws_iam_role_policy" "codedeploy_s3" {
  name = "codedeploy-s3-access-${var.environment}"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:Get*", "s3:List*"]
        Resource = "*" # Restrict to artifact bucket later
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ec2-profile-${var.environment}"
  role = aws_iam_role.ec2_role.name
}

resource "aws_launch_template" "app_server" {
  name_prefix   = "${var.environment}-app-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.instance_sg.id]
  }

  user_data = base64encode(templatefile("user_data.sh", {
    environment = var.environment
    region      = var.aws_region
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name            = "${var.environment}-app-server"
      CodeDeployGroup = "${var.environment}-deployment-group"
      Environment     = var.environment
      ManagedBy       = "Terraform"
      Project         = "tenant-management"
      InstanceType    = "spot"
    }
  }

  tag_specifications {
    resource_type = "volume"
    tags = {
      Name        = "${var.environment}-app-server-volume"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Auto Scaling Group with multi-AZ Spot instances
resource "aws_autoscaling_group" "app_server" {
  name                = "${var.environment}-app-asg"
  min_size            = 1
  max_size            = 1
  desired_capacity    = 1
  vpc_zone_identifier = aws_subnet.public[*].id
  health_check_type   = "EC2"
  health_check_grace_period = 300

  mixed_instances_policy {
    instances_distribution {
      on_demand_base_capacity                  = 0
      on_demand_percentage_above_base_capacity = 0
      spot_allocation_strategy                 = "price-capacity-optimized"
    }

    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.app_server.id
        version            = "$Latest"
      }

      # Diversify instance types for better availability
      override {
        instance_type = "t3.small"
      }
      override {
        instance_type = "t3a.small"
      }
      override {
        instance_type = "t2.small"
      }
    }
  }

  tag {
    key                 = "Name"
    value               = "${var.environment}-app-server"
    propagate_at_launch = true
  }

  tag {
    key                 = "CodeDeployGroup"
    value               = "${var.environment}-deployment-group"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }

  tag {
    key                 = "ManagedBy"
    value               = "Terraform"
    propagate_at_launch = true
  }

  tag {
    key                 = "Project"
    value               = "tenant-management"
    propagate_at_launch = true
  }

  tag {
    key                 = "InstanceType"
    value               = "spot"
    propagate_at_launch = true
  }
}
