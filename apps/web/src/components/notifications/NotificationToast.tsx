import { useEffect, useRef } from 'react'
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

export const NotificationToast = () => {
  const notifications = useNotificationsStore((state) => state.notifications)
  const navigate = useNavigate()
  const lastNotificationIdRef = useRef<number | null>(null)
  const mountTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (notifications.length === 0) {
      return
    }

    const latestNotification = notifications[0]

    const notificationTime = new Date(latestNotification.createdAt).getTime()
    if (notificationTime < mountTimeRef.current) {
      lastNotificationIdRef.current = latestNotification.id
      return
    }

    if (lastNotificationIdRef.current === latestNotification.id) {
      return
    }

    lastNotificationIdRef.current = latestNotification.id
    const { type, message, taskId } = latestNotification
    const title = getNotificationTitle(type)

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
