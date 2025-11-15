import { create } from 'zustand'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { WebSocketNotification as BaseWebSocketNotification } from '@jungle/types'

// Extended notification for UI with additional fields
interface UINotification extends BaseWebSocketNotification {
  id: string
  read: boolean
}

interface NotificationsState {
  // WebSocket
  socket: Socket | null
  isConnected: boolean

  // Notifications
  notifications: Array<UINotification>
  unreadCount: number

  // Actions
  connect: (token: string) => void
  disconnect: () => void
  addNotification: (notification: BaseWebSocketNotification) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NOTIFICATIONS_URL =
  import.meta.env.VITE_NOTIFICATIONS_SERVICE_URL || 'http://localhost:6001'

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],
  unreadCount: 0,

  connect: (token: string) => {
    const { socket: existingSocket } = get()

    // Disconnect existing socket if any
    if (existingSocket) {
      existingSocket.disconnect()
    }

    // Create new socket connection with JWT authentication
    const newSocket = io(`${NOTIFICATIONS_URL}/notifications`, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    // Connection event handlers
    newSocket.on('connect', () => {
      set({ isConnected: true })
    })

    newSocket.on('disconnect', () => {
      set({ isConnected: false })
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      set({ isConnected: false })
    })

    // Listen for notifications
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

  addNotification: (notification: BaseWebSocketNotification) => {
    // Convert to UINotification with id and read status
    const uiNotification: UINotification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      read: false,
    }

    set((state) => ({
      notifications: [uiNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  markAsRead: (notificationId: string) => {
    set((state) => {
      const notification = state.notifications.find(
        (n) => n.id === notificationId,
      )
      if (!notification || notification.read) {
        return state
      }

      return {
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    })
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    })
  },
}))
