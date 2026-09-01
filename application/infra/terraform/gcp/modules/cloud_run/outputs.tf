output "gateway_url" {
  value = google_cloud_run_v2_service.api_gateway.uri
}

output "frontend_url" {
  value = google_cloud_run_v2_service.frontend.uri
}
