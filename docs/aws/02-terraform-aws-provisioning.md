# 02 - Complete AWS Terraform Resources Provisioning

This guide details all infrastructure resources provisioned on Amazon Web Services using Terraform under `application/infra/terraform/aws/`.

---

## 🏗️ Exhaustive List of Provisioned AWS Resources

When you run `terraform apply`, the following **20 core AWS resources** are provisioned:

| Component | AWS Resource Type | Resource Name Pattern | Purpose |
| :--- | :--- | :--- | :--- |
| **VPC** | `aws_vpc` | `foodlens-dev-vpc` | Isolated network (`10.1.0.0/16`) |
| **Internet Gateway** | `aws_internet_gateway` | `foodlens-dev-igw` | Gateway for public subnet traffic |
| **Public Subnets** | `aws_subnet` | `foodlens-dev-public-subnet-1/2` | Multi-AZ public subnets for ALB (`10.1.1.0/24`, `10.1.2.0/24`) |
| **Private Subnets** | `aws_subnet` | `foodlens-dev-private-subnet-1/2` | Multi-AZ private subnets for ECS Fargate |
| **DB Subnets** | `aws_subnet` | `foodlens-dev-db-subnet-1/2` | Subnets for RDS PostgreSQL |
| **NAT Gateway** | `aws_nat_gateway` | `foodlens-dev-nat-gw` | Egress NAT for Fargate tasks in private subnets |
| **Secrets Manager** | `aws_secretsmanager_secret` | `foodlens-dev-db-credentials` | Encrypted DB & JWT secrets |
| **ECR Repositories** | `aws_ecr_repository` | `foodlens-dev/api-gateway`, `frontend`, etc. | Container image repositories for 8 services |
| **RDS DB Subnet Group** | `aws_db_subnet_group` | `foodlens-dev-rds-subnet-group` | Database network subnet group |
| **RDS Security Group** | `aws_security_group` | `foodlens-dev-rds-sg` | Security group allowing port 5432 ingress |
| **RDS PostgreSQL** | `aws_db_instance` | `foodlens-dev-postgres` | Managed PostgreSQL 15 database instance |
| **ElastiCache Subnet** | `aws_elasticache_subnet_group` | `foodlens-dev-redis-subnet-group` | Subnet group for Redis |
| **ElastiCache Redis** | `aws_elasticache_cluster` | `foodlens-dev-redis` | Managed Redis 7 cache cluster |
| **S3 Bucket** | `aws_s3_bucket` | `foodlens-dev-uploads-bucket` | S3 bucket for image uploads |
| **ECS Cluster** | `aws_ecs_cluster` | `foodlens-dev-ecs-cluster` | Serverless ECS cluster |
| **ALB Security Group** | `aws_security_group` | `foodlens-dev-alb-sg` | Security group allowing ports 80/3000 ingress |
| **ECS Tasks SG** | `aws_security_group` | `foodlens-dev-ecs-tasks-sg` | Security group for ECS Fargate tasks |
| **Load Balancer** | `aws_lb` | `foodlens-dev-alb` | Public Application Load Balancer |
| **Target Groups** | `aws_lb_target_group` | `foodlens-dev-frontend-tg`, `gateway-tg` | Target groups for routing traffic |
| **ALB Listeners** | `aws_lb_listener` | Frontend & Gateway Listeners | Ports 80 & 3000 listeners |

---

## 🛠️ Step-by-Step Execution Commands

```bash
cd application/infra/terraform/aws
terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```
