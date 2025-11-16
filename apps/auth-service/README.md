# Auth Service

Serviço de autenticação e gerenciamento de usuários usando JWT.

## Responsabilidades

- **Registro de usuários**: Criação de contas com email, username e senha
- **Login/Autenticação**: Geração de tokens JWT
- **Validação de tokens**: Verificação de tokens para outros serviços
- **Gerenciamento de usuários**: Listagem e busca de usuários
- **Hash de senhas**: Usando bcrypt para segurança

## Tecnologias

- **NestJS**: Framework backend
- **TypeORM**: ORM para PostgreSQL
- **Passport-JWT**: Estratégia de autenticação
- **bcrypt**: Hash de senhas
- **PostgreSQL**: Banco de dados

## Database Schema

### Tabela: users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- bcrypt hash
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

**Todas as rotas são consumidas via API Gateway**

### POST /auth/register
Cria novo usuário
```json
Request:
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepass123"
}

Response:
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe"
}
```

### POST /auth/login
Autenticação
```json
Request:
{
  "email": "user@example.com",
  "password": "securepass123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

### GET /auth/profile
Retorna perfil do usuário autenticado (requer JWT)

### GET /auth/users
Lista todos os usuários (requer JWT)

## Variáveis de Ambiente

```bash
NODE_ENV=development
DB_HOST=localhost          # Host do PostgreSQL
DB_PORT=5432               # Porta do PostgreSQL
DB_USER=postgres           # Usuário do banco
DB_PASS=password           # Senha do banco
DB_NAME=challenge_db       # Nome do banco
JWT_SECRET=your-secret-key # Chave para assinar JWTs (deve ser a mesma em todos os serviços)
```

## Migrações

### Criar nova migração
```bash
npm run migration:generate -- src/migrations/MigrationName
```

### Rodar migrações
```bash
npm run migration:run
```

### Reverter última migração
```bash
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

## Segurança

- **Senhas**: Nunca armazenadas em plain text, sempre com bcrypt (salt rounds: 10)
- **JWT**: Tokens assinados com secret compartilhado
- **Validação**: Email e username únicos no banco
- **Rate Limiting**: Aplicado pelo API Gateway

## Health Check

```bash
curl http://localhost:4000/health
```

## Integrações

- **Tasks Service**: Consulta perfis de usuários para atribuição de tasks
- **Notifications Service**: Busca informações de usuários para notificações
