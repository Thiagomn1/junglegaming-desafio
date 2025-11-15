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
    // Only connect if user is authenticated
    if (!user || !token) {
      disconnect()
      return
    }

    // Connect with token
    connect(token)

    // Cleanup on unmount or when user changes
    return () => {
      disconnect()
    }
  }, [user, token, connect, disconnect])
}
