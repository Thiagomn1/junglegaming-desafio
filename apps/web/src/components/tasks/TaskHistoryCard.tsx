import { History } from 'lucide-react'
import type { TaskHistoryEntry } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TaskHistoryCardProps {
  history: Array<TaskHistoryEntry>
}

export function TaskHistoryCard({ history }: TaskHistoryCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Alterações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {entry.username || 'Sistema'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {entry.action === 'created' && 'Criou'}
                      {entry.action === 'updated' && 'Atualizou'}
                      {entry.action === 'commented' && 'Comentou'}
                      {entry.action === 'deleted' && 'Deletou'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(entry.timestamp).toLocaleString('pt-BR')}
                  </p>
                  {entry.metadata && entry.action === 'updated' && (
                    <div className="mt-2 text-xs text-slate-600">
                      <details>
                        <summary className="cursor-pointer hover:text-slate-900">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 p-2 bg-slate-50 rounded text-xs overflow-auto">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Nenhuma alteração registrada ainda.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
