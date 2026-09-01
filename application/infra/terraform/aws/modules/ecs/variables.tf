variable "prefix" {
  type        = string
  description = "Prefix for resources"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public Subnet IDs for ALB"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private Subnet IDs for Fargate tasks"
}

variable "ecr_repository_urls" {
  type        = map(string)
  description = "Map of service names to ECR repo URLs"
}

variable "database_url" {
  type        = string
  description = "PostgreSQL Database URL"
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
