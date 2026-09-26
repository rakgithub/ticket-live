import type { ReactNode } from 'react'
import { TicketCheck } from 'lucide-react'
import { Card } from '@/design-system'

interface AuthShellProps {
  title: string
  description: string
  children: ReactNode
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="grid min-h-svh place-items-center bg-surface-page px-page-gutter py-section-gap text-text-primary">
      <div className="grid w-full max-w-card-width-md gap-space-8">
        <header className="grid justify-items-center gap-space-3 text-center">
          <span className="flex size-target-min items-center justify-center rounded-card bg-action-primary text-action-primary-text">
            <TicketCheck aria-hidden="true" className="size-icon-md" />
          </span>
          <div className="grid gap-space-1">
            <p className="text-body-sm font-semibold">Ticket Live</p>
          </div>
        </header>

        <Card size="md" padding="md" className="grid gap-space-6">
          <div className="grid gap-space-2 text-center">
            <h1 className="text-title font-semibold leading-tight tracking-tight text-text-primary">{title}</h1>
            <p className="text-body-sm text-text-secondary">{description}</p>
          </div>
          {children}
        </Card>

        <p className="text-center text-label text-text-muted">By continuing, you agree to your organization’s access policies.</p>
      </div>
    </main>
  )
}
