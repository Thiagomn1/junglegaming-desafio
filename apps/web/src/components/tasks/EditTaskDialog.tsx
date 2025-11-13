import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'

interface EditTaskFormData {
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
}

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  register: UseFormRegister<EditTaskFormData>
  errors: {
    title?: {
      message?: string
    }
  }
  watch: UseFormWatch<EditTaskFormData>
  setValue: UseFormSetValue<EditTaskFormData>
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  allUsers: Array<{ id: number; username: string }>
  selectedAssignees: Array<number>
  onToggleAssignee: (userId: number) => void
}

export function EditTaskDialog({
  open,
  onOpenChange,
  register,
  errors,
  watch,
  setValue,
  onSubmit,
  isPending,
  allUsers,
  selectedAssignees,
  onToggleAssignee,
}: EditTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias na tarefa
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              {...register('title')}
              placeholder="Título da tarefa"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              {...register('description')}
              placeholder="Descrição da tarefa"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
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
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as any)}
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
            <Input id="edit-dueDate" type="date" {...register('dueDate')} />
          </div>

          <div className="space-y-2">
            <Label>Atribuir para</Label>
            <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
              {allUsers.length > 0 ? (
                <div className="space-y-2">
                  {allUsers.map((u) => (
                    <div key={u.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`assignee-${u.id}`}
                        checked={selectedAssignees.includes(u.id)}
                        onChange={() => onToggleAssignee(u.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor={`assignee-${u.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {u.username}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Carregando usuários...</p>
              )}
            </div>
            {selectedAssignees.length > 0 && (
              <p className="text-xs text-slate-500">
                {selectedAssignees.length} usuário(s) selecionado(s)
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
