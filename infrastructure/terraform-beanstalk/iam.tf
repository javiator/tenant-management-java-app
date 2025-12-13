# Role for App Runner to access ECR (Build/Pull)
resource "aws_iam_role" "apprunner_access_role" {
  name = "AppRunnerECRAccessRole-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_access_policy" {
  role       = aws_iam_role.apprunner_access_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# Instance Role (optional, for accessing other AWS services like S3 or SSM)
resource "aws_iam_role" "apprunner_instance_role" {
  name = "AppRunnerInstanceRole-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

# Allow Instance Role to read from SSM (for Env Vars if needed)
resource "aws_iam_role_policy_attachment" "ssm_read_policy" {
  role       = aws_iam_role.apprunner_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
}
