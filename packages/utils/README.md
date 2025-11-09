# @jungle/utils

Funções utilitárias compartilhadas entre todos os serviços.

## Módulos

### `validation.ts` - Validações comuns

Funções para validar email, senha e username.

### `date.ts` - Manipulação de datas

Funções para trabalhar com datas.

### `crypto.ts` - Criptografia

Funções para hash e comparação de senhas usando bcrypt.

### `task.ts` - Utilitários para tarefas

Funções para trabalhar com datas de vencimento de tarefas.

## Exemplo de uso completo

```typescript
import {
  hashPassword,
  comparePassword,
  isValidEmail,
  formatDate,
  addDays,
  isTaskOverdue,
  getDaysUntilDue,
} from "@jungle/utils";

// Auth Service
async function registerUser(email: string, password: string) {
  if (!isValidEmail(email)) {
    throw new Error("Email inválido");
  }

  const hash = await hashPassword(password);
  // Salvar usuário...
}

async function loginUser(email: string, password: string, storedHash: string) {
  const isValid = await comparePassword(password, storedHash);
  if (!isValid) {
    throw new Error("Credenciais inválidas");
  }
  // Gerar tokens...
}

// Tasks Service
function getTaskStatus(task: Task) {
  const expirationDate = addDays(new Date(), 7);

  return {
    ...task,
    isOverdue: isTaskOverdue(task.dueDate),
    daysUntilDue: task.dueDate ? getDaysUntilDue(task.dueDate) : null,
    createdAt: formatDate(task.createdAt),
  };
}
```
