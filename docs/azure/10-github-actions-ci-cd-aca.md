# 10 - GitHub Actions CI/CD Pipeline for ACA

This guide details configuring secrets in GitHub Actions for building Docker images and updating Azure Container Apps.

---

## 1. Configure GitHub Repository Secrets

Add the following secrets to your GitHub repository Settings -> Secrets -> Actions:

| Secret Name | Description / Value |
| :--- | :--- |
| `AZURE_ACR_NAME` | `foodlensdevacr` |
| `AZURE_ACR_USERNAME` | ACR Admin Username |
| `AZURE_ACR_PASSWORD` | ACR Admin Password |

---

## 2. Deploy Container App via Azure CLI Action

Example workflow step to deploy updated image revision to ACA:
```yaml
- name: Deploy to Azure Container App
  uses: azure/CLI@v1
  with:
    inlineScript: |
      az containerapp update \
        --name foodlens-api-gateway \
        --resource-group foodlens-dev-rg \
        --image foodlensdevacr.azurecr.io/foodlens/api-gateway:${{ github.sha }}
```
