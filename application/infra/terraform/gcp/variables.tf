variable "project_id" {
  type        = string
  description = "GCP Project ID"
  default     = "foodlens-ai-project"
}

variable "region" {
  type        = string
  description = "GCP primary deployment region"
  default     = "us-central1"
}

variable "secondary_region" {
  type        = string
  description = "Secondary GCP deployment region for multi-region failover"
  default     = "europe-west1"
}


variable "environment" {
  type        = string
  description = "Environment name"
  default     = "dev"
}

variable "prefix" {
  type        = string
  description = "Resource prefix"
  default     = "foodlens-dev"
}

variable "db_password" {
  type        = string
  description = "PostgreSQL Administrator Password"
  sensitive   = true
  default     = "P@ssw0rd12345!"
}

variable "jwt_access_secret" {
  type        = string
  description = "JWT Access Token Secret"
  sensitive   = true
  default     = "super-secret-access-key-foodlens-2026"
}

variable "jwt_refresh_secret" {
  type        = string
  description = "JWT Refresh Token Secret"
  sensitive   = true
  default     = "super-secret-refresh-key-foodlens-2026"
}
