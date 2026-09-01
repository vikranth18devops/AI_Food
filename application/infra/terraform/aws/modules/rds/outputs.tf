output "endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "RDS Endpoint"
}

output "db_name" {
  value       = aws_db_instance.postgres.db_name
  description = "Database Name"
}

output "db_instance_id" {
  value       = aws_db_instance.postgres.identifier
  description = "RDS DB Instance Identifier"
}

output "connection_string" {
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${var.db_name}"
  description = "PostgreSQL Connection String"
  sensitive   = true
}
