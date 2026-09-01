# 05 - AWS RDS PostgreSQL Setup

This guide explains AWS RDS PostgreSQL instance creation, DB subnet groups, and security group rule configuration.

---

## 1. Verify RDS Instance Status

Check RDS instance status:
```bash
aws rds describe-db-instances \
  --db-instance-identifier foodlens-dev-postgres \
  --query "DBInstances[0].[DBInstanceStatus,Endpoint.Address,Endpoint.Port]" \
  --output table
```

---

## 2. Test Connection from VPC

Ensure Security Group `foodlens-dev-rds-sg` allows PostgreSQL port `5432` ingress from `10.1.0.0/16`.
