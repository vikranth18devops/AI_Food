# 06 - Traefik v3 Ingress Setup on AWS

This guide covers deploying Traefik v3 as an Ingress Controller on AWS (EKS / ECS / EC2) with Network Load Balancer (NLB) or Application Load Balancer (ALB).

---

## 1. Deploy Traefik v3 via Helm on AWS

Install Traefik Helm Chart in `ingress-traefik` namespace:
```bash
helm repo add traefik https://traefik.github.io/charts
helm repo update

helm install traefik traefik/traefik \
  --namespace ingress-traefik \
  --create-namespace \
  --set service.type=LoadBalancer \
  --set service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="external" \
  --set service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-nlb-target-type"="ip"
```

---

## 2. Deploy FoodLens AI Helm Chart with Traefik

```bash
helm install foodlens-ai application/infra/helm/foodlens-ai \
  -f application/infra/helm/foodlens-ai/values-aws.yaml
```

---

## 3. Verify Traefik LoadBalancer IP & Route 53 Mapping

Retrieve AWS LoadBalancer DNS name:
```bash
kubectl get service traefik -n ingress-traefik -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Map Route 53 CNAME / Alias record pointing `app.foodlens.example.com` to the Traefik LoadBalancer hostname.
