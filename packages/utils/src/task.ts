/**
 * Verifica se a data de vencimento de uma tarefa já passou
 * @param dueDate - Data de vencimento da tarefa
 * @returns boolean indicando se a tarefa está vencida
 */
export const isTaskOverdue = (dueDate: Date | string | null): boolean => {
  if (!dueDate) return false;
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return new Date() > due;
};

/**
 * Calcula quantos dias faltam até a data de vencimento
 * @param dueDate - Data de vencimento da tarefa
 * @returns Número de dias (negativo se já venceu)
 */
export const getDaysUntilDue = (dueDate: Date | string): number => {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Verifica se a tarefa está próxima do vencimento (padrão: 3 dias)
 * @param dueDate - Data de vencimento da tarefa
 * @param warningDays - Número de dias para considerar "próximo" (padrão: 3)
 * @returns boolean indicando se está próximo do vencimento
 */
export const isTaskDueSoon = (
  dueDate: Date | string | null,
  warningDays: number = 3,
): boolean => {
  if (!dueDate) return false;
  const daysUntil = getDaysUntilDue(dueDate);
  return daysUntil >= 0 && daysUntil <= warningDays;
};
