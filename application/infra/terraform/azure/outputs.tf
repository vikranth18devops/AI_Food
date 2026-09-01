output "resource_group_name" {
  value       = azurerm_resource_group.rg.name
  description = "Resource group name"
}

output "acr_login_server" {
  value       = module.acr.acr_login_server
  description = "Azure Container Registry login server"
}

output "key_vault_uri" {
  value       = module.keyvault.key_vault_uri
  description = "Azure Key Vault Vault URI"
}

output "postgres_fqdn" {
  value       = module.database.fqdn
  description = "PostgreSQL Flexible Server FQDN"
}

output "redis_hostname" {
  value       = module.redis.hostname
  description = "Redis Cache Hostname"
}

output "storage_account_name" {
  value       = module.storage.storage_account_name
  description = "Azure Storage Account Name"
}

output "api_gateway_url" {
  value       = "https://${module.container_apps.api_gateway_fqdn}"
  description = "API Gateway Public Container App URL"
}

output "frontend_url" {
  value       = "https://${module.container_apps.frontend_fqdn}"
  description = "Frontend Web Application Public URL"
}

output "apim_gateway_url" {
  value       = module.apim.apim_gateway_url
  description = "Azure API Management (APIM) Gateway URL"
}

output "apim_developer_portal_url" {
  value       = module.apim.apim_developer_portal_url
  description = "Azure API Management (APIM) Developer Portal URL"
}
