# FoodLens AI Documentation Portal

Welcome to the central documentation portal for **FoodLens AI**. This directory contains all architecture specs, database schemas, API specs, security policies, multi-region cloud production guides, and SRE incident runbooks ordered alphabetically.

---

## 📑 General Platform Documentation (Alphabetical Order)

| Guide | Description | Path |
| :--- | :--- | :--- |
| **API Reference** | API Gateway routes, request/response formats, and authentication | [`api.md`](api.md) |
| **Architecture Specification** | High-level component interactions, microservice dependencies & data flow | [`architecture.md`](architecture.md) |
| **Database Schema** | PostgreSQL entity relationships, tables, and field definitions | [`database.md`](database.md) |
| **Event Schemas** | Asynchronous RabbitMQ message payloads and event routing keys | [`events.md`](events.md) |
| **Security Policy** | Security disclosures, secret management, and compliance standards | [`SECURITY.md`](SECURITY.md) |

---

## ☁️ Multi-Region Multi-Cloud Production Guides & SRE Runbooks (Alphabetical Order)

### 1. Amazon Web Services ([`aws/`](aws/))
- **15-Step Multi-Region Production Suite**: AWS ECS Fargate, RDS PostgreSQL Cross-Region Replicas, ElastiCache Redis, S3 CRR, Secrets Manager, ALB, Route 53 Failover, CloudWatch Alarms, and SRE Incident Response Runbook.
- **Master Guide & Resource Inventory**: [`aws/README.md`](aws/README.md)
- **Multi-Region Architecture & Flow Diagrams**: [`aws/00-architecture-flow-diagram.md`](aws/00-architecture-flow-diagram.md)
- **Real-Time DR Failover Runbook**: [`aws/13-realtime-failover-runbook.md`](aws/13-realtime-failover-runbook.md)
- **SRE Alert Incident Response Runbook**: [`aws/14-sre-alert-incident-runbook.md`](aws/14-sre-alert-incident-runbook.md)

### 2. Microsoft Azure ([`azure/`](azure/))
- **16-Step Multi-Region Production Suite**: Azure Container Apps (ACA), Azure APIM Gateway (`Consumption_0`), PostgreSQL Flexible Server Read Replicas, Azure Redis, Blob Storage GRS, Key Vault, Azure Front Door, Azure Monitor Metric Alerts, and SRE Incident Response Runbook.
- **Master Guide & Resource Inventory**: [`azure/README.md`](azure/README.md)
- **Multi-Region Architecture & Flow Diagrams**: [`azure/00-architecture-flow-diagram.md`](azure/00-architecture-flow-diagram.md)
- **Real-Time DR Failover Runbook**: [`azure/14-realtime-failover-runbook.md`](azure/14-realtime-failover-runbook.md)
- **SRE Alert Incident Response Runbook**: [`azure/15-sre-alert-incident-runbook.md`](azure/15-sre-alert-incident-runbook.md)

### 3. Google Cloud Platform ([`gcp/`](gcp/))
- **15-Step Multi-Region Production Suite**: GCP Cloud Run, Cloud SQL PostgreSQL Read Replicas, Memorystore Redis, Dual-Region GCS, Secret Manager, Global External Load Balancer, Cloud Monitoring Alert Policies, and SRE Incident Response Runbook.
- **Master Guide & Resource Inventory**: [`gcp/README.md`](gcp/README.md)
- **Multi-Region Architecture & Flow Diagrams**: [`gcp/00-architecture-flow-diagram.md`](gcp/00-architecture-flow-diagram.md)
- **Real-Time DR Failover Runbook**: [`gcp/13-realtime-failover-runbook.md`](gcp/13-realtime-failover-runbook.md)
- **SRE Alert Incident Response Runbook**: [`gcp/14-sre-alert-incident-runbook.md`](gcp/14-sre-alert-incident-runbook.md)
