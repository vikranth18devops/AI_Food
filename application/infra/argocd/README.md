# ArgoCD GitOps Integration for FoodLens AI

Declarative ArgoCD GitOps manifests for automated continuous deployment of the FoodLens AI Helm chart.

---

## Directory Structure

```
infra/argocd/
├── project.yaml                 # ArgoCD AppProject definition
├── application.yaml             # Single-cluster ArgoCD Application
├── applicationset.yaml          # Multi-cloud / Multi-cluster ApplicationSet (Azure, AWS, GCP)
├── environments/
│   ├── dev.yaml                 # Dev environment ArgoCD Application
│   ├── staging.yaml             # Staging environment ArgoCD Application
│   └── prod.yaml                # Production environment ArgoCD Application
└── README.md                    # GitOps setup instructions
```

---

## Quick Start / Deployment Instructions

### 1. Install ArgoCD on your Kubernetes Cluster
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 2. Apply ArgoCD Project
```bash
kubectl apply -f infra/argocd/project.yaml
```

### 3. Deploy FoodLens AI Application via ArgoCD
```bash
kubectl apply -f infra/argocd/application.yaml
```

### 4. Multi-Cloud GitOps Automation (Optional)
To automatically deploy across Azure AKS, AWS EKS, and GCP GKE clusters using ArgoCD ApplicationSet:
```bash
kubectl apply -f infra/argocd/applicationset.yaml
```
