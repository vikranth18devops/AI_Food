variable "resource_group_name" {
  type        = string
  description = "Resource Group name"
}

variable "location" {
  type        = string
  description = "Azure region location"
}

variable "prefix" {
  type        = string
  description = "Resource prefix"
}

variable "publisher_name" {
  type        = string
  description = "APIM Publisher Name"
  default     = "FoodLens AI Team"
}

variable "publisher_email" {
  type        = string
  description = "APIM Publisher Email"
  default     = "admin@foodlens.example.com"
}

variable "backend_url" {
  type        = string
  description = "Target API Gateway backend FQDN or URL"
}
