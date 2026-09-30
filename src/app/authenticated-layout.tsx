import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router'
import { logout } from '@/features/auth'
import { clearAccessToken } from '@/features/auth/api/auth-session'
import { Button, ChatBox, Dropdown, HeaderBar, type ChatMessage } from '@/ui'

export function AuthenticatedLayout() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

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

  function handleChatSend(message: string) {
    setChatMessages((messages) => [
      ...messages,
      { id: `visitor-${messages.length + 1}`, author: 'visitor', text: message },
    ])
  }

  const navigation = (
    <>
      <Dropdown
        label="Events"
        triggerVariant="ghost"
        items={[
          { id: 'add-event', label: 'Add Events', onSelect: () => navigate('/events/new') },
          { id: 'events-list', label: 'Events List', onSelect: () => navigate('/events') },
        ]}
      />
      <Link
        to="/orders"
        className="rounded-control px-space-3 py-space-2 text-body-sm font-medium text-text-secondary no-underline hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-surface-card"
      >
        Orders
      </Link>
    </>
  )

  return (
    <div className="min-h-svh bg-surface-page text-text-primary">
      <HeaderBar
        title="Ticket Live"
        navigation={navigation}
        actions={(
          <Button type="button" variant="ghost" size="sm" loading={isLoggingOut} onClick={handleLogout}>
            Log out
          </Button>
        )}
      />
      <Outlet />
      <ChatBox messages={chatMessages} onSend={handleChatSend} />
    </div>
  )
}
