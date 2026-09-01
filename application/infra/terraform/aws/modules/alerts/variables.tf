variable "prefix" {
  type        = string
  description = "Resource prefix"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "sre_email" {
  type        = string
  description = "SRE On-Call Email"
  default     = "vikranth.devops18@gmail.com"
}


variable "db_instance_id" {
  type        = string
  description = "RDS DB Instance Identifier"
}

variable "ecs_cluster_name" {
  type        = string
  description = "ECS Cluster Name"
}

variable "alb_arn_suffix" {
  type        = string
  description = "ALB ARN Suffix"
}
