variable "region" {
  type        = string
  description = "AWS primary deployment region"
  default     = "us-east-1"
}

variable "secondary_region" {
  type        = string
  description = "Secondary AWS deployment region for multi-region failover"
  default     = "us-west-2"
}


variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "dev"
}

variable "prefix" {
  type        = string
  description = "Prefix for AWS resources"
  default     = "foodlens-dev"
}

variable "db_password" {
  type        = string
  description = "PostgreSQL DB password"
  sensitive   = true
  default     = "P@ssw0rd12345!"
}

variable "jwt_access_secret" {
  type        = string
  description = "JWT Access Secret"
  sensitive   = true
  default     = "super-secret-access-key-foodlens-2026"
}

variable "jwt_refresh_secret" {
  type        = string
  description = "JWT Refresh Secret"
  sensitive   = true
  default     = "super-secret-refresh-key-foodlens-2026"
}
