import { useQuery } from '@tanstack/react-query'
import { authApi, tasksApi } from '@/lib/api'

export function useTaskDetail(taskId: string, isAuthenticated: boolean, token: string | null) {
  const {
    data: task,
    isLoading: isLoadingTask,
    error: taskError,
  } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getTask(taskId),
    enabled: isAuthenticated && !!token,
  })

  const {
    data: comments = [],
    isLoading: isLoadingComments,
    error: commentsError,
  } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => tasksApi.getComments(taskId),
    enabled: isAuthenticated && !!token,
  })

  const { data: history = [] } = useQuery({
    queryKey: ['task-history', taskId],
    queryFn: () => tasksApi.getHistory(taskId),
    enabled: isAuthenticated && !!token,
  })

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.getAllUsers(),
    enabled: isAuthenticated && !!token,
  })

  return {
    task,
    isLoadingTask,
    taskError,
    comments,
    isLoadingComments,
    commentsError,
    history,
    allUsers,
  }
}
