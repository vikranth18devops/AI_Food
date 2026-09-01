output "server_id" {
  value       = azurerm_postgresql_flexible_server.postgres.id
  description = "PostgreSQL Flexible Server ID"
}

output "fqdn" {
  value       = azurerm_postgresql_flexible_server.postgres.fqdn
  description = "PostgreSQL Fully Qualified Domain Name"
}

output "database_name" {
  value       = azurerm_postgresql_flexible_server_database.db.name
  description = "PostgreSQL Database Name"
}

output "connection_string" {
  value       = "postgresql://${var.db_admin_user}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.postgres.fqdn}:5432/${var.db_name}?schema=public"
  description = "Database Connection String"
  sensitive   = true
}
