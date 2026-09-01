output "action_group_id" {
  value       = azurerm_monitor_action_group.sre_action_group.id
  description = "Azure Monitor Action Group ID for SRE On-Call"
}
