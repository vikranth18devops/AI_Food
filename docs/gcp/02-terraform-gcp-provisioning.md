# 02 - Complete GCP Terraform Resources Provisioning

This guide details all infrastructure resources provisioned on Google Cloud Platform using Terraform under `application/infra/terraform/gcp/`.

---

## 🏗️ Exhaustive List of Provisioned GCP Resources

When you run `terraform apply`, the following **15 core GCP resources** are provisioned:

| Component | GCP Resource Type | Resource Name Pattern | Purpose |
| :--- | :--- | :--- | :--- |
| **VPC Network** | `google_compute_network` | `foodlens-dev-vpc` | Isolated VPC network |
| **Subnetwork** | `google_compute_subnetwork` | `foodlens-dev-subnet` | Primary regional subnetwork (`10.2.0.0/20`) |
| **VPC Access Connector** | `google_vpc_access_connector` | `foodlens-dev-vpc-connector` | Serverless VPC Access connector (`10.8.0.0/28`) |
| **Secret Manager Secrets** | `google_secret_manager_secret` | `foodlens-dev-db-password`, `jwt-access`, `jwt-refresh` | Secret Manager secrets for DB & JWT keys |
| **Secret Manager Versions** | `google_secret_manager_secret_version` | Secret versions | Encrypted secret data payloads |
| **Artifact Registry** | `google_artifact_registry_repository` | `foodlens-dev-repo` | Docker image repository (`DOCKER` format) |
| **Cloud SQL Instance** | `google_sql_database_instance` | `foodlens-dev-cloudsql` | Managed PostgreSQL 15 database instance |
| **Cloud SQL Database** | `google_sql_database` | `foodlens_db` | Relational database instance |
| **Cloud SQL User** | `google_sql_user` | `foodlens_user` | Database user credentials |
| **Memorystore Redis** | `google_redis_instance` | `foodlens-dev-redis` | Managed Memorystore for Redis instance |
| **Cloud Storage (GCS)** | `google_storage_bucket` | `foodlens-dev-uploads-bucket` | GCS bucket for image uploads |
| **Cloud Run API Gateway** | `google_cloud_run_v2_service` | `foodlens-dev-api-gateway` | Public Cloud Run Gateway service (Port 3000) |
| **Cloud Run Frontend** | `google_cloud_run_v2_service` | `foodlens-dev-frontend` | Public Cloud Run Frontend service (Port 80) |
| **Cloud Run IAM Gateway** | `google_cloud_run_v2_service_iam_member` | `allUsers` invoker role | Unauthenticated public access for API Gateway |
| **Cloud Run IAM Frontend** | `google_cloud_run_v2_service_iam_member` | `allUsers` invoker role | Unauthenticated public access for Frontend |

---

## 🛠️ Step-by-Step Execution Commands

```bash
cd application/infra/terraform/gcp
terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```
