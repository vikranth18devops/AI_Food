# FoodLens AI - Microservices Food & Nutrition Platform

[![CI Pipeline](https://github.com/your-org/AI_Food/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/AI_Food/actions/workflows/ci.yml)
[![Docker Build](https://github.com/your-org/AI_Food/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/your-org/AI_Food/actions/workflows/docker-publish.yml)
[![Terraform CI](https://github.com/your-org/AI_Food/actions/workflows/terraform-ci.yml/badge.svg)](https://github.com/your-org/AI_Food/actions/workflows/terraform-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**FoodLens AI** is an enterprise-grade, cloud-native microservices platform for AI-powered food identification, nutritional analysis, recipe recommendations, and health insights.

---

## 📐 System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client_Layer ["Client & Edge Layer"]
        Client["React 18 SPA (Vite + TypeScript)"]
        Traefik["Traefik v3 Edge Proxy / Ingress<br/>(Ports 80 / 443 / 8080)"]
    end

    subgraph Gateway_Layer ["Gateway & Security Layer"]
        APIGateway["API Gateway (Port 3000)<br/>- JWT Guard & Rate Limiter<br/>- SSE Event Proxy"]
        AuthService["Auth Service (Port 3001)<br/>- Password Hashing & Tokens"]
    end

    subgraph Service_Mesh ["Microservices Layer (Alphabetical)"]
        AnalysisService["Analysis Service (Port 3005)"]
        FoodService["Food Service (Port 3003)"]
        ImageService["Image Service (Port 3002)"]
        NutriService["Nutrition Service (Port 3004)"]
        RecService["Recommendation Service (Port 3006)"]
    end

    subgraph Event_Broker ["Broker & Caching"]
        RabbitMQ[("RabbitMQ Broker (Port 5672)")]
        Redis[("Redis Cache (Port 6379)")]
    end

    subgraph Persistence ["Data & Storage"]
        Postgres[("PostgreSQL Database (Port 5432)")]
        ObjectStorage[("Object Storage (S3 / Azure Blob / GCS)")]
    end

    Client -->|HTTPS / REST / SSE| Traefik
    Traefik -->|Proxy Router| APIGateway

    APIGateway -->|REST| AuthService
    APIGateway -->|REST| ImageService
    AuthService --> Postgres
    ImageService --> Postgres
    ImageService --> ObjectStorage

    ImageService -->|FOOD_ANALYSIS_REQUESTED| RabbitMQ
    RabbitMQ --> FoodService
    FoodService --> Postgres
    FoodService -->|FOOD_RECOGNIZED| RabbitMQ

    RabbitMQ --> NutriService
    NutriService <--> Redis
    NutriService --> Postgres
    NutriService -->|NUTRITION_COMPLETED| RabbitMQ

    RabbitMQ --> AnalysisService
    AnalysisService --> Postgres
    AnalysisService -->|HEALTH_ANALYSIS_COMPLETED| RabbitMQ

    RabbitMQ --> RecService
    RecService <--> Redis
    RecService --> Postgres
    RecService -->|FOOD_ANALYSIS_COMPLETED| RabbitMQ

    RabbitMQ -->|SSE Stream Update| APIGateway
```

---

## 🏗️ Repository Directory Layout (Alphabetical Order)

```
AI_Food/
├── README.md                                # Platform overview & getting started guide
│
├── application/                             # Core Application Workspace
│   ├── .github/workflows/                   # GitHub Actions CI/CD (CI, Docker, Terraform)
│   ├── apps/                                # React Frontend Web Application (Vite/TypeScript)
│   ├── infra/                               # Infrastructure & DevOps Suites
│   │   ├── argocd/                          # ArgoCD GitOps Manifests & ApplicationSets
│   │   ├── helm/                            # Kubernetes Helm Chart (`foodlens-ai`)
│   │   ├── monitoring/                      # Observability (Dynatrace, ELK, Loki, Prometheus)
│   │   └── terraform/                       # Multi-Cloud IaC (AWS, Azure, GCP)
│   ├── packages/                            # Shared Configs, Types & Utilities
│   ├── prisma/                              # PostgreSQL Database Schema & Seeders
│   ├── scripts/                             # Deployment Scripts (`deploy_azure_aca.sh`)
│   ├── services/                            # 7 Node.js/TypeScript Microservices (Alphabetical)
│   │   ├── analysis-service/                # AI Vision Processing Engine (Port 3005)
│   │   ├── api-gateway/                     # Public Ingress Router & JWT Auth Proxy (Port 3000)
│   │   ├── auth-service/                    # User Accounts & Token Lifecycle (Port 3001)
│   │   ├── food-service/                    # Food Catalog & Recipes (Port 3003)
│   │   ├── image-service/                   # Image Processing & Blob Storage (Port 3002)
│   │   ├── nutrition-service/               # Macronutrient Engine (Port 3004)
│   │   └── recommendation-service/          # Dietary & Recipe Recommendation (Port 3006)
│   ├── docker-compose.yml                   # Local Multi-Container Development (with Traefik v3)
│   └── package.json                         # Workspace Scripts
│
└── docs/                                    # Central Documentation Portal (Alphabetical)
    ├── README.md                            # Documentation Index
    ├── api.md                               # REST API Endpoints & Gateway Routing
    ├── architecture.md                      # System Architecture & Component Interactions
    ├── database.md                          # PostgreSQL Entity Relationships & Schema
    ├── events.md                            # RabbitMQ Event Schemas & Topics
    ├── SECURITY.md                          # Security Policy & Vulnerability Reporting
    ├── aws/                                 # 11-Step Production AWS Guide (ECS, Fargate)
    ├── azure/                               # 11-Step Production Azure Guide (ACA, PaaS)
    └── gcp/                                 # 11-Step Production GCP Guide (Cloud Run)
```

---

## ⚡ Quick Start (Local Development)

Launch the complete platform locally using Docker Compose & Traefik v3:

```bash
cd application
npm install
docker compose up -d
```

### Local Endpoint Map:
- **API Gateway**: `http://localhost:3000`
- **PostgreSQL Database**: `localhost:5433` (foodlens_user/foodlens_password)
- **RabbitMQ Management**: `http://localhost:15672` (guest/guest)
- **React Frontend**: `http://localhost:5173`
- **Traefik v3 Proxy Dashboard**: `http://localhost:8080`

---

## ☁️ Multi-Cloud & DevOps Suites (Alphabetical Order)

### 1. Amazon Web Services (AWS)
- IaC: [`application/infra/terraform/aws`](file:///Users/aarvik/Documents/AI_Food/application/infra/terraform/aws) (ECS Fargate, RDS PostgreSQL, ElastiCache Redis, S3)
- Guide: [`docs/aws/README.md`](file:///Users/aarvik/Documents/AI_Food/docs/aws/README.md)

### 2. Microsoft Azure
- IaC: [`application/infra/terraform/azure`](file:///Users/aarvik/Documents/AI_Food/application/infra/terraform/azure) (Azure Container Apps, PostgreSQL Flexible Server, Redis, Key Vault)
- Guide: [`docs/azure/README.md`](file:///Users/aarvik/Documents/AI_Food/docs/azure/README.md)

### 3. Google Cloud Platform (GCP)
- IaC: [`application/infra/terraform/gcp`](file:///Users/aarvik/Documents/AI_Food/application/infra/terraform/gcp) (Cloud Run, Cloud SQL PostgreSQL, Memorystore Redis, GCS)
- Guide: [`docs/gcp/README.md`](file:///Users/aarvik/Documents/AI_Food/docs/gcp/README.md)

---

## 📖 Comprehensive Documentation (Alphabetical Order)

For detailed production deployment guides, refer to the [`docs/`](file:///Users/aarvik/Documents/AI_Food/docs) folder:
- 📡 **API Reference**: [`docs/api.md`](file:///Users/aarvik/Documents/AI_Food/docs/api.md)
- 📐 **Architecture Specification**: [`docs/architecture.md`](file:///Users/aarvik/Documents/AI_Food/docs/architecture.md)
- 🟧 **AWS Production Guide**: [`docs/aws/README.md`](file:///Users/aarvik/Documents/AI_Food/docs/aws/README.md)
- 🔵 **Azure Production Guide**: [`docs/azure/README.md`](file:///Users/aarvik/Documents/AI_Food/docs/azure/README.md)
- 🗄️ **Database Schema**: [`docs/database.md`](file:///Users/aarvik/Documents/AI_Food/docs/database.md)
- 📡 **Event Schemas**: [`docs/events.md`](file:///Users/aarvik/Documents/AI_Food/docs/events.md)
- 🔴 **GCP Production Guide**: [`docs/gcp/README.md`](file:///Users/aarvik/Documents/AI_Food/docs/gcp/README.md)
- 🛡️ **Security Policy**: [`docs/SECURITY.md`](file:///Users/aarvik/Documents/AI_Food/docs/SECURITY.md)
