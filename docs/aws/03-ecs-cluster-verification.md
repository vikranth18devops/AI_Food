# 03 - ECS Cluster & Fargate Verification

Verify ECS cluster state, task definitions, and Application Load Balancer DNS.

```bash
aws ecs list-clusters
aws ecs list-services --cluster foodlens-dev-ecs-cluster
aws elbv2 describe-load-balancers --names foodlens-dev-alb --query "LoadBalancers[0].DNSName" --output tsv
```
