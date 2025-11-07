# @jungle/tsconfig

Configurações TypeScript compartilhadas.

## Uso

### Para serviços NestJS

```json
{
  "extends": "@jungle/tsconfig/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### Para pacotes genéricos

```json
{
  "extends": "@jungle/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```
