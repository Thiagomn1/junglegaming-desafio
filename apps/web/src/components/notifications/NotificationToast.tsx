import { useEffect } from 'react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { NotificationType } from '@jungle/types'
import { useNotificationsStore } from '../../store/useNotificationsStore'

const getNotificationTitle = (type: NotificationType): string => {
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

/**
 * Component that listens to notification store and displays toasts
 * Should be mounted once at the app root level
 */
export const NotificationToast = () => {
  const notifications = useNotificationsStore((state) => state.notifications)
  const navigate = useNavigate()

  useEffect(() => {
    // Only show toast if there are notifications
    if (notifications.length === 0) {
      return
    }

    // Get the latest notification
    const latestNotification = notifications[0]
    const { type, message, taskId } = latestNotification
    const title = getNotificationTitle(type)

    // Create click handler for navigating to task
    const handleClick = () => {
      if (taskId) {
        navigate({ to: '/tasks/$id', params: { id: String(taskId) } })
      }
    }

    const toastOptions = {
      description: message,
      action: taskId
        ? {
            label: 'Ver Tarefa',
            onClick: handleClick,
          }
        : undefined,
    }

    switch (type) {
      case NotificationType.TASK_CREATED:
        toast.success(title, toastOptions)
        break

      case NotificationType.TASK_UPDATED:
      case NotificationType.TASK_STATUS_CHANGED:
        toast.info(title, toastOptions)
        break

      case NotificationType.TASK_DELETED:
        toast.error(title, { description: message })
        break

      case NotificationType.COMMENT_CREATED:
        toast.success(title, toastOptions)
        break

      case NotificationType.TASK_ASSIGNED:
        toast.info(title, toastOptions)
        break

      default:
        toast(title, toastOptions)
    }
  }, [notifications, navigate])

  return null
}
