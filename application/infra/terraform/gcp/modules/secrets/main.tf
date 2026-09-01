resource "google_secret_manager_secret" "db_password" {
  secret_id = "${var.prefix}-db-password"
  project   = var.project_id

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password_ver" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

resource "google_secret_manager_secret" "jwt_access" {
  secret_id = "${var.prefix}-jwt-access"
  project   = var.project_id

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "jwt_access_ver" {
  secret      = google_secret_manager_secret.jwt_access.id
  secret_data = var.jwt_access_secret
}

resource "google_secret_manager_secret" "jwt_refresh" {
  secret_id = "${var.prefix}-jwt-refresh"
  project   = var.project_id

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "jwt_refresh_ver" {
  secret      = google_secret_manager_secret.jwt_refresh.id
  secret_data = var.jwt_refresh_secret
}
