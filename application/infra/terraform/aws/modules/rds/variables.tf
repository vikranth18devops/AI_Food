variable "prefix" {
  type        = string
  description = "Prefix for resources"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Database Subnet IDs"
}

variable "db_name" {
  type        = string
  description = "Database name"
  default     = "foodlens_db"
}

variable "db_username" {
  type        = string
  description = "Database admin user"
  default     = "foodlens_user"
}

variable "db_password" {
  type        = string
  description = "Database admin password"
  sensitive   = true
}
