# 09 - PostgreSQL Schema Migrations

Run Prisma migrations against RDS PostgreSQL:

```bash
DATABASE_URL="postgresql://foodlens_user:P@ssw0rd12345!@foodlens-dev-postgres.123456789012.us-east-1.rds.amazonaws.com:5432/foodlens_db" \
  npx prisma migrate deploy --schema=./prisma/schema.prisma
```
