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

variable "infrastructure_subnet_id" {
  type        = string
  description = "Subnet ID for Container Apps environment"
}

variable "acr_login_server" {
  type        = string
  description = "ACR Login Server"
}

variable "acr_username" {
  type        = string
  description = "ACR Admin Username"
}

variable "acr_password" {
  type        = string
  description = "ACR Admin Password"
  sensitive   = true
}

variable "database_url" {
  type        = string
  description = "PostgreSQL Database Connection String"
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
