# 14 - AWS SRE Alert Incident Response Runbook

This runbook provides step-by-step triage, diagnostic CLI commands, and remediation procedures for SRE On-Call Engineers responding to CloudWatch metric alarms across the **FoodLens AI** AWS platform.

---

## 🚨 SRE Severity Classification Matrix

| Severity Level | Response SLA | Notification Channel | Example Incidents |
| :--- | :--- | :--- | :--- |
| **P1 - Critical** | **< 15 Minutes** | SNS / PagerDuty / On-Call | RDS CPU > 80%, ALB 5xx > 10, Storage Free < 5GB |
| **P2 - Warning** | **< 1 Hour** | Slack `#sre-alerts` / Email | ECS Fargate Memory > 85%, Target Response Time > 1.5s |
| **P3 - Informational**| **Next Business Day** | JIRA Ticket Creation | ElastiCache Redis cache miss spike |

---

## 🛠️ Incident Triage & Remediation Procedures

### 1. Alarm Rule: `foodlens-dev-alert-rds-high-cpu` (P1 Critical)

**Symptom**: RDS PostgreSQL CPU utilization exceeded 80% for 5 consecutive minutes.

#### Diagnostic Commands
```bash
# 1. Fetch CloudWatch CPU Metric statistics for RDS
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=foodlens-dev-postgres \
  --start-time $(date -u -v-30M +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 300 \
  --statistics Average

# 2. Check running ECS tasks submitting queries
aws ecs list-tasks \
  --cluster foodlens-dev-cluster \
  --service-name foodlens-food-service
```

#### Remediation Steps
1. Scale RDS instance class if traffic exceeds `db.t4g.micro`:
   ```bash
   aws rds modify-db-instance \
     --db-instance-identifier foodlens-dev-postgres \
     --db-instance-class db.t4g.medium \
     --apply-immediately
   ```

---

### 2. Alarm Rule: `foodlens-dev-alert-alb-5xx-errors` (P1 Critical)

**Symptom**: Application Load Balancer HTTP 5xx error count exceeded 10 in 5 minutes.

#### Diagnostic Commands
```bash
# Stream CloudWatch Container Logs for API Gateway
aws logs tail /aws/ecs/foodlens-api-gateway --follow
```

#### Remediation Steps
1. Scale up ECS Fargate task count:
   ```bash
   aws ecs update-service \
     --cluster foodlens-dev-cluster \
     --service foodlens-api-gateway-service \
     --desired-count 4
   ```
