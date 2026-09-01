# FoodLens AI - AWS Production Deployment Guide

This directory contains step-by-step guides for provisioning, deploying, and operating the **FoodLens AI Microservices Platform** on **Amazon Web Services (AWS)** using **ECS Fargate, RDS PostgreSQL, ElastiCache Redis, S3, and ALB**.

---

## 📋 AWS Resource Inventory & Architecture Reference

Before deploying, review all 20+ AWS resources provisioned via Terraform:

| Resource Name / Type | AWS Service | SKU / Tier | Purpose & Description | Multi-Region Status |
| :--- | :--- | :--- | :--- | :--- |
| `aws_vpc` | VPC & Networking | `10.0.0.0/16` | Custom VPC & Public/Private Subnets across 2 AZs | Regional VPC per Region |
| `aws_route53_record` | Route 53 | Anycast DNS | Latency-Based Routing & Global Health Probes | **Global Anycast Service** |
| `aws_lb` | Application Load Balancer | ALB Standard | External HTTPS Ingress & Listener Rules | Regional ALB per Region |
| `aws_ecs_cluster` | ECS Fargate Cluster | Serverless Compute | Container Cluster (`foodlens-dev-cluster`) | Primary (`us-east-1`) / Secondary (`us-west-2`) |
| `aws_ecs_task_definition` (x8) | ECS Task Defs | Fargate 0.25 vCPU | 8 Microservices Container Definitions | Dual-Region Deployment |
| `aws_ecs_service` (x8) | ECS Services | Fargate Launch | Auto-scaling microservices task instances | Primary Mesh / Failover Mesh |
| `aws_db_instance` | RDS PostgreSQL | `db.t4g.micro` | Primary PostgreSQL 15 Database (`foodlens_db`) | Primary Write Node (`us-east-1`) |
| `aws_db_instance` (Replica) | RDS Read Replica | `db.t4g.micro` | Async Cross-Region Read Replica Database | Failover Read Replica (`us-west-2`) |
| `aws_elasticache_cluster` | ElastiCache Redis | `cache.t4g.micro` | Nutrition Facts & Recipe Video Cache Layer | Active Instances per Region |
| `aws_s3_bucket` | S3 Object Storage | Standard CRR | Food Image Uploads (`foodlens-dev-uploads`) | Cross-Region Replication (CRR) |
| `aws_ecr_repository` (x8) | ECR Repositories | Private ECR | Image Repositories for 8 microservices | Cross-Region Replication Enabled |
| `aws_cloudwatch_metric_alarm` (x3) | CloudWatch Alarms | SRE Metric Rules | P1/P2 Golden Signals Alarms (CPU, Free Storage, 5xx Errors) | Multi-Region Metric Alarms |
| `aws_secretsmanager_secret` | Secrets Manager | Standard | Key Vault Secrets for DB passwords & JWT secrets | Replicated Secrets |
| `aws_cloudwatch_log_group` | CloudWatch Logs | Standard | Centralized Container Logs & Metric Alarms | Regional Log Streams |

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
