import { User } from 'lucide-react'
import type { UseFormRegister } from 'react-hook-form'
import type { Comment } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

interface CommentFormData {
  text: string
}

interface TaskCommentsCardProps {
  comments: Array<Comment>
  isLoadingComments: boolean
  commentsError: unknown
  register: UseFormRegister<CommentFormData>
  errors: {
    text?: {
      message?: string
    }
  }
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
}

export function TaskCommentsCard({
  comments,
  isLoadingComments,
  commentsError,
  register,
  errors,
  onSubmit,
  isPending,
}: TaskCommentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Comentários ({isLoadingComments ? '...' : comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="comment">Adicionar Comentário</Label>
            <Textarea
              id="comment"
              placeholder="Digite seu comentário..."
              rows={3}
              {...register('text')}
              disabled={isPending}
              className="mt-1"
            />
            {errors.text && (
              <p className="text-sm text-red-600 mt-1">{errors.text.message}</p>
            )}
          </div>
          <Button className="cursor-pointer" type="submit" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Adicionar Comentário'}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoadingComments ? (
            <>
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </>
          ) : commentsError ? (
            <p className="text-sm text-red-600">Erro ao carregar comentários</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="border-l-2 border-slate-200 pl-4 py-2">
      <div className="flex items-center gap-2 mb-1">
        <User className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium">
          {comment.authorName || `Usuário #${comment.authorId}`}
        </span>
        <span className="text-xs text-slate-500">
          {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <p className="text-sm text-slate-700 whitespace-pre-wrap">
        {comment.text}
      </p>
    </div>
  )
}

function CommentSkeleton() {
  return (
    <div className="border-l-2 border-slate-200 pl-4 py-2">
      <div className="flex items-center gap-2 mb-1">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4 mt-1" />
    </div>
  )
}
