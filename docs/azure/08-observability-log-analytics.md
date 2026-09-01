# 08 - Observability & Log Analytics

This guide covers streaming live container stdout/stderr logs and querying Log Analytics Workspaces.

---

## 1. Stream Live Container Logs

Stream real-time logs from API Gateway container app:
```bash
az containerapp logs show \
  --name foodlens-api-gateway \
  --resource-group foodlens-dev-rg \
  --follow
```

---

## 2. Query Log Analytics Workspace

Query Log Analytics Workspace using Kusto (KQL):
```kql
ContainerAppConsoleLogs_CL
| where ContainerAppName_s == "foodlens-api-gateway"
| project TimeGenerated, Log_s, Stream_s
| order by TimeGenerated desc
| take 100
```
