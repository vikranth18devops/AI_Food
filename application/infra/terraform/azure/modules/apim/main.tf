# Azure API Management Instance (Consumption SKU for serverless cost efficiency)
resource "azurerm_api_management" "apim" {
  name                = "${var.prefix}-apim"
  location            = var.location
  resource_group_name = var.resource_group_name
  publisher_name      = var.publisher_name
  publisher_email     = var.publisher_email
  sku_name            = "Consumption_0"

  tags = {
    Environment = var.prefix
    Project     = "FoodLens AI"
    ManagedBy   = "Terraform"
  }
}

# FoodLens API Definition
resource "azurerm_api_management_api" "foodlens_api" {
  name                = "foodlens-api"
  resource_group_name = var.resource_group_name
  api_management_name = azurerm_api_management.apim.name
  revision            = "1"
  display_name        = "FoodLens AI Platform API"
  path                = "api"
  protocols           = ["https"]
  service_url         = "https://${var.backend_url}"
}

# Product Subscription Scope
resource "azurerm_api_management_product" "unlimited_product" {
  product_id            = "unlimited"
  api_management_name   = azurerm_api_management.apim.name
  resource_group_name   = var.resource_group_name
  display_name          = "Unlimited Subscription"
  subscription_required = false
  approval_required     = false
  published             = true
}

# Link API to Product
resource "azurerm_api_management_product_api" "product_api_link" {
  api_name            = azurerm_api_management_api.foodlens_api.name
  product_id          = azurerm_api_management_product.unlimited_product.product_id
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = var.resource_group_name
}

# Global APIM Inbound Rate-Limiting Policy
resource "azurerm_api_management_api_policy" "api_policy" {
  api_name            = azurerm_api_management_api.foodlens_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = var.resource_group_name

  xml_content = <<XML
<policies>
  <inbound>
    <rate-limit calls="100" renewal-period="60" />
    <cors allow-credentials="true">
      <allowed-origins>
        <origin>*</origin>
      </allowed-origins>
      <allowed-methods>
        <method>GET</method>
        <method>POST</method>
        <method>PUT</method>
        <method>DELETE</method>
        <method>OPTIONS</method>
      </allowed-methods>
      <allowed-headers>
        <header>*</header>
      </allowed-headers>
    </cors>
    <base />
  </inbound>
  <backend>
    <base />
  </backend>
  <outbound>
    <base />
  </outbound>
  <on-error>
    <base />
  </on-error>
</policies>
XML
}
