import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-primary">Jungle Tasks</div>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost">Login</Button>
          <Button>Register</Button>
        </div>
      </div>
    </nav>
  )
}
