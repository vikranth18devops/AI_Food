output "vnet_id" {
  value       = azurerm_virtual_network.vnet.id
  description = "Virtual Network ID"
}

output "vnet_name" {
  value       = azurerm_virtual_network.vnet.name
  description = "Virtual Network Name"
}

output "aca_subnet_id" {
  value       = azurerm_subnet.aca_subnet.id
  description = "Container Apps Subnet ID"
}

output "db_subnet_id" {
  value       = azurerm_subnet.db_subnet.id
  description = "Database Subnet ID"
}

output "pe_subnet_id" {
  value       = azurerm_subnet.pe_subnet.id
  description = "Private Endpoints Subnet ID"
}
