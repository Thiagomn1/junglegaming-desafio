# @jungle/eslint-config

Configurações ESLint compartilhadas.

## Uso

### Para serviços NestJS

```javascript
// eslint.config.mjs
import nestjsConfig from '@jungle/eslint-config/nestjs';

export default [
  // ... outras configs
  nestjsConfig,
];
```
