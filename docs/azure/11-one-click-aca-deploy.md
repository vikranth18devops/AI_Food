# 11 - One-Click ACA Deployment Script

This guide covers running the automated single-command deployment script to provision the entire FoodLens AI stack on Azure Container Apps.

---

## 1. Run One-Click ACA Deployment Script

Execute the master deployment script:
```bash
chmod +x application/scripts/deploy_azure_aca.sh
./application/scripts/deploy_azure_aca.sh
```

The script automatically executes:
1. Azure Resource Group & Storage Account creation
2. Terraform ACA Environment, PostgreSQL Flexible Server, Redis, Key Vault, Storage, & ACR provisioning
3. Database migrations & seed initialization
4. Microservices health checks & URL outputs

---

## 2. Teardown & Clean Up

To delete all Azure Container Apps resources and Resource Groups:
```bash
chmod +x application/scripts/teardown_azure_aca.sh
./application/scripts/teardown_azure_aca.sh
```
