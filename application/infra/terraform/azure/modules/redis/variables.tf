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

variable "sku_name" {
  type        = string
  description = "Redis SKU Name (Basic, Standard, Premium)"
  default     = "Basic"
}

variable "capacity" {
  type        = number
  description = "Redis capacity (0 to 6 for Basic/Standard)"
  default     = 0
}
