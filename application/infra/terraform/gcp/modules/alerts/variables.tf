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
  default     = "sre-oncall@foodlens.example.com"
}

variable "cloudsql_instance_name" {
  type        = string
  description = "Cloud SQL Instance Name"
}
