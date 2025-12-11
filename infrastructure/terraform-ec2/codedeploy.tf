# --- IAM Role for CodeDeploy Service ---
resource "aws_iam_role" "codedeploy_service" {
  name = "codedeploy-service-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codedeploy.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "codedeploy_service_policy" {
  role       = aws_iam_role.codedeploy_service.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
}

# --- CodeDeploy Application ---
resource "aws_codedeploy_app" "app" {
  compute_platform = "Server"
  name             = "app-${var.environment}"
}

# --- CodeDeploy Deployment Group ---
resource "aws_codedeploy_deployment_group" "app" {
  app_name              = aws_codedeploy_app.app.name
  deployment_group_name = "dg-${var.environment}"
  service_role_arn      = aws_iam_role.codedeploy_service.arn

  autoscaling_groups = [aws_autoscaling_group.app.name]

  load_balancer_info {
    target_group_info {
      name = aws_lb_target_group.app.name
    }
  }

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "IN_PLACE" # Simple rolling update (not Blue/Green for this demo)
  }
}
