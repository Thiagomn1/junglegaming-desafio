import { Calendar, Clock, Edit, Trash2, User, Users } from 'lucide-react'
import type { Task } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const STATUS_LABELS: Record<string, string> = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Progresso',
  REVIEW: 'Em Revisão',
  DONE: 'Concluído',
}

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

const STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  DONE: 'bg-green-100 text-green-800',
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

interface TaskDetailsCardProps {
  task: Task
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
}

export function TaskDetailsCard({
  task,
  isOwner,
  onEdit,
  onDelete,
}: TaskDetailsCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={STATUS_COLORS[task.status]}>
                {STATUS_LABELS[task.status]}
              </Badge>
              <Badge className={PRIORITY_COLORS[task.priority]}>
                {PRIORITY_LABELS[task.priority]}
              </Badge>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.description && (
          <div>
            <h3 className="font-medium text-sm mb-2">Descrição</h3>
            <p className="text-slate-600 whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-slate-500 text-xs">Prazo</p>
                <p className="font-medium">
                  {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-slate-500 text-xs">Criada em</p>
              <p className="font-medium">
                {new Date(task.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {task.createdBy && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-slate-500 text-xs">Criada por</p>
                <p className="font-medium">
                  {task.createdByUsername || `Usuário #${task.createdBy}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {task.assigneesDetails && task.assigneesDetails.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-slate-500 mt-1" />
              <div className="flex-1">
                <p className="text-slate-500 text-xs mb-2">Atribuído para</p>
                <div className="flex flex-wrap gap-2">
                  {task.assigneesDetails.map((assignee) => (
                    <Badge key={assignee.id} variant="secondary">
                      {assignee.username}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
