import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Hello World! 👋
        </h1>
        <p className="text-gray-600 mb-8">
          Jungle Challenge - Task Management System
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>Backend API: {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</p>
          <p>WebSocket: {import.meta.env.VITE_WS_URL || 'http://localhost:6000'}</p>
        </div>
      </div>
    </div>
  )
}
