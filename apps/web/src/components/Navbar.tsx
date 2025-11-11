import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { LoginDialog } from '@/components/auth/LoginDialog'
import { RegisterDialog } from '@/components/auth/RegisterDialog'

export function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const { isAuthenticated, user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
  }

  return (
    <>
      <nav className="border-b bg-white">
        <div className="mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">Jungle Tasks</div>
          </Link>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/tasks">
                  <Button variant="ghost" className="cursor-pointer">
                    Minhas Tarefas
                  </Button>
                </Link>
                <span className="text-sm text-slate-600">
                  Olá, {user?.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => setLoginOpen(true)}
                >
                  Login
                </Button>
                <Button
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() => setRegisterOpen(true)}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />
    </>
  )
}
