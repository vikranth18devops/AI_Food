# SNS Topic for SRE On-Call Alerts
resource "aws_sns_topic" "sre_alerts_topic" {
  name = "${var.prefix}-sre-alerts-topic"

  tags = {
    Environment = var.environment
    Project     = "FoodLens AI"
    ManagedBy   = "Terraform"
  }
}

resource "aws_sns_topic_subscription" "sre_email_sub" {
  topic_arn = aws_sns_topic.sre_alerts_topic.arn
  protocol  = "email"
  endpoint  = var.sre_email
}

# RDS PostgreSQL CPU Utilization Alert (P1 Critical)
resource "aws_cloudwatch_metric_alarm" "rds_high_cpu" {
  alarm_name          = "${var.prefix}-alert-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 5
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "SRE Alert: RDS PostgreSQL CPU utilization exceeded 80%"
  alarm_actions       = [aws_sns_topic.sre_alerts_topic.arn]

  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }
}

# RDS Storage Space Alert (P1 Critical)
resource "aws_cloudwatch_metric_alarm" "rds_low_storage" {
  alarm_name          = "${var.prefix}-alert-rds-low-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 5
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 5000000000 # 5 GB in Bytes
  alarm_description   = "SRE Alert: RDS PostgreSQL Free Storage Space below 5GB"
  alarm_actions       = [aws_sns_topic.sre_alerts_topic.arn]

  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }
}

# ALB HTTP 5xx Error Alert (P1 Critical)
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "${var.prefix}-alert-alb-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 5
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "SRE Alert: ALB HTTP 5xx Error count exceeded 10 in 5 mins"
  alarm_actions       = [aws_sns_topic.sre_alerts_topic.arn]

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }
}
