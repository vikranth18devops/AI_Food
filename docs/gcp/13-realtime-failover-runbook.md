# 13 - GCP Real-Time Disaster Recovery (DR) Failover & Failback Runbook

This document provides a step-by-step operational runbook for executing a **Real-Time Disaster Recovery (DR) Failover** and subsequent **Failback** of the **FoodLens AI Platform** across GCP regions (`us-central1` Primary $\rightarrow$ `europe-west1` Secondary).

---

## ⏱️ Target Recovery Metrics

| Metric | Target SLA | Description |
| :--- | :--- | :--- |
| **RTO (Recovery Time Objective)** | **< 3 Minutes** | Time required to switch Global External Load Balancer backends to `europe-west1`. |
| **RPO (Recovery Point Objective)** | **< 1 Minute** | Maximum data lag between Cloud SQL Primary & Cross-Region Replica. |

---

## 🚨 PHASE 1: Real-Time Failover Execution (us-central1 Outage)

### Step 1: Promote GCP Cloud SQL Read Replica
Promote the `europe-west1` read replica database to standalone primary instance:

```bash
# 1. Promote Cloud SQL Read Replica in europe-west1
gcloud sql instances promote-replica foodlens-dev-cloudsql-replica-eu

# 2. Verify instance status changes to RUNNABLE
gcloud sql instances describe foodlens-dev-cloudsql-replica-eu \
  --format="value(state)"
```

---

### Step 2: Update GCP Global External Load Balancer Backends
Shift Global External Application Load Balancer traffic to point to `europe-west1` Cloud Run backend service:

```bash
# Update Global External Load Balancer Backend Service
gcloud compute backend-services add-backend foodlens-global-backend \
  --global \
  --network-endpoint-group=foodlens-cloudrun-neg-eu \
  --network-endpoint-group-region=europe-west1

# Remove primary us-central1 backend NEG
gcloud compute backend-services remove-backend foodlens-global-backend \
  --global \
  --network-endpoint-group=foodlens-cloudrun-neg-us \
  --network-endpoint-group-region=us-central1
```

---

### Step 3: Update Cloud Run Service Environment Variables
Update Cloud Run service environment variables in `europe-west1` to connect to the promoted Cloud SQL database (`foodlens-dev-cloudsql-replica-eu`):

```bash
NEW_DB_URL="postgresql://foodlens_admin:P%40ssw0rd12345!@/foodlens_db?host=/cloudsql/foodlens-ai-project:europe-west1:foodlens-dev-cloudsql-replica-eu"

# Update API Gateway Cloud Run Service
gcloud run services update foodlens-api-gateway-eu \
  --region=europe-west1 \
  --update-env-vars=DATABASE_URL=$NEW_DB_URL
```

---

## ✅ PHASE 2: Post-Failover Verification

Execute automated sanity checks against `europe-west1` services:

```bash
# 1. Test API Gateway Health Check Endpoint
curl -i https://api.foodlens.ai/api/health

# 2. Test End-to-End Image Upload API
curl -X POST https://api.foodlens.ai/api/analysis/upload \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "image=@sample_food.jpg"
```

---

## 🔄 PHASE 3: Real-Time Failback Execution (Restoring us-central1)

Once `us-central1` primary infrastructure is fully restored, execute failback:

```bash
# 1. Create Cloud SQL Read Replica in us-central1 pointing to europe-west1
gcloud sql instances create foodlens-dev-cloudsql-primary \
  --master-instance-name=foodlens-dev-cloudsql-replica-eu \
  --region=us-central1 \
  --tier=db-custom-2-7680

# 2. Re-add us-central1 NEG backend to Global Load Balancer
gcloud compute backend-services add-backend foodlens-global-backend \
  --global \
  --network-endpoint-group=foodlens-cloudrun-neg-us \
  --network-endpoint-group-region=us-central1
```
