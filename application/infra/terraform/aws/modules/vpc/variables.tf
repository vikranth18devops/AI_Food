variable "prefix" {
  type        = string
  description = "Prefix for all resources"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for VPC"
  default     = "10.1.0.0/16"
}

variable "public_subnets" {
  type        = list(string)
  description = "Public Subnet CIDRs"
  default     = ["10.1.1.0/24", "10.1.2.0/24"]
}

variable "private_subnets" {
  type        = list(string)
  description = "Private Subnet CIDRs"
  default     = ["10.1.10.0/24", "10.1.11.0/24"]
}

variable "database_subnets" {
  type        = list(string)
  description = "Database Subnet CIDRs"
  default     = ["10.1.20.0/24", "10.1.21.0/24"]
}
