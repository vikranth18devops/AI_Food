# 08 - Observability & CloudWatch

This guide covers viewing container logs and metrics in AWS CloudWatch.

---

## 1. Stream CloudWatch Container Logs

```bash
aws logs tail /ecs/foodlens-dev-api-gateway --follow
```
