export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Formata uma data UTC como data local sem conversão de timezone
 * Útil para dueDate que deve ser exibido exatamente como foi salvo
 *
 * @example
 * formatDateOnly('2025-11-22T00:00:00.000Z') // "22/11/2025" (pt-BR)
 */
export const formatDateOnly = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();

  const localDate = new Date(year, month, day);
  return localDate.toLocaleDateString("pt-BR");
};

/**
 * Converte uma data UTC para o formato YYYY-MM-DD para inputs type="date"
 * Garante que a data seja exibida corretamente sem conversão de timezone
 *
 * @example
 * toDateInputValue('2025-11-22T00:00:00.000Z') // "2025-11-22"
 * toDateInputValue(null) // ""
 */
export const toDateInputValue = (
  date: string | Date | null | undefined
): string => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
