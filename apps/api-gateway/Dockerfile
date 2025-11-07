FROM node:20-alpine
WORKDIR /app

# Copiar package.json raiz e dos workspaces
COPY package*.json ./
COPY apps/api-gateway/package*.json ./apps/api-gateway/
COPY packages/types/package*.json ./packages/types/
COPY packages/utils/package*.json ./packages/utils/
COPY packages/tsconfig/package*.json ./packages/tsconfig/
COPY packages/eslint-config/package*.json ./packages/eslint-config/

# Instalar dependências
RUN npm install

# Copiar código dos packages
COPY packages/ ./packages/

# Buildar os packages compartilhados
RUN npm run build --workspace=@jungle/types
RUN npm run build --workspace=@jungle/utils

# Copiar código do serviço
COPY apps/api-gateway/ ./apps/api-gateway/

WORKDIR /app/apps/api-gateway
EXPOSE 3001
CMD ["npm", "run", "start:dev"]