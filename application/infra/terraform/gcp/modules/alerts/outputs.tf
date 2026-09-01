output "notification_channel_id" {
  value       = google_monitoring_notification_channel.sre_email_channel.id
  description = "GCP Monitoring Notification Channel ID"
}
