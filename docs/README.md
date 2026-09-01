# FoodLens AI Documentation Portal

Welcome to the central documentation portal for **FoodLens AI**. This directory contains all architecture specs, database schemas, API specs, security policies, and multi-region cloud production deployment guides ordered alphabetically.

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

## ☁️ Multi-Region Multi-Cloud Production Guides (Alphabetical Order)

### 1. Amazon Web Services ([`aws/`](aws/))
- **12-Step Multi-Region Production Guide**: AWS ECS Fargate, RDS PostgreSQL Cross-Region Replicas, ElastiCache Redis, S3 CRR, Secrets Manager, ALB, Route 53 Failover, and CloudWatch.
- **Master Guide**: [`aws/README.md`](aws/README.md)
- **Multi-Region Failover Guide**: [`aws/12-multi-region-failover.md`](aws/12-multi-region-failover.md)

### 2. Microsoft Azure ([`azure/`](azure/))
- **12-Step Multi-Region Production Guide**: Azure Container Apps (ACA), PostgreSQL Flexible Server Read Replicas, Azure Redis, Blob Storage GRS, Key Vault, Azure Front Door, and Log Analytics.
- **Master Guide**: [`azure/README.md`](azure/README.md)
- **Multi-Region Failover Guide**: [`azure/12-multi-region-failover.md`](azure/12-multi-region-failover.md)

### 3. Google Cloud Platform ([`gcp/`](gcp/))
- **12-Step Multi-Region Production Guide**: GCP Cloud Run, Cloud SQL PostgreSQL Read Replicas, Memorystore Redis, Dual-Region GCS, Secret Manager, Global External Load Balancer, and Cloud Logging.
- **Master Guide**: [`gcp/README.md`](gcp/README.md)
- **Multi-Region Failover Guide**: [`gcp/12-multi-region-failover.md`](gcp/12-multi-region-failover.md)
