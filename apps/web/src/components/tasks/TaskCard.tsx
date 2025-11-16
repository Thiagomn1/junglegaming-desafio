import { Calendar } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { TaskPriority, TaskStatus } from '@/lib/task-constants'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  priorityColors,
  priorityLabels,
  statusColors,
  statusLabels,
} from '@/lib/task-constants'
import { formatDateOnly } from '@jungle/utils/date'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string | null
    status: TaskStatus
    priority: TaskPriority
    dueDate?: string | null
  }
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Link to="/tasks/$id" params={{ id: task.id }} className="block">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge className={statusColors[task.status]}>
              {statusLabels[task.status]}
            </Badge>
            <Badge className={priorityColors[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {task.description && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              {formatDateOnly(task.dueDate)}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
