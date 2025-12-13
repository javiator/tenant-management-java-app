# --- Beanstalk Service Role ---
resource "aws_iam_role" "beanstalk_service" {
  name = "beanstalk-service-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "elasticbeanstalk.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "beanstalk_service_enhanced_health" {
  role       = aws_iam_role.beanstalk_service.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "beanstalk_service_managed" {
  role       = aws_iam_role.beanstalk_service.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
}

# --- Beanstalk EC2 Instance Profile ---
resource "aws_iam_role" "beanstalk_ec2" {
  name = "beanstalk-ec2-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "beanstalk_ec2_web" {
  role       = aws_iam_role.beanstalk_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_role_policy_attachment" "beanstalk_ec2_docker" {
  role       = aws_iam_role.beanstalk_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
}

resource "aws_iam_role_policy_attachment" "beanstalk_ec2_worker" {
  role       = aws_iam_role.beanstalk_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
}

resource "aws_iam_role_policy_attachment" "beanstalk_ec2_ecr" {
  role       = aws_iam_role.beanstalk_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "beanstalk_ec2" {
  name = "beanstalk-ec2-profile-${var.environment}"
  role = aws_iam_role.beanstalk_ec2.name
}

# Reuse existing roles for Pipeline if needed, or define them here.
# Copying existing CodePipeline roles for consistency.
# ... (Previous roles from App Runner copy are here, I will append or overwrite?)
# The copy command copied the file. I should overwrite it or check if I need to keep the others.
# The `iam.tf` I copied has `codepipeline_role` and `codebuild_role`. I need those.
# So I should APPEND or manually edit. I'll use text replacement to append.
