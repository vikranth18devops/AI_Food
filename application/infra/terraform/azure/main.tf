terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Primary Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "${var.prefix}-rg"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = "FoodLens AI"
    ManagedBy   = "Terraform"
  }
}

# Networking Module
module "networking" {
  source              = "./modules/networking"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
}

# Key Vault Module
module "keyvault" {
  source              = "./modules/keyvault"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
  tenant_id           = var.tenant_id
  db_password         = var.db_admin_password
  jwt_access_secret   = var.jwt_access_secret
  jwt_refresh_secret  = var.jwt_refresh_secret
}

# Container Registry Module
module "acr" {
  source              = "./modules/acr"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
}

# Database Module (PostgreSQL Flexible Server)
module "database" {
  source              = "./modules/database"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
  subnet_id           = module.networking.db_subnet_id
  vnet_id             = module.networking.vnet_id
  db_admin_user       = var.db_admin_user
  db_admin_password   = var.db_admin_password
}

# Redis Cache Module
module "redis" {
  source              = "./modules/redis"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
}

# Blob Storage Module
module "storage" {
  source              = "./modules/storage"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
}

# Container Apps Module (Primary Compute)
module "container_apps" {
  source                   = "./modules/container_apps"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  prefix                   = var.prefix
  infrastructure_subnet_id = module.networking.aca_subnet_id
  acr_login_server         = module.acr.acr_login_server
  acr_username             = module.acr.acr_admin_username
  acr_password             = module.acr.acr_admin_password
  database_url             = module.database.connection_string
  redis_url                = module.redis.connection_string
  jwt_access_secret        = var.jwt_access_secret
  jwt_refresh_secret       = var.jwt_refresh_secret

  depends_on = [
    module.acr,
    module.database,
    module.redis,
    module.storage
  ]
}

# API Management (APIM) Module
module "apim" {
  source              = "./modules/apim"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  prefix              = var.prefix
  backend_url         = module.container_apps.api_gateway_fqdn

  depends_on = [
    module.container_apps
  ]
}
