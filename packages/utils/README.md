# @jungle/utils

Funções utilitárias compartilhadas entre todos os serviços.

## Uso

```typescript
import { isValidEmail, Logger, addDays } from '@jungle/utils';

// Validação
if (isValidEmail(email)) {
  // ...
}

// Logger
const logger = new Logger('AuthService');
logger.info('Usuário logado');

// Datas
const expirationDate = addDays(new Date(), 7);
```

## Módulos

- `validation.ts` - Validações comuns (email, senha, username)
- `date.ts` - Manipulação de datas
- `logger.ts` - Logger simples para todos os serviços
