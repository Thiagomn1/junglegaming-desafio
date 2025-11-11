# Frontend - Jungle Challenge

Frontend da aplicação de gerenciamento de tarefas.

## Stack

- **React 19** - UI Framework
- **Vite** - Build tool
- **TanStack Router** - Type-safe routing
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety

## Estrutura

```
src/
├── components/     # Componentes reutilizáveis
├── lib/            # Utilitários e configurações
├── routes/         # Rotas da aplicação (TanStack Router)
│   ├── __root.tsx  # Layout raiz
│   └── index.tsx   # Página inicial
├── main.tsx        # Entry point
└── styles.css      # Estilos globais
```

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar dev server
npm run dev

# Build para produção
npm run build

# Preview do build
npm run serve
```

## Variáveis de Ambiente

Crie um arquivo `.env`:

```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:6000/notifications
```

## Adicionar Novas Rotas

O TanStack Router usa file-based routing. Para adicionar uma nova rota:

1. Crie um arquivo em `src/routes/`:
   - `about.tsx` → `/about`
   - `tasks/index.tsx` → `/tasks`
   - `tasks/$id.tsx` → `/tasks/:id`

2. O arquivo `routeTree.gen.ts` é gerado automaticamente

Exemplo:

```tsx
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return <div>About Page</div>
}
```
