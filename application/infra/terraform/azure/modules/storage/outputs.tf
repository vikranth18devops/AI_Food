output "storage_account_id" {
  value       = azurerm_storage_account.storage.id
  description = "Storage Account ID"
}

output "storage_account_name" {
  value       = azurerm_storage_account.storage.name
  description = "Storage Account Name"
}

output "primary_connection_string" {
  value       = azurerm_storage_account.storage.primary_connection_string
  description = "Storage Account Primary Connection String"
  sensitive   = true
}

output "container_name" {
  value       = azurerm_storage_container.container.name
  description = "Blob Container Name"
}
