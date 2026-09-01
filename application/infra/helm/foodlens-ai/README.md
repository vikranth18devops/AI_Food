# FoodLens AI Helm Chart

Production-ready Helm Chart for deploying the **FoodLens AI** microservices platform on Kubernetes clusters (Azure AKS, AWS EKS, GCP GKE, or local K8s).

---

## Chart Components

This chart deploys all 8 FoodLens AI platform microservices:
1. `api-gateway` (Port 3000)
2. `auth-service` (Port 3001)
3. `image-service` (Port 3002)
4. `food-service` (Port 3003)
5. `nutrition-service` (Port 3004)
6. `analysis-service` (Port 3005)
7. `recommendation-service` (Port 3006)
8. `frontend` (Port 80)

---

## Deployment Commands

### 1. Default / Generic Kubernetes Deployment
```bash
helm install foodlens-ai ./infra/helm/foodlens-ai
```

### 2. Azure AKS Deployment
```bash
helm install foodlens-ai ./infra/helm/foodlens-ai -f ./infra/helm/foodlens-ai/values-azure.yaml
```

### 3. AWS EKS Deployment
```bash
helm install foodlens-ai ./infra/helm/foodlens-ai -f ./infra/helm/foodlens-ai/values-aws.yaml
```

### 4. GCP GKE Deployment
```bash
helm install foodlens-ai ./infra/helm/foodlens-ai -f ./infra/helm/foodlens-ai/values-gcp.yaml
```

---

## Dry Run & Linting

Verify chart templates before applying to cluster:
```bash
helm lint ./infra/helm/foodlens-ai
helm template foodlens-ai ./infra/helm/foodlens-ai --debug
```
