import { Bell, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from '@tanstack/react-router'
import { NotificationType } from '@jungle/types'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'
import { useNotificationsStore } from '../../store/useNotificationsStore'
import { ScrollArea } from '../ui/scroll-area'

export const NotificationsDrawer = () => {
  const notifications = useNotificationsStore((state) => state.notifications)
  const unreadCount = useNotificationsStore((state) => state.unreadCount)
  const markAsRead = useNotificationsStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead)
  const deleteNotification = useNotificationsStore(
    (state) => state.deleteNotification,
  )
  const navigate = useNavigate()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case NotificationType.TASK_CREATED:
        return '✨'
      case NotificationType.TASK_UPDATED:
        return '📝'
      case NotificationType.TASK_DELETED:
        return '🗑️'
      case NotificationType.COMMENT_CREATED:
        return '💬'
      case NotificationType.TASK_ASSIGNED:
        return '👤'
      case NotificationType.TASK_STATUS_CHANGED:
        return '🔄'
      default:
        return '🔔'
    }
  }

  const getNotificationBadgeVariant = (
    type: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case NotificationType.TASK_CREATED:
        return 'default'
      case NotificationType.TASK_UPDATED:
      case NotificationType.TASK_STATUS_CHANGED:
        return 'secondary'
      case NotificationType.TASK_DELETED:
        return 'destructive'
      case NotificationType.COMMENT_CREATED:
        return 'default'
      case NotificationType.TASK_ASSIGNED:
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatNotificationType = (type: string): string => {
    switch (type) {
      case NotificationType.TASK_CREATED:
        return 'Nova Tarefa'
      case NotificationType.TASK_UPDATED:
        return 'Tarefa Atualizada'
      case NotificationType.TASK_DELETED:
        return 'Tarefa Excluída'
      case NotificationType.COMMENT_CREATED:
        return 'Novo Comentário'
      case NotificationType.TASK_ASSIGNED:
        return 'Tarefa Atribuída'
      case NotificationType.TASK_STATUS_CHANGED:
        return 'Status Alterado'
      default:
        return 'Notificação'
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Notificações</SheetTitle>
          <SheetDescription>
            {unreadCount > 0
              ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}`
              : 'Você não tem notificações não lidas'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mb-4"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}

          <ScrollArea className="h-[calc(100vh-200px)]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma notificação ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      !notification.read ? 'bg-muted/50 border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div
                        className="flex-1 space-y-1 cursor-pointer"
                        onClick={() => {
                          markAsRead(notification.id)
                          if (notification.taskId) {
                            navigate({
                              to: '/tasks/$id',
                              params: { id: String(notification.taskId) },
                            })
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getNotificationBadgeVariant(
                              notification.type,
                            )}
                            className="text-xs"
                          >
                            {formatNotificationType(notification.type)}
                          </Badge>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm font-medium">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                              locale: ptBR,
                            },
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
