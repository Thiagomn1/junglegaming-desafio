import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'

import type { Comment } from '@/lib/api'
import { tasksApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/tasks_/$id')({
  component: TaskDetailPage,
})

const commentSchema = z.object({
  text: z.string().min(1, 'Comentário não pode estar vazio'),
})

type CommentFormData = z.infer<typeof commentSchema>

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

function TaskDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated, token } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  })

  const {
    data: task,
    isLoading: isLoadingTask,
    error: taskError,
  } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getTask(id),
    enabled: isAuthenticated && !!token,
  })

  const {
    data: comments = [],
    isLoading: isLoadingComments,
    error: commentsError,
  } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => tasksApi.getComments(id),
    enabled: isAuthenticated && !!token,
  })

  const createCommentMutation = useMutation({
    mutationFn: (data: CommentFormData) => tasksApi.createComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] })
      toast.success('Comentário adicionado com sucesso!')
      reset()
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Erro ao adicionar comentário. Tente novamente.'
      toast.error(message)
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (taskError) {
      const err = taskError as any
      const message = err.response?.data?.message || 'Erro ao carregar tarefa'
      toast.error(message)
    }
  }, [taskError])

  const onSubmit = (data: CommentFormData) => {
    createCommentMutation.mutate(data)
  }

  if (isLoadingTask) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p>Tarefa não encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/tasks' })}
          className="mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Task Details */}
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
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
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
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              Comentários ({isLoadingComments ? '...' : comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Comment Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="comment">Adicionar Comentário</Label>
                <Textarea
                  id="comment"
                  placeholder="Digite seu comentário..."
                  rows={3}
                  {...register('text')}
                  disabled={createCommentMutation.isPending}
                  className="mt-1"
                />
                {errors.text && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.text.message}
                  </p>
                )}
              </div>
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={createCommentMutation.isPending}
              >
                {createCommentMutation.isPending
                  ? 'Enviando...'
                  : 'Adicionar Comentário'}
              </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {isLoadingComments ? (
                <>
                  <CommentSkeleton />
                  <CommentSkeleton />
                  <CommentSkeleton />
                </>
              ) : commentsError ? (
                <p className="text-sm text-red-600">
                  Erro ao carregar comentários
                </p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="border-l-2 border-slate-200 pl-4 py-2">
      <div className="flex items-center gap-2 mb-1">
        <User className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium">
          {comment.authorName || `Usuário #${comment.authorId}`}
        </span>
        <span className="text-xs text-slate-500">
          {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <p className="text-sm text-slate-700 whitespace-pre-wrap">
        {comment.text}
      </p>
    </div>
  )
}

function CommentSkeleton() {
  return (
    <div className="border-l-2 border-slate-200 pl-4 py-2">
      <div className="flex items-center gap-2 mb-1">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4 mt-1" />
    </div>
  )
}
