resource "aws_elastic_beanstalk_application" "app" {
  name        = "${var.project_name}-beanstalk"
  description = "Beanstalk Application for Tenant Management"
}

resource "aws_elastic_beanstalk_environment" "env" {
  name                = var.environment
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.4.1 running Docker"
  # Check latest solution stack name if possible, or use regex data source

  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = aws_vpc.main.id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", aws_subnet.private_1[*].id) # Private subnet for instances? Or Public? Usually Private if ALB is public.
    # Beanstalk creates ALB. If ELBSubnets are public, instances can be private.
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBSubnets"
    value     = join(",", [aws_subnet.public_1.id, aws_subnet.public_2.id])
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.medium"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.beanstalk_ec2.name
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.beanstalk_ec2_sg.id
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = aws_iam_role.beanstalk_service.name
  }

  # --- Environment Variables ---
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_PROFILES_ACTIVE"
    value     = "prod"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_DATASOURCE_URL"
    value     = "jdbc:postgresql://${aws_db_instance.default.endpoint}/${aws_db_instance.default.db_name}"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_DATASOURCE_USERNAME"
    value     = var.db_username
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_DATASOURCE_PASSWORD"
    value     = var.db_password
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "GEMINI_API_KEY"
    value     = var.gemini_api_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "GEMINI_MODEL"
    value     = var.gemini_model
  }
}
