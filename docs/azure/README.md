# FoodLens AI - Microsoft Azure Cloud Architecture & Data Flow Guide

This document contains full multi-region architectural specifications, component interaction diagrams, step-by-step data flow sequences, and production guides for **FoodLens AI** on **Microsoft Azure**.

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
[ Client / React SPA ]
         │ (1. HTTPS Request)
         ▼
[ Azure Front Door ] ── (2. Anycast WAF Inspection & Global Failover)
         │
         ├─── (Active Primary Path) ────────────────────────────────────────────────────────┐
         │                                                                                  │
         ▼ (East US Primary)                                                                ▼ (West Europe Failover)
[ Azure APIM Primary ]                                                             [ Azure APIM Secondary ]
         │                                                                                  │
         ▼                                                                                  ▼
[ Traefik v3 Primary Proxy ]                                                       [ Traefik v3 Secondary Proxy ]
         │                                                                                  │
         ▼                                                                                  ▼
[ API Gateway Primary (ACA) ]                                                      [ API Gateway Secondary (ACA) ]
         │                                                                                  │
         ├───► [ Auth Service (ACA) ] ──► [ Azure PostgreSQL Flex ]                        │
         │                                           ▲                                      │
         └───► [ Image Service (ACA) ] ─► [ Storage (GRS) ]                         (Read Replica DB & Storage Sync)
                         │                           │                                      │
                         ▼ (FOOD_ANALYSIS_REQUESTED) │                                      │
           [ RabbitMQ Event Broker ]                 │                                      │
                         │                           │                                      │
   ┌─────────────────────┼─────────────────────┐     │                                      │
   ▼                     ▼                     ▼     │                                      │
[ Food Service ]  [ Nutrition Svc ]  [ Analysis Svc ]  │                                      │
   │                     │                     │     │                                      │
   ▼                     ▼                     ▼     │                                      │
[ Azure Postgres ] [ Azure Redis ]   [ Azure Postgres] │                                    │
   │                     │                     │     │                                      │
   └─────────────────────┼─────────────────────┘     │                                      │
                         │ (Event Chain)             │                                      │
                         ▼                           │                                      │
           [ Recommendation Service (ACA) ]          │                                      │
                         │                           │                                      │
                         ▼ (FOOD_ANALYSIS_COMPLETED) │                                      │
           [ API Gateway Primary (ACA) ]             │                                      │
                         │                           │                                      │
                         ▼ (Real-Time SSE Stream)    │                                      │
               [ Client / React SPA ] ───────────────┴──────────────────────────────────────┘
```

---

## 🗺️ 3. Step-by-Step Documentation Index (0 - 13)

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
