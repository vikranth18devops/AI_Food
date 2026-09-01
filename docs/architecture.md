# FoodLens AI - Comprehensive Platform Architecture & Flow Diagrams

This document contains full architectural specifications, component interaction diagrams, event-driven async flow sequences, and multi-cloud infrastructure models for **FoodLens AI**.

---

## 1. Complete Microservices Architecture Diagram

```mermaid
flowchart TB
    subgraph Client_Layer ["Client & Edge Layer"]
        Client["React 18 SPA (Vite + TypeScript)"]
        Traefik["Traefik v3 Edge Proxy / Ingress<br/>(Ports 80 / 443 / 8080)"]
    end

    subgraph Gateway_Layer ["Gateway & Security Layer"]
        APIGateway["API Gateway (Port 3000)<br/>- JWT Authentication Guard<br/>- Rate Limiting & Security Headers<br/>- SSE Event Proxy"]
        AuthService["Auth Service (Port 3001)<br/>- User Reg & Password Hashing<br/>- JWT Access & Refresh Tokens"]
    end

    subgraph Service_Mesh ["Microservices Layer (Asynchronous & Synchronous)"]
        ImageService["Image Service (Port 3002)<br/>- Image Validation & Storage<br/>- Blob / Local File Uploads"]
        FoodService["Food Recognition Service (Port 3003)<br/>- Vision AI Engine<br/>- Dish Identification"]
        NutriService["Nutrition Service (Port 3004)<br/>- Macro/Micronutrient Engine<br/>- 100g Base Calculations"]
        AnalysisService["Health Analysis Service (Port 3005)<br/>- AI Health Interpretation<br/>- Allergens & Health Claims"]
        RecService["Recommendation Service (Port 3006)<br/>- YouTube Recipe Search<br/>- Caching Engine"]
    end

    subgraph Event_Broker ["Event Broker & Caching"]
        RabbitMQ[("RabbitMQ Message Broker<br/>(Ports 5672 / 15672)<br/>AMQP Event Exchange")]
        Redis[("Redis Cache Cluster<br/>(Port 6379)<br/>- Nutrition & Video Caching")]
    end

    subgraph Persistence_Layer ["Data Persistence & Storage"]
        Postgres[("Azure / AWS / GCP PostgreSQL<br/>(Port 5432)<br/>- Relational Database")]
        ObjectStorage[("Object Storage<br/>(S3 / Blob Storage / GCS)<br/>- Uploaded Food Images")]
    end

    %% Client Routing
    Client -->|HTTPS / REST / SSE| Traefik
    Traefik -->|Proxy Router| APIGateway

    %% Gateway Service Connections
    APIGateway -->|REST / HTTP| AuthService
    APIGateway -->|REST / HTTP| ImageService
    AuthService -->|User Schema Query| Postgres
    ImageService -->|Upload Metadata| Postgres
    ImageService -->|Store Image| ObjectStorage

    %% Async Event-Driven Bus Connections
    ImageService -->|Publish: FOOD_ANALYSIS_REQUESTED| RabbitMQ

    RabbitMQ -->|Consume: FOOD_ANALYSIS_REQUESTED| FoodService
    FoodService -->|Vision AI Query| AI_Vision["Vision AI Engine"]
    FoodService -->|Save Dish Metadata| Postgres
    FoodService -->|Publish: FOOD_RECOGNIZED| RabbitMQ

    RabbitMQ -->|Consume: FOOD_RECOGNIZED| NutriService
    NutriService <-->|Check Cache| Redis
    NutriService -->|Save Nutrition Facts| Postgres
    NutriService -->|Publish: NUTRITION_COMPLETED| RabbitMQ

    RabbitMQ -->|Consume: NUTRITION_COMPLETED| AnalysisService
    AnalysisService -->|AI Health Interpretation| AI_LLM["LLM Insights Engine"]
    AnalysisService -->|Save Health Claims| Postgres
    AnalysisService -->|Publish: HEALTH_ANALYSIS_COMPLETED| RabbitMQ

    RabbitMQ -->|Consume: HEALTH_ANALYSIS_COMPLETED| RecService
    RecService <-->|Check Video Cache| Redis
    RecService -->|Save Curated Videos| Postgres
    RecService -->|Publish: FOOD_ANALYSIS_COMPLETED| RabbitMQ

    RabbitMQ -->|Consume: COMPLETED -> SSE Stream| APIGateway
```

---

## 2. Event-Driven Workflow Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as React SPA Frontend
    participant Gateway as API Gateway
    participant ImageSvc as Image Service
    participant Broker as RabbitMQ Event Bus
    participant FoodSvc as Food Recognition Service
    participant NutriSvc as Nutrition Service
    participant HealthSvc as Health Analysis Service
    participant RecSvc as Recommendation Service
    participant DB as PostgreSQL DB

    User->>Gateway: POST /api/analysis/upload (Image File + SSE Connection)
    Gateway->>ImageSvc: Forward Multipart Upload
    ImageSvc->>DB: Create Root Analysis Record (Status: PENDING)
    ImageSvc->>Broker: Publish FOOD_ANALYSIS_REQUESTED (analysisId, imageUri)
    ImageSvc-->>Gateway: 202 Accepted (analysisId)
    Gateway-->>User: 202 Accepted (Listening on SSE Stream)

    Broker->>FoodSvc: Consume FOOD_ANALYSIS_REQUESTED
    FoodSvc->>FoodSvc: Execute Vision AI Identification
    FoodSvc->>DB: Insert IdentifiedFood & Ingredients
    FoodSvc->>Broker: Publish FOOD_RECOGNIZED (analysisId, dishName)

    Broker->>NutriSvc: Consume FOOD_RECOGNIZED
    NutriSvc->>NutriSvc: Query Nutrition Engine (100g Base Metrics)
    NutriSvc->>DB: Insert NutritionFacts
    NutriSvc->>Broker: Publish NUTRITION_COMPLETED (analysisId)

    Broker->>HealthSvc: Consume NUTRITION_COMPLETED
    HealthSvc->>HealthSvc: Generate AI Health Analysis & Allergen Flags
    HealthSvc->>DB: Insert HealthAnalysis & Factual Claims
    HealthSvc->>Broker: Publish HEALTH_ANALYSIS_COMPLETED (analysisId)

    Broker->>RecSvc: Consume HEALTH_ANALYSIS_COMPLETED
    RecSvc->>RecSvc: Fetch YouTube Recipe Tutorials
    RecSvc->>DB: Insert YouTubeVideo Links & Update Status: COMPLETED
    RecSvc->>Broker: Publish FOOD_ANALYSIS_COMPLETED (analysisId)

    Broker->>Gateway: Consume FOOD_ANALYSIS_COMPLETED
    Gateway-->>User: SSE Event: COMPLETED (Payload: Full Food Card Data)
```

---

## 3. Multi-Cloud Deployment Architecture

```mermaid
graph TD
    subgraph Azure ["Microsoft Azure Cloud (Production)"]
        ACA["Azure Container Apps Environment<br/>- Traefik v3 Ingress<br/>- 8 Microservice Apps"]
        PSQL_Az["Azure DB for PostgreSQL<br/>Flexible Server"]
        Redis_Az["Azure Cache for Redis"]
        KV_Az["Azure Key Vault"]
    end

    subgraph AWS ["Amazon Web Services (Production)"]
        ECS["AWS ECS Fargate Cluster<br/>- Application Load Balancer<br/>- 8 Fargate Tasks"]
        RDS_AWS["AWS RDS PostgreSQL"]
        Redis_AWS["AWS ElastiCache Redis"]
        SM_AWS["AWS Secrets Manager"]
    end

    subgraph GCP ["Google Cloud Platform (Production)"]
        CR["GCP Cloud Run Environment<br/>- Cloud Run Ingress<br/>- 8 Container Revisions"]
        CSQL_GCP["GCP Cloud SQL PostgreSQL"]
        Redis_GCP["GCP Memorystore Redis"]
        SM_GCP["GCP Secret Manager"]
    end
```
