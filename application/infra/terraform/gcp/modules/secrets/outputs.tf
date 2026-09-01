output "db_password_secret_id" {
  value = google_secret_manager_secret.db_password.secret_id
}

output "jwt_access_secret_id" {
  value = google_secret_manager_secret.jwt_access.secret_id
}

output "jwt_refresh_secret_id" {
  value = google_secret_manager_secret.jwt_refresh.secret_id
}
