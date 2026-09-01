# FoodLens AI - GCP Production Deployment Guide

This directory contains step-by-step guides for provisioning, deploying, and operating the **FoodLens AI Microservices Platform** on **Google Cloud Platform (GCP)** using **Cloud Run, Cloud SQL PostgreSQL, Memorystore Redis, GCS, and Artifact Registry**.

---

## 🗺️ Step-by-Step Documentation Index (0 - 12)

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
