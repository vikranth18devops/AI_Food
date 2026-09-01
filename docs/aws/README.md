# FoodLens AI - AWS Production Deployment Guide

This directory contains step-by-step guides for provisioning, deploying, and operating the **FoodLens AI Microservices Platform** on **Amazon Web Services (AWS)** using **ECS Fargate, RDS PostgreSQL, ElastiCache Redis, S3, and ALB**.

---

## 🗺️ Step-by-Step Documentation Index (1 - 11)

1. [01 - Prerequisites & Tooling Setup](01-prerequisites.md): Install AWS CLI, Terraform, and configure ECR authentication.
2. [02 - Complete AWS Terraform Resources Provisioning](02-terraform-aws-provisioning.md): Detailed breakdown of all 20+ AWS resources provisioned via Terraform.
3. [03 - ECS Cluster & Fargate Verification](03-ecs-cluster-verification.md): Verify ECS Cluster health, task definitions, and ALB DNS.
4. [04 - AWS Secrets Manager Integration](04-secrets-manager-aws.md): Manage database credentials and JWT tokens in Secrets Manager.
5. [05 - AWS RDS PostgreSQL Setup](05-rds-postgresql.md): Provision and manage RDS PostgreSQL 15 database instance (`foodlens_db`).
6. [06 - ALB Ingress & Custom Domains](06-alb-ingress-custom-domain.md): Configure Application Load Balancer target groups, listeners, and Route 53 domain mapping.
7. [07 - Microservices Communication & DNS](07-microservices-communication.md): AWS Cloud Map / Service Connect internal service discovery.
8. [08 - Observability & CloudWatch](08-observability-cloudwatch.md): AWS CloudWatch container logs, metrics, and alarm triggers.
9. [09 - PostgreSQL Schema Migrations](09-postgresql-migrations.md): Run Prisma migrations and seed data against RDS PostgreSQL.
10. [10 - GitHub Actions CI/CD Pipeline](10-github-actions-ci-cd-aws.md): Configure automated ECR image building and ECS task deployment.
11. [11 - One-Click AWS Deployment Script](11-one-click-aws-deploy.md): Automated one-command deployment and teardown guide.
