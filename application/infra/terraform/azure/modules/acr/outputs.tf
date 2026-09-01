output "acr_id" {
  value       = azurerm_container_registry.acr.id
  description = "Container Registry ID"
}

output "acr_login_server" {
  value       = azurerm_container_registry.acr.login_server
  description = "Container Registry Login Server URL"
}

output "acr_admin_username" {
  value       = azurerm_container_registry.acr.admin_username
  description = "ACR Admin Username"
}

output "acr_admin_password" {
  value       = azurerm_container_registry.acr.admin_password
  description = "ACR Admin Password"
  sensitive   = true
}
