# 04 - Secret Manager Integration

Manage database passwords and JWT secrets in GCP Secret Manager:

```bash
gcloud secrets create foodlens-dev-db-password --data-file=- <<< "P@ssw0rd12345!"
gcloud secrets create foodlens-dev-jwt-access --data-file=- <<< "super-secret-access-key-foodlens-2026"
```
