# 12 - Azure Multi-Region Active-Active & Failover Architecture

This guide details configuring Multi-Region Disaster Recovery (DR) and High Availability (HA) on Microsoft Azure.

---

## 🏗️ Azure Multi-Region Component Mapping

| Service | Primary Region (`eastus`) | Secondary Region (`westeurope`) | Multi-Region Integration |
| :--- | :--- | :--- | :--- |
| **Global Router** | Azure Front Door Profile | Azure Front Door Profile | Azure Front Door Global Anycast & Health Probes |
| **Compute** | ACA Environment (`eastus`) | ACA Environment (`westeurope`) | Multi-Region Container App Revisions |
| **Database** | PostgreSQL Flexible Primary | PostgreSQL Flexible Read Replica | Asynchronous DB Replication |
| **Caching** | Azure Cache for Redis | Azure Cache for Redis | Secondary Redis Instance |
| **Storage** | Storage Account (`RA-GRS`) | Storage Account Secondary | Geo-Redundant Storage (GRS) |

---

## 🛠️ Failover Execution Steps

### 1. Promote Secondary PostgreSQL Read Replica
```bash
az postgres flexible-server replica stop-replication \
  --resource-group foodlens-dev-rg \
  --name foodlens-dev-psql-replica-west
```

### 2. Update Front Door Endpoint Target
Azure Front Door automatically routes traffic to `westeurope` when health probes detect primary endpoint outage (`RTO < 2 mins`).
