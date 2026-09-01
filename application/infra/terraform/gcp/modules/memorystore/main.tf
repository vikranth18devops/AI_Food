resource "google_redis_instance" "redis" {
  name           = "${var.prefix}-redis"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.region
  project        = var.project_id
}
