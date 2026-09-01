# Notification Channel for SRE On-Call Email Alerts
resource "google_monitoring_notification_channel" "sre_email_channel" {
  project      = var.project_id
  display_name = "SRE On-Call Email Channel"
  type         = "email"

  labels = {
    email_address = var.sre_email
  }
}

# Cloud SQL High CPU Utilization Alert (P1 Critical)
resource "google_monitoring_alert_policy" "cloudsql_high_cpu" {
  project      = var.project_id
  display_name = "${var.prefix}-alert-cloudsql-high-cpu"
  combiner     = "OR"

  conditions {
    display_name = "Cloud SQL CPU Utilization > 80%"
    condition_threshold {
      filter          = "metric.type=\"cloudsql.googleapis.com/database/cpu/utilization\" AND resource.type=\"cloudsql_database\" AND resource.label.database_id=\"${var.project_id}:${var.cloudsql_instance_name}\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.8

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.sre_email_channel.name]
}

# Cloud Run 5xx Errors Alert (P1 Critical)
resource "google_monitoring_alert_policy" "cloudrun_5xx_errors" {
  project      = var.project_id
  display_name = "${var.prefix}-alert-cloudrun-5xx-errors"
  combiner     = "OR"

  conditions {
    display_name = "Cloud Run 5xx Request Count > 10 in 5m"
    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND metric.label.response_code_class=\"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 10

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.sre_email_channel.name]
}
