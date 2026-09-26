import { ArrowUpRight, Inbox } from 'lucide-react'
import * as React from 'react'
import { Card, type CardSize } from './card'
import { cn } from '../lib/cn'

export interface ListCardProps<T> {
  heading: React.ReactNode
  items: T[]
  getKey: (item: T, index: number) => React.Key
  renderItem: (item: T, index: number) => React.ReactNode
  size?: CardSize
  actions?: React.ReactNode
  emptyState?: React.ReactNode
  className?: string
  listLabel?: string
}

export function ListCard<T>({
  heading,
  items,
  getKey,
  renderItem,
  size = 'full',
  actions,
  emptyState,
  className,
  listLabel,
}: ListCardProps<T>) {
  const headerPadding = size === 'sm' ? 'px-card-sm' : size === 'lg' ? 'px-card-lg' : 'px-card-md'
  return (
    <Card size={size} padding="none" className={cn('overflow-hidden', className)}>
      <div className={cn('flex flex-col justify-between gap-space-4 py-space-5 md:flex-row md:items-center', headerPadding)}>
        <div className="min-w-0">
          {typeof heading === 'string' ? <h2 className="text-title-sm font-semibold text-text-primary">{heading}</h2> : heading}
        </div>
        {actions ? <div className="flex w-full flex-wrap items-center gap-space-2 md:w-auto">{actions}</div> : null}
      </div>
      {items.length ? (
        <ul aria-label={listLabel} className="divide-y divide-border-subtle">
          {items.map((item, index) => <li key={getKey(item, index)}>{renderItem(item, index)}</li>)}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center gap-space-3 border-t border-border-subtle px-card-md py-card-lg text-center">
          {emptyState ?? <>
            <span className="flex size-target-min items-center justify-center rounded-card bg-surface-subtle text-text-muted"><Inbox aria-hidden="true" className="size-icon-lg" /></span>
            <p className="text-body-sm text-text-secondary">Nothing to show yet.</p>
          </>}
        </div>
      )}
    </Card>
  )
}

export interface ListCardRowProps {
  title: React.ReactNode
  description?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  href?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  id?: string
  'aria-label'?: string
}

export function ListCardRow({ title, description, leading, trailing, href, onClick, className, id, 'aria-label': ariaLabel }: ListCardRowProps) {
  const content = (
    <>
      {leading ? <span className="flex shrink-0 items-center justify-center text-text-muted">{leading}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-sm font-medium text-text-primary">{title}</span>
        {description ? <span className="mt-space-1 block truncate text-label text-text-muted">{description}</span> : null}
      </span>
      {trailing ?? (href ? <ArrowUpRight aria-hidden="true" className="size-icon-sm shrink-0 text-text-muted" /> : null)}
    </>
  )

  const interactive = Boolean(href || onClick)
  const classes = cn('flex min-h-target-min items-center gap-space-3 px-card-md py-space-3', interactive && 'w-full text-left transition-colors duration-motion-fast hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-none', className)
  return href
    ? <a id={id} aria-label={ariaLabel} href={href} className={classes}>{content}</a>
    : onClick ? <button id={id} aria-label={ariaLabel} type="button" onClick={onClick} className={classes}>{content}</button>
    : <div id={id} aria-label={ariaLabel} className={classes}>{content}</div>
}
