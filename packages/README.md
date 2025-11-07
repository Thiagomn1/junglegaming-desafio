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
import { JwtPayload, AuthTokens, UserResponse } from '@jungle/types';
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
import { isValidEmail, Logger, addDays } from '@jungle/utils';

const logger = new Logger('MyService');
logger.info('Mensagem de log');
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
import nestjsConfig from '@jungle/eslint-config/nestjs';
```

---

## 🚀 Como Usar nos Serviços

### 1. Instalar dependências (já configurado via workspaces)

Os pacotes já estão disponíveis automaticamente via npm workspaces.

### 2. Importar nos serviços

```typescript
// Em api-gateway, auth-service, etc.
import { JwtPayload, UserResponse } from '@jungle/types';
import { Logger, isValidEmail } from '@jungle/utils';

const logger = new Logger('AuthService');
logger.info('Usuário autenticado');
```

---

## 🛠️ Desenvolvimento

### Build de todos os pacotes

```bash
cd packages/types && npm run build
cd packages/utils && npm run build
```

Ou via Turborepo (recomendado):

```bash
# Na raiz do projeto
npm run build
```

---

## ✅ Status Atual

| Pacote | Status | Descrição |
|--------|--------|-----------|
| `@jungle/types` | ✅ Pronto | Tipos básicos criados |
| `@jungle/utils` | ✅ Pronto | Utils básicos criados |
| `@jungle/tsconfig` | ✅ Pronto | Configs compartilhadas |
| `@jungle/eslint-config` | ✅ Pronto | Rules compartilhadas |

---

## 📝 Próximos Passos

### Quando adicionar `tasks-service`:

1. Criar `tasks.types.ts` em `@jungle/types`:
```typescript
export interface Task {
  id: number;
  title: string;
  description: string;
  userId: number;
  status: TaskStatus;
  createdAt: Date;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}
```

### Quando adicionar `notifications-service`:

1. Criar `notifications.types.ts` em `@jungle/types`:
```typescript
export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  TASK_CREATED = 'task_created',
  TASK_COMPLETED = 'task_completed',
  SYSTEM = 'system',
}
```

---

## 💡 Benefícios

### ✅ Antes (sem packages compartilhados):
```typescript
// Em auth-service
interface JwtPayload { ... }

// Em api-gateway (código duplicado!)
interface JwtPayload { ... }

// Em tasks-service (código triplicado!)
interface JwtPayload { ... }
```

### ✅ Agora (com @jungle/types):
```typescript
// Em TODOS os serviços
import { JwtPayload } from '@jungle/types';
```

**Resultado:**
- ✅ Zero duplicação de código
- ✅ Consistência entre serviços
- ✅ Fácil manutenção
- ✅ TypeScript type-safety

---

## 🔧 Manutenção

### Adicionar novo tipo

```bash
# 1. Editar o arquivo
cd packages/types/src
# criar novo arquivo ou editar existente

# 2. Exportar no index
# packages/types/src/index.ts
export * from './novo-tipo';

# 3. Build
cd packages/types
npm run build
```

### Adicionar nova função utilitária

```bash
# Similar ao processo acima
cd packages/utils/src
# criar função

# Exportar no index.ts
# Build
```

---

## 📚 Recursos

- [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Turborepo](https://turbo.build/repo/docs)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
