export const statusLabels = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Progresso',
  REVIEW: 'Em Revisão',
  DONE: 'Concluído',
} as const

export const priorityLabels = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
} as const

export const statusColors = {
  TODO: 'bg-slate-100 text-slate-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-purple-100 text-purple-800',
  DONE: 'bg-emerald-100 text-emerald-800',
} as const

export const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-red-100 text-red-800',
  URGENT: 'bg-rose-100 text-rose-800',
} as const

export type TaskStatus = keyof typeof statusLabels
export type TaskPriority = keyof typeof priorityLabels
