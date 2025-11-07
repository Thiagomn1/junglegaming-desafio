# Jungle Challenge - Microservices Architecture

Projeto de microserviços com API Gateway, serviço de autenticação, PostgreSQL e RabbitMQ.

## Estrutura do Projeto

```
jungle-challenge/
├── apps/
│   ├── api-gateway/          # Gateway principal (porta 3001)
│   └── auth-service/         # Serviço de autenticação (porta 4000)
├── packages/
│   ├── types/                # Tipos TypeScript compartilhados
│   ├── utils/                # Funções utilitárias compartilhadas
│   ├── tsconfig/             # Configurações TypeScript compartilhadas
│   └── eslint-config/        # Configurações ESLint compartilhadas
├── docker-compose.yml
└── package.json
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 20.x
- [Docker](https://www.docker.com/) >= 24.x
- [Docker Compose](https://docs.docker.com/compose/) >= 2.x
- npm >= 10.x

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone <repository-url>
cd jungle-challenge
```

### 2. Configure as variáveis de ambiente

**Para desenvolvimento com Docker (recomendado):**

O projeto já vem com um arquivo `.env` na raiz com valores padrão para desenvolvimento. Se quiser customizar:

```bash
# Edite o arquivo .env na raiz do projeto
nano .env
```

**Para desenvolvimento local (sem Docker):**

Copie os arquivos de exemplo para cada serviço:

```bash
# API Gateway
cp apps/api-gateway/.env.example apps/api-gateway/.env

# Auth Service
cp apps/auth-service/.env.example apps/auth-service/.env
```

### 3. Inicie os containers com Docker Compose

```bash
docker-compose up -d
```

Isso irá iniciar:

- ✅ PostgreSQL (porta 5432)
- ✅ RabbitMQ (portas 5672 e 15672)
- ✅ Auth Service (porta 4000)
- ✅ API Gateway (porta 3001)

### 4. Verifique se os serviços estão rodando

```bash
docker-compose ps
```

Você deve ver todos os containers com status "Up".

### 5. Acesse a documentação da API

- **API Gateway Swagger**: http://localhost:3001/api/docs
- **Auth Service Swagger**: http://localhost:4000/api/docs
- **RabbitMQ Management**: http://localhost:15672 (user: admin, password: admin)

## Desenvolvimento Local (sem Docker)

### 1. Instale as dependências

```bash
npm install
```

### 2. Build dos packages compartilhados

```bash
npm run build --workspace=@jungle/types
npm run build --workspace=@jungle/utils
```

### 3. Configure PostgreSQL e RabbitMQ localmente

Certifique-se de ter PostgreSQL e RabbitMQ rodando localmente ou ajuste os arquivos `.env` para apontar para instâncias remotas.

### 4. Execute os serviços em modo desenvolvimento

```bash
# Terminal 1 - Auth Service
npm run dev --workspace=auth-service

# Terminal 2 - API Gateway
npm run dev --workspace=api-gateway
```

## Variáveis de Ambiente

### Arquivo .env na raiz (Docker Compose)

O arquivo `.env` na raiz controla as variáveis para o Docker Compose:

| Variável                | Descrição              | Valor Padrão   |
| ----------------------- | ---------------------- | -------------- |
| `NODE_ENV`              | Ambiente de execução   | `development`  |
| `JWT_SECRET`            | Chave secreta para JWT | `secret`       |
| `POSTGRES_USER`         | Usuário do PostgreSQL  | `postgres`     |
| `POSTGRES_PASSWORD`     | Senha do PostgreSQL    | `password`     |
| `POSTGRES_DB`           | Nome do banco de dados | `challenge_db` |
| `RABBITMQ_DEFAULT_USER` | Usuário do RabbitMQ    | `admin`        |
| `RABBITMQ_DEFAULT_PASS` | Senha do RabbitMQ      | `admin`        |

## Comandos Disponíveis

```bash
# Desenvolvimento (todos os serviços)
npm run dev

# Build (todos os serviços)
npm run build

# Lint
npm run lint

# Lint com fix
npm run lint:fix

# Limpar builds
npm run clean
```

## Endpoints da API

### Autenticação (via API Gateway)

**Base URL**: `http://localhost:3001/api/auth`

#### POST /api/auth/register

Registra um novo usuário.

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "username": "usuario",
    "password": "senha123"
  }'
```

**Response**:

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

#### POST /api/auth/login

Realiza login de um usuário existente.

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123"
  }'
```

**Response**:

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

#### POST /api/auth/refresh

Renova o access token usando o refresh token.

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

#### GET /api/auth/profile

Obtém o perfil do usuário autenticado (requer autenticação).

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response**:

```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "username": "usuario",
  "roles": ["user"],
  "createdAt": "2025-11-07T08:00:00.000Z"
}
```

## Rate Limiting

A API Gateway possui rate limiting configurado:

- **Limite**: 10 requisições por 60 segundos
- **Escopo**: Global (todas as rotas)

## Packages Compartilhados

### @jungle/types

Tipos TypeScript compartilhados entre os serviços.

```typescript
import { JwtPayload, AuthTokens } from "@jungle/types";
```

### @jungle/utils

Funções utilitárias compartilhadas.

```typescript
import { isValidEmail, Logger } from "@jungle/utils";
```

### @jungle/tsconfig

Configurações TypeScript base para os serviços.

```json
{
  "extends": "@jungle/tsconfig/nestjs.json"
}
```

### @jungle/eslint-config

Configurações ESLint compartilhadas.

```javascript
import jungleConfig from "@jungle/eslint-config/nestjs.js";
```

## Troubleshooting

### Containers não iniciam

```bash
# Verifique os logs
docker-compose logs

# Reconstrua as imagens
docker-compose up -d --build
```

### Erro de conexão com o banco de dados

```bash
# Verifique se o PostgreSQL está rodando
docker-compose ps db

# Verifique os logs do auth-service
docker-compose logs auth-service
```

### Porta já em uso

Se alguma porta já estiver em uso, você pode alterar no `docker-compose.yml`:

```yaml
ports:
  - "3002:3001" # Muda a porta do host para 3002
```

## Limpeza

Para parar e remover todos os containers:

```bash
docker-compose down
```

Para remover também os volumes (dados do banco):

```bash
docker-compose down -v
```
