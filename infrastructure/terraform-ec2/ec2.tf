# --- 1. AMI Data Source (Amazon Linux 2023) ---
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# --- 2. Launch Template ---
resource "aws_launch_template" "app" {
  name_prefix   = "lt-${var.environment}-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.micro" # Free tier eligible-ish

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  network_interfaces {
    associate_public_ip_address = false # Private Subnet
    security_groups             = [aws_security_group.app_sg.id]
  }

  # User Data: Install Java 21, Nginx, CodeDeploy Agent, and set global env vars
  user_data = base64encode(<<-EOF
              #!/bin/bash
              # 1. Update and Install Dependencies
              dnf update -y
              dnf install -y java-21-amazon-corretto-headless ruby wget nginx

              # 2. Configure Nginx (Reverse Proxy)
              # Remove default config
              rm -f /etc/nginx/conf.d/default.conf

              # Create new config
              cat > /etc/nginx/conf.d/app.conf << 'NGINX_CONF'
              server {
                  listen 80;
                  server_name localhost;
                  
                  # Frontend: Serve Static Files (Default)
                  location / {
                      root /var/www/html;
                      index index.html index.htm;
                      try_files $uri $uri/ /index.html;
                  }

                  # Backend: Reverse Proxy to Java App
                  location /api {
                      proxy_pass http://localhost:8080;
                      proxy_set_header Host $host;
                      proxy_set_header X-Real-IP $remote_addr;
                      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                      proxy_set_header X-Forwarded-Proto $scheme;
                  }
              }
              NGINX_CONF

              # 3. Start Nginx
              systemctl enable nginx
              systemctl start nginx

              # 4. Install CodeDeploy Agent
              cd /home/ec2-user
              wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
              chmod +x ./install
              ./install auto
              systemctl enable codedeploy-agent
              systemctl start codedeploy-agent

              # 5. Set Environment Variables (Persist in /etc/environment)
              echo "SPRING_PROFILES_ACTIVE=prod" >> /etc/environment
              echo "POSTGRES_URL=jdbc:postgresql://${aws_db_instance.default.endpoint}/${var.db_name}" >> /etc/environment
              echo "POSTGRES_USER=${var.db_username}" >> /etc/environment
              echo "POSTGRES_PASSWORD=${var.db_password}" >> /etc/environment
              echo "GEMINI_API_KEY=${var.gemini_api_key}" >> /etc/environment
              echo "GEMINI_MODEL=${var.gemini_model}" >> /etc/environment
              
              echo "User Data script complete."
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "ec2-${var.environment}"
      Environment = var.environment
    }
  }
}

# --- 3. Auto Scaling Group ---
resource "aws_autoscaling_group" "app" {
  name                = "asg-${var.environment}"
  desired_capacity    = 1
  max_size            = 2
  min_size            = 1
  vpc_zone_identifier = module.vpc.private_subnets
  target_group_arns   = [aws_lb_target_group.app.arn]

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  # Refresh instances when Launch Template changes
  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
  }

  tag {
    key                 = "Name"
    value               = "ec2-instance-${var.environment}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }
}
