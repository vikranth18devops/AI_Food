# FoodLens AI - Microsoft Azure Cloud Architecture & Data Flow Guide

This document contains full architectural specifications, component interaction diagrams, step-by-step data flow sequences, and production guides for **FoodLens AI** on **Microsoft Azure**.

---

## 🏗️ 1. Azure Architecture Diagram

```mermaid
flowchart TB
    subgraph Client_Layer ["Client & Global Routing Layer"]
        Client["Users / React Frontend SPA / Mobile Apps"]
        FrontDoor["Azure Front Door (Global Anycast Router)<br/>- Multi-Region Failover & Latency Routing<br/>- Web Application Firewall (WAF)"]
    end

    subgraph API_Governance ["API Governance & Edge Router"]
        APIM["Azure API Management (APIM)<br/>- Consumption SKU (Consumption_0)<br/>- Rate-Limiting Policy (100 req/min)<br/>- CORS Wildcards & Subscription Keys"]
        Traefik["Traefik v3 Ingress Proxy<br/>- Ports 80 / 443 / 8080 Dashboard"]
    end

    subgraph ACA_Environment ["Azure Container Apps (ACA) Environment (VNet Delegated: 10.0.0.0/21)"]
        subgraph Public_Apps ["Public Facing Container Apps"]
            APIGateway["foodlens-api-gateway (Port 3000)<br/>- JWT Guard & Rate Limiter<br/>- SSE Event Stream Proxy"]
            FrontendApp["foodlens-frontend (Port 80)<br/>- React 18 SPA UI"]
        end

        subgraph Internal_Apps ["Internal Microservices Mesh"]
            AuthService["foodlens-auth-service (Port 3001)"]
            ImageService["foodlens-image-service (Port 3002)"]
            FoodService["foodlens-food-service (Port 3003)"]
            NutriService["foodlens-nutrition-service (Port 3004)"]
            AnalysisService["foodlens-analysis-service (Port 3005)"]
            RecService["foodlens-recommendation-service (Port 3006)"]
            RabbitMQApp["foodlens-rabbitmq (Ports 5672 / 15672)"]
        end
    end

    subgraph Security_ACR ["Identity, Registry & Secrets"]
        ACR["Azure Container Registry (ACR)<br/>foodlensdevacr.azurecr.io<br/>- Managed Identity AcrPull Role"]
        KeyVault["Azure Key Vault<br/>foodlensdevkv.vault.azure.net<br/>- DB Passwords & JWT Secrets"]
    end

    subgraph Azure_Data ["Azure Managed Databases & Caching"]
        PostgresFlex[("Azure DB for PostgreSQL<br/>Flexible Server (v15)<br/>- Private Subnet & DNS Zone<br/>- Read Replicas (HA/DR)")]
        AzureRedis[("Azure Cache for Redis<br/>foodlensdevredis.redis.cache.windows.net")]
        AzureStorage[("Azure Storage Account<br/>foodlensdevsa (Blob: uploads)<br/>- Geo-Redundant Storage (RA-GRS)")]
    end

    subgraph Azure_Monitoring ["Observability & Telemetry"]
        LogAnalytics["Azure Log Analytics Workspace<br/>foodlens-dev-law<br/>- Kusto Log Streaming & Insights"]
    end

    Client -->|HTTPS| FrontDoor
    FrontDoor -->|Route Traffic| APIM
    APIM -->|Inbound Policy| Traefik
    Traefik -->|Proxy Router| APIGateway
    Traefik -->|Proxy Router| FrontendApp

    APIGateway -->|REST| AuthService
    APIGateway -->|REST| ImageService
    ImageService -->|Publish: FOOD_ANALYSIS_REQUESTED| RabbitMQApp

    RabbitMQApp -->|Consume| FoodService
    FoodService -->|Publish: FOOD_RECOGNIZED| RabbitMQApp

    RabbitMQApp -->|Consume| NutriService
    NutriService <-->|Check Cache| AzureRedis
    NutriService -->|Publish: NUTRITION_COMPLETED| RabbitMQApp

    RabbitMQApp -->|Consume| AnalysisService
    AnalysisService -->|Publish: HEALTH_ANALYSIS_COMPLETED| RabbitMQApp

    RabbitMQApp -->|Consume| RecService
    RecService <-->|Check Cache| AzureRedis
    RecService -->|Publish: FOOD_ANALYSIS_COMPLETED| RabbitMQApp

    AuthService --> PostgresFlex
    ImageService --> PostgresFlex
    ImageService --> AzureStorage
    FoodService --> PostgresFlex
    NutriService --> PostgresFlex
    AnalysisService --> PostgresFlex
    RecService --> PostgresFlex

    ACR -.->|Pull Container Images| ACA_Environment
    KeyVault -.->|Inject Secrets| ACA_Environment
    ACA_Environment -->|Stream Container Logs| LogAnalytics
```

---

## 🗺️ Step-by-Step Documentation Index (0 - 13)

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
