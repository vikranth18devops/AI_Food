#!/usr/bin/env bash

# ==============================================================================
# FoodLens AI - Automated One-Click Azure Container Apps (ACA) Deployment Script
# ==============================================================================

set -eo pipefail

RESOURCE_GROUP="foodlens-global-rg"
LOCATION="eastus"
STORAGE_ACCOUNT="foodlenstfstate"
CONTAINER_NAME="tfstate"

echo "=== 1. Creating Azure Remote State Storage ==="
az group create --name "${RESOURCE_GROUP}" --location "${LOCATION}" || true
az storage account create --name "${STORAGE_ACCOUNT}" --resource-group "${RESOURCE_GROUP}" --location "${LOCATION}" --sku Standard_LRS || true
az storage container create --name "${CONTAINER_NAME}" --account-name "${STORAGE_ACCOUNT}" || true

echo "=== 2. Provisioning ACA Architecture via Terraform ==="
cd application/infra/terraform/azure
terraform init \
  -backend-config="resource_group_name=${RESOURCE_GROUP}" \
  -backend-config="storage_account_name=${STORAGE_ACCOUNT}" \
  -backend-config="container_name=${CONTAINER_NAME}" \
  -backend-config="key=aca.tfstate"

terraform apply -auto-approve
cd -

echo "=== 3. Azure Container Apps Deployment Complete! ==="
