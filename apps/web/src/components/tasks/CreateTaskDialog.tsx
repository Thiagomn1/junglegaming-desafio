import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as z from 'zod'
import { tasksApi } from '@/lib/api'
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

const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  assignees: z.array(z.number()).optional(),
})

type CreateTaskFormData = z.infer<typeof createTaskSchema>

interface CreateTaskDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  allUsers: Array<{ id: number; username: string }>
}

export function CreateTaskDialog({
  isOpen,
  onOpenChange,
  allUsers,
}: CreateTaskDialogProps) {
  const queryClient = useQueryClient()
  const [selectedAssignees, setSelectedAssignees] = useState<Array<number>>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: 'TODO',
      priority: 'MEDIUM',
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskFormData) => tasksApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tarefa criada com sucesso!')
      onOpenChange(false)
      reset()
      setSelectedAssignees([])
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        'Erro ao criar tarefa. Tente novamente.'
      toast.error(message)
    },
  })

  const toggleAssignee = (userId: number) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((assigneeId) => assigneeId !== userId)
        : [...prev, userId],
    )
  }

  const onSubmit = (data: CreateTaskFormData) => {
    const assigneesAsNumbers = selectedAssignees.map((a) =>
      typeof a === 'string' ? parseInt(a, 10) : Number(a),
    )
    createTaskMutation.mutate({
      ...data,
      assignees: assigneesAsNumbers,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Crie uma nova tarefa para organizar seu trabalho
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Ex: Implementar autenticação"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descreva os detalhes da tarefa..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger id="status">
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
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger id="priority">
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
            <Label htmlFor="dueDate">Prazo</Label>
            <Input id="dueDate" type="date" {...register('dueDate')} />
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
                        id={`create-assignee-${u.id}`}
                        checked={selectedAssignees.includes(u.id)}
                        onChange={() => toggleAssignee(u.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor={`create-assignee-${u.id}`}
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
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="cursor-pointer"
            >
              {createTaskMutation.isPending ? 'Criando...' : 'Criar Tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
