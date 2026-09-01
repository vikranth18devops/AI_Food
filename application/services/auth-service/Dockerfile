FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json ./
COPY packages/ ./packages/
COPY prisma/ ./prisma/
COPY services/auth-service/ ./services/auth-service/

RUN npm install --legacy-peer-deps
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build --workspace=packages/shared-types && npm run build --workspace=packages/shared-config && npm run build --workspace=packages/shared-utils
RUN npm run build --workspace=services/auth-service

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3001
CMD ["node", "services/auth-service/dist/main"]
