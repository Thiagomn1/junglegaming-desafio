import { create } from 'zustand'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { WebSocketNotification as BaseWebSocketNotification } from '@jungle/types'
import type { Notification } from '@/lib/api'
import { notificationsApi } from '@/lib/api'

interface NotificationsState {
  // WebSocket
  socket: Socket | null
  isConnected: boolean

  // Notifications
  notifications: Array<Notification>
  unreadCount: number
  isLoading: boolean

  // Actions
  connect: (token: string) => void
  disconnect: () => void
  fetchNotifications: () => Promise<void>
  addNotification: (notification: BaseWebSocketNotification) => void
  markAsRead: (notificationId: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: number) => Promise<void>
}

const NOTIFICATIONS_URL =
  import.meta.env.VITE_NOTIFICATIONS_SERVICE_URL || 'http://localhost:6001'

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  connect: (token: string) => {
    const { socket: existingSocket } = get()

    if (existingSocket) {
      existingSocket.disconnect()
    }

    const newSocket = io(`${NOTIFICATIONS_URL}/notifications`, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      set({ isConnected: true })
      // Fetch notifications when connected
      get().fetchNotifications()
    })

    newSocket.on('disconnect', () => {
      set({ isConnected: false })
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      set({ isConnected: false })
    })

    newSocket.on('notification', (notification: BaseWebSocketNotification) => {
      get().addNotification(notification)
    })

    set({ socket: newSocket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, isConnected: false })
    }
  },

  fetchNotifications: async () => {
    try {
      set({ isLoading: true })
      const notifications = await notificationsApi.getAll()
      const { count } = await notificationsApi.getUnreadCount()
      set({
        notifications,
        unreadCount: count,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      set({ isLoading: false })
    }
  },

  addNotification: (notification: BaseWebSocketNotification) => {
    // Create a temporary notification from WebSocket data
    const newNotification: Notification = {
      id: Date.now(), // Temporary ID, will be replaced when we refetch
      type: notification.type,
      message: notification.message,
      taskId: notification.taskId || null,
      userId: 0, // Will be set by backend
      read: false,
      metadata: notification.metadata || null,
      createdAt: new Date(notification.timestamp).toISOString(),
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))

    // Optionally refetch to get the real notification from backend
    setTimeout(() => {
      get().fetchNotifications()
    }, 500)
  },

  markAsRead: async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId)

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead()

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  },

  deleteNotification: async (notificationId: number) => {
    try {
      await notificationsApi.delete(notificationId)

      set((state) => {
        const notification = state.notifications.find(
          (n) => n.id === notificationId,
        )
        const wasUnread = notification && !notification.read

        return {
          notifications: state.notifications.filter(
            (n) => n.id !== notificationId,
          ),
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        }
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  },
}))
