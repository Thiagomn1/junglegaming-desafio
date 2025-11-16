import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as z from 'zod'

import { useAuthStore } from '@/store/authStore'
import { useTaskDetail } from '@/hooks/useTaskDetail'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { Button } from '@/components/ui/button'
import {
  DeleteTaskDialog,
  EditTaskDialog,
  TaskCommentsCard,
  TaskDetailLoading,
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
  const { isAuthenticated, token, user } = useAuthStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAssignees, setSelectedAssignees] = useState<Array<number>>([])

  const {
    task,
    isLoadingTask,
    taskError,
    comments,
    isLoadingComments,
    commentsError,
    history,
    allUsers,
  } = useTaskDetail(id, isAuthenticated, token)

  const { createCommentMutation, updateTaskMutation, deleteTaskMutation } =
    useTaskMutations(id)

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
      // Converter ISO date para YYYY-MM-DD (sem conversão de timezone)
      setValueEdit('dueDate', task.dueDate ? task.dueDate.split('T')[0] : '')
      const assigneesAsNumbers = (task.assignees || []).map((a) =>
        typeof a === 'string' ? parseInt(a, 10) : Number(a),
      )
      setSelectedAssignees(assigneesAsNumbers)
    }
  }, [task, isEditDialogOpen, setValueEdit])

  const onSubmitComment = (data: CommentFormData) => {
    createCommentMutation.mutate(data, {
      onSuccess: () => reset(),
    })
  }

  const onSubmitEdit = (data: EditTaskFormData) => {
    const assigneesAsNumbers = selectedAssignees.map((a) =>
      typeof a === 'string' ? parseInt(a, 10) : Number(a),
    )
    updateTaskMutation.mutate(
      {
        ...data,
        assignees: assigneesAsNumbers,
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false)
          resetEdit()
        },
      },
    )
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
    return <TaskDetailLoading />
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/tasks' })}
          className="mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <TaskDetailsCard
          task={task}
          isOwner={!!isOwner}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />

        <TaskHistoryCard history={history} />

        <TaskCommentsCard
          comments={comments}
          isLoadingComments={isLoadingComments}
          commentsError={commentsError}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmitComment)}
          isPending={createCommentMutation.isPending}
        />

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
