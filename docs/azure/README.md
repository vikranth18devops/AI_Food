# FoodLens AI - Microsoft Azure Cloud Architecture & Data Flow Guide

This document contains full multi-region architectural specifications, component interaction diagrams, step-by-step data flow sequences, and production guides for **FoodLens AI** on **Microsoft Azure**.

---

## 📋 Azure Resource Inventory & Cost Reference

Below is the compact, single-screen resource inventory and estimated operational cost breakdown (Pay-As-You-Go pricing for `eastus` Primary & `westeurope` DR):

| Resource & SKU | 1 Hr | 1 Day | 1 Wk | 1 Mo | Purpose & Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🌐 `azurerm_cdn_frontdoor_profile` (Standard) | `$0.05` | `$1.13` | `$7.90` | `$34.30` | Global Anycast Router & WAF |
| 🛡️ `azurerm_api_management` (`Consumption_0`) | `$0.00` | `$0.00` | `$0.00` | `$0.00` | Serverless API Facade (1M free/mo) |
| ⚡ `azurerm_container_app` (8 Apps, Serverless) | `$0.01` | `$0.36` | `$2.52` | `$10.95` | 8 Microservices Mesh |
| 🗄️ `azurerm_postgresql_flexible_server` (`B1ms`) | `$0.05` | `$1.13` | `$7.89` | `$34.05` | Primary PostgreSQL DB (`eastus`) |
| 🔄 `azurerm_postgresql_flexible_server_replica` | `$0.05` | `$1.13` | `$7.89` | `$34.05` | Read Replica DB (`westeurope`) |
| ⚡ `azurerm_redis_cache` (`Basic C0`) | `$0.02` | `$0.53` | `$3.70` | `$16.06` | Nutrition & Video Cache Layer |
| 📦 `azurerm_storage_account` (`Standard RA-GRS`) | `$0.00` | `$0.08` | `$0.54` | `$2.30` | Food Image Blob Storage (50GB) |
| 🐳 `azurerm_container_registry` (Premium Geo-Rep)| `$0.07` | `$1.67` | `$11.69` | `$50.00` | Geo-Replicated Image Registry |
| 🔐 `azurerm_key_vault` (Standard) | `$0.00` | `$0.01` | `$0.07` | `$0.30` | Vault Secrets (JWT & Passwords) |
| 🚨 `azurerm_monitor_metric_alert` (4 Alert Rules) | `$0.00` | `$0.01` | `$0.09` | `$0.40` | SRE Metric Alert Rules |
| 📊 `azurerm_log_analytics_workspace` (PerGB2018) | `$0.00` | `$0.12` | `$0.84` | `$3.65` | Centralized Logs (5GB/mo free) |
| 💵 **TOTAL AZURE MULTI-REGION COST** | **`~$0.25`** | **`~$6.17`** | **`~$43.13`** | **`~$186.06`** | **Complete Azure Infrastructure Total** |

---

## 🏗️ 1. Azure Multi-Region Architecture Diagram

```mermaid
flowchart TD
    subgraph Anycast_Global ["1. Global Anycast Ingress & WAF"]
        Client["React 18 SPA / Mobile App"]
        FrontDoor["Azure Front Door Global Anycast Router"]
    end

    subgraph Primary_Region ["2. Primary Azure Region (East US)"]
        APIM_Primary["Azure APIM Primary"]
        Traefik_Primary["Traefik v3 Ingress Proxy"]
        
        subgraph ACA_Primary ["ACA Primary Environment"]
            Gateway_P["foodlens-api-gateway"]
            Auth_P["foodlens-auth-service"]
            Image_P["foodlens-image-service"]
            Food_P["foodlens-food-service"]
            Nutri_P["foodlens-nutrition-service"]
            Analysis_P["foodlens-analysis-service"]
            Rec_P["foodlens-recommendation-service"]
            Broker_P[("foodlens-rabbitmq")]
        end

        Postgres_P[("Azure DB for PostgreSQL Primary")]
        Redis_P[("Azure Cache for Redis")]
        Storage_P[("Azure Storage Account Primary")]
    end

    subgraph Secondary_Region ["3. Secondary Azure Region (West Europe Failover)"]
        APIM_Secondary["Azure APIM Secondary"]
        Traefik_Secondary["Traefik v3 Secondary Proxy"]
        
        subgraph ACA_Secondary ["ACA Failover Environment"]
            Gateway_S["foodlens-api-gateway Failover"]
            Microservices_S["Failover Microservices Mesh"]
            Broker_S[("foodlens-rabbitmq Secondary")]
        end

        Postgres_S[("Azure DB for PostgreSQL Read Replica")]
        Redis_S[("Azure Cache for Redis Secondary")]
        Storage_S[("Azure Storage Account Secondary Replica")]
    end

    subgraph Security_Monitoring ["4. Identity, Registry & Observability"]
        ACR["Azure Container Registry"]
        KeyVault["Azure Key Vault"]
        LogAnalytics["Azure Log Analytics Workspace"]
    end

    Client --> FrontDoor
    FrontDoor --> APIM_Primary
    FrontDoor -.-> APIM_Secondary

    APIM_Primary --> Traefik_Primary
    Traefik_Primary --> Gateway_P
    Gateway_P --> Auth_P
    Gateway_P --> Image_P
    Image_P --> Storage_P
    Image_P --> Postgres_P
    Image_P --> Broker_P

    Broker_P --> Food_P
    Food_P --> Postgres_P
    Food_P --> Broker_P

    Broker_P --> Nutri_P
    Nutri_P <--> Redis_P
    Nutri_P --> Postgres_P
    Nutri_P --> Broker_P

    Broker_P --> Analysis_P
    Analysis_P --> Postgres_P
    Analysis_P --> Broker_P

    Broker_P --> Rec_P
    Rec_P <--> Redis_P
    Rec_P --> Postgres_P
    Rec_P --> Broker_P

    Broker_P --> Gateway_P
    Gateway_P --> Client

    APIM_Secondary --> Traefik_Secondary
    Traefik_Secondary --> Gateway_S
    Gateway_S --> Microservices_S
    Microservices_S --> Postgres_S
    Microservices_S --> Storage_S

    Postgres_P ==> Postgres_S
    Storage_P ==> Storage_S

    ACR -.-> ACA_Primary
    ACR -.-> ACA_Secondary
    KeyVault -.-> ACA_Primary
    KeyVault -.-> ACA_Secondary
    ACA_Primary --> LogAnalytics
    ACA_Secondary --> LogAnalytics
```

---

## ⚡ 2. Azure Multi-Region Execution Flow Chart

```
[ Client / React SPA / Mobile App ]
                │
                │ (1. HTTPS Request Payload)
                ▼
  [ Azure Front Door Anycast Router ]
  (Global Health Probes & WAF Shield)
                │
                ├─────────────────────────────────────────────────────────────────────────┐
                │                                                                         │
                ▼ (Primary Route: East US Healthy)                                        ▼ (Disaster Recovery Route: Failover)
  [ Azure APIM Primary (East US) ]                                          [ Azure APIM Secondary (West Europe) ]
                │                                                                         │
                ▼                                                                         ▼
  [ Traefik v3 Primary Proxy ]                                              [ Traefik v3 Secondary Proxy ]
                │                                                                         │
                ▼                                                                         ▼
  [ API Gateway Container App (East US) ]                                   [ API Gateway Container App (West Europe) ]
                │                                                                         │
      ┌─────────┴─────────┐                                                     ┌─────────┴─────────┐
      │                   │                                                     │                   │
      ▼ (Sync Auth)       ▼ (Upload Stream)                                     ▼ (Failover Auth)   ▼ (Failover Upload)
 [ Auth Service ]   [ Image Service ]                                      [ Auth Service ]    [ Image Service ]
      │                   │                                                     │                   │
      ▼                   ▼                                                     ▼                   ▼
 [ Azure Postgres ] [ Azure Storage (Blob) ]                               [ PostgreSQL Replica ] [ Storage Replica (GRS) ]
      (Primary)      (Primary uploads)                                      (Promoted Primary)  (Read-Access Secondary)
                          │                                                                         │
                          ▼ (Publish: FOOD_ANALYSIS_REQUESTED)                                       ▼
             [ RabbitMQ Primary Broker ]                                               [ RabbitMQ Secondary Broker ]
                          │                                                                         │
    ┌─────────────────────┼─────────────────────┐                                   ┌───────────────┼───────────────┐
    ▼                     ▼                     ▼                                   ▼               ▼               ▼
[ Food Service ]   [ Nutrition Service ] [ Analysis Service ]                   [ Food Service ] [ Nutrition Svc ] [ Analysis Svc ]
(Vision AI Engine) (USDA 100g Lookup)  (AI Health Insights)                     (Failover Mesh)  (Failover Mesh)  (Failover Mesh)
    │                     │                     │                                   │               │               │
    ▼                     ▼                     ▼                                   ▼               ▼               ▼
[ Azure Postgres ] [ Azure Redis ]     [ Azure Postgres ]                       [ Postgres Rep ] [ Secondary Redis ] [ Postgres Rep ]
    │                     │                     │                                   │               │               │
    └─────────────────────┼─────────────────────┘                                   └───────────────┼───────────────┘
                          │ (Async Event Chain)                                                     │
                          ▼                                                                         ▼
          [ Recommendation Service (East US) ]                                    [ Recommendation Service (West Europe) ]
          (YouTube Recipe Video Search)                                           (Failover Video Search)
                          │                                                                         │
                          ▼ (Publish: FOOD_ANALYSIS_COMPLETED)                                      ▼
          [ API Gateway Primary Container App ]                                    [ API Gateway Secondary Container App ]
                          │                                                                         │
                          ▼ (Real-Time SSE Event Stream)                                            ▼
            [ Client / React SPA UI ] ──────────────────────────────────────────────────────────────┘
```

---

## 🗺️ 3. Step-by-Step Documentation Index (0 - 15)

0. [00 - Azure Architecture & Flow Diagram](00-architecture-flow-diagram.md): Dedicated visual Mermaid flowcharts and sequence diagrams.
1. [01 - Prerequisites & Tooling Setup](01-prerequisites.md): Install Azure CLI, Terraform, and configure ACR credentials.
2. [02 - Complete Azure Terraform Resources Provisioning](02-terraform-aca-provisioning.md): Detailed breakdown of all 25 Azure resources provisioned via Terraform.
3. [03 - ACA Environment & Revisions Verification](03-aca-environment-verification.md): Verify Container Apps Environment status, revisions, and health.
4. [04 - Key Vault Secrets Integration](04-keyvault-secrets-aca.md): Configure Azure Key Vault secrets and map them to Container Apps environment variables.
5. [05 - Azure PostgreSQL Flexible Server](05-postgresql-flexible-server.md): Provision Azure Database for PostgreSQL Flexible Server (`foodlens_db`).
6. [06 - Traefik v3 Ingress & Custom Domains](06-aca-ingress-custom-domain.md): Configure external HTTPS ingress for API Gateway & Frontend with custom domain binding.
7. [07 - Microservices Communication & DNS](07-microservices-communication.md): Internal microservices routing, internal ingress, and DNS service discovery.
8. [08 - Observability & Log Analytics](08-observability-log-analytics.md): Azure Log Analytics Workspace, App Insights telemetry, and streaming container logs.
9. [09 - PostgreSQL Schema Migrations](09-postgresql-migrations.md): Run Prisma migrations and seed initial data against Azure PostgreSQL.
10. [10 - GitHub Actions CI/CD Pipeline](10-github-actions-ci-cd-aca.md): Configure automated ACR image building and ACA deployment pipeline.
11. [11 - One-Click ACA Deployment Script](11-one-click-aca-deploy.md): Automated one-command deployment and teardown guide.
12. [12 - Azure Multi-Region Active-Active Architecture](12-multi-region-failover.md): Azure Front Door global routing and PostgreSQL Read Replicas.
13. [13 - Azure API Management (APIM) Integration](13-api-management-apim.md): APIM gateway facade, rate limiting policies, and developer portal.
14. [14 - Real-Time Disaster Recovery Failover & Failback Runbook](14-realtime-failover-runbook.md): Step-by-step operational runbook for live Azure region failover and failback.
15. [15 - Azure SRE Alert Incident Response Runbook](15-sre-alert-incident-runbook.md): SRE operational triage, diagnostic CLI commands, and remediation steps for Azure Monitor metric alerts.
