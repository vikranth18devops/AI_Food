# 13 - AWS Real-Time Disaster Recovery (DR) Failover & Failback Runbook

This document provides a step-by-step operational runbook for executing a **Real-Time Disaster Recovery (DR) Failover** and subsequent **Failback** of the **FoodLens AI Platform** across AWS regions (`us-east-1` Primary $\rightarrow$ `us-west-2` Secondary).

---

## ⏱️ Target Recovery Metrics

| Metric | Target SLA | Description |
| :--- | :--- | :--- |
| **RTO (Recovery Time Objective)** | **< 3 Minutes** | Time required to switch global DNS traffic to `us-west-2`. |
| **RPO (Recovery Point Objective)** | **< 1 Minute** | Maximum data lag between RDS Primary & Cross-Region Replica. |

---

## 🚨 PHASE 1: Real-Time Failover Execution (us-east-1 Outage)

### Step 1: Promote RDS PostgreSQL Cross-Region Read Replica
Promote the `us-west-2` read replica database to become a standalone primary instance:

```bash
# 1. Promote RDS Read Replica in us-west-2
aws rds promote-read-replica \
  --db-instance-identifier foodlens-dev-postgres-replica-west \
  --region us-west-2

# 2. Verify instance status changes to available
aws rds describe-db-instances \
  --db-instance-identifier foodlens-dev-postgres-replica-west \
  --region us-west-2 \
  --query "DBInstances[0].DBInstanceStatus"
```

---

### Step 2: Shift Route 53 Global Traffic
Update Route 53 DNS routing policies to direct global traffic to `us-west-2` Application Load Balancer (ALB):

```bash
# Update Route 53 Routing Policy to point to Secondary ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.foodlens.ai",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z1H1FL5HABSF5D",
          "DNSName": "foodlens-dev-alb-west-123456789.us-west-2.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'
```

---

### Step 3: Update ECS Fargate Task Definitions
Update ECS Task Definitions in `us-west-2` to connect to the promoted RDS database endpoint (`foodlens-dev-postgres-replica-west.us-west-2.rds.amazonaws.com`):

```bash
NEW_DB_URL="postgresql://foodlens_admin:P%40ssw0rd12345!@foodlens-dev-postgres-replica-west.us-west-2.rds.amazonaws.com:5432/foodlens_db?sslmode=require"

# Update ECS API Gateway Task Definition
aws ecs update-service \
  --cluster foodlens-dev-cluster-west \
  --service foodlens-api-gateway-service \
  --region us-west-2 \
  --force-new-deployment
```

---

## ✅ PHASE 2: Post-Failover Verification

Execute automated sanity checks against `us-west-2` services:

```bash
# 1. Test API Gateway Health Check
curl -i https://api.foodlens.ai/api/health

# 2. Test End-to-End Image Upload
curl -X POST https://api.foodlens.ai/api/analysis/upload \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "image=@sample_food.jpg"
```

---

## 🔄 PHASE 3: Real-Time Failback Execution (Restoring us-east-1)

Once `us-east-1` primary infrastructure is fully restored, execute failback:

```bash
# 1. Create Cross-Region Read Replica in us-east-1 pointing to us-west-2
aws rds create-db-instance-read-replica \
  --db-instance-identifier foodlens-dev-postgres-primary \
  --source-db-instance-identifier arn:aws:rds:us-west-2:123456789012:db:foodlens-dev-postgres-replica-west \
  --region us-east-1

# 2. Re-point Route 53 DNS to us-east-1 ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://route53-primary.json
```
