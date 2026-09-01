resource "google_artifact_registry_repository" "repo" {
  location      = var.location
  repository_id = "${var.prefix}-repo"
  description   = "Docker repository for FoodLens AI services"
  format        = "DOCKER"
  project       = var.project_id
}
