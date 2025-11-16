import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { tasksApi } from '@/lib/api'

interface CommentFormData {
  text: string
}

interface EditTaskFormData {
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  assignees?: Array<number>
}

export function useTaskMutations(taskId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const createCommentMutation = useMutation({
    mutationFn: (data: CommentFormData) => tasksApi.createComment(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
      toast.success('Comentário adicionado com sucesso!')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Erro ao adicionar comentário. Tente novamente.'
      toast.error(message)
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: (data: EditTaskFormData) => tasksApi.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-history', taskId] })
      toast.success('Tarefa atualizada com sucesso!')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Erro ao atualizar tarefa. Tente novamente.'
      toast.error(message)
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: () => tasksApi.deleteTask(taskId),
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

  return {
    createCommentMutation,
    updateTaskMutation,
    deleteTaskMutation,
  }
}
