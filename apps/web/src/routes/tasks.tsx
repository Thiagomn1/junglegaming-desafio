import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { authApi, tasksApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { CreateTaskDialog, TaskFilters, TaskList } from '@/components/tasks'

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
})

function TasksPage() {
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuthStore()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const {
    data: allTasks = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const data = await tasksApi.getTasks()
      return data
    },
    enabled: isAuthenticated && !!token,
    retry: (failureCount, err) => {
      if ((err as any).response?.status === 429) return false
      return failureCount < 1
    },
  })

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.getAllUsers(),
    enabled: isAuthenticated && !!token,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      console.warn('Not authenticated, redirecting to home')
      navigate({ to: '/' })
      return
    }

    if (!token) {
      console.error('Authenticated but no token available')
    }
  }, [isAuthenticated, token, navigate])

  useEffect(() => {
    if (queryError) {
      const err = queryError as any
      if (err.response?.status === 429) {
        console.warn('Rate limited - showing empty list')
        return
      }
      const message =
        err.response?.data?.message || err.message || 'Erro ao carregar tarefas'
      toast.error(message)
    }
  }, [queryError])

  const filteredTasks = useMemo(() => {
    const filtered = allTasks.filter((task) => {
      if (statusFilter && task.status !== statusFilter) return false

      if (priorityFilter && task.priority !== priorityFilter) return false

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesDescription = task.description
          ?.toLowerCase()
          .includes(query)
        if (!matchesTitle && !matchesDescription) return false
      }
      return true
    })
    return filtered
  }, [allTasks, statusFilter, priorityFilter, searchQuery])

  const handleClearFilters = () => {
    setStatusFilter('')
    setPriorityFilter('')
    setSearchQuery('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Minhas Tarefas
            </h1>
            <p className="text-slate-600 mt-2">
              Gerencie e organize suas tarefas
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        <TaskFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          onStatusFilterChange={setStatusFilter}
          onPriorityFilterChange={setPriorityFilter}
          onSearchQueryChange={setSearchQuery}
          onClearFilters={handleClearFilters}
        />

        <TaskList
          tasks={filteredTasks}
          isLoading={isLoading}
          hasNoTasks={allTasks.length === 0}
        />

        <CreateTaskDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          allUsers={allUsers}
        />
      </div>
    </div>
  )
}
