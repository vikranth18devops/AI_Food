# 12 - GCP Multi-Region Active-Active & Failover Architecture

This guide details configuring Multi-Region Disaster Recovery (DR) and High Availability (HA) on Google Cloud Platform.

---

## 🏗️ GCP Multi-Region Component Mapping

| Service | Primary Region (`us-central1`) | Secondary Region (`europe-west1`) | Multi-Region Integration |
| :--- | :--- | :--- | :--- |
| **Global Router** | Global External LB | Global External LB | Global External HTTP(S) Load Balancer |
| **Compute** | Cloud Run (`us-central1`) | Cloud Run (`europe-west1`) | Multi-Region Serverless Revisions |
| **Database** | Cloud SQL Primary | Cloud SQL Read Replica | Asynchronous Cross-Region Replication |
| **Caching** | Memorystore Redis Primary | Memorystore Redis Replica | Secondary Redis Instance |
| **Storage** | GCS Bucket (`NAM4`) | GCS Bucket (`EU`) | Multi-Region GCS Object Storage |

---

## 🛠️ Failover Execution Steps

### 1. Promote Cloud SQL Read Replica
```bash
gcloud sql instances promote-replica foodlens-dev-cloudsql-replica-eu
```

### 2. Update Global External Load Balancer Backend
GCP Global External Load Balancer automatically shifts user requests to `europe-west1` based on backend health checks and user proximity.
