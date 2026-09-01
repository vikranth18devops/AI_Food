# 09 - PostgreSQL Schema Migrations

This guide details running Prisma database migrations against Azure Database for PostgreSQL Flexible Server.

---

## 1. Run Migration Command via Local CLI or Container Job

Run Prisma migration deploy:
```bash
DATABASE_URL="postgresql://foodlens_user:P@ssw0rd123456!@foodlens-dev-psql-server.postgres.database.azure.com:5432/foodlens_db?schema=public" \
  npx prisma migrate deploy --schema=./prisma/schema.prisma
```

---

## 2. Seed Initial Database Tables

Seed initial database data:
```bash
DATABASE_URL="postgresql://foodlens_user:P@ssw0rd123456!@foodlens-dev-psql-server.postgres.database.azure.com:5432/foodlens_db?schema=public" \
  npx ts-node ./prisma/seeds/seed.ts
```
