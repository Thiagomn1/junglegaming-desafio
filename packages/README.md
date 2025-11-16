# 📦 Packages - Jungle Challenge

Pacotes compartilhados entre todos os serviços do monorepo.

## Estrutura

```
packages/
├── auth/               # Módulo de autenticação compartilhado
├── types/              # Tipos TypeScript compartilhados
├── utils/              # Funções utilitárias
├── tsconfig/           # Configurações TypeScript
└── eslint-config/      # Configurações ESLint
```

---

## 📋 Pacotes Disponíveis

### 1. `@jungle/auth`

Módulo NestJS compartilhado para autenticação JWT.

**Conteúdo:**

- `jwt.strategy.ts` - Estratégia Passport JWT
- `jwt-auth.guard.ts` - Guard para proteger rotas
- `auth.module.ts` - Módulo exportável

**Uso:**

```typescript
import { AuthModule, JwtAuthGuard } from "@jungle/auth";

@Module({
  imports: [AuthModule],
})
export class AppModule {}

// Proteger rota
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Req() req) {
  return req.user; // { userId, email, username }
}
```

---

### 2. `@jungle/types`

Tipos e interfaces TypeScript compartilhados.

**Conteúdo:**

- `auth.types.ts` - Tipos de autenticação (JWT, tokens, usuários)
- `common.types.ts` - Tipos comuns (paginação, respostas, roles)

**Uso:**

```typescript
import { JwtPayload, AuthTokens, UserResponse } from "@jungle/types";
```

---

### 3. `@jungle/utils`

Funções utilitárias reutilizáveis.

**Conteúdo:**

- `validation.ts` - Validações (email, senha, username)
- `date.ts` - Manipulação de datas
- `logger.ts` - Logger simples

**Uso:**

```typescript
import { isValidEmail, Logger, formatDate } from "@jungle/utils";

const logger = new Logger("MyService");
logger.info("Mensagem de log");
```

---

### 4. `@jungle/tsconfig`

Configurações TypeScript compartilhadas.

**Arquivos:**

- `base.json` - Configuração base
- `nestjs.json` - Específica para NestJS

**Uso:**

```json
{
  "extends": "@jungle/tsconfig/nestjs.json"
}
```

---

### 5. `@jungle/eslint-config`

Configurações ESLint compartilhadas.

**Arquivos:**

- `nestjs.js` - Rules para projetos NestJS

**Uso:**

```javascript
import nestjsConfig from "@jungle/eslint-config/nestjs";
```

---
