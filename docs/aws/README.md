# FoodLens AI - AWS Production Deployment Guide

This directory contains step-by-step guides for provisioning, deploying, and operating the **FoodLens AI Microservices Platform** on **Amazon Web Services (AWS)** using **ECS Fargate, RDS PostgreSQL, ElastiCache Redis, S3, and ALB**.

---

## 📋 AWS Resource Inventory & Cost Reference

Below is the compact, single-screen resource inventory and estimated operational cost breakdown (Pay-As-You-Go pricing for `us-east-1` Primary & `us-west-2` DR):

| Resource & SKU | 1 Hr | 1 Day | 1 Wk | 1 Mo | Purpose & Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🌐 `aws_route53_record` (Anycast DNS) | `$0.00` | `$0.02` | `$0.13` | `$0.60` | Latency-Based Routing & Global Health Probes |
| ⚖️ `aws_lb` (ALB Standard) | `$0.03` | `$0.60` | `$4.20` | `$18.25` | External HTTPS Ingress & Listener Rules |
| ⚡ `aws_ecs_cluster` (8 Fargate Tasks) | `$0.05` | `$1.22` | `$8.57` | `$37.23` | 8 Microservices Containers (2 vCPU / 4GB) |
| 🗄️ `aws_db_instance` (`db.t4g.micro`) | `$0.02` | `$0.50` | `$3.53` | `$15.33` | Primary PostgreSQL DB (`us-east-1`) |
| 🔄 `aws_db_instance` (`db.t4g.micro` Replica)| `$0.02` | `$0.50` | `$3.53` | `$15.33` | Async Read Replica DB (`us-west-2`) |
| ⚡ `aws_elasticache_cluster` (`cache.t4g.micro`)| `$0.02` | `$0.41` | `$2.86` | `$12.41` | Nutrition Facts & Video Cache Layer |
| 📦 `aws_s3_bucket` (Standard CRR) | `$0.00` | `$0.07` | `$0.50` | `$2.20` | Food Image Uploads (50GB Cross-Region) |
| 🐳 `aws_ecr_repository` (Private ECR) | `$0.00` | `$0.03` | `$0.23` | `$1.00` | Private Container Image Repositories (10GB) |
| 🔐 `aws_secretsmanager_secret` (Standard) | `$0.00` | `$0.05` | `$0.37` | `$1.60` | Vault Secrets (DB Passwords & JWT Tokens) |
| 🚨 `aws_cloudwatch_metric_alarm` (3 Rules) | `$0.01` | `$0.12` | `$0.84` | `$3.65` | SRE Metric Alarms & CloudWatch Logs |
| 💵 **TOTAL AWS MULTI-REGION COST** | **`~$0.15`** | **`~$3.52`** | **`~$24.76`** | **`~$107.60`** | **Complete AWS Infrastructure Total** |

---

## 🗺️ Step-by-Step Documentation Index (0 - 14)

0. [00 - AWS Architecture & Flow Diagram](00-architecture-flow-diagram.md): Visual Mermaid flowcharts, execution sequence diagrams, and failover flows.
1. [01 - Prerequisites & Tooling Setup](01-prerequisites.md): Install AWS CLI, Terraform, and configure ECR authentication.
2. [02 - Complete AWS Terraform Resources Provisioning](02-terraform-aws-provisioning.md): Detailed breakdown of all 20+ AWS resources provisioned via Terraform.
3. [03 - ECS Cluster & Fargate Verification](03-ecs-cluster-verification.md): Verify ECS Cluster health, task definitions, and ALB DNS.
4. [04 - AWS Secrets Manager Integration](04-secrets-manager-aws.md): Manage database credentials and JWT tokens in Secrets Manager.
5. [05 - AWS RDS PostgreSQL Setup](05-rds-postgresql.md): Provision and manage RDS PostgreSQL 15 database instance (`foodlens_db`).
6. [06 - Traefik v3 Ingress & Custom Domains](06-alb-ingress-custom-domain.md): Configure Traefik Ingress Controller, ALB target groups, listeners, and Route 53 domain mapping.
7. [07 - Microservices Communication & DNS](07-microservices-communication.md): AWS Cloud Map / Service Connect internal service discovery.
8. [08 - Observability & CloudWatch](08-observability-cloudwatch.md): AWS CloudWatch container logs, metrics, and alarm triggers.
9. [09 - PostgreSQL Schema Migrations](09-postgresql-migrations.md): Run Prisma migrations and seed data against RDS PostgreSQL.
10. [10 - GitHub Actions CI/CD Pipeline](10-github-actions-ci-cd-aws.md): Configure automated ECR image building and ECS task deployment.
11. [11 - One-Click AWS Deployment Script](11-one-click-aws-deploy.md): Automated one-command deployment and teardown guide.
12. [12 - AWS Multi-Region Active-Active Architecture](12-multi-region-failover.md): Route 53 global failover routing and RDS Read Replicas.
13. [13 - AWS Real-Time Disaster Recovery Failover & Failback Runbook](13-realtime-failover-runbook.md): Operational runbook for live AWS region failover and failback.
14. [14 - AWS SRE Alert Incident Response Runbook](14-sre-alert-incident-runbook.md): SRE operational triage, diagnostic CLI commands, and remediation steps for CloudWatch alarms.
