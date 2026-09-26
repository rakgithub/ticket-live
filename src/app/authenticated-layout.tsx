import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { logout } from '@/features/auth'
import { clearAccessToken } from '@/features/auth/api/auth-session'
import { Button, HeaderBar } from '@/ui'

export function AuthenticatedLayout() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
    } catch {
      clearAccessToken()
    } finally {
      navigate('/login', { replace: true })
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-svh bg-surface-page text-text-primary">
      <HeaderBar
        title="Ticket Live"
        actions={(
          <Button type="button" variant="ghost" size="sm" loading={isLoggingOut} onClick={handleLogout}>
            Log out
          </Button>
        )}
      />
      <Outlet />
    </div>
  )
}
