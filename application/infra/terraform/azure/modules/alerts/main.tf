# SRE Action Group (Email & Webhook On-Call Targets)
resource "azurerm_monitor_action_group" "sre_action_group" {
  name                = "${var.prefix}-sre-action-group"
  resource_group_name = var.resource_group_name
  short_name          = "SREOnCall"

  email_receiver {
    name                    = "SRE-OnCall-Email"
    email_address           = var.sre_email
    use_common_alert_schema = true
  }

  tags = {
    Environment = var.prefix
    Project     = "FoodLens AI"
    ManagedBy   = "Terraform"
  }
}

# PostgreSQL High CPU Alert (P1 Critical)
resource "azurerm_monitor_metric_alert" "postgres_cpu_alert" {
  name                = "${var.prefix}-alert-postgres-high-cpu"
  resource_group_name = var.resource_group_name
  scopes              = [var.postgres_id]
  description         = "SRE Alert: PostgreSQL CPU utilization exceeded 80%"
  severity            = 1
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "cpu_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
  }

  action {
    action_group_id = azurerm_monitor_action_group.sre_action_group.id
  }
}

# PostgreSQL High Storage Alert (P1 Critical)
resource "azurerm_monitor_metric_alert" "postgres_storage_alert" {
  name                = "${var.prefix}-alert-postgres-high-storage"
  resource_group_name = var.resource_group_name
  scopes              = [var.postgres_id]
  description         = "SRE Alert: PostgreSQL storage utilization exceeded 85%"
  severity            = 1
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.DBforPostgreSQL/flexibleServers"
    metric_name      = "storage_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 85
  }

  action {
    action_group_id = azurerm_monitor_action_group.sre_action_group.id
  }
}

# Redis High Memory Alert (P1 Critical)
resource "azurerm_monitor_metric_alert" "redis_memory_alert" {
  name                = "${var.prefix}-alert-redis-high-memory"
  resource_group_name = var.resource_group_name
  scopes              = [var.redis_id]
  description         = "SRE Alert: Redis Memory Usage exceeded 85%"
  severity            = 1
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Cache/redis"
    metric_name      = "usedmemorypercentage"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 85
  }

  action {
    action_group_id = azurerm_monitor_action_group.sre_action_group.id
  }
}

# APIM Failed Requests Alert (P1 Critical)
resource "azurerm_monitor_metric_alert" "apim_failed_requests" {
  name                = "${var.prefix}-alert-apim-failed-requests"
  resource_group_name = var.resource_group_name
  scopes              = [var.apim_id]
  description         = "SRE Alert: APIM Gateway Failed Requests exceeded 5%"
  severity            = 1
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.ApiManagement/service"
    metric_name      = "FailedRequests"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = 50
  }

  action {
    action_group_id = azurerm_monitor_action_group.sre_action_group.id
  }
}
