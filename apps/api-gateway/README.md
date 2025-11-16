# API Gateway

Gateway central que gerencia todas as requisições HTTP da aplicação, fazendo o roteamento para os microserviços apropriados.

## Responsabilidades

- **Roteamento centralizado**: Direciona requisições para auth-service, tasks-service e notifications-service
- **Autenticação JWT**: Valida tokens JWT usando estratégia passport
- **Rate limiting**: Proteção contra abuso com throttling (10 req/min global, 3 req/min por IP)
- **Documentação Swagger**: API docs disponíveis em `/api-docs`
- **Health check**: Endpoint `/health` para monitoramento

## Endpoints

### Authentication (proxy para auth-service)

- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/profile` - Perfil do usuário autenticado (requer JWT)
- `GET /api/auth/users` - Listar todos os usuários (requer JWT)

### Tasks (proxy para tasks-service)

- `GET /api/tasks` - Listar tasks (com filtros opcionais)
- `POST /api/tasks` - Criar task (requer JWT)
- `GET /api/tasks/:id` - Obter task específica (requer JWT)
- `PATCH /api/tasks/:id` - Atualizar task (requer JWT)
- `DELETE /api/tasks/:id` - Deletar task (requer JWT)
- `GET /api/tasks/:id/comments` - Listar comentários da task
- `POST /api/tasks/:id/comments` - Criar comentário
- `GET /api/tasks/:id/history` - Histórico de mudanças da task

### Notifications (proxy para notifications-service)

- `GET /api/notifications` - Listar notificações do usuário
- `GET /api/notifications/unread` - Listar não lidas
- `GET /api/notifications/unread/count` - Contador de não lidas
- `PATCH /api/notifications/:id/read` - Marcar como lida
- `PATCH /api/notifications/read-all` - Marcar todas como lidas
- `DELETE /api/notifications/:id` - Deletar notificação

## Variáveis de Ambiente

```bash
NODE_ENV=development                          # Ambiente (development/production)
JWT_SECRET=your-secret-key                    # Chave secreta JWT (mesma em todos os serviços)
AUTH_SERVICE_URL=http://auth-service:4000     # URL do serviço de autenticação
TASKS_SERVICE_URL=http://tasks-service:5000   # URL do serviço de tasks
NOTIFICATIONS_SERVICE_URL=http://notifications-service:6000  # URL do serviço de notificações
```

## Desenvolvimento Local

### Pré-requisitos

- Node.js 20+
- Serviços backend rodando (auth, tasks, notifications)

### Setup

```bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

### Acessar Swagger

```
http://localhost:3001/api-docs
```

## Arquitetura

```
Cliente (Web/Mobile)
        ↓
   API Gateway (porta 3001)
        ↓
   ┌────┴────┬────────┬─────────────┐
   ↓         ↓        ↓             ↓
Auth-Svc  Tasks-Svc  Notif-Svc  (futuros)
```

## Segurança

- **JWT Strategy**: Valida tokens em rotas protegidas
- **Rate Limiting**:
  - Global: 10 req/min
  - Por IP: 3 req/min
- **CORS**: Configurado para aceitar requisições do frontend
- **Helmet**: Headers de segurança HTTP

## Health Check

```bash
curl http://localhost:3001/health
# Response: {"status":"ok","timestamp":"2025-01-16T..."}
```
