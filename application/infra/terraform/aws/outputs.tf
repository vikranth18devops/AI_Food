output "alb_dns_name" {
  value       = module.ecs.alb_dns_name
  description = "Application Load Balancer DNS Name"
}

output "ecr_repository_urls" {
  value       = module.ecr.repository_urls
  description = "ECR Repository URLs"
}

output "rds_endpoint" {
  value       = module.rds.endpoint
  description = "PostgreSQL RDS Endpoint"
}

output "redis_url" {
  value       = module.elasticache.redis_url
  description = "ElastiCache Redis URL"
  sensitive   = true
}

output "s3_bucket_name" {
  value       = module.s3.bucket_name
  description = "S3 Bucket Name"
}
