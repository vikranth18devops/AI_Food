# 09 - PostgreSQL Schema Migrations

Run Prisma database migrations against GCP Cloud SQL:

```bash
DATABASE_URL="postgresql://foodlens_user:P@ssw0rd12345!@35.200.10.20:5432/foodlens_db" \
  npx prisma migrate deploy --schema=./prisma/schema.prisma
```
