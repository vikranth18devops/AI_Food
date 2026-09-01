# FoodLens AI - Microsoft Azure Cloud Architecture & Data Flow Guide

This document contains full multi-region architectural specifications, component interaction diagrams, step-by-step data flow sequences, and production guides for **FoodLens AI** on **Microsoft Azure**.

---

## 🏗️ 1. Azure Multi-Region Architecture Diagram

```mermaid
flowchart TD
    classDef clientStyle fill:#0078D4,color:#fff,stroke:#004578,stroke-width:2px;
    classDef edgeStyle fill:#5C2D91,color:#fff,stroke:#3B1E5D,stroke-width:2px;
    classDef acaStyle fill:#008272,color:#fff,stroke:#004E44,stroke-width:2px;
    classDef dataStyle fill:#107C41,color:#fff,stroke:#0A4B27,stroke-width:2px;
    classDef secStyle fill:#D83B01,color:#fff,stroke:#8E2600,stroke-width:2px;
    classDef replicaStyle fill:#7A7A7A,color:#fff,stroke:#4A4A4A,stroke-width:2px,stroke-dasharray: 5 5;

    subgraph Anycast_Global ["1. Global Anycast Ingress & WAF"]
        Client["React 18 SPA / Mobile App"]:::clientStyle
        FrontDoor["Azure Front Door (Global Anycast Router)<br/>- Multi-Region Latency & Health Probes<br/>- Web Application Firewall (WAF)"]:::edgeStyle
    end

    subgraph Primary_Region ["2. Primary Azure Region (East US)"]
        APIM_Primary["Azure APIM Primary<br/>(Consumption_0)"]:::edgeStyle
        Traefik_Primary["Traefik v3 Ingress Proxy"]:::edgeStyle
        
        subgraph ACA_Primary ["ACA Primary Environment (VNet: 10.0.0.0/21)"]
            Gateway_P["foodlens-api-gateway (3000)"]:::acaStyle
            Auth_P["foodlens-auth-service (3001)"]:::acaStyle
            Image_P["foodlens-image-service (3002)"]:::acaStyle
            Food_P["foodlens-food-service (3003)"]:::acaStyle
            Nutri_P["foodlens-nutrition-service (3004)"]:::acaStyle
            Analysis_P["foodlens-analysis-service (3005)"]:::acaStyle
            Rec_P["foodlens-recommendation-service (3006)"]:::acaStyle
            Broker_P[("foodlens-rabbitmq (5672)")]:::secStyle
        end

        Postgres_P[("Azure DB for PostgreSQL<br/>Flexible Primary (v15)")]:::dataStyle
        Redis_P[("Azure Cache for Redis")]:::dataStyle
        Storage_P[("Azure Storage Account<br/>(Blob: uploads RA-GRS)")]:::dataStyle
    end

    subgraph Secondary_Region ["3. Secondary Azure Region (West Europe Failover)"]
        APIM_Secondary["Azure APIM Secondary<br/>(Failover Facade)"]:::replicaStyle
        Traefik_Secondary["Traefik v3 Secondary Proxy"]:::replicaStyle
        
        subgraph ACA_Secondary ["ACA Failover Environment (VNet: 10.1.0.0/21)"]
            Gateway_S["foodlens-api-gateway (Failover)"]:::replicaStyle
            Microservices_S["Failover Microservices Mesh<br/>(Auth, Image, Food, Nutri, Analysis, Rec)"]:::replicaStyle
            Broker_S[("foodlens-rabbitmq (Secondary)")]:::replicaStyle
        end

        Postgres_S[("Azure DB for PostgreSQL<br/>Flexible Read Replica")]:::replicaStyle
        Redis_S[("Azure Cache for Redis<br/>(Secondary)")]:::replicaStyle
        Storage_S[("Azure Storage Account<br/>Secondary Replica (RA-GRS)")]:::replicaStyle
    end

    subgraph Security_Monitoring ["4. Identity, Registry & Observability"]
        ACR["Azure Container Registry (ACR)<br/>foodlensdevacr.azurecr.io"]
        KeyVault["Azure Key Vault<br/>foodlensdevkv.vault.azure.net"]
        LogAnalytics["Azure Log Analytics Workspace<br/>foodlens-dev-law"]
    end

    Client -->|1. HTTPS Request| FrontDoor
    FrontDoor -->|2a. Active Path (Primary Health OK)| APIM_Primary
    FrontDoor -.->|2b. Automatic DR Failover| APIM_Secondary

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

    Postgres_P ==="Async Cross-Region DB Replication"===> Postgres_S
    Storage_P ==="Geo-Redundant Storage (RA-GRS) Sync"===> Storage_S

    ACR -.->|Pull Container Images| ACA_Primary
    ACR -.->|Pull Container Images| ACA_Secondary
    KeyVault -.->|Inject Secrets| ACA_Primary
    KeyVault -.->|Inject Secrets| ACA_Secondary
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
