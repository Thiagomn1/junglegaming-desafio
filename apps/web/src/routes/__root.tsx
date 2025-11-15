import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'

import { Navbar } from '@/components/Navbar'
import { NotificationToast } from '@/components/notifications/NotificationToast'
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection'

function RootComponent() {
  // Initialize WebSocket connection based on auth status
  useWebSocketConnection()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet />
      <Toaster position="top-right" richColors />
      <NotificationToast />
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
