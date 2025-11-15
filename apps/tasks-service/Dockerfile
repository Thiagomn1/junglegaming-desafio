FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN npm install -g turbo

FROM base AS pruner
COPY . .
RUN turbo prune tasks-service --docker

FROM base AS builder
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
RUN npm install

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN turbo run build --filter=tasks-service...

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/tasks-service/dist ./apps/tasks-service/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/tasks-service/src/migrations ./apps/tasks-service/src/migrations
COPY --from=builder --chown=nestjs:nodejs /app/apps/tasks-service/src/data-source.ts ./apps/tasks-service/src/data-source.ts
COPY --from=builder --chown=nestjs:nodejs /app/apps/tasks-service/package*.json ./apps/tasks-service/
COPY --from=builder --chown=nestjs:nodejs /app/apps/tasks-service/tsconfig*.json ./apps/tasks-service/
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

RUN npm install --omit=dev

USER nestjs
WORKDIR /app/apps/tasks-service
EXPOSE 5000

CMD ["sh", "-c", "npm run migration:run && node dist/main.js"]
