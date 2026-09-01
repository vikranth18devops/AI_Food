# 06 - Traefik v3 Ingress Setup on GCP

This guide covers deploying Traefik v3 as an Ingress Controller on Google Cloud Platform (GKE / Cloud Run) with GCP Network Load Balancing.

---

## 1. Deploy Traefik v3 via Helm on GCP

Install Traefik Helm Chart in `ingress-traefik` namespace:
```bash
helm repo add traefik https://traefik.github.io/charts
helm repo update

helm install traefik traefik/traefik \
  --namespace ingress-traefik \
  --create-namespace \
  --set service.type=LoadBalancer
```

---

## 2. Deploy FoodLens AI Helm Chart with Traefik

```bash
helm install foodlens-ai application/infra/helm/foodlens-ai \
  -f application/infra/helm/foodlens-ai/values-gcp.yaml
```

---

## 3. Retrieve GCP LoadBalancer External IP

Fetch Public IP assigned by GCP Network Load Balancer:
```bash
kubectl get service traefik -n ingress-traefik -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

Map GCP External IP (`A` Record) in Google Cloud DNS to `app.foodlens.example.com`.
