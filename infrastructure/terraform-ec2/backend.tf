terraform {
  backend "s3" {
    bucket  = "tenant-management-tf-state-383226947124"
    key     = "ec2-demo/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
    # dynamodb_table = "..." (Locking disabled)
  }
}
