# Use the default VPC for simplicity and cost saving
data "google_compute_network" "default" {
  name = "default"
}

# No VPC Connector needed for Public IP approach
