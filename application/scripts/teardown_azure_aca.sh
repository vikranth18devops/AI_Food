#!/usr/bin/env bash

# ==============================================================================
# FoodLens AI - Automated Azure Container Apps Teardown Script
# ==============================================================================

set -eo pipefail

echo "=== 1. Destroying Terraform ACA Resources ==="
cd application/infra/terraform/azure
terraform destroy -auto-approve || true
cd -

echo "=== 2. Deleting Azure Resource Groups ==="
az group delete --name foodlens-dev-rg --yes --no-wait || true
az group delete --name foodlens-global-rg --yes --no-wait || true

echo "=== Azure ACA Teardown Completed! ==="
