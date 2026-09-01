variable "resource_group_name" {
  type        = string
  description = "Resource group name"
}

variable "location" {
  type        = string
  description = "Azure location"
}

variable "prefix" {
  type        = string
  description = "Prefix for all resources"
}

variable "tenant_id" {
  type        = string
  description = "Azure Active Directory Tenant ID"
}

variable "db_password" {
  type        = string
  description = "PostgreSQL Admin Password"
  sensitive   = true
}

variable "jwt_access_secret" {
  type        = string
  description = "JWT Access Token Secret"
  sensitive   = true
}

variable "jwt_refresh_secret" {
  type        = string
  description = "JWT Refresh Token Secret"
  sensitive   = true
}

variable "redis_connection_string" {
  type        = string
  description = "Redis Connection String"
  sensitive   = true
  default     = ""
}

variable "storage_connection_string" {
  type        = string
  description = "Azure Storage Account Connection String"
  sensitive   = true
  default     = ""
}
