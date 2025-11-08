# Jungle Challenge - Microservices Architecture

Projeto de microserviços para um Sistema de Gestão de Tarefas Colaborativo com autenticação simples, CRUD de tarefas, comentários, atribuição e notificações

## Estrutura do Projeto

```
jungle-challenge/
├── apps/
│   ├── api-gateway/          # Gateway principal (porta 3001)
│   ├── auth-service/         # Serviço de autenticação (porta 4000)
│   └── tasks-service/        # Serviço de gerenciamento de tarefas (porta 5000)
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

# Tasks Service
cp apps/tasks-service/.env.example apps/tasks-service/.env
```

### 3. Inicie os containers com Docker Compose

```bash
docker-compose up -d
```

Isso irá iniciar:

- ✅ PostgreSQL (porta 5432)
- ✅ RabbitMQ (portas 5672 e 15672)
- ✅ Auth Service (porta 4000)
- ✅ Tasks Service (porta 5000)
- ✅ API Gateway (porta 3001)

### 4. Verifique se os serviços estão rodando

```bash
docker-compose ps
```

Você deve ver todos os containers com status "Up".

### 5. Acesse a documentação da API

- **API Gateway Swagger**: http://localhost:3001/api/docs
- **Auth Service Swagger**: http://localhost:4000/api/docs
- **Tasks Service Swagger**: http://localhost:5000/api/docs
- **RabbitMQ Management**: http://localhost:15672 (user: admin, password: admin)

## Desenvolvimento Local (sem Docker)

### 🚀 Fluxo Rápido (TL;DR)

```bash
npm run setup   # Apenas na primeira vez
npm run dev     # Inicia tudo em um único comando
```

Pronto! Todos os serviços e packages em watch mode rodando em paralelo.

### Setup Inicial (primeira vez)

```bash
# 1. Instale todas as dependências e build os packages
npm run setup
```

Este comando faz:

- ✅ `npm install` - Instala dependências de todos os workspaces
- ✅ Build automático dos packages compartilhados (@jungle/types e @jungle/utils)

### Executar o Projeto

**Opção 1: Rodar tudo em um único comando (RECOMENDADO)** 🚀

```bash
npm run dev
```

Este comando:

- ✅ Inicia **todos** os serviços em paralelo (api-gateway + auth-service + tasks-service)
- ✅ Inicia **watch mode** nos packages (types e utils) para rebuild automático
- ✅ Hot reload em todos os serviços
- ✅ Um único terminal!

**Como funciona:**

```
npm run dev
    │
    ├─> @jungle/types (tsc --watch)
    ├─> @jungle/utils (tsc --watch)
    ├─> api-gateway (nest start --watch)
    ├─> auth-service (nest start --watch)
    └─> tasks-service (nest start --watch)

Todas rodando em paralelo! 🔥
Mudou algo em @jungle/types? → Rebuild automático → Serviços detectam e recarregam
```

### Pré-requisitos

Certifique-se de ter PostgreSQL e RabbitMQ rodando localmente:

```bash
# PostgreSQL na porta 5432
# RabbitMQ na porta 5672

# Ou ajuste os arquivos .env em cada serviço para apontar para instâncias remotas
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

### Desenvolvimento

```bash
# Setup inicial (primeira vez)
npm run setup

# Rodar tudo em desenvolvimento (serviços + packages em watch mode)
npm run dev

# Rodar apenas os serviços (sem watch nos packages)
npm run dev:services

# Rodar um serviço específico
npm run dev --workspace=api-gateway
npm run dev --workspace=auth-service
npm run dev --workspace=tasks-service
```

### Build

```bash
# Build completo (packages + serviços)
npm run build

# Build apenas dos packages compartilhados
npm run build:packages

# Build de um workspace específico
npm run build --workspace=@jungle/types
npm run build --workspace=auth-service
npm run build --workspace=tasks-service
```

### Qualidade de Código

```bash
# Executar lint em todos os projetos
npm run lint

# Lint com correção automática
npm run lint:fix

# Executar testes
npm run test
```

### Limpeza

```bash
# Limpar builds e node_modules
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

### Tarefas (via API Gateway)

**Base URL**: `http://localhost:3001/api/tasks`

**⚠️ Todos os endpoints de tarefas requerem autenticação (Bearer Token)**

#### POST /api/tasks

Cria uma nova tarefa.

```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -d '{
    "title": "Implementar nova feature",
    "description": "Adicionar funcionalidade X ao sistema",
    "priority": "HIGH",
    "status": "TODO",
    "assignees": [1, 2],
    "dueDate": "2025-11-15T23:59:59.000Z"
  }'
```

**Priority**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
**Status**: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`

**Response**:

```json
{
  "id": 1,
  "title": "Implementar nova feature",
  "description": "Adicionar funcionalidade X ao sistema",
  "priority": "HIGH",
  "status": "TODO",
  "assignees": ["1", "2"],
  "dueDate": "2025-11-15T23:59:59.000Z",
  "createdBy": 5,
  "createdAt": "2025-11-08T01:00:00.000Z",
  "updatedAt": "2025-11-08T01:00:00.000Z"
}
```

#### GET /api/tasks

Lista todas as tarefas.

```bash
curl -X GET http://localhost:3001/api/tasks \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

#### GET /api/tasks/:id

Obtém uma tarefa específica.

```bash
curl -X GET http://localhost:3001/api/tasks/1 \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

#### PATCH /api/tasks/:id

Atualiza uma tarefa existente.

```bash
curl -X PATCH http://localhost:3001/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -d '{
    "status": "DONE",
    "priority": "MEDIUM"
  }'
```

#### DELETE /api/tasks/:id

Deleta uma tarefa.

```bash
curl -X DELETE http://localhost:3001/api/tasks/1 \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

**Response**:

```json
{
  "message": "Tarefa deletada com sucesso"
}
```

### Eventos RabbitMQ

O Tasks Service publica eventos no RabbitMQ para cada operação:

- **`task.created`**: Quando uma tarefa é criada
- **`task.updated`**: Quando uma tarefa é atualizada
- **`task.deleted`**: Quando uma tarefa é deletada

Esses eventos podem ser consumidos por outros serviços para implementar notificações, logs de auditoria, etc.

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

## Limpeza

Para parar e remover todos os containers:

```bash
docker-compose down
```

Para remover também os volumes (dados do banco):

```bash
docker-compose down -v
```
