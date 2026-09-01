# 03 - Cloud Run Services Verification

Verify Cloud Run services, traffic allocation, and public URLs.

```bash
gcloud run services list --platform managed
gcloud run services describe foodlens-dev-api-gateway --format="value(status.url)"
gcloud run services describe foodlens-dev-frontend --format="value(status.url)"
```
