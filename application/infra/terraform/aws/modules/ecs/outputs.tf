output "alb_dns_name" {
  value       = aws_lb.alb.dns_name
  description = "Application Load Balancer DNS Name"
}

output "alb_arn_suffix" {
  value       = aws_lb.alb.arn_suffix
  description = "Application Load Balancer ARN Suffix"
}

output "cluster_name" {
  value       = aws_ecs_cluster.cluster.name
  description = "ECS Cluster Name"
}
