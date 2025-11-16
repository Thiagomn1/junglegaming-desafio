FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

RUN npm install -g turbo

FROM base AS pruner

COPY . .
RUN turbo prune web --docker

FROM base AS builder

ARG VITE_API_URL
ARG VITE_NOTIFICATIONS_SERVICE_URL

COPY .gitignore .gitignore
COPY --from=pruner /app/out/json/ .

RUN npm install

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_NOTIFICATIONS_SERVICE_URL=${VITE_NOTIFICATIONS_SERVICE_URL}

RUN turbo run build --filter=@jungle/types...
RUN turbo run build --filter=web...

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
