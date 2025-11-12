import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Filter, Search } from 'lucide-react'
import { toast } from 'sonner'

import { tasksApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
})

const statusLabels = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Progresso',
  REVIEW: 'Em Revisão',
  DONE: 'Concluído',
}

const priorityLabels = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

const statusColors = {
  TODO: 'bg-slate-100 text-slate-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-purple-100 text-purple-800',
  DONE: 'bg-emerald-100 text-emerald-800',
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-red-100 text-red-800',
  URGENT: 'bg-rose-100 text-rose-800',
}

function TasksPage() {
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuthStore()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

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
          <Button>Nova Tarefa</Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filtros</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Search Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por título ou descrição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={statusFilter === '' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('')}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={statusFilter === 'TODO' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('TODO')}
                    >
                      A Fazer
                    </Button>
                    <Button
                      variant={
                        statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setStatusFilter('IN_PROGRESS')}
                    >
                      Em Progresso
                    </Button>
                    <Button
                      variant={
                        statusFilter === 'REVIEW' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setStatusFilter('REVIEW')}
                    >
                      Revisão
                    </Button>
                    <Button
                      variant={statusFilter === 'DONE' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('DONE')}
                    >
                      Concluído
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={priorityFilter === '' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPriorityFilter('')}
                    >
                      Todas
                    </Button>
                    <Button
                      variant={priorityFilter === 'LOW' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPriorityFilter('LOW')}
                    >
                      Baixa
                    </Button>
                    <Button
                      variant={
                        priorityFilter === 'MEDIUM' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setPriorityFilter('MEDIUM')}
                    >
                      Média
                    </Button>
                    <Button
                      variant={
                        priorityFilter === 'HIGH' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setPriorityFilter('HIGH')}
                    >
                      Alta
                    </Button>
                    <Button
                      variant={
                        priorityFilter === 'URGENT' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setPriorityFilter('URGENT')}
                    >
                      Urgente
                    </Button>
                  </div>
                </div>

                {(statusFilter || priorityFilter || searchQuery) && (
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">
                {allTasks.length === 0
                  ? 'Nenhuma tarefa encontrada. Crie sua primeira tarefa!'
                  : 'Nenhuma tarefa encontrada com os filtros selecionados.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <Link
                key={task.id}
                to="/tasks/$id"
                params={{ id: task.id }}
                className="block"
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {task.title}
                      </CardTitle>
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
                        {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
