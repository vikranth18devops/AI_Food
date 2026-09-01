# FoodLens AI - GCP Production Deployment Guide

This directory contains step-by-step guides for provisioning, deploying, and operating the **FoodLens AI Microservices Platform** on **Google Cloud Platform (GCP)** using **Cloud Run, Cloud SQL PostgreSQL, Memorystore Redis, GCS, and Artifact Registry**.

---

## 📋 GCP Resource Inventory & Architecture Reference

Before deploying, review all 15+ GCP resources provisioned via Terraform:

| Resource Name / Type | GCP Service | SKU / Tier | Purpose & Description | Multi-Region Status |
| :--- | :--- | :--- | :--- | :--- |
| `google_compute_network` | VPC Network | `10.0.0.0/20` | Custom VPC & Subnetworks for Cloud Run & DB | Regional Subnets per Region |
| `google_compute_global_forwarding_rule` | Global Load Balancer | Global External | Anycast HTTP(S) Load Balancer & WAF Armor | **Global Anycast Service** |
| `google_vpc_access_connector` | VPC Access Connector | e2-micro | Serverless VPC Access Connector for Cloud Run | Regional Connector |
| `google_cloud_run_v2_service` (x8) | Cloud Run | Serverless Revisions | 8 Microservices Containers (`api-gateway`, `auth`, etc.) | Primary (`us-central1`) / Secondary (`europe-west1`) |
| `google_sql_database_instance` | Cloud SQL PostgreSQL | `db-custom-2-7680` | Primary PostgreSQL 15 Database (`foodlens_db`) | Primary Write Node (`us-central1`) |
| `google_sql_database_instance` (Replica) | Cloud SQL Replica | `db-custom-2-7680` | Async Cross-Region Read Replica Database | Failover Read Replica (`europe-west1`) |
| `google_redis_instance` | Memorystore Redis | `BASIC` Tier | Fast Nutrition Facts & Video Caching Layer | Active Instances per Region |
| `google_storage_bucket` | Cloud Storage (GCS) | Multi-Region | Food Image Storage Bucket (`NAM4` / `EU`) | Dual-Region / Multi-Region Sync |
| `google_artifact_registry_repository` | Artifact Registry | Docker Repo | Central Container Image Repository | Multi-Region Image Replication |
| `google_monitoring_alert_policy` (x2) | Cloud Operations | SRE Metric Rules | P1/P2 Golden Signals Alerts (CPU, 5xx Errors) | Multi-Region Metric Alerts |
| `google_secret_manager_secret` | Secret Manager | Standard | Key Vault Secrets for DB passwords & JWT secrets | Global Secret Access |
| `google_logging_project_sink` | Cloud Operations | Standard | Centralized Container Logs & Metrics Sinks | Global Operations Sink |

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
