# 14 - Azure Real-Time Disaster Recovery (DR) Failover & Failback Runbook

This document provides a step-by-step operational runbook for executing a **Real-Time Disaster Recovery (DR) Failover** and subsequent **Failback** of the **FoodLens AI Platform** across Azure regions (`East US` Primary $\rightarrow$ `West Europe` Secondary).

---

## ⏱️ Target Recovery Metrics

| Metric | Target SLA | Description |
| :--- | :--- | :--- |
| **RTO (Recovery Time Objective)** | **< 3 Minutes** | Time required to switch global traffic to `West Europe`. |
| **RPO (Recovery Point Objective)** | **< 1 Minute** | Maximum data lag between PostgreSQL Primary & Read Replica. |

---

## 🚨 PHASE 1: Real-Time Failover Execution (East US Outage)

Follow these exact steps when `East US` region experiences a critical outage or degradation.

### Step 1: Promote PostgreSQL Flexible Server Read Replica
Stop asynchronous replication and promote the `westeurope` read replica to standalone primary database:

```bash
# 1. Stop DB replication in West Europe
az postgres flexible-server replica stop-replication \
  --resource-group foodlens-dev-rg \
  --name foodlens-dev-psql-replica-west

# 2. Verify server state is Read-Write
az postgres flexible-server show \
  --resource-group foodlens-dev-rg \
  --name foodlens-dev-psql-replica-west \
  --query "{Name:name, State:state, UserVisibleState:userVisibleState}" \
  --output table
```

---

### Step 2: Trigger Azure Storage Account Geo-Failover
Execute failover on the Geo-Redundant Storage (GRS) account to make `West Europe` secondary endpoint the primary write target:

```bash
# Initiate Customer-Managed Storage Failover
az storage account failover \
  --resource-group foodlens-dev-rg \
  --name foodlensdevsa \
  --yes
```

---

### Step 3: Shift Azure Front Door Global Traffic
Force Azure Front Door to route 100% of global HTTP/HTTPS traffic to the `West Europe` APIM gateway:

```bash
# Disable East US backend origin in Azure Front Door
az afd origin update \
  --resource-group foodlens-dev-rg \
  --profile-name foodlens-afd-profile \
  --origin-group-name foodlens-apim-origingroup \
  --origin-name eastus-apim-origin \
  --enabled-state Disabled

# Force route refresh
az afd route update \
  --resource-group foodlens-dev-rg \
  --profile-name foodlens-afd-profile \
  --endpoint-name foodlens-global-endpoint \
  --route-name default-route \
  --link-to-default-domain Enabled
```

---

### Step 4: Update Secondary Container Apps Connection Strings
Update Container Apps environment variables in `westeurope` to point to the newly promoted PostgreSQL primary (`foodlens-dev-psql-replica-west`):

```bash
NEW_DB_URL="postgresql://foodlens_admin:P%40ssw0rd123456!@foodlens-dev-psql-replica-west.postgres.database.azure.com:5432/foodlens_db?sslmode=require"

# Update API Gateway Revision
az containerapp update \
  --resource-group foodlens-dev-rg \
  --name foodlens-api-gateway-west \
  --set-env-vars DATABASE_URL=$NEW_DB_URL

# Update Image Service Revision
az containerapp update \
  --resource-group foodlens-dev-rg \
  --name foodlens-image-service-west \
  --set-env-vars DATABASE_URL=$NEW_DB_URL
```

---

## ✅ PHASE 2: Post-Failover Verification

Execute these automated sanity checks to verify system readiness in `West Europe`:

```bash
# 1. Test APIM Gateway Health Check Endpoint
curl -i https://foodlens-apim-west.azure-api.net/api/health

# 2. Test End-to-End Image Upload API
curl -X POST https://foodlens-apim-west.azure-api.net/api/analysis/upload \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "image=@sample_food.jpg"
```

---

## 🔄 PHASE 3: Real-Time Failback Execution (Restoring East US)

Once `East US` region infrastructure is fully restored, execute failback:

```bash
# 1. Re-establish East US PostgreSQL as Read Replica of West Europe
az postgres flexible-server replica create \
  --resource-group foodlens-dev-rg \
  --name foodlens-dev-psql-server \
  --source-server foodlens-dev-psql-replica-west \
  --location eastus

# 2. Re-enable East US origin in Azure Front Door
az afd origin update \
  --resource-group foodlens-dev-rg \
  --profile-name foodlens-afd-profile \
  --origin-group-name foodlens-apim-origingroup \
  --origin-name eastus-apim-origin \
  --enabled-state Enabled
```
