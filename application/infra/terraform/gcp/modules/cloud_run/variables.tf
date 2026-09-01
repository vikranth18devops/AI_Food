variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "location" {
  type        = string
  description = "GCP Location"
}

variable "prefix" {
  type        = string
  description = "Prefix for resources"
}

variable "repository_id" {
  type        = string
  description = "Artifact Registry repo ID"
}

variable "database_url" {
  type        = string
  description = "Database connection string"
  sensitive   = true
}

variable "redis_url" {
  type        = string
  description = "Redis URL"
  sensitive   = true
}

variable "jwt_access_secret" {
  type        = string
  description = "JWT Access Secret"
  sensitive   = true
}

variable "jwt_refresh_secret" {
  type        = string
  description = "JWT Refresh Secret"
  sensitive   = true
}
