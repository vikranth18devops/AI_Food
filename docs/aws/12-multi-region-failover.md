# 12 - AWS Multi-Region Active-Active & Failover Architecture

This guide details configuring Multi-Region Disaster Recovery (DR) and High Availability (HA) on Amazon Web Services.

---

## 🏗️ AWS Multi-Region Component Mapping

| Service | Primary Region (`us-east-1`) | Secondary Region (`us-west-2`) | Multi-Region Integration |
| :--- | :--- | :--- | :--- |
| **Global Router** | Route 53 Latency / Failover | Route 53 Latency / Failover | Route 53 Health Probes & Anycast DNS |
| **Compute** | ECS Fargate Cluster (`us-east-1`) | ECS Fargate Cluster (`us-west-2`) | Multi-Region Container Task Execution |
| **Database** | RDS PostgreSQL Primary | RDS PostgreSQL Read Replica | Asynchronous DB Replication |
| **Caching** | ElastiCache Redis Primary | ElastiCache Redis Replica | Cross-Region Redis Sync |
| **Storage** | S3 Primary Bucket | S3 Replica Bucket | S3 Cross-Region Replication (CRR) |

---

## 🛠️ Failover Execution Steps

### 1. Promote RDS Read Replica to Primary
```bash
aws rds promote-read-replica \
  --db-instance-identifier foodlens-dev-postgres-replica-west \
  --region us-west-2
```

### 2. Shift Traffic via Route 53
Route 53 health probes automatically redirect HTTP/HTTPS traffic to the secondary ALB (`us-west-2`) when primary health checks fail.
