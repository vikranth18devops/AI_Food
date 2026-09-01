resource "azurerm_private_dns_zone" "postgres_dns" {
  name                = "${var.prefix}-postgres.private.postgres.database.azure.com"
  resource_group_name = var.resource_group_name
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres_dns_link" {
  name                  = "${var.prefix}-postgres-dns-link"
  private_dns_zone_name = azurerm_private_dns_zone.postgres_dns.name
  resource_group_name   = var.resource_group_name
  virtual_network_id    = var.vnet_id
}

resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = "${var.prefix}-psql-server"
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = "15"
  delegated_subnet_id    = var.subnet_id
  private_dns_zone_id    = azurerm_private_dns_zone.postgres_dns.id
  administrator_login    = var.db_admin_user
  administrator_password = var.db_admin_password
  storage_mb             = var.storage_mb
  sku_name               = var.sku_name
  zone                   = "1"

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres_dns_link]
}

resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = var.db_name
  server_id = azurerm_postgresql_flexible_server.postgres.id
  collation = "en_US.utf8"
  charset   = "utf8"
}
