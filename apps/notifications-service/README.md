# Notifications Service

Serviço de notificações em tempo real usando WebSocket e processamento assíncrono com RabbitMQ.

## Responsabilidades

- **Notificações em tempo real**: WebSocket (Socket.IO) para push notifications
- **Processamento de eventos**: Consumer RabbitMQ para eventos de tasks
- **Persistência**: Armazena notificações no PostgreSQL
- **Gerenciamento**: CRUD de notificações (marcar como lida, deletar)

## Tecnologias

- **NestJS**: Framework backend
- **Socket.IO**: WebSocket para comunicação real-time
- **RabbitMQ**: Consumer de eventos de tasks
- **TypeORM**: ORM para PostgreSQL
- **PostgreSQL**: Banco de dados

## Database Schema

### Tabela: notifications
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100) NOT NULL,  -- task.created, task.updated, etc
  message TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  task_id INTEGER,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

**Todas as rotas HTTP são consumidas via API Gateway**

### REST API
- `GET /notifications` - Listar todas as notificações do usuário
- `GET /notifications/unread` - Listar não lidas
- `GET /notifications/unread/count` - Contador de não lidas
- `PATCH /notifications/:id/read` - Marcar como lida
- `PATCH /notifications/read-all` - Marcar todas como lidas
- `DELETE /notifications/:id` - Deletar notificação

### WebSocket

**Namespace**: `/notifications`

**Eventos do servidor → cliente**:
- `notification` - Nova notificação recebida

**Autenticação**:
```javascript
const socket = io('http://localhost:6001/notifications', {
  auth: { token: 'jwt-token-here' }
});
```

**Conexão**:
```javascript
socket.on('connect', () => {
  console.log('Conectado ao servidor de notificações');
});

socket.on('notification', (notification) => {
  console.log('Nova notificação:', notification);
  // { id, type, message, taskId, metadata, timestamp }
});
```

## Variáveis de Ambiente

```bash
NODE_ENV=development
PORT=6000                  # Porta interna (exposta como 6001 externamente)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=challenge_db
JWT_SECRET=your-secret-key
RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

## Tipos de Notificação

```typescript
enum NotificationType {
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
  TASK_ASSIGNED = 'task.assigned',
  TASK_STATUS_CHANGED = 'task.status_changed',
  COMMENT_CREATED = 'task.comment.created',
}
```

## RabbitMQ Consumer

### Queue
- **Exchange**: `tasks_events`
- **Queue**: `notifications_queue`
- **Binding**: Escuta todas as routing keys `task.*`

### Processamento
1. Evento recebido do RabbitMQ
2. Notificação criada no banco de dados
3. Usuários afetados identificados (assignees, author, etc)
4. WebSocket envia notificação para usuários conectados

## Migrações

```bash
# Criar migração
npm run migration:generate -- src/migrations/MigrationName

# Rodar migrações
npm run migration:run

# Reverter
npm run migration:revert
```

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar migrações
npm run migration:run

# Dev mode
npm run dev

# Build
npm run build
```

## Fluxo de Notificações

```
1. Task criada em Tasks Service
2. Evento publicado no RabbitMQ (task.created)
3. Notifications Service consome evento
4. Notificação salva no banco
5. WebSocket envia para usuários conectados
6. Frontend recebe e exibe toast/badge
```

## WebSocket Connection Management

- **Rooms por usuário**: `user:${userId}`
- **Autenticação**: JWT validado no handshake
- **Reconexão**: Configurada com exponential backoff
- **Tracking**: Mapa de usuários conectados em memória

## Health Check

```bash
curl http://localhost:6000/health
```

## Integrações

- **Tasks Service**: Consome eventos via RabbitMQ
- **Frontend**: Conexão WebSocket para real-time updates

## Troubleshooting

### WebSocket não conecta
- Verificar se porta 6001 está acessível
- Validar token JWT no `auth` do socket
- Conferir CORS no servidor

### Notificações não chegam
- Verificar se RabbitMQ está rodando
- Conferir se queue está bound ao exchange
- Validar userId no evento
