output "instance_connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}

output "public_ip" {
  value = google_sql_database_instance.postgres.public_ip_address
}

output "connection_string" {
  value       = "postgresql://${var.db_user}:${var.db_password}@${google_sql_database_instance.postgres.public_ip_address}:5432/${var.db_name}"
  sensitive   = true
  description = "PostgreSQL Connection String"
}
