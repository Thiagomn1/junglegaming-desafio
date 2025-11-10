FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN npm install -g turbo

FROM base AS pruner
COPY . .
RUN turbo prune notifications-service --docker

FROM base AS builder
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
RUN npm install

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN turbo run build --filter=notifications-service...

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/notifications-service/dist ./apps/notifications-service/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/notifications-service/package*.json ./apps/notifications-service/
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

RUN npm install --omit=dev

USER nestjs
WORKDIR /app/apps/notifications-service
EXPOSE 6000

CMD ["sh", "-c", "npm run migration:run && node dist/main.js"]
