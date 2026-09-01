output "primary_endpoint" {
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  description = "Redis Cache Address"
}

output "port" {
  value       = aws_elasticache_cluster.redis.cache_nodes[0].port
  description = "Redis Cache Port"
}

output "redis_url" {
  value       = "redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:${aws_elasticache_cluster.redis.cache_nodes[0].port}"
  description = "Redis URL"
}
