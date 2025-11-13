import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'

import { authApi, tasksApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DeleteTaskDialog,
  EditTaskDialog,
  TaskCommentsCard,
  TaskDetailsCard,
  TaskHistoryCard,
} from '@/components/tasks'

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
  assignees: z.array(z.number()).optional(),
})

type CommentFormData = z.infer<typeof commentSchema>
type EditTaskFormData = z.infer<typeof editTaskSchema>

function TaskDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated, token, user } = useAuthStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAssignees, setSelectedAssignees] = useState<Array<number>>([])

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

  const { data: history = [] } = useQuery({
    queryKey: ['task-history', id],
    queryFn: () => tasksApi.getHistory(id),
    enabled: isAuthenticated && !!token,
  })

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.getAllUsers(),
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
      queryClient.invalidateQueries({ queryKey: ['task-history', id] })
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
      // Ensure assignees are numbers
      const assigneesAsNumbers = (task.assignees || []).map((a) =>
        typeof a === 'string' ? parseInt(a, 10) : Number(a),
      )
      setSelectedAssignees(assigneesAsNumbers)
    }
  }, [task, isEditDialogOpen, setValueEdit])

  const onSubmit = (data: CommentFormData) => {
    createCommentMutation.mutate(data)
  }

  const onSubmitEdit = (data: EditTaskFormData) => {
    // Ensure assignees are sent as numbers
    const assigneesAsNumbers = selectedAssignees.map((a) =>
      typeof a === 'string' ? parseInt(a, 10) : Number(a),
    )
    updateTaskMutation.mutate({
      ...data,
      assignees: assigneesAsNumbers,
    })
  }

  const toggleAssignee = (userId: number) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((assigneeId) => assigneeId !== userId)
        : [...prev, userId],
    )
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
        <TaskDetailsCard
          task={task}
          isOwner={!!isOwner}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />

        {/* History Section */}
        <TaskHistoryCard history={history} />

        {/* Comments Section */}
        <TaskCommentsCard
          comments={comments}
          isLoadingComments={isLoadingComments}
          commentsError={commentsError}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          isPending={createCommentMutation.isPending}
        />

        {/* Edit Dialog */}
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          register={registerEdit}
          errors={errorsEdit}
          watch={watchEdit}
          setValue={setValueEdit}
          onSubmit={handleSubmitEdit(onSubmitEdit)}
          isPending={updateTaskMutation.isPending}
          allUsers={allUsers}
          selectedAssignees={selectedAssignees}
          onToggleAssignee={toggleAssignee}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteTaskDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          isPending={deleteTaskMutation.isPending}
        />
      </div>
    </div>
  )
}
