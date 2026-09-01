# 15 - Azure SRE Alert Incident Response Runbook

This runbook provides step-by-step triage, diagnostic CLI commands, and remediation procedures for SRE On-Call Engineers responding to Azure metric alerts across the **FoodLens AI** platform.

---

## 🚨 SRE Severity Classification Matrix

| Severity Level | Response SLA | Notification Channel | Example Incidents |
| :--- | :--- | :--- | :--- |
| **P1 - Critical** | **< 15 Minutes** | PagerDuty / On-Call Phone Call | DB CPU > 80%, APIM Errors > 5%, Storage > 85%, ACA Outage |
| **P2 - Warning** | **< 1 Hour** | Slack `#sre-alerts` / Email | DB Replication Lag > 60s, Container p95 Latency > 1.5s |
| **P3 - Informational**| **Next Business Day** | JIRA Ticket Creation | Non-blocking Redis cache miss spike |

---

## 🛠️ Incident Triage & Remediation Procedures

### 1. Alert Rule: `foodlens-dev-alert-postgres-high-cpu` (P1 Critical)

**Symptom**: PostgreSQL Flexible Server CPU utilization exceeded 80% for 5 consecutive minutes.

#### Diagnostic Commands
```bash
# 1. Fetch active query connections on PostgreSQL
az postgres flexible-server show \
  --resource-group foodlens-dev-rg \
  --name foodlens-dev-psql-server \
  --query "{State:state, MetricCpu:cpuPercent}"

# 2. Check container logs for microservices executing long-running queries
az containerapp logs show \
  --resource-group foodlens-dev-rg \
  --name foodlens-food-service \
  --follow
```

#### Remediation Steps
1. Identify and terminate deadlocked or long-running unindexed queries via `pg_stat_activity`.
2. Scale up PostgreSQL compute SKU tier if traffic volume exceeds `Standard_B1ms`:
   ```bash
   az postgres flexible-server update \
     --resource-group foodlens-dev-rg \
     --name foodlens-dev-psql-server \
     --sku-name Standard_D2ds_v4
   ```

---

### 2. Alert Rule: `foodlens-dev-alert-apim-failed-requests` (P1 Critical)

**Symptom**: Azure API Management Gateway failed requests (5xx/4xx) exceeded 5% threshold.

#### Diagnostic Commands
```bash
# 1. Stream APIM Gateway Diagnostic Logs
az apim show \
  --resource-group foodlens-dev-rg \
  --name foodlens-dev-apim \
  --query "gatewayUrl"

# 2. Inspect API Gateway Container App health
az containerapp show \
  --resource-group foodlens-dev-rg \
  --name foodlens-api-gateway \
  --query "properties.provisioningState"
```

#### Remediation Steps
1. Verify backend API Gateway container app responsiveness (`curl https://<api-gateway-fqdn>/api/health`).
2. If API Gateway container app is crashing or memory throttled, scale replica count:
   ```bash
   az containerapp update \
     --resource-group foodlens-dev-rg \
     --name foodlens-api-gateway \
     --min-replicas 3 \
     --max-replicas 10
   ```

---

### 3. Alert Rule: `foodlens-dev-alert-redis-high-memory` (P1 Critical)

**Symptom**: Azure Cache for Redis memory usage exceeded 85%.

#### Diagnostic Commands
```bash
# Check Redis memory usage and eviction metrics
az redis show \
  --resource-group foodlens-dev-rg \
  --name foodlensdevredis \
  --query "{Host:hostName, Port:sslPort, ProvisioningState:provisioningState}"
```

#### Remediation Steps
1. Connect via Redis CLI and run `MEMORY USAGE` / key eviction check.
2. Flush transient recommendation video cache keys or scale Redis instance to `Standard C1`.
