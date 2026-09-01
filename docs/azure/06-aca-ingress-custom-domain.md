# 06 - Traefik v3 Ingress & Custom Domains

This guide covers configuring **Traefik v3 Proxy** for edge routing, path-based load balancing, HTTPS TLS termination, and the Traefik Dashboard.

---

## 1. Traefik v3 Proxy Overview

Traefik v3 handles edge traffic routing for FoodLens AI:
- **Web EntryPoint (`:80`)**: HTTP traffic router & redirect to HTTPS.
- **WebSecure EntryPoint (`:443`)**: TLS encrypted traffic router.
- **Traefik Dashboard (`:8080`)**: Live traffic monitoring UI.

---

## 2. Docker Compose Traefik v3 Local Execution

In local development, Traefik routes requests to microservices:
```bash
docker compose up -d traefik
```

Access Traefik Dashboard locally:
- **Traefik Dashboard URL**: `http://localhost:8080`

---

## 3. Kubernetes Traefik v3 IngressRoute Setup

Deploy Traefik v3 IngressRoute CRD manifest via Helm:
```bash
helm install foodlens-ai application/infra/helm/foodlens-ai \
  --set ingress.className=traefik
```

Verify Traefik IngressRoute:
```bash
kubectl get ingressroute -n foodlens-ai
```
