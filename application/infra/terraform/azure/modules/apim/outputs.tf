output "apim_id" {
  value       = azurerm_api_management.apim.id
  description = "Azure APIM Instance ID"
}

output "apim_gateway_url" {
  value       = azurerm_api_management.apim.gateway_url
  description = "Azure APIM Gateway Public URL"
}

output "apim_developer_portal_url" {
  value       = azurerm_api_management.apim.developer_portal_url
  description = "Azure APIM Developer Portal URL"
}
