FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json ./
COPY packages/ ./packages/
COPY prisma/ ./prisma/
COPY services/image-service/ ./services/image-service/

RUN npm install --legacy-peer-deps
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build --workspace=packages/shared-types && npm run build --workspace=packages/shared-config && npm run build --workspace=packages/shared-utils
RUN npm run build --workspace=services/image-service

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3002
CMD ["node", "services/image-service/dist/main"]
