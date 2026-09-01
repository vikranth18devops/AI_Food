output "sns_topic_arn" {
  value       = aws_sns_topic.sre_alerts_topic.arn
  description = "AWS SNS Topic ARN for SRE On-Call Alerts"
}
