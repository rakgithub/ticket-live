import { ChevronDown, Command, Menu, Moon, Sun } from 'lucide-react'
import * as React from 'react'
import { Button } from './button'
import { Dropdown } from './dropdown'
import { cn } from '../lib/cn'

export interface HeaderBarProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  brand?: React.ReactNode
  navigation?: React.ReactNode
  actions?: React.ReactNode
  accountName?: string
  accountItems?: { id: string; label: string; onSelect?: () => void; destructive?: boolean }[]
  notifications?: React.ReactNode
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
}

export function HeaderBar({
  title,
  brand,
  navigation,
  actions,
  accountName = 'Account',
  accountItems = [],
  notifications,
  theme,
  onThemeChange,
  className,
  ...props
}: HeaderBarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const mobileNavigationId = React.useId()
  return (
    <header className={cn('sticky top-0 z-header border-b border-border-subtle bg-surface-card', className)} {...props}>
      <div className="mx-auto flex min-h-header-height max-w-content items-center justify-between gap-space-4 px-page-gutter">
        <div className="flex min-w-0 items-center gap-space-8">
          <a href="#main" className="flex items-center gap-space-3 rounded-control text-text-primary no-underline focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-surface-page" aria-label="Ticket Live home">
            {brand ?? <span className="flex size-icon-lg items-center justify-center rounded-control bg-action-primary text-action-primary-text"><Command aria-hidden="true" className="size-icon-sm" /></span>}
            <span className="truncate text-body-sm font-semibold">{title}</span>
          </a>
          {navigation ? <nav aria-label="Primary" className="hidden items-center gap-space-2 md:flex">{navigation}</nav> : null}
        </div>
        <div className="flex shrink-0 items-center gap-space-2">
          {actions}
          {onThemeChange ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
          ) : null}
          {notifications ? <div className="hidden sm:block">{notifications}</div> : null}
          {accountItems.length ? <div className="hidden sm:block"><Dropdown label={accountName} items={accountItems} triggerVariant="ghost" /></div> : null}
          {navigation ? <Button variant="ghost" size="icon" className="md:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls={mobileNavigationId} onClick={() => setMobileOpen((open) => !open)}>
            {mobileOpen ? <ChevronDown aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button> : null}
        </div>
      </div>
      {mobileOpen && navigation ? <nav id={mobileNavigationId} aria-label="Mobile primary" className="grid gap-space-2 border-t border-border-subtle px-page-gutter py-space-4 md:hidden">{navigation}</nav> : null}
    </header>
  )
}
