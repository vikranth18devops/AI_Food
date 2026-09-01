# 04 - Key Vault Secrets Integration

This guide details configuring Azure Key Vault secrets and mapping them to Container Apps environment variables.

---

## 1. Store Secrets in Key Vault

Store database connection string and JWT secrets:
```bash
az keyvault secret set --vault-name foodlensdevkv --name db-password --value "P@ssw0rd123456!"
az keyvault secret set --vault-name foodlensdevkv --name jwt-access-secret --value "super-secret-access-key-foodlens-2026"
az keyvault secret set --vault-name foodlensdevkv --name jwt-refresh-secret --value "super-secret-refresh-key-foodlens-2026"
```

---

## 2. Reference Secrets in Container Apps

Container Apps reference Key Vault secrets using managed identity or container app secrets:
```bash
az containerapp secret set \
  --name foodlens-api-gateway \
  --resource-group foodlens-dev-rg \
  --secrets "db-url=postgresql://foodlens_user:P@ssw0rd123456!@foodlens-dev-psql-server.postgres.database.azure.com:5432/foodlens_db?schema=public"
```
