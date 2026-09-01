# GCP Multi-Region End-to-End Architecture & Flow Diagram

This document contains visual Mermaid flowchart and sequence diagrams detailing the multi-region active-active/failover architecture, request routing, microservices processing, and data persistence on **Google Cloud Platform (GCP)**.

---

## 📐 1. GCP Multi-Region Architecture & Flowchart Diagram

```mermaid
flowchart TD
    subgraph Anycast_Global ["1. Global Anycast Ingress & WAF"]
        Client["React 18 SPA / Mobile App"]
        GCLB["GCP Global External Application Load Balancer"]
    end

    subgraph Primary_Region ["2. Primary GCP Region (us-central1)"]
        Traefik_Primary["Traefik v3 Ingress Proxy"]
        
        subgraph CloudRun_Primary ["Cloud Run Primary Services"]
            Gateway_P["foodlens-api-gateway"]
            Auth_P["foodlens-auth-service"]
            Image_P["foodlens-image-service"]
            Food_P["foodlens-food-service"]
            Nutri_P["foodlens-nutrition-service"]
            Analysis_P["foodlens-analysis-service"]
            Rec_P["foodlens-recommendation-service"]
            Broker_P[("foodlens-rabbitmq")]
        end

        Postgres_P[("GCP Cloud SQL PostgreSQL Primary")]
        Redis_P[("GCP Memorystore Redis")]
        Storage_P[("GCS Multi-Region Storage Bucket")]
    end

    subgraph Secondary_Region ["3. Secondary GCP Region (europe-west1 Failover)"]
        Traefik_Secondary["Traefik v3 Secondary Proxy"]
        
        subgraph CloudRun_Secondary ["Cloud Run Failover Services"]
            Gateway_S["foodlens-api-gateway Failover"]
            Microservices_S["Failover Microservices Mesh"]
            Broker_S[("foodlens-rabbitmq Secondary")]
        end

        Postgres_S[("GCP Cloud SQL Read Replica")]
        Redis_S[("GCP Memorystore Redis Secondary")]
        Storage_S[("GCS Storage Bucket Secondary Replica")]
    end

    subgraph Security_Monitoring ["4. Identity, Registry & Observability"]
        ArtifactRegistry["GCP Artifact Registry"]
        SecretManager["GCP Secret Manager"]
        CloudLogging["GCP Cloud Operations Logging"]
    end

    Client --> GCLB
    GCLB --> Traefik_Primary
    GCLB -.-> Traefik_Secondary

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

    Traefik_Secondary --> Gateway_S
    Gateway_S --> Microservices_S
    Microservices_S --> Postgres_S
    Microservices_S --> Storage_S

    Postgres_P ==> Postgres_S
    Storage_P ==> Storage_S

    ArtifactRegistry -.-> CloudRun_Primary
    ArtifactRegistry -.-> CloudRun_Secondary
    SecretManager -.-> CloudRun_Primary
    SecretManager -.-> CloudRun_Secondary
    CloudRun_Primary --> CloudLogging
    CloudRun_Secondary --> CloudLogging
```

---

## ⚡ 2. GCP Multi-Region Execution Flow Chart

```
[ Client / React SPA ]
         │ (1. HTTPS Request)
         ▼
[ GCP Global External Load Balancer ] ── (2. Global Anycast Routing & WAF)
         │
         ├─── (Active Primary Path) ────────────────────────────────────────────────────────┐
         │                                                                                  │
         ▼ (us-central1 Primary)                                                            ▼ (europe-west1 Failover)
[ Traefik v3 Primary Proxy ]                                                       [ Traefik v3 Secondary Proxy ]
         │                                                                                  │
         ▼                                                                                  ▼
[ API Gateway Primary (Cloud Run) ]                                                [ API Gateway Secondary (Cloud Run) ]
         │                                                                                  │
         ├───► [ Auth Service (Cloud Run) ] ──► [ GCP Cloud SQL ]                         │
         │                                           ▲                                      │
         └───► [ Image Service (Cloud Run) ] ─► [ GCS Bucket ]                     (Read Replica DB & Storage Sync)
                         │                           │                                      │
                         ▼ (FOOD_ANALYSIS_REQUESTED) │                                      │
           [ RabbitMQ Event Broker ]                 │                                      │
                         │                           │                                      │
   ┌─────────────────────┼─────────────────────┐     │                                      │
   ▼                     ▼                     ▼     │                                      │
[ Food Service ]  [ Nutrition Svc ]  [ Analysis Svc ]  │                                      │
   │                     │                     │     │                                      │
   ▼                     ▼                     ▼     │                                      │
[ GCP Cloud SQL ] [ Memorystore ]   [ GCP Cloud SQL ] │                                    │
   │                     │                     │     │                                      │
   └─────────────────────┼─────────────────────┘     │                                      │
                         │ (Event Chain)             │                                      │
                         ▼                           │                                      │
           [ Recommendation Service (Cloud Run) ]    │                                      │
                         │                           │                                      │
                         ▼ (FOOD_ANALYSIS_COMPLETED) │                                      │
           [ API Gateway Primary (Cloud Run) ]       │                                      │
                         │                           │                                      │
                         ▼ (Real-Time SSE Stream)    │                                      │
               [ Client / React SPA ] ───────────────┴──────────────────────────────────────┘
```

---

## 🔄 3. GCP Multi-Region Failover Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Client App
    participant GCLB as GCP Global External LB
    participant CR_P as Cloud Run Primary (us-central1)
    participant CR_S as Cloud Run Secondary (europe-west1)
    participant Postgres_P as GCP Cloud SQL Primary (us-central1)
    participant Postgres_S as GCP Cloud SQL Replica (europe-west1)

    Note over User,Postgres_S: Normal Operational Mode (us-central1 Active)
    User->>GCLB: POST /api/analysis/upload (Food Image)
    GCLB->>CR_P: Route Traffic to Healthy Primary Region
    CR_P->>CR_P: Execute Request & Event Pipeline
    CR_P->>Postgres_P: Write Transaction Data
    Postgres_P-->>Postgres_S: Async Cross Region Replication Sync
    CR_P-->>User: 200 OK (Processed via Primary)

    Note over GCLB,Postgres_S: Primary Region Outage Detected
    GCLB->>GCLB: Health Check Fails on Primary Endpoint
    GCLB->>CR_S: Automatic Anycast Failover Routing to europe-west1
    CR_S->>CR_S: Forward Traffic to Secondary Cloud Run Revisions
    Postgres_S->>Postgres_S: Promote Secondary Read Replica to Primary
    CR_S->>Postgres_S: Execute Write Transactions on Promoted Primary
    CR_S-->>User: 200 OK (Failover Complete)
```
