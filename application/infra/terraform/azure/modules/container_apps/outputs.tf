output "environment_id" {
  value       = azurerm_container_app_environment.env.id
  description = "Container Apps Environment ID"
}

output "api_gateway_fqdn" {
  value       = azurerm_container_app.api_gateway.ingress[0].fqdn
  description = "API Gateway Ingress FQDN"
}

output "frontend_fqdn" {
  value       = azurerm_container_app.frontend.ingress[0].fqdn
  description = "Frontend Web Application Ingress FQDN"
}
