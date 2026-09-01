variable "prefix" {
  type        = string
  description = "Prefix for resources"
}

variable "db_password" {
  type        = string
  description = "PostgreSQL admin password"
  sensitive   = true
}

variable "jwt_access_secret" {
  type        = string
  description = "JWT Access secret"
  sensitive   = true
}

variable "jwt_refresh_secret" {
  type        = string
  description = "JWT Refresh secret"
  sensitive   = true
}
