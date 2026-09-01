# 05 - Azure PostgreSQL Flexible Server

This guide explains Azure Database for PostgreSQL Flexible Server setup and VNet private networking.

---

## 1. Verify PostgreSQL Flexible Server Status

Check server status:
```bash
az postgres flexible-server show \
  --resource-group foodlens-dev-rg \
  --name foodlens-dev-psql-server \
  --output table
```

---

## 2. Verify Database Instance

List databases inside server:
```bash
az postgres flexible-server db list \
  --resource-group foodlens-dev-rg \
  --server-name foodlens-dev-psql-server \
  --output table
```

Output expected:
```text
Name         ResourceGroup
-----------  ---------------
foodlens_db  foodlens-dev-rg
```
