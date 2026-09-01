# 08 - Observability & Cloud Logging

View Cloud Run container logs in GCP Cloud Logging:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=foodlens-dev-api-gateway" --limit=50
```
