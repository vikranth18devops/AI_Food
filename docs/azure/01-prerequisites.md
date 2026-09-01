# 01 - Prerequisites & Tooling Setup

This guide walks through installing required CLI tools and authenticating with Azure.

---

## 1. Install Required CLI Tools

### macOS (Homebrew)
```bash
brew install azure-cli terraform jq
```

### Linux (Ubuntu/Debian)
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
sudo apt-get update && sudo apt-get install -y terraform jq
```

---

## 2. Authenticate with Azure CLI

Login to your Azure account:
```bash
az login
```

Set active Subscription:
```bash
az account set --subscription "YOUR_AZURE_SUBSCRIPTION_ID"
```

Verify active subscription:
```bash
az account show --output table
```

---

## 3. Create Resource Group & ACR for Remote State

Create global resource group:
```bash
az group create --name foodlens-global-rg --location eastus
```

Create Azure Container Registry (ACR):
```bash
az acr create --resource-group foodlens-global-rg --name foodlensdevacr --sku Standard
```

Log in to ACR:
```bash
az acr login --name foodlensdevacr
```
