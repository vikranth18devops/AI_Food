# 07 - Microservices Communication & DNS

This guide details internal container app routing and DNS service discovery within the Container Apps Environment.

---

## 1. Internal Ingress Configuration

Internal microservices (`auth-service`, `image-service`, `food-service`, etc.) are configured with `external_enabled = false` and `target_port`.

Internal DNS format inside ACA Environment:
```text
http://<container-app-name>
```

Example internal service URLs:
- `http://foodlens-auth-service:3001`
- `http://foodlens-image-service:3002`
- `http://foodlens-food-service:3003`
- `http://foodlens-nutrition-service:3004`
- `http://foodlens-analysis-service:3005`
- `http://foodlens-recommendation-service:3006`
