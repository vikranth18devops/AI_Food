variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "prefix" {
  type        = string
  description = "Resource prefix"
}

variable "sre_email" {
  type        = string
  description = "SRE On-Call Email"
  default     = "vikranth.devops18@gmail.com"
}


variable "cloudsql_instance_name" {
  type        = string
  description = "Cloud SQL Instance Name"
}
