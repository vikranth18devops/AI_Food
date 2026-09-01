# 02 - Complete Azure Terraform Resources Provisioning

This guide details all infrastructure resources provisioned on Microsoft Azure using Terraform under `application/infra/terraform/azure/`.

---

## 🏗️ Exhaustive List of Provisioned Azure Resources

When you run `terraform apply`, the following **10 core resource groups and modules** are provisioned on Azure:

| Module / Component | Azure Resource Type | Resource Name Pattern | Purpose |
| :--- | :--- | :--- | :--- |
| **Resource Group** | `azurerm_resource_group` | `foodlens-dev-rg` | Logical lifecycle boundary for all platform resources |
| **Virtual Network** | `azurerm_virtual_network` | `foodlens-dev-vnet` | Isolated VPC networking (`10.0.0.0/16`) |
| **Container Subnet** | `azurerm_subnet` | `foodlens-dev-aca-subnet` | Subnet delegated to `Microsoft.App/environments` (`10.0.0.0/21`) |
| **Database Subnet** | `azurerm_subnet` | `foodlens-dev-db-subnet` | Subnet delegated to `Microsoft.DBforPostgreSQL/flexibleServers` |
| **Private DNS Zone** | `azurerm_private_dns_zone` | `*.postgres.database.azure.com` | Private DNS resolution for PostgreSQL in VNet |
| **Container Registry** | `azurerm_container_registry` | `foodlensdevacr` | Docker image registry for microservices |
| **Key Vault** | `azurerm_key_vault` | `foodlensdevkv` | Hardware-backed secrets storage for DB & JWT keys |
| **Key Vault Secrets** | `azurerm_key_vault_secret` | `db-password`, `jwt-access-secret`, `jwt-refresh-secret` | Encrypted keys stored inside Key Vault |
| **PostgreSQL Flexible** | `azurerm_postgresql_flexible_server` | `foodlens-dev-psql-server` | Managed PostgreSQL 15 database engine |
| **PostgreSQL Database** | `azurerm_postgresql_flexible_server_database` | `foodlens_db` | Relational database instance |
| **Redis Cache** | `azurerm_redis_cache` | `foodlensdevredis` | Managed Azure Cache for Redis |
| **Storage Account** | `azurerm_storage_account` | `foodlensdevsa` | Object storage account for image uploads |
| **Blob Container** | `azurerm_storage_container` | `uploads` | Blob storage container for food image files |
| **Log Analytics** | `azurerm_log_analytics_workspace` | `foodlens-dev-law` | Centralized log workspace for container logs |
| **ACA Environment** | `azurerm_container_app_environment` | `foodlens-dev-aca-env` | Managed Container Apps environment connected to VNet |
| **API Gateway** | `azurerm_container_app` | `foodlens-api-gateway` | Public Ingress Router (Port 3000) |
| **Auth Service** | `azurerm_container_app` | `foodlens-auth-service` | Internal User & Auth Microservice (Port 3001) |
| **Image Service** | `azurerm_container_app` | `foodlens-image-service` | Internal Image Microservice (Port 3002) |
| **Food Service** | `azurerm_container_app` | `foodlens-food-service` | Internal Recipe & Food Catalog Microservice (Port 3003) |
| **Nutrition Service** | `azurerm_container_app` | `foodlens-nutrition-service` | Internal Nutritional Breakdown Microservice (Port 3004) |
| **Analysis Service** | `azurerm_container_app` | `foodlens-analysis-service` | Internal AI Vision Analysis Microservice (Port 3005) |
| **Recommendation Service** | `azurerm_container_app` | `foodlens-recommendation-service` | Internal Dietary Recommendation Microservice (Port 3006) |
| **Frontend** | `azurerm_container_app` | `foodlens-frontend` | Public Web Application UI (Port 80) |
| **RabbitMQ** | `azurerm_container_app` | `foodlens-rabbitmq` | Internal Message Queue Broker (Port 5672) |

---

## 🛠️ Step-by-Step Execution Commands

### 1. Initialize Remote State Backend
```bash
az group create --name foodlens-global-rg --location eastus
az storage account create --name foodlenstfstate --resource-group foodlens-global-rg --location eastus --sku Standard_LRS
az storage container create --name tfstate --account-name foodlenstfstate

cd application/infra/terraform/azure
terraform init \
  -backend-config="resource_group_name=foodlens-global-rg" \
  -backend-config="storage_account_name=foodlenstfstate" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=aca.tfstate"
```

### 2. Validate Terraform Configuration
```bash
terraform validate
```

### 3. Generate Infrastructure Plan
```bash
terraform plan -out=tfplan
```

### 4. Provision All Azure Resources
```bash
terraform apply tfplan
```

---

## 📊 Terraform Output Verification

Once `terraform apply` finishes, query the generated Azure outputs:

```bash
terraform output
```

Expected Outputs:
```text
api_gateway_url      = "https://foodlens-api-gateway.eastus.azurecontainerapps.io"
frontend_url         = "https://foodlens-frontend.eastus.azurecontainerapps.io"
acr_login_server     = "foodlensdevacr.azurecr.io"
key_vault_uri        = "https://foodlensdevkv.vault.azure.net/"
postgres_fqdn        = "foodlens-dev-psql-server.postgres.database.azure.com"
redis_hostname       = "foodlensdevredis.redis.cache.windows.net"
storage_account_name = "foodlensdevsa"
resource_group_name  = "foodlens-dev-rg"
```
