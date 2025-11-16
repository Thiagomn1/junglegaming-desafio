import { Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface TaskFiltersProps {
  statusFilter: string
  priorityFilter: string
  searchQuery: string
  onStatusFilterChange: (status: string) => void
  onPriorityFilterChange: (priority: string) => void
  onSearchQueryChange: (query: string) => void
  onClearFilters: () => void
}

export function TaskFilters({
  statusFilter,
  priorityFilter,
  searchQuery,
  onStatusFilterChange,
  onPriorityFilterChange,
  onSearchQueryChange,
  onClearFilters,
}: TaskFiltersProps) {
  const hasActiveFilters = statusFilter || priorityFilter || searchQuery

  return (
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
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onStatusFilterChange('')}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === 'TODO' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onStatusFilterChange('TODO')}
                >
                  A Fazer
                </Button>
                <Button
                  variant={
                    statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => onStatusFilterChange('IN_PROGRESS')}
                >
                  Em Progresso
                </Button>
                <Button
                  variant={statusFilter === 'REVIEW' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onStatusFilterChange('REVIEW')}
                >
                  Revisão
                </Button>
                <Button
                  variant={statusFilter === 'DONE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onStatusFilterChange('DONE')}
                >
                  Concluído
                </Button>
              </div>
            </div>

            {/* Priority Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Prioridade</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={priorityFilter === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPriorityFilterChange('')}
                >
                  Todas
                </Button>
                <Button
                  variant={priorityFilter === 'LOW' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPriorityFilterChange('LOW')}
                >
                  Baixa
                </Button>
                <Button
                  variant={priorityFilter === 'MEDIUM' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPriorityFilterChange('MEDIUM')}
                >
                  Média
                </Button>
                <Button
                  variant={priorityFilter === 'HIGH' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPriorityFilterChange('HIGH')}
                >
                  Alta
                </Button>
                <Button
                  variant={priorityFilter === 'URGENT' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPriorityFilterChange('URGENT')}
                >
                  Urgente
                </Button>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
