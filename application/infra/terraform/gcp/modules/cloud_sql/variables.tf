variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "region" {
  type        = string
  description = "GCP Region"
}

variable "prefix" {
  type        = string
  description = "Prefix for resources"
}

variable "db_password" {
  type        = string
  description = "PostgreSQL admin password"
  sensitive   = true
}

variable "db_name" {
  type        = string
  description = "Database name"
  default     = "foodlens_db"
}

variable "db_user" {
  type        = string
  description = "Database user"
  default     = "foodlens_user"
}
