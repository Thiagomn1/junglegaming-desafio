# Tasks Service

Serviço de gerenciamento de tarefas com suporte a comentários, histórico e eventos assíncronos.

## Responsabilidades

- **CRUD de Tasks**: Criar, ler, atualizar e deletar tarefas
- **Sistema de comentários**: Adicionar comentários em tasks
- **Histórico de mudanças**: Rastrear todas as alterações em tasks
- **Eventos RabbitMQ**: Publicar eventos para outros serviços
- **Atribuição de usuários**: Múltiplos assignees por task

## Tecnologias

- **NestJS**: Framework backend
- **TypeORM**: ORM para PostgreSQL
- **RabbitMQ**: Message broker para eventos
- **PostgreSQL**: Banco de dados

## Database Schema

### Tabela: tasks
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'TODO',  -- TODO, IN_PROGRESS, REVIEW, DONE
  priority VARCHAR(50) DEFAULT 'MEDIUM',  -- LOW, MEDIUM, HIGH, URGENT
  due_date TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: task_assignees
```sql
CREATE TABLE task_assignees (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  PRIMARY KEY (task_id, user_id)
);
```

### Tabela: comments
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: task_history
```sql
CREATE TABLE task_history (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  action VARCHAR(50),  -- created, updated, commented, deleted
  user_id INTEGER,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

**Todas as rotas são consumidas via API Gateway**

### Tasks
- `GET /tasks` - Listar tasks (filtros: ?status=TODO&priority=HIGH)
- `POST /tasks` - Criar task
- `GET /tasks/:id` - Obter task específica
- `PATCH /tasks/:id` - Atualizar task
- `DELETE /tasks/:id` - Deletar task

### Comments
- `GET /tasks/:id/comments` - Listar comentários
- `POST /tasks/:id/comments` - Criar comentário

### History
- `GET /tasks/:id/history` - Histórico de mudanças

## Variáveis de Ambiente

```bash
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=challenge_db
JWT_SECRET=your-secret-key
RABBITMQ_URL=amqp://admin:admin@localhost:5672
AUTH_SERVICE_URL=http://auth-service:4000
```

## Eventos RabbitMQ

### Exchange
- **Nome**: `tasks_events`
- **Tipo**: `topic`

### Routing Keys
- `task.created` - Quando task é criada
- `task.updated` - Quando task é atualizada
- `task.deleted` - Quando task é deletada
- `task.assigned` - Quando usuário é atribuído
- `task.status_changed` - Quando status muda
- `task.comment.created` - Quando comentário é criado

### Payload Exemplo
```json
{
  "id": 123,
  "title": "Implementar feature X",
  "assignees": [1, 2],
  "createdBy": 1,
  "status": "IN_PROGRESS"
}
```

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

## Fluxo de Eventos

```
1. Task criada → evento task.created publicado
2. Notifications Service consome evento
3. Notificações criadas para assignees
4. WebSocket envia notificação em tempo real
```

## Health Check

```bash
curl http://localhost:5000/health
```

## Integrações

- **Auth Service**: Valida usuários e busca perfis
- **Notifications Service**: Recebe eventos via RabbitMQ
