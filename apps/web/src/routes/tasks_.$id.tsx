import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Clock, Edit, Trash2, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'

import type { Comment } from '@/lib/api'
import { tasksApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/tasks_/$id')({
  component: TaskDetailPage,
})

const commentSchema = z.object({
  text: z.string().min(1, 'Comentário não pode estar vazio'),
})

const editTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
})

type CommentFormData = z.infer<typeof commentSchema>
type EditTaskFormData = z.infer<typeof editTaskSchema>

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
  const { isAuthenticated, token, user } = useAuthStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  })

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    setValue: setValueEdit,
    watch: watchEdit,
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
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

  const updateTaskMutation = useMutation({
    mutationFn: (data: EditTaskFormData) => tasksApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tarefa atualizada com sucesso!')
      setIsEditDialogOpen(false)
      resetEdit()
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Erro ao atualizar tarefa. Tente novamente.'
      toast.error(message)
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: () => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tarefa removida com sucesso!')
      navigate({ to: '/tasks' })
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Erro ao remover tarefa. Tente novamente.'
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

  useEffect(() => {
    if (task && isEditDialogOpen) {
      setValueEdit('title', task.title)
      setValueEdit('description', task.description || '')
      setValueEdit('status', task.status)
      setValueEdit('priority', task.priority)
      setValueEdit('dueDate', task.dueDate || '')
    }
  }, [task, isEditDialogOpen, setValueEdit])

  const onSubmit = (data: CommentFormData) => {
    createCommentMutation.mutate(data)
  }

  const onSubmitEdit = (data: EditTaskFormData) => {
    updateTaskMutation.mutate(data)
  }

  const handleDelete = () => {
    deleteTaskMutation.mutate()
  }

  const isOwner = user && task && Number(user.id) === task.createdBy

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
              {isOwner && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
              <DialogDescription>
                Faça as alterações necessárias na tarefa
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleSubmitEdit(onSubmitEdit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  {...registerEdit('title')}
                  placeholder="Título da tarefa"
                />
                {errorsEdit.title && (
                  <p className="text-sm text-red-600">
                    {errorsEdit.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  {...registerEdit('description')}
                  placeholder="Descrição da tarefa"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={watchEdit('status')}
                    onValueChange={(value) =>
                      setValueEdit('status', value as any)
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">A Fazer</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                      <SelectItem value="REVIEW">Em Revisão</SelectItem>
                      <SelectItem value="DONE">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Prioridade</Label>
                  <Select
                    value={watchEdit('priority')}
                    onValueChange={(value) =>
                      setValueEdit('priority', value as any)
                    }
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baixa</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Prazo</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  {...registerEdit('dueDate')}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateTaskMutation.isPending}
                  className="cursor-pointer"
                >
                  {updateTaskMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A tarefa será permanentemente
                removida do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 cursor-pointer"
                disabled={deleteTaskMutation.isPending}
              >
                {deleteTaskMutation.isPending ? 'Removendo...' : 'Remover'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
