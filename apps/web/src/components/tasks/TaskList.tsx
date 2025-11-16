import { TaskCard } from './TaskCard'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { TaskStatus, TaskPriority } from '@/lib/task-constants'

interface Task {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
}

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  hasNoTasks: boolean
}

export function TaskList({ tasks, isLoading, hasNoTasks }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">
            {hasNoTasks
              ? 'Nenhuma tarefa encontrada. Crie sua primeira tarefa!'
              : 'Nenhuma tarefa encontrada com os filtros selecionados.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
