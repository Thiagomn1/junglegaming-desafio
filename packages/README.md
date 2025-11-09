# 📦 Packages - Jungle Challenge

Pacotes compartilhados entre todos os serviços do monorepo.

## Estrutura

```
packages/
├── types/              # Tipos TypeScript compartilhados
├── utils/              # Funções utilitárias
├── tsconfig/           # Configurações TypeScript
└── eslint-config/      # Configurações ESLint
```

---

## 📋 Pacotes Disponíveis

### 1. `@jungle/types`

Tipos e interfaces TypeScript compartilhados.

**Conteúdo:**

- `auth.types.ts` - Tipos de autenticação (JWT, tokens, usuários)
- `common.types.ts` - Tipos comuns (paginação, respostas, roles)

**Uso:**

```typescript
import { JwtPayload, AuthTokens, UserResponse } from "@jungle/types";
```

---

### 2. `@jungle/utils`

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

### 3. `@jungle/tsconfig`

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

### 4. `@jungle/eslint-config`

Configurações ESLint compartilhadas.

**Arquivos:**

- `nestjs.js` - Rules para projetos NestJS

**Uso:**

```javascript
import nestjsConfig from "@jungle/eslint-config/nestjs";
```

---
