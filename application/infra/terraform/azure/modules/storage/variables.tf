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

variable "container_name" {
  type        = string
  description = "Name of the blob storage container"
  default     = "uploads"
}
