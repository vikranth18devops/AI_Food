output "id" {
  value       = azurerm_redis_cache.redis.id
  description = "Redis Cache Instance ID"
}

output "hostname" {
  value       = azurerm_redis_cache.redis.hostname
  description = "Redis Hostname"
}

output "ssl_port" {
  value       = azurerm_redis_cache.redis.ssl_port
  description = "Redis SSL Port"
}

output "primary_access_key" {
  value       = azurerm_redis_cache.redis.primary_access_key
  description = "Redis Primary Access Key"
  sensitive   = true
}

output "connection_string" {
  value       = "rediss://:${azurerm_redis_cache.redis.primary_access_key}@${azurerm_redis_cache.redis.hostname}:${azurerm_redis_cache.redis.ssl_port}"
  description = "Redis Connection String"
  sensitive   = true
}
