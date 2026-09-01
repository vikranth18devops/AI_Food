# FoodLens AI - GCP Production Deployment Guide

This directory contains step-by-step guides for provisioning, deploying, and operating the **FoodLens AI Microservices Platform** on **Google Cloud Platform (GCP)** using **Cloud Run, Cloud SQL PostgreSQL, Memorystore Redis, GCS, and Artifact Registry**.

---

## 📋 GCP Resource Inventory & Cost / Pricing Reference

Below is the complete resource inventory and estimated operational cost breakdown based on GCP Standard Pay-As-You-Go pricing (us-central1 & europe-west1 DR):

| Resource Name / Type | GCP Service | SKU / Tier | 1 Hr Usage | 1 Day (24h) | 1 Week (168h) | 1 Month (730h) | Purpose & Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `google_compute_global_forwarding_rule` | Global Load Balancer | Global External | `$0.027` | `$0.65` | `$4.54` | `$19.71` | Anycast HTTP(S) Load Balancer & WAF Armor |
| `google_vpc_access_connector` | VPC Access Connector | e2-micro | `$0.008` | `$0.19` | `$1.34` | `$5.84` | Serverless VPC Access Connector for Cloud Run |
| `google_cloud_run_v2_service` (x8) | Cloud Run | Serverless | `$0.012` | `$0.29` | `$2.02` | `$8.76` | 8 Microservices Containers (2M free calls/mo) |
| `google_sql_database_instance` | Cloud SQL Primary | `db-custom-2-7680` | `$0.098` | `$2.35` | `$16.46` | `$71.54` | Primary PostgreSQL 15 Database (`us-central1`) |
| `google_sql_database_instance` (Replica) | Cloud SQL Replica | `db-custom-2-7680` | `$0.098` | `$2.35` | `$16.46` | `$71.54` | Async Cross-Region Read Replica (`europe-west1`) |
| `google_redis_instance` | Memorystore Redis | `BASIC` Tier | `$0.049` | `$1.18` | `$8.23` | `$35.77` | Nutrition Facts & Video Caching Layer (1GB) |
| `google_storage_bucket` | Cloud Storage (GCS) | Multi-Region | `$0.003` | `$0.07` | `$0.51` | `$2.20` | Food Image Storage Bucket (`NAM4` / `EU`) |
| `google_artifact_registry_repository` | Artifact Registry | Docker Repo | `$0.001` | `$0.03` | `$0.23` | `$1.00` | Central Container Image Repository (10GB) |
| `google_monitoring_alert_policy` | Cloud Operations | SRE Metric Rules | `$0.004` | `$0.10` | `$0.67` | `$2.90` | P1/P2 Golden Signals Alerts & Logging |
| **TOTAL ESTIMATED COST** | **GCP Environment** | **Multi-Region** | **`~$0.30`** | **`~$7.21`** | **`~$50.46`** | **`~$219.26`** | **Complete GCP Infrastructure Total** |

---

## 🗺️ Step-by-Step Documentation Index (0 - 14)

0. [00 - GCP Architecture & Flow Diagram](00-architecture-flow-diagram.md): Visual Mermaid flowcharts, execution sequence diagrams, and failover flows.
1. [01 - Prerequisites & Tooling Setup](01-prerequisites.md): Install `gcloud` CLI, Terraform, and configure Artifact Registry authentication.
2. [02 - Complete GCP Terraform Resources Provisioning](02-terraform-gcp-provisioning.md): Detailed breakdown of all 15+ GCP resources provisioned via Terraform.
3. [03 - Cloud Run Services Verification](03-cloud-run-verification.md): Verify Cloud Run services, traffic allocation, and public URLs.
4. [04 - Secret Manager Integration](04-secret-manager-gcp.md): Manage database passwords and JWT secrets in GCP Secret Manager.
5. [05 - GCP Cloud SQL PostgreSQL Setup](05-cloud-sql-postgresql.md): Provision and manage Cloud SQL PostgreSQL 15 instance (`foodlens_db`).
6. [06 - Traefik v3 Ingress & Custom Domains](06-cloud-run-custom-domain.md): Configure custom domain mapping, Traefik Ingress, and managed SSL certificates.
7. [07 - Microservices Communication & VPC Access](07-microservices-communication.md): Serverless VPC Access Connector and internal microservices routing.
8. [08 - Observability & Cloud Logging](08-observability-cloud-logging.md): Google Cloud Operations, Cloud Logging, and Cloud Monitoring dashboards.
9. [09 - PostgreSQL Schema Migrations](09-postgresql-migrations.md): Run Prisma migrations and seed data against Cloud SQL.
10. [10 - GitHub Actions CI/CD Pipeline](10-github-actions-ci-cd-gcp.md): Configure automated Artifact Registry image building and Cloud Run revisions deployment.
11. [11 - One-Click GCP Deployment Script](11-one-click-gcp-deploy.md): Automated one-command deployment and teardown guide.
12. [12 - GCP Multi-Region Active-Active Architecture](12-multi-region-failover.md): Global External Load Balancer routing and Cloud SQL Read Replicas.
13. [13 - GCP Real-Time Disaster Recovery Failover & Failback Runbook](13-realtime-failover-runbook.md): Operational runbook for live GCP region failover and failback.
14. [14 - GCP SRE Alert Incident Response Runbook](14-sre-alert-incident-runbook.md): SRE operational triage, diagnostic CLI commands, and remediation steps for Google Monitoring alert policies.
