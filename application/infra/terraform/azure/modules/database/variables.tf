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

variable "subnet_id" {
  type        = string
  description = "Delegated database subnet ID"
}

variable "db_admin_user" {
  type        = string
  description = "PostgreSQL administrator username"
  default     = "foodlens_user"
}

variable "db_admin_password" {
  type        = string
  description = "PostgreSQL administrator password"
  sensitive   = true
}

variable "db_name" {
  type        = string
  description = "PostgreSQL database name"
  default     = "foodlens_db"
}

variable "sku_name" {
  type        = string
  description = "PostgreSQL SKU tier and size"
  default     = "B_Standard_B1ms"
}

variable "storage_mb" {
  type        = number
  description = "PostgreSQL allocated storage in MB"
  default     = 32768
}

variable "vnet_id" {
  type        = string
  description = "Virtual Network ID for Private DNS Zone binding"
}
