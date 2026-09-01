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

variable "sku" {
  type        = string
  description = "ACR SKU tier (Basic, Standard, Premium)"
  default     = "Standard"
}
