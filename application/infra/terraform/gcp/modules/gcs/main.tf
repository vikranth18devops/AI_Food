resource "google_storage_bucket" "uploads" {
  name                     = "${var.prefix}-uploads-bucket"
  location                 = var.location
  project                  = var.project_id
  force_destroy            = true
  public_access_prevention = "enforced"
}
