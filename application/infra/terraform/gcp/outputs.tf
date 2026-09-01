output "artifact_registry_repo" {
  value = module.artifact_registry.repository_name
}

output "cloud_sql_connection" {
  value = module.cloud_sql.instance_connection_name
}

output "redis_host" {
  value = module.memorystore.host
}

output "gcs_bucket" {
  value = module.gcs.bucket_name
}

output "api_gateway_url" {
  value = module.cloud_run.gateway_url
}

output "frontend_url" {
  value = module.cloud_run.frontend_url
}
