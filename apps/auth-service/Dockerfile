# Dockerfile otimizado para monorepo Turbo
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN npm install -g turbo

# Prune stage - usa turbo prune para gerar apenas os arquivos necessários
FROM base AS pruner
COPY . .
RUN turbo prune auth-service --docker

# Build stage - instala dependências e faz build
FROM base AS builder
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Build usando turbo (automaticamente builda as dependências primeiro)
RUN turbo run build --filter=auth-service...

# Production stage - imagem final enxuta
FROM node:20-alpine AS runner
WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copiar apenas os arquivos de produção necessários
COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/dist ./apps/auth-service/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/package*.json ./apps/auth-service/
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --omit=dev

USER nestjs
WORKDIR /app/apps/auth-service
EXPOSE 3000

CMD ["node", "dist/main.js"]