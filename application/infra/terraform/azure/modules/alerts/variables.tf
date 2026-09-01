variable "resource_group_name" {
  type        = string
  description = "Azure Resource Group Name"
}

variable "location" {
  type        = string
  description = "Azure Region Location"
}

variable "prefix" {
  type        = string
  description = "Resource prefix"
}

variable "sre_email" {
  type        = string
  description = "SRE On-Call Email"
  default     = "vikranth.devops18@gmail.com"
}


variable "postgres_id" {
  type        = string
  description = "PostgreSQL Flexible Server ID"
}

variable "redis_id" {
  type        = string
  description = "Azure Redis Cache ID"
}

variable "apim_id" {
  type        = string
  description = "Azure APIM Gateway ID"
}
