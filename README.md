# Jungle Challenge - Serviços de Gestão de Tarefas

Sistema de gestão de tarefas colaborativo com arquitetura de microserviços, autenticação JWT, notificações em tempo real e event-driven architecture.

## 🚀 Quick Start

```bash
# Com Docker (recomendado)
docker-compose up -d

# Acessar
http://localhost      # Frontend
http://localhost:3001 # API Gateway
```

**Pronto!** Todos os serviços estarão rodando.

## 🏗️ Arquitetura

```
Frontend (React) → API Gateway → Auth/Tasks/Notifications Services
                                       ↓
                              PostgreSQL + RabbitMQ
```

**Stack**: NestJS, React 19, TypeORM, PostgreSQL, RabbitMQ, Socket.IO, Docker

**Portas**:

- Frontend: 80 (Docker) ou 3000 (local)
- API Gateway: 3001
- Auth Service: 4000
- Tasks Service: 5000
- Notifications Service: 6001 (WebSocket) - _Nota: Porta 6000 é bloqueada por navegadores_
- RabbitMQ Management: 15672 (admin/admin)

## 📦 Componentes

| Serviço                   | Responsabilidade                            | Tecnologias                                  |
| ------------------------- | ------------------------------------------- | -------------------------------------------- |
| **API Gateway**           | Proxy reverso, rate limiting, roteamento    | NestJS, Express                              |
| **Auth Service**          | Autenticação JWT, gerenciamento de usuários | NestJS, TypeORM, bcrypt                      |
| **Tasks Service**         | CRUD de tarefas e comentários, eventos      | NestJS, TypeORM, RabbitMQ                    |
| **Notifications Service** | Notificações em tempo real via WebSocket    | NestJS, Socket.IO, RabbitMQ                  |
| **Frontend**              | Interface do usuário                        | React 19, TanStack Router/Query, Tailwind v4 |

## 💻 Desenvolvimento Local

### Backend no Docker + Frontend local (recomendado)

```bash
# 1. Subir backend
docker-compose up -d

# 2. Frontend (novo terminal)
cd apps/web
cp .env.example .env
npm install
npm run dev
```

Frontend em: http://localhost:3000

### Tudo local (sem Docker)

```bash
# 1. Setup inicial (primeira vez)
npm run setup

# 2. Infraestrutura
npm run dev:infra

# 3. Todos os serviços
npm run dev
```

## 🎯 Decisões Técnicas

**Microserviços**: Escalabilidade independente, separação de domínios (trade-off: complexidade operacional)

**RabbitMQ**: Comunicação assíncrona desacoplada, resiliência a falhas (trade-off: overhead de infraestrutura)

**TypeORM**: Type-safety end-to-end, migrations automáticas (alternativas: Prisma, Drizzle)

**TanStack Query**: Cache automático, background refetching, UX otimizada

**Socket.IO**: Notificações bi-direcionais em tempo real, fallback automático

**Monorepo**: Compartilhamento de código (types, utils, configs) em um único repositório

## 🐛 Problemas Conhecidos

1. **Rate limiting agressivo** - 10 req/min globalmente (ideal: por usuário/IP com Redis)
2. **Sem filtros no backend** - GET /tasks não aceita query params (workaround: client-side)
3. **Sem paginação** - Performance degrada com muitos dados
4. **WebSocket não valida token expirado** - Conexão persiste após JWT expirar
5. **Porta 6000 bloqueada** - Navegadores bloqueiam porta 6000, usamos 6001 para WebSocket

## 🔧 Melhorias Futuras

**Curto prazo**: Testes (Jest/Supertest), logging estruturado

**Médio prazo**: Paginação, Redis cache, CI/CD, monitoramento (Prometheus/Grafana)

**Longo prazo**: Kubernetes, event sourcing

## ⏱️ Tempo Gasto

- **Backend**: 3 dias
- **Frontend** 2 dias

---

## 📚 Documentação Completa

<details>
<summary><b>Arquitetura Detalhada</b></summary>

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│                     http://localhost:3000                       │
│           React 19 • TanStack Router/Query • Tailwind           │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────▼────────────────────────────────────────────────┐
│                    API Gateway (NestJS)                         │
│                     http://localhost:3001                       │
│            Rate Limiting • Auth Proxy • Routing                 │
└──────┬─────────────────────┬──────────────────────┬────────────┘
       │                     │                      │
┌──────▼────────┐  ┌─────────▼────────┐  ┌─────────▼─────────────┐
│ Auth Service  │  │  Tasks Service   │  │ Notifications Service │
│  Port: 4000   │  │   Port: 5000     │  │   Port: 6001 (WS)     │
│               │  │                  │  │                       │
│ • JWT Auth    │  │ • CRUD Tasks     │  │ • WebSocket Server    │
│ • User Mgmt   │  │ • Comments       │  │ • RabbitMQ Consumer   │
│               │  │ • RabbitMQ Pub   │  │ • Real-time Notify    │
└───────┬───────┘  └────────┬─────────┘  └──────────┬────────────┘
        │                   │                       │
┌───────▼───────────────────▼───────────────────────▼────────────┐
│                      PostgreSQL                                │
│                     Port: 5432                                 │
└────────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │    RabbitMQ      │
                    │   Port: 5672     │
                    │  (Mgmt: 15672)   │
                    └──────────────────┘

Event Flow:
Task Created/Updated → Tasks Service → RabbitMQ → Notifications Service → WebSocket → Frontend
```

</details>

<details>
<summary><b>Estrutura do Projeto</b></summary>

```
jungle-challenge/
├── apps/
│   ├── api-gateway/          # Gateway principal (porta 3001)
│   ├── auth-service/         # Serviço de autenticação (porta 4000)
│   ├── tasks-service/        # Serviço de gerenciamento de tarefas (porta 5000)
│   ├── notifications-service/ # Serviço de notificações WebSocket (porta 6001)
│   └── web/                  # Frontend React (porta 3000 local / 80 Docker)
├── packages/
│   ├── types/                # Tipos TypeScript compartilhados
│   ├── utils/                # Funções utilitárias compartilhadas
│   ├── tsconfig/             # Configurações TypeScript compartilhadas
│   └── eslint-config/        # Configurações ESLint compartilhadas
├── docker-compose.yml
└── package.json
```

</details>

<details>
<summary><b>Comandos Úteis</b></summary>

### Desenvolvimento

```bash
npm run setup              # Setup inicial (primeira vez)
npm run dev                # Rodar todos os serviços
npm run dev:infra          # Só PostgreSQL + RabbitMQ
npm run dev:services       # Só os microserviços
```

### Build

```bash
npm run build              # Build completo
npm run build:packages     # Só packages compartilhados
```

### Qualidade

```bash
npm run lint               # Lint
npm run lint:fix           # Lint com fix
npm run test               # Testes
```

### Docker

```bash
docker-compose up -d       # Subir tudo
docker-compose ps          # Ver status
docker-compose logs -f     # Ver logs
docker-compose down        # Parar tudo
docker-compose down -v     # Parar e limpar volumes
```

### Migrations

```bash
npm run migration:show     # Ver status
npm run migration:run      # Aplicar pendentes
npm run migration:revert   # Reverter última
```

</details>

<details>
<summary><b>API Endpoints</b></summary>

### Autenticação (via Gateway)

**POST /api/auth/register**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "user",
    "password": "senha123"
  }'
```

**POST /api/auth/login**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123"
  }'
```

**GET /api/auth/profile** (requer Bearer token)

```bash
curl http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer {token}"
```

### Tasks (via Gateway)

**POST /api/tasks** - Criar nova tarefa (requer Bearer token)

```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "Nova tarefa",
    "description": "Descrição",
    "priority": "HIGH",
    "status": "TODO",
    "assignees": [2, 3]
  }'
```

**GET /api/tasks** - Listar todas as tarefas (requer Bearer token)

```bash
curl http://localhost:3001/api/tasks \
  -H "Authorization: Bearer {token}"
```

**GET /api/tasks/:id** - Obter tarefa específica (requer Bearer token)

```bash
curl http://localhost:3001/api/tasks/1 \
  -H "Authorization: Bearer {token}"
```

**PATCH /api/tasks/:id** - Atualizar tarefa (requer Bearer token)

```bash
curl -X PATCH http://localhost:3001/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "status": "DONE",
    "assignees": [2]
  }'
```

**DELETE /api/tasks/:id** - Deletar tarefa (requer Bearer token)

```bash
curl -X DELETE http://localhost:3001/api/tasks/1 \
  -H "Authorization: Bearer {token}"
```

**GET /api/tasks/:id/history** - Obter histórico de mudanças (requer Bearer token)

```bash
curl http://localhost:3001/api/tasks/1/history \
  -H "Authorization: Bearer {token}"
```

**POST /api/tasks/:taskId/comments** - Criar comentário (requer Bearer token)

```bash
curl -X POST http://localhost:3001/api/tasks/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "text": "Meu comentário na tarefa"
  }'
```

**GET /api/tasks/:taskId/comments** - Listar comentários (requer Bearer token)

```bash
curl http://localhost:3001/api/tasks/1/comments \
  -H "Authorization: Bearer {token}"
```

### Notificações (via Gateway)

**GET /api/notifications** - Listar todas as notificações (requer Bearer token)

```bash
curl http://localhost:3001/api/notifications \
  -H "Authorization: Bearer {token}"
```

**GET /api/notifications/unread** - Listar notificações não lidas (requer Bearer token)

```bash
curl http://localhost:3001/api/notifications/unread \
  -H "Authorization: Bearer {token}"
```

**GET /api/notifications/unread/count** - Obter contagem de não lidas (requer Bearer token)

```bash
curl http://localhost:3001/api/notifications/unread/count \
  -H "Authorization: Bearer {token}"
```

**PATCH /api/notifications/:id/read** - Marcar como lida (requer Bearer token)

```bash
curl -X PATCH http://localhost:3001/api/notifications/5/read \
  -H "Authorization: Bearer {token}"
```

**PATCH /api/notifications/read-all** - Marcar todas como lidas (requer Bearer token)

```bash
curl -X PATCH http://localhost:3001/api/notifications/read-all \
  -H "Authorization: Bearer {token}"
```

**DELETE /api/notifications/:id** - Deletar notificação (requer Bearer token)

```bash
curl -X DELETE http://localhost:3001/api/notifications/5 \
  -H "Authorization: Bearer {token}"
```

### WebSocket (Notificações em Tempo Real)

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:6001/notifications", {
  auth: { token: "SEU_TOKEN" },
});

socket.on("connect", () => console.log("Conectado ao WebSocket"));
socket.on("notification", (notif) => console.log("Nova notificação:", notif));
```

**Tipos de notificações**:

- `TASK_CREATED` - Quando você cria uma tarefa
- `TASK_ASSIGNED` - Quando você é atribuído a uma tarefa
- `TASK_UPDATED` - Quando uma tarefa que você está envolvido é atualizada
- `TASK_STATUS_CHANGED` - Quando o status de uma tarefa muda
- `TASK_DELETED` - Quando uma tarefa é deletada
- `COMMENT_CREATED` - Quando alguém comenta em uma tarefa que você criou ou está atribuído

**Swagger Docs**:

- API Gateway: http://localhost:3001/api-docs
- Auth Service: http://localhost:4000/api-docs (via network interna)
- Tasks Service: http://localhost:5000/api-docs (via network interna)
- Notifications Service: http://localhost:6001/api-docs

</details>

<details>
<summary><b>🔧 Troubleshooting</b></summary>

### Problemas Comuns

#### 1. Porta 3001 já em uso

```bash
# Descobrir o processo usando a porta
lsof -i :3001
# Ou usar outra porta no .env
API_GATEWAY_PORT=3002
```

#### 2. WebSocket não conecta (ERR_UNSAFE_PORT)

**Problema**: Porta 6000 é bloqueada por navegadores por segurança.
**Solução**: Usar porta 6001 (já configurado no docker-compose.yml)

#### 3. Migrações falhando

```bash
# Verificar se database está rodando
docker ps | grep db

# Rodar migrações manualmente
npm run migration:run --workspace=auth-service
npm run migration:run --workspace=tasks-service
npm run migration:run --workspace=notifications-service
```

#### 4. ECONNREFUSED ao conectar no banco

**Causa**: PostgreSQL ainda não está pronto quando serviço inicia.
**Solução**: Docker Compose `depends_on` está configurado, mas pode precisar de retry manual:

```bash
docker-compose restart auth-service tasks-service notifications-service
```

#### 5. RabbitMQ não conecta

```bash
# Verificar se RabbitMQ está rodando
docker ps | grep rabbitmq

# Acessar management UI
open http://localhost:15672
# Credenciais: admin/admin
```

#### 6. Frontend não carrega (VITE_API_URL undefined)

**Causa**: Variáveis de ambiente não injetadas no build Docker.
**Solução**: Passar build args no docker-compose:

```bash
docker-compose build web --build-arg VITE_API_URL=http://localhost:3001/api
```

#### 7. Token inválido / 401 Unauthorized

```bash
# Verificar se JWT_SECRET é o mesmo em todos os serviços
grep JWT_SECRET apps/*/. env

# Gerar novo token fazendo login novamente
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### 8. Containers ficam reiniciando

```bash
# Ver logs do container com problema
docker logs -f <container-name>

# Verificar health checks
docker inspect <container-name> | grep -A 10 Health
```

#### 9. Notificações não aparecem

**Checklist**:

- ✅ WebSocket conectado? (ver console do navegador)
- ✅ Token JWT válido no auth do socket?
- ✅ RabbitMQ rodando?
- ✅ Evento sendo publicado? (ver logs do tasks-service)

#### 10. Build falha com "Out of memory"

```bash
# Aumentar memória do Docker Desktop
# Preferências → Resources → Memory: 4GB+

# Ou buildar serviços individualmente
docker-compose build api-gateway
docker-compose build auth-service
# etc...
```

### Comandos Úteis

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api-gateway

# Resetar tudo (⚠️ apaga dados)
docker-compose down -v
docker system prune -a

# Rebuild completo
docker-compose build --no-cache
docker-compose up -d
```

</details>

<details>
<summary><b>Configuração de Variáveis de Ambiente</b></summary>

### Copiar arquivos .env

```bash
# Todos de uma vez
for service in api-gateway auth-service tasks-service notifications-service web; do
  cp apps/$service/.env.example apps/$service/.env
done
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3001
VITE_NOTIFICATIONS_SERVICE_URL=http://localhost:6001
```

**Importante**: A porta 6000 é bloqueada por navegadores modernos (Chrome, Firefox) por questões de segurança. Usamos 6001 para evitar `ERR_UNSAFE_PORT`.

### Backend Services

Cada serviço tem seu `.env.example` com as configurações necessárias para PostgreSQL, RabbitMQ, JWT, etc.

</details>

## 📋 Requisitos

- Node.js >= 20.x
- Docker >= 24.x
- Docker Compose >= 2.x
- npm >= 10.x
