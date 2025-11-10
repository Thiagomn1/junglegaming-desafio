# @jungle/types

Tipos e interfaces TypeScript compartilhados entre todos os serviços do monorepo.

## Uso

```typescript
// Em qualquer serviço (api-gateway, auth-service, etc.)
import { JwtPayload, AuthTokens, UserResponse } from "@jungle/types";
```

## Estrutura

- `auth.types.ts` - Tipos relacionados à autenticação
- `tasks.types.ts` - Tipos relacionados a tarefas
- `notifications.types.ts` - Tipos relacionados a notificações
- `common.types.ts` - Tipos comuns (paginação, respostas, etc.)
- `index.ts` - Exportações centralizadas

## Desenvolvimento

```bash
# Build
npm run build

# Watch mode
npm run dev

# Clean
npm run clean
```
