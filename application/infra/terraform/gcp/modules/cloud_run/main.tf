resource "google_cloud_run_v2_service" "api_gateway" {
  name     = "${var.prefix}-api-gateway"
  location = var.location
  project  = var.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "${var.location}-docker.pkg.dev/${var.project_id}/${var.repository_id}/api-gateway:latest"
      ports {
        container_port = 3000
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "3000"
      }
      env {
        name  = "DATABASE_URL"
        value = var.database_url
      }
      env {
        name  = "REDIS_URL"
        value = var.redis_url
      }
      env {
        name  = "JWT_ACCESS_SECRET"
        value = var.jwt_access_secret
      }
      env {
        name  = "JWT_REFRESH_SECRET"
        value = var.jwt_refresh_secret
      }
    }
  }
}

resource "google_cloud_run_v2_service" "frontend" {
  name     = "${var.prefix}-frontend"
  location = var.location
  project  = var.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "${var.location}-docker.pkg.dev/${var.project_id}/${var.repository_id}/frontend:latest"
      ports {
        container_port = 80
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "gateway_public" {
  project  = google_cloud_run_v2_service.api_gateway.project
  location = google_cloud_run_v2_service.api_gateway.location
  name     = google_cloud_run_v2_service.api_gateway.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  project  = google_cloud_run_v2_service.frontend.project
  location = google_cloud_run_v2_service.frontend.location
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
