output "host" {
  value = google_redis_instance.redis.host
}

output "port" {
  value = google_redis_instance.redis.port
}

output "redis_url" {
  value = "redis://${google_redis_instance.redis.host}:${google_redis_instance.redis.port}"
}
