# 04 - AWS Secrets Manager Integration

This guide details managing database credentials and JWT secret keys in AWS Secrets Manager.

---

## 1. Create Secrets in Secrets Manager

Store database password and JWT tokens:
```bash
aws secretsmanager create-secret \
  --name foodlens-dev-db-credentials \
  --secret-string "P@ssw0rd12345!"

aws secretsmanager create-secret \
  --name foodlens-dev-jwt-access-secret \
  --secret-string "super-secret-access-key-foodlens-2026"

aws secretsmanager create-secret \
  --name foodlens-dev-jwt-refresh-secret \
  --secret-string "super-secret-refresh-key-foodlens-2026"
```

---

## 2. Reference Secrets in ECS Task Definitions

ECS Fargate tasks read Secrets Manager secrets via execution role IAM permissions:
```json
{
  "name": "JWT_ACCESS_SECRET",
  "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:foodlens-dev-jwt-access-secret"
}
```
