FROM node:20-alpine AS base
# Instala ferramentas de build necessárias para compilação nativa do bcrypt
# python3, make, g++ são necessários para node-gyp compilar bcrypt do source
RUN apk add --no-cache libc6-compat python3 make g++
RUN apk update
WORKDIR /app
RUN npm install -g turbo

FROM base AS pruner
COPY . .
RUN turbo prune auth-service --docker

FROM base AS builder
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
RUN npm install

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN turbo run build --filter=auth-service...

FROM node:20-alpine AS runner
# Build tools necessários para rebuild do bcrypt em produção
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/dist ./apps/auth-service/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/src/migrations ./apps/auth-service/src/migrations
COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/src/data-source.ts ./apps/auth-service/src/data-source.ts
COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/src/auth ./apps/auth-service/src/auth
COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/package*.json ./apps/auth-service/
COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/tsconfig*.json ./apps/auth-service/
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

RUN npm install --omit=dev && \
    cd packages/utils && npm rebuild bcrypt --build-from-source && cd ../..

USER nestjs
WORKDIR /app/apps/auth-service
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["sh", "-c", "npm run migration:run && node dist/main.js"]