# --- S3 Artifact Bucket ---
resource "aws_s3_bucket" "pipeline_artifacts" {
  bucket = "codepipeline-apprunner-${var.environment}-${data.aws_caller_identity.current.account_id}"
  # force_destroy = true # Careful in prod
}

data "aws_caller_identity" "current" {}

# --- IAM Roles ---

# 1. CodePipeline Role
resource "aws_iam_role" "codepipeline_role" {
  name = "codepipeline-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "codepipeline.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "codepipeline_policy" {
  name = "codepipeline-policy-${var.environment}"
  role = aws_iam_role.codepipeline_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject", "s3:GetObjectVersion", "s3:GetBucketVersioning",
          "s3:PutObjectAcl", "s3:PutObject"
        ]
        Resource = [aws_s3_bucket.pipeline_artifacts.arn, "${aws_s3_bucket.pipeline_artifacts.arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["codebuild:BatchGetBuilds", "codebuild:StartBuild"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["codestar-connections:UseConnection"]
        Resource = aws_codestarconnections_connection.github.arn
      }
    ]
  })
}

# 2. CodeBuild Role
resource "aws_iam_role" "codebuild_role" {
  name = "codebuild-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "codebuild.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "codebuild_policy" {
  name = "codebuild-policy-${var.environment}"
  role = aws_iam_role.codebuild_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents",
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart"
        ]
        Resource = "*" # Restrict to specific ECR ARNs in prod
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:GetObjectVersion", "s3:PutObject"]
        Resource = [aws_s3_bucket.pipeline_artifacts.arn, "${aws_s3_bucket.pipeline_artifacts.arn}/*"]
      }
    ]
  })
}

# --- GitHub Connection ---
resource "aws_codestarconnections_connection" "github" {
  name          = "github-conn-${var.environment}"
  provider_type = "GitHub"
}

# --- CodeBuild Project ---
resource "aws_codebuild_project" "build" {
  name          = "build-${var.environment}"
  description   = "Builds Docker images for App Runner"
  build_timeout = "15"
  service_role  = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux2-x86_64-standard:5.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true # Required for Docker build

    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }
    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "buildspec-apprunner.yml"
  }
}

# --- CodePipeline ---
resource "aws_codepipeline" "pipeline" {
  name     = "pipeline-${var.environment}"
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    location = aws_s3_bucket.pipeline_artifacts.bucket
    type     = "S3"
  }

  stage {
    name = "Source"
    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]

      configuration = {
        ConnectionArn    = aws_codestarconnections_connection.github.arn
        FullRepositoryId = var.github_repo_id
        BranchName       = var.github_branch_name
      }
    }
  }

  stage {
    name = "Build"
    action {
      name            = "Build"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      input_artifacts = ["source_output"]
      # output_artifacts = ["build_output"] # Not needed if we just push to ECR
      version = "1"

      configuration = {
        ProjectName = aws_codebuild_project.build.name
      }
    }
  }
}
