# 03 - ACA Environment & Revisions Verification

This guide explains how to verify Azure Container Apps environment health, active revisions, and ingress endpoints.

---

## 1. List Container Apps Environment Status

List active Container Apps:
```bash
az containerapp list --resource-group foodlens-dev-rg --output table
```

Output expected:
```text
Name                             ResourceGroup    Location    ProvisioningState    Fqdn
-------------------------------  ---------------  ----------  -------------------  ------------------------------------------------
foodlens-api-gateway             foodlens-dev-rg  eastus      Succeeded            foodlens-api-gateway.eastus.azurecontainerapps.io
foodlens-frontend                foodlens-dev-rg  eastus      Succeeded            foodlens-frontend.eastus.azurecontainerapps.io
foodlens-auth-service            foodlens-dev-rg  eastus      Succeeded
foodlens-image-service           foodlens-dev-rg  eastus      Succeeded
foodlens-food-service            foodlens-dev-rg  eastus      Succeeded
foodlens-nutrition-service       foodlens-dev-rg  eastus      Succeeded
foodlens-analysis-service        foodlens-dev-rg  eastus      Succeeded
foodlens-recommendation-service  foodlens-dev-rg  eastus      Succeeded
```

---

## 2. Check App Revisions & Health

Check active revisions for API Gateway:
```bash
az containerapp revision list \
  --name foodlens-api-gateway \
  --resource-group foodlens-dev-rg \
  --output table
```
