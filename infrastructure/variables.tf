variable "location" {
  default = "UK South"
}

variable service_name {
  default = "me-using"
}

variable "api_key_dev" {
    description = "API key for the web application"
    sensitive   = true
}