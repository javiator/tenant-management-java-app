resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/app/${var.environment}"
  retention_in_days = 7
}

resource "aws_iam_role_policy" "logs_policy" {
  name = "logs-policy-${var.environment}"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
          "logs:DescribeLogGroups"
        ]
        Resource = "*"
      }
    ]
  })
}
