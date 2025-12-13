resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.environment}/db_password"
  type  = "SecureString"
  value = var.db_password
}

resource "aws_ssm_parameter" "gemini_api_key" {
  name  = "/${var.environment}/gemini_api_key"
  type  = "SecureString"
  value = var.gemini_api_key
}

resource "aws_iam_role_policy_attachment" "ec2_ssm_read" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
}
