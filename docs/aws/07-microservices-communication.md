# 07 - Microservices Communication & DNS

This guide details internal ECS Fargate service discovery via AWS Cloud Map.

---

## 1. Cloud Map Service Discovery

ECS Fargate tasks communicate internally using private Cloud Map DNS names:
```text
http://auth-service.foodlens.local:3001
http://image-service.foodlens.local:3002
```
