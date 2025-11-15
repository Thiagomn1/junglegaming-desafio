# Imagem base
FROM node:20-alpine AS base

# Instala dependências necessárias
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

# Instala turbo globalmente
RUN npm install -g turbo

# ========================================
# Pruner - Reduz o monorepo apenas ao necessário
# ========================================
FROM base AS pruner

COPY . .
RUN turbo prune web --docker

# ========================================
# Builder - Instala dependências e faz build
# ========================================
FROM base AS builder

# Copia arquivos de lockfile e package.json
COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .

# Instala dependências (incluindo devDependencies para build)
RUN npm install

# Copia o código fonte
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Build do pacote types e depois do web (turbo gerencia dependências)
RUN turbo run build --filter=@jungle/types...
RUN turbo run build --filter=web...

# ========================================
# Runner - Imagem de produção com Nginx
# ========================================
FROM nginx:alpine AS runner

# Copia arquivos de build do Vite
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copia configuração customizada do Nginx
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expõe porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]
