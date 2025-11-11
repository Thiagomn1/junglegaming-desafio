import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'

import { Navbar } from '@/components/Navbar'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet />
      <Toaster position="top-right" richColors />
    </div>
  ),
})
