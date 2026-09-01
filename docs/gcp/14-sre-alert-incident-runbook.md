# 14 - GCP SRE Alert Incident Response Runbook

This runbook provides step-by-step triage, diagnostic CLI commands, and remediation procedures for SRE On-Call Engineers responding to Google Cloud Operations Alert Policies across the **FoodLens AI** GCP platform.

---

## 🚨 SRE Severity Classification Matrix

| Severity Level | Response SLA | Notification Channel | Example Incidents |
| :--- | :--- | :--- | :--- |
| **P1 - Critical** | **< 15 Minutes** | Email / PagerDuty / On-Call | Cloud SQL CPU > 80%, Cloud Run 5xx > 10 in 5m |
| **P2 - Warning** | **< 1 Hour** | Slack `#sre-alerts` / Email | Cloud Run Container Memory > 85%, Latency > 1.5s |
| **P3 - Informational**| **Next Business Day** | JIRA Ticket Creation | Memorystore Redis cache eviction spike |

---

## 🛠️ Incident Triage & Remediation Procedures

### 1. Alert Policy: `foodlens-dev-alert-cloudsql-high-cpu` (P1 Critical)

**Symptom**: Cloud SQL PostgreSQL instance CPU utilization exceeded 80% for 5 consecutive minutes.

#### Diagnostic Commands
```bash
# 1. Fetch Cloud SQL instance metrics
gcloud sql instances describe foodlens-dev-cloudsql \
  --format="value(settings.tier, state)"

# 2. Tail Cloud Logging streams for Cloud SQL
gcloud logging read "resource.type=cloudsql_database AND severity>=ERROR" \
  --limit 20
```

#### Remediation Steps
1. Upgrade Cloud SQL machine tier if query traffic volume exceeds current tier:
   ```bash
   gcloud sql instances patch foodlens-dev-cloudsql \
     --tier db-custom-4-15360
   ```

---

### 2. Alert Policy: `foodlens-dev-alert-cloudrun-5xx-errors` (P1 Critical)

**Symptom**: Cloud Run services HTTP 5xx error count exceeded 10 in 5 minutes.

#### Diagnostic Commands
```bash
# Tail Cloud Run logs for API Gateway service
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=foodlens-api-gateway" \
  --limit 30 \
  --format="value(textPayload)"
```

#### Remediation Steps
1. Scale up Cloud Run instance scaling limits:
   ```bash
   gcloud run services update foodlens-api-gateway \
     --region us-central1 \
     --max-instances 20
   ```
