variable "location" {
  type        = string
  description = "Azure primary deployment region"
  default     = "eastus"
}

variable "secondary_location" {
  type        = string
  description = "Secondary Azure deployment region for multi-region failover"
  default     = "westeurope"
}


variable "environment" {
  type        = string
  description = "Deployment environment name (dev, staging, prod)"
  default     = "dev"
}

variable "prefix" {
  type        = string
  description = "Prefix for all Azure resources"
  default     = "foodlens-dev"
}

variable "tenant_id" {
  type        = string
  description = "Azure Active Directory Tenant ID (optional, defaults to provider user tenant)"
  default     = ""
}

variable "db_admin_user" {
  type        = string
  description = "PostgreSQL Administrator Username"
  default     = "foodlens_admin"
}

variable "db_admin_password" {
  type        = string
  description = "PostgreSQL Administrator Password"
  sensitive   = true
  default     = "P@ssw0rd123456!"
}

variable "jwt_access_secret" {
  type        = string
  description = "JWT Access Token Secret Key"
  sensitive   = true
  default     = "super-secret-access-key-foodlens-2026"
}

variable "jwt_refresh_secret" {
  type        = string
  description = "JWT Refresh Token Secret Key"
  sensitive   = true
  default     = "super-secret-refresh-key-foodlens-2026"
}
