# AWS Multi-Region End-to-End Architecture & Flow Diagram

This document contains visual Mermaid flowchart and sequence diagrams detailing the multi-region active-active/failover architecture, request routing, microservices processing, and data persistence on **Amazon Web Services (AWS)**.

---

## 📐 1. AWS Multi-Region Architecture & Flowchart Diagram

```mermaid
flowchart TD
    subgraph Anycast_Global ["1. Global Anycast Ingress & WAF"]
        Client["React 18 SPA / Mobile App"]
        Route53["AWS Route 53 Global Anycast Router"]
    end

    subgraph Primary_Region ["2. Primary AWS Region (us-east-1)"]
        ALB_Primary["AWS Application Load Balancer Primary"]
        Traefik_Primary["Traefik v3 Ingress Proxy"]
        
        subgraph ECS_Primary ["ECS Fargate Primary Cluster"]
            Gateway_P["foodlens-api-gateway"]
            Auth_P["foodlens-auth-service"]
            Image_P["foodlens-image-service"]
            Food_P["foodlens-food-service"]
            Nutri_P["foodlens-nutrition-service"]
            Analysis_P["foodlens-analysis-service"]
            Rec_P["foodlens-recommendation-service"]
            Broker_P[("foodlens-rabbitmq")]
        end

        Postgres_P[("AWS RDS PostgreSQL Primary")]
        Redis_P[("AWS ElastiCache Redis")]
        Storage_P[("AWS S3 Bucket Primary")]
    end

    subgraph Secondary_Region ["3. Secondary AWS Region (us-west-2 Failover)"]
        ALB_Secondary["AWS Application Load Balancer Secondary"]
        Traefik_Secondary["Traefik v3 Secondary Proxy"]
        
        subgraph ECS_Secondary ["ECS Fargate Failover Cluster"]
            Gateway_S["foodlens-api-gateway Failover"]
            Microservices_S["Failover Microservices Mesh"]
            Broker_S[("foodlens-rabbitmq Secondary")]
        end

        Postgres_S[("AWS RDS PostgreSQL Read Replica")]
        Redis_S[("AWS ElastiCache Redis Secondary")]
        Storage_S[("AWS S3 Bucket Secondary Replica")]
    end

    subgraph Security_Monitoring ["4. Identity, Registry & Observability"]
        ECR["AWS Elastic Container Registry"]
        SecretsManager["AWS Secrets Manager"]
        CloudWatch["AWS CloudWatch Logs & Metrics"]
    end

    Client --> Route53
    Route53 --> ALB_Primary
    Route53 -.-> ALB_Secondary

    ALB_Primary --> Traefik_Primary
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

    ALB_Secondary --> Traefik_Secondary
    Traefik_Secondary --> Gateway_S
    Gateway_S --> Microservices_S
    Microservices_S --> Postgres_S
    Microservices_S --> Storage_S

    Postgres_P ==> Postgres_S
    Storage_P ==> Storage_S

    ECR -.-> ECS_Primary
    ECR -.-> ECS_Secondary
    SecretsManager -.-> ECS_Primary
    SecretsManager -.-> ECS_Secondary
    ECS_Primary --> CloudWatch
    ECS_Secondary --> CloudWatch
```

---

## ⚡ 2. AWS Multi-Region Execution Flow Chart

```
[ Client / React SPA ]
         │ (1. HTTPS Request)
         ▼
[ AWS Route 53 ] ── (2. Latency-Based Routing & Failover)
         │
         ├─── (Active Primary Path) ────────────────────────────────────────────────────────┐
         │                                                                                  │
         ▼ (us-east-1 Primary)                                                              ▼ (us-west-2 Failover)
[ AWS Application Load Balancer ]                                                  [ AWS ALB Secondary ]
         │                                                                                  │
         ▼                                                                                  ▼
[ Traefik v3 Primary Proxy ]                                                       [ Traefik v3 Secondary Proxy ]
         │                                                                                  │
         ▼                                                                                  ▼
[ API Gateway Primary (Fargate) ]                                                  [ API Gateway Secondary (Fargate) ]
         │                                                                                  │
         ├───► [ Auth Service (Fargate) ] ──► [ AWS RDS PostgreSQL ]                       │
         │                                           ▲                                      │
         └───► [ Image Service (Fargate) ] ─► [ S3 Bucket (CRR) ]                   (Read Replica DB & Storage Sync)
                         │                           │                                      │
                         ▼ (FOOD_ANALYSIS_REQUESTED) │                                      │
           [ RabbitMQ Event Broker ]                 │                                      │
                         │                           │                                      │
   ┌─────────────────────┼─────────────────────┐     │                                      │
   ▼                     ▼                     ▼     │                                      │
[ Food Service ]  [ Nutrition Svc ]  [ Analysis Svc ]  │                                      │
   │                     │                     │     │                                      │
   ▼                     ▼                     ▼     │                                      │
[ AWS RDS Postgres ] [ ElastiCache ] [ AWS RDS Postgres]                                  │
   │                     │                     │     │                                      │
   └─────────────────────┼─────────────────────┘     │                                      │
                         │ (Event Chain)             │                                      │
                         ▼                           │                                      │
           [ Recommendation Service (Fargate) ]      │                                      │
                         │                           │                                      │
                         ▼ (FOOD_ANALYSIS_COMPLETED) │                                      │
           [ API Gateway Primary (Fargate) ]         │                                      │
                         │                           │                                      │
                         ▼ (Real-Time SSE Stream)    │                                      │
               [ Client / React SPA ] ───────────────┴──────────────────────────────────────┘
```

---

## 🔄 3. AWS Multi-Region Failover Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Client App
    participant Route53 as AWS Route 53
    participant ALB_P as AWS ALB (us-east-1)
    participant ALB_S as AWS ALB (us-west-2)
    participant ECS_P as ECS Fargate Primary (us-east-1)
    participant ECS_S as ECS Fargate Secondary (us-west-2)
    participant Postgres_P as AWS RDS Primary (us-east-1)
    participant Postgres_S as AWS RDS Replica (us-west-2)

    Note over User,Postgres_S: Normal Operational Mode (us-east-1 Active)
    User->>Route53: POST /api/analysis/upload (Food Image)
    Route53->>ALB_P: Route Traffic to Healthy Primary Region
    ALB_P->>ECS_P: Execute Request & Event Pipeline
    ECS_P->>Postgres_P: Write Transaction Data
    Postgres_P-->>Postgres_S: Async Cross Region Replication Sync
    ECS_P-->>User: 200 OK (Processed via Primary)

    Note over Route53,Postgres_S: Primary Region Outage Detected
    Route53->>Route53: Health Check Fails on Primary Endpoint
    Route53->>ALB_S: Automatic Failover Routing to us-west-2
    ALB_S->>ECS_S: Forward Traffic to Secondary Fargate Cluster
    Postgres_S->>Postgres_S: Promote Secondary Read Replica to Primary
    ECS_S->>Postgres_S: Execute Write Transactions on Promoted Primary
    ECS_S-->>User: 200 OK (Failover Complete)
```
