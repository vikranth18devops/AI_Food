# Azure Multi-Region End-to-End Architecture & Flow Diagram

This document contains visual Mermaid flowchart and sequence diagrams detailing the multi-region active-active/failover architecture, request routing, microservices processing, and data persistence on **Microsoft Azure**.

---

## 📐 1. Azure Multi-Region Architecture & Flowchart Diagram

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

## 🔄 2. Azure Multi-Region Failover Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Client App
    participant FrontDoor as Azure Front Door
    participant APIM_P as Azure APIM (East US)
    participant APIM_S as Azure APIM (West Europe)
    participant ACA_P as ACA Primary Mesh (East US)
    participant ACA_S as ACA Secondary Mesh (West Europe)
    participant Postgres_P as Azure PostgreSQL Primary
    participant Postgres_S as Azure PostgreSQL Replica

    Note over User,Postgres_S: Normal Operational Mode (Primary Active)
    User->>FrontDoor: POST /api/analysis/upload (Food Image)
    FrontDoor->>APIM_P: Route Traffic to Healthy Primary Region
    APIM_P->>ACA_P: Execute Request & Event Pipeline
    ACA_P->>Postgres_P: Write Transaction Data
    Postgres_P-->>Postgres_S: Async Cross Region Replication Sync
    ACA_P-->>User: 200 OK (Processed via Primary)

    Note over FrontDoor,Postgres_S: Primary Region Outage Detected
    FrontDoor->>FrontDoor: Health Check Fails on Primary Endpoint
    FrontDoor->>APIM_S: Automatic Anycast Failover Routing
    APIM_S->>ACA_S: Forward Traffic to Secondary Region Mesh
    Postgres_S->>Postgres_S: Promote Secondary Read Replica to Primary
    ACA_S->>Postgres_S: Execute Write Transactions on Promoted Primary
    ACA_S-->>User: 200 OK (Failover Complete)
```
