import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNotificationsStore } from '../store/useNotificationsStore'

/**
 * Hook to manage WebSocket connection based on authentication status
 * Should be called once at the app root level
 */
export const useWebSocketConnection = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const connect = useNotificationsStore((state) => state.connect)
  const disconnect = useNotificationsStore((state) => state.disconnect)

  useEffect(() => {
    if (!user || !token) {
      disconnect()
      return
    }

    connect(token)

    return () => {
      disconnect()
    }
  }, [user, token, connect, disconnect])
}
