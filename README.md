# Jungle Challenge - Microservices Architecture

Projeto de microserviços para um Sistema de Gestão de Tarefas Colaborativo com autenticação simples, CRUD de tarefas, comentários, atribuição e notificações

## Estrutura do Projeto

```
jungle-challenge/
├── apps/
│   ├── api-gateway/          # Gateway principal (porta 3001)
│   ├── auth-service/         # Serviço de autenticação (porta 4000)
│   ├── tasks-service/        # Serviço de gerenciamento de tarefas (porta 5000)
│   └── notifications-service/ # Serviço de notificações (porta 6000)
├── packages/
│   ├── types/                # Tipos TypeScript compartilhados
│   ├── utils/                # Funções utilitárias compartilhadas
│   ├── tsconfig/             # Configurações TypeScript compartilhadas
│   └── eslint-config/        # Configurações ESLint compartilhadas
├── docker-compose.yml
├── docker-compose.dev.yml
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

### 2. Inicie os containers com Docker Compose

```bash
docker-compose up -d
```

Isso irá iniciar:

- ✅ PostgreSQL (porta 5432)
- ✅ RabbitMQ (portas 5672 e 15672)
- ✅ Auth Service (porta 4000)
- ✅ Tasks Service (porta 5000)
- ✅ Notifications Service (porta 6000)
- ✅ API Gateway (porta 3001)
- ✅ Frontend Web (porta 80)

### 3. Verifique se os serviços estão rodando

```bash
docker-compose ps
```

Você deve ver todos os containers com status "Up".

### 4. Acesse a aplicação

- **Frontend**: http://localhost
- **API Gateway Swagger**: http://localhost:3001/api/docs
- **Auth Service Swagger**: http://localhost:4000/api/docs
- **Tasks Service Swagger**: http://localhost:5000/api/docs
- **Notifications Service Swagger**: http://localhost:6000/api/docs
- **RabbitMQ Management**: http://localhost:15672 (user: admin, password: admin)

## Desenvolvimento Local (sem Docker)

### 🚀 Fluxo Rápido

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

### Configurar Variáveis de Ambiente (Desenvolvimento Local)

Copie os arquivos de exemplo para cada serviço:

```bash
# API Gateway
cp apps/api-gateway/.env.example apps/api-gateway/.env

# Auth Service
cp apps/auth-service/.env.example apps/auth-service/.env

# Tasks Service
cp apps/tasks-service/.env.example apps/tasks-service/.env

# Notifications Service
cp apps/notifications-service/.env.example apps/notifications-service/.env

# Frontend Web
cp apps/web/.env.example apps/web/.env
```

Edite os arquivos `.env` de cada serviço conforme necessário para apontar para suas instâncias locais de PostgreSQL e RabbitMQ.

Para o frontend, configure as URLs da API no `.env`:

```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:6000/notifications
```

### Executar o Projeto

**Opção 1: Rodar tudo em um único comando (RECOMENDADO)** 🚀

```bash
npm run dev
```

### Infraestrutura para Desenvolvimento Local

Você precisa de PostgreSQL e RabbitMQ rodando. Temos duas opções:

**Opção 1: Usar Docker apenas para infraestrutura (RECOMENDADO)** 🐳

```bash
# Inicia PostgreSQL e RabbitMQ em containers
npm run dev:infra

# Verificar se subiram
docker ps

# Parar quando terminar
npm run dev:infra:stop
```

Isso sobe:

- ✅ PostgreSQL na porta 5432
- ✅ RabbitMQ na porta 5672 (Management UI: http://localhost:15672)

**Opção 2: Instalar PostgreSQL e RabbitMQ localmente**

Instale manualmente PostgreSQL e RabbitMQ em sua máquina e ajuste os arquivos `.env` de cada serviço para apontar para essas instâncias.

## Comandos Disponíveis

### Desenvolvimento

```bash
# Setup inicial (primeira vez)
npm run setup

# Infraestrutura (apenas para dev local sem Docker completo)
npm run dev:infra          # Inicia PostgreSQL e RabbitMQ em containers
npm run dev:infra:stop     # Para a infraestrutura

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

### Migrations (TypeORM)

> **⚙️ Migrations Automáticas**: As migrations rodam **automaticamente** quando os serviços iniciam (`migrationsRun: true`).

#### 🚀 Workflow Completo: Alterar uma Entity

Quando você adiciona/remove campos de uma entity, siga este fluxo:

**1. Altere a entity**

```typescript
// apps/auth-service/src/auth/user.entity.ts
@Entity("users")
export class User {
  // ... campos existentes

  @Column({ nullable: true })
  avatar?: string; // NOVO CAMPO
}
```

**2. Gere a migration automaticamente**

```bash
# Usando o helper script
npm run migration:generate-helper auth AddUserAvatar
npm run migration:generate-helper tasks AddTaskTags
```

```bash
# Ou manualmente
DB_HOST=localhost npm run migration:generate src/migrations/AddUserAvatar --workspace=auth-service
```

**3. Aplicar a migration**

Com Docker:

```bash
# Rebuild e restart do serviço
docker-compose build auth-service
docker-compose up -d auth-service

# A migration roda automaticamente no startup!
```

Dev local (sem Docker):

```bash
# Restart do serviço (Ctrl+C e rodar de novo)
npm run dev

# Ou rodar manualmente
npm run migration:run --workspace=auth-service
```

#### 📋 Comandos Disponíveis

**Comandos para todos os serviços:**

```bash
# Ver status de todas as migrations
npm run migration:show

# Rodar todas as migrations pendentes
npm run migration:run

# Reverter última migration de todos os serviços
npm run migration:revert
```

#### ⚠️ Quando Precisar Resetar o Banco Completamente

```bash
# ATENÇÃO: Isso deleta TODOS os dados!
docker-compose down -v
docker-compose up -d

# Migrations rodam automaticamente no restart
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

### Comentários (via API Gateway)

**Base URL**: `http://localhost:3001/api/tasks/:id/comments`

**⚠️ Todos os endpoints de comentários requerem autenticação (Bearer Token)**

#### POST /api/tasks/:id/comments

Cria um comentário em uma tarefa.

```bash
curl -X POST http://localhost:3001/api/tasks/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -d '{
    "text": "Este é um comentário sobre a tarefa"
  }'
```

**Response**:

```json
{
  "id": 1,
  "text": "Este é um comentário sobre a tarefa",
  "authorId": 5,
  "taskId": 1,
  "createdAt": "2025-11-08T10:00:00.000Z"
}
```

#### GET /api/tasks/:id/comments

Lista todos os comentários de uma tarefa (ordenados do mais recente para o mais antigo).

```bash
curl -X GET http://localhost:3001/api/tasks/1/comments \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

**Response**:

```json
[
  {
    "id": 2,
    "text": "Segundo comentário",
    "authorId": 3,
    "taskId": 1,
    "createdAt": "2025-11-08T11:00:00.000Z"
  },
  {
    "id": 1,
    "text": "Este é um comentário sobre a tarefa",
    "authorId": 5,
    "taskId": 1,
    "createdAt": "2025-11-08T10:00:00.000Z"
  }
]
```

### Notificações (via API Gateway)

**Base URL**: `http://localhost:3001/notifications`

**⚠️ Todos os endpoints de notificações requerem autenticação (Bearer Token)**

O sistema de notificações funciona em tempo real através de eventos RabbitMQ e WebSocket. Notificações são automaticamente criadas quando:

- Uma tarefa é criada
- Uma tarefa tem seu status alterado
- Um comentário é adicionado em uma tarefa (notifica o dono da tarefa, exceto se o autor do comentário for o próprio dono)

#### GET /notifications

Lista todas as notificações do usuário autenticado (ordenadas da mais recente para a mais antiga).

```bash
curl -X GET http://localhost:3001/notifications \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

**Response**:

```json
[
  {
    "id": 3,
    "type": "task.comment.created",
    "message": "Novo comentário em: Implementar feature",
    "userId": 1,
    "taskId": 5,
    "read": false,
    "metadata": {
      "commentId": 6,
      "taskTitle": "Implementar feature",
      "authorId": 2,
      "text": "Comentário exemplo"
    },
    "createdAt": "2025-11-10T19:16:41.429Z"
  },
  {
    "id": 2,
    "type": "task.status_changed",
    "message": "Status da tarefa alterado para: DONE",
    "userId": 1,
    "taskId": 5,
    "read": true,
    "metadata": {
      "changes": {
        "status": "DONE"
      }
    },
    "createdAt": "2025-11-10T19:13:12.613Z"
  }
]
```

#### GET /notifications/unread

Lista apenas as notificações não lidas do usuário.

```bash
curl -X GET http://localhost:3001/notifications/unread \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

#### GET /notifications/unread/count

Retorna a contagem de notificações não lidas (útil para badges/contadores na UI).

```bash
curl -X GET http://localhost:3001/notifications/unread/count \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

**Response**:

```json
{
  "count": 3
}
```

#### PATCH /notifications/:id/read

Marca uma notificação específica como lida.

```bash
curl -X PATCH http://localhost:3001/notifications/5/read \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

**Response**:

```json
{
  "id": 5,
  "type": "task.created",
  "message": "Nova tarefa criada: Título da tarefa",
  "userId": 1,
  "taskId": 10,
  "read": true,
  "metadata": { ... },
  "createdAt": "2025-11-10T20:00:00.000Z"
}
```

#### PATCH /notifications/read-all

Marca todas as notificações do usuário como lidas.

```bash
curl -X PATCH http://localhost:3001/notifications/read-all \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

**Response**:

```json
{
  "success": true
}
```

### WebSocket - Notificações em Tempo Real

O Notifications Service oferece um gateway WebSocket para receber notificações em tempo real.

**URL**: `ws://localhost:6000/notifications`

**Autenticação**: JWT token via query parameter ou header

#### Conectar ao WebSocket

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:6000/notifications", {
  auth: {
    token: "SEU_ACCESS_TOKEN",
  },
});

// Evento de conexão bem-sucedida
socket.on("connected", (data) => {
  console.log("Conectado:", data);
  // { message: 'Conectado ao servidor de notificações', userId: 7 }
});

// Receber notificações em tempo real
socket.on("notification", (notification) => {
  console.log("Nova notificação:", notification);
  /* {
    type: 'task.created',
    message: 'Nova tarefa criada: Título',
    taskId: 5,
    metadata: { ... },
    timestamp: '2025-11-10T20:00:00.000Z'
  } */
});

// Evento de erro de autenticação
socket.on("error", (error) => {
  console.error("Erro:", error);
});
```

### Tipos de Notificações

O sistema suporta os seguintes tipos de notificações:

- **`task.created`**: Nova tarefa foi criada (notifica o criador)
- **`task.updated`**: Tarefa foi atualizada
- **`task.status_changed`**: Status da tarefa foi alterado (tipo específico de update)
- **`task.deleted`**: Tarefa foi deletada
- **`task.comment.created`**: Novo comentário em uma tarefa (notifica o dono da tarefa, exceto auto-comentários)

Cada notificação inclui:

- `id`: ID único da notificação
- `type`: Tipo da notificação (enum)
- `message`: Mensagem descritiva em português
- `userId`: ID do usuário que receberá a notificação
- `taskId`: ID da tarefa relacionada
- `read`: Status de leitura (boolean)
- `metadata`: Dados adicionais em formato JSON (varia por tipo)
- `createdAt`: Data/hora de criação

### Eventos RabbitMQ

O Tasks Service publica eventos no RabbitMQ para cada operação:

- **`task.created`**: Quando uma tarefa é criada
- **`task.updated`**: Quando uma tarefa é atualizada
- **`task.deleted`**: Quando uma tarefa é deletada
- **`task.comment.created`**: Quando um comentário é criado em uma tarefa

Esses eventos são consumidos automaticamente pelo Notifications Service, que:

1. Persiste a notificação no banco de dados
2. Envia a notificação em tempo real via WebSocket para usuários conectados
3. Filtra notificações irrelevantes (ex: não notifica auto-comentários)

### Histórico de Auditoria (TaskHistory)

Todas as operações nas tarefas são automaticamente registradas na tabela `task_history` para auditoria:

- **`created`**: Quando uma tarefa é criada
- **`updated`**: Quando uma tarefa é atualizada
- **`commented`**: Quando um comentário é adicionado
- **`deleted`**: Quando uma tarefa é deletada

Cada entrada de histórico inclui:

- `taskId`: ID da tarefa relacionada
- `action`: Tipo de ação executada
- `userId`: ID do usuário que executou a ação
- `metadata`: Dados adicionais em formato JSON (mudanças, texto do comentário, etc.)
- `timestamp`: Data/hora da ação

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
import { Logger } from "@jungle/utils";
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

## Frontend (React + Vite)

O frontend está localizado em `apps/web` e utiliza as seguintes tecnologias:

- **React 19** - Framework UI
- **Vite** - Build tool e dev server
- **TanStack Router** - Roteamento com type-safety
- **TanStack Query** - Data fetching e cache
- **Tailwind CSS v4** - Estilização
- **TypeScript** - Type safety

### Estrutura do Frontend

```
apps/web/
├── src/
│   ├── routes/          # Rotas da aplicação (TanStack Router)
│   ├── components/      # Componentes reutilizáveis
│   ├── lib/             # Utilitários e configurações
│   └── main.tsx         # Entry point
├── public/              # Assets estáticos
├── Dockerfile           # Build de produção (Nginx)
├── Dockerfile.dev       # Build de desenvolvimento
├── nginx.conf           # Configuração do Nginx
└── vite.config.ts       # Configuração do Vite
```

### Executar Frontend Localmente

**Desenvolvimento:**

```bash
cd apps/web
npm install
npm run dev
```

O frontend estará disponível em: http://localhost:3000

**Build de produção:**

```bash
npm run build
npm run serve
```

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp apps/web/.env.example apps/web/.env
```

Configurações disponíveis:

- `VITE_API_URL` - URL da API Gateway (padrão: http://localhost:3001)
- `VITE_WS_URL` - URL do WebSocket de notificações (padrão: http://localhost:6000/notifications)

### Docker

**Produção (com Nginx):**

```bash
docker build -f apps/web/Dockerfile -t jungle-web .
docker run -p 80:80 jungle-web
```

**Desenvolvimento (com hot reload):**

```bash
docker build -f apps/web/Dockerfile.dev -t jungle-web-dev .
docker run -p 3000:3000 -v $(pwd)/apps/web:/app/apps/web jungle-web-dev
```

### Integração com Backend

O frontend se comunica com o backend através de:

1. **REST API** - Via API Gateway (porta 3001)
2. **WebSocket** - Para notificações em tempo real (porta 6000)
