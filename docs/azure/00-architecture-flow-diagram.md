# Azure End-to-End Architecture & Flow Diagram

This document contains visual Mermaid flowchart and sequence diagrams detailing the complete lifecycle of request routing, microservices processing, and data persistence on **Microsoft Azure**.

---

## 📐 1. Full Azure Architecture & Flowchart Diagram

```mermaid
flowchart TD
    %% Styling
    classDef clientStyle fill:#0078D4,color:#fff,stroke:#004578,stroke-width:2px;
    classDef edgeStyle fill:#5C2D91,color:#fff,stroke:#3B1E5D,stroke-width:2px;
    classDef acaStyle fill:#008272,color:#fff,stroke:#004E44,stroke-width:2px;
    classDef dataStyle fill:#107C41,color:#fff,stroke:#0A4B27,stroke-width:2px;
    classDef secStyle fill:#D83B01,color:#fff,stroke:#8E2600,stroke-width:2px;

    subgraph Client_Layer ["1. Client & Anycast Layer"]
        Client["React 18 SPA / Mobile App"]:::clientStyle
        FrontDoor["Azure Front Door (Global Anycast WAF)"]:::edgeStyle
    end

    subgraph Ingress_Layer ["2. API Governance & Ingress Layer"]
        APIM["Azure API Management (APIM)<br/>Consumption_0 SKU<br/>Rate-Limit: 100 req/min"]:::edgeStyle
        Traefik["Traefik v3 Ingress Proxy<br/>Ports 80 / 443 / 8080"]:::edgeStyle
    end

    subgraph Compute_Layer ["3. Azure Container Apps (ACA) Microservices Mesh"]
        Gateway["foodlens-api-gateway (3000)"]:::acaStyle
        Auth["foodlens-auth-service (3001)"]:::acaStyle
        Image["foodlens-image-service (3002)"]:::acaStyle
        Food["foodlens-food-service (3003)"]:::acaStyle
        Nutri["foodlens-nutrition-service (3004)"]:::acaStyle
        Analysis["foodlens-analysis-service (3005)"]:::acaStyle
        Rec["foodlens-recommendation-service (3006)"]:::acaStyle
    end

    subgraph Event_Layer ["4. Async Message Broker"]
        RabbitMQ[("foodlens-rabbitmq<br/>AMQP Port 5672")]:::secStyle
    end

    subgraph Persistence_Layer ["5. Managed Data & Storage Layer"]
        Postgres[("Azure DB for PostgreSQL<br/>Flexible Server (v15)")]:::dataStyle
        Redis[("Azure Cache for Redis")]:::dataStyle
        Storage[("Azure Storage Account<br/>Blob: uploads")]:::dataStyle
    end

    %% Routing Flow Connections
    Client -->|1. HTTPS Upload| FrontDoor
    FrontDoor -->|2. WAF Cleared| APIM
    APIM -->|3. Rate-Limit Passed| Traefik
    Traefik -->|4. Ingress Forward| Gateway

    Gateway -->|5a. Auth Token Verify| Auth
    Gateway -->|5b. File Stream Upload| Image

    Auth -->|User Table Lookup| Postgres
    Image -->|Save Blob File| Storage
    Image -->|Insert PENDING Status| Postgres
    Image -->|6. Publish Event| RabbitMQ

    RabbitMQ -->|7. Consume FOOD_ANALYSIS_REQUESTED| Food
    Food -->|Vision AI Query| VisionAI["Vision AI Engine"]
    Food -->|Save Dish Facts| Postgres
    Food -->|8. Publish Event| RabbitMQ

    RabbitMQ -->|9. Consume FOOD_RECOGNIZED| Nutri
    Nutri <-->|Check Cache| Redis
    Nutri -->|Save Nutrients| Postgres
    Nutri -->|10. Publish Event| RabbitMQ

    RabbitMQ -->|11. Consume NUTRITION_COMPLETED| Analysis
    Analysis -->|LLM Insights| LLM["LLM AI Engine"]
    Analysis -->|Save Health Claims| Postgres
    Analysis -->|12. Publish Event| RabbitMQ

    RabbitMQ -->|13. Consume HEALTH_ANALYSIS_COMPLETED| Rec
    Rec <-->|Check Video Cache| Redis
    Rec -->|Save Recipe Videos| Postgres
    Rec -->|14. Publish COMPLETED| RabbitMQ

    RabbitMQ -->|15. Real-Time Push| Gateway
    Gateway -->|16. SSE Stream Payload| Client
```

---

## 🔄 2. Azure End-to-End Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Client App (SPA)
    participant FrontDoor as Azure Front Door
    participant APIM as Azure APIM
    participant Gateway as API Gateway (ACA)
    participant ImageSvc as Image Service (ACA)
    participant Storage as Azure Storage Account
    participant Broker as RabbitMQ Event Bus
    participant FoodSvc as Food Service (ACA)
    participant NutriSvc as Nutrition Service (ACA)
    participant HealthSvc as Health Analysis Service (ACA)
    participant RecSvc as Recommendation Service (ACA)
    participant Redis as Azure Cache for Redis
    participant Postgres as Azure PostgreSQL Flex

    User->>FrontDoor: POST /api/analysis/upload (Food Image)
    FrontDoor->>APIM: Forward Inspected HTTPS Payload
    APIM->>APIM: Validate CORS & Rate Limit (100 req/min)
    APIM->>Gateway: Forward Request with Headers
    Gateway->>ImageSvc: Stream Image Multipart Payload
    ImageSvc->>Storage: Store Image File in Blob Container (uploads)
    ImageSvc->>Postgres: Create Analysis Record (Status: PENDING)
    ImageSvc->>Broker: Publish FOOD_ANALYSIS_REQUESTED Event
    ImageSvc-->>Gateway: 202 Accepted (analysisId)
    Gateway-->>User: 202 Accepted (Listening on SSE Stream)

    Broker->>FoodSvc: Consume FOOD_ANALYSIS_REQUESTED Event
    FoodSvc->>FoodSvc: Execute Vision AI Dish Identification
    FoodSvc->>Postgres: Save IdentifiedDish & Ingredients
    FoodSvc->>Broker: Publish FOOD_RECOGNIZED Event

    Broker->>NutriSvc: Consume FOOD_RECOGNIZED Event
    NutriSvc->>Redis: Query Nutrition Facts Cache (100g Base)
    alt Cache Miss
        NutriSvc->>NutriSvc: Fetch USDA 100g Base Metrics
        NutriSvc->>Redis: Write Cache Entry
    end
    NutriSvc->>Postgres: Save NutritionFacts Record
    NutriSvc->>Broker: Publish NUTRITION_COMPLETED Event

    Broker->>HealthSvc: Consume NUTRITION_COMPLETED Event
    HealthSvc->>HealthSvc: Generate AI Educational Insights & Allergen Alerts
    HealthSvc->>Postgres: Save HealthAnalysis & Factual Claims
    HealthSvc->>Broker: Publish HEALTH_ANALYSIS_COMPLETED Event

    Broker->>RecSvc: Consume HEALTH_ANALYSIS_COMPLETED Event
    RecSvc->>Redis: Query YouTube Video Cache
    RecSvc->>Postgres: Save YouTubeVideo Links & Set Status: COMPLETED
    RecSvc->>Broker: Publish FOOD_ANALYSIS_COMPLETED Event

    Broker->>Gateway: Consume FOOD_ANALYSIS_COMPLETED Event
    Gateway-->>User: Push Real-Time SSE Event Stream Update (Full Food Card Data)
```
