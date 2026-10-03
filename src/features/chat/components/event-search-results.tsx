import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/ui'
import type { ChatEventSearchResult } from '../types/chat'

export interface EventSearchResultsProps {
  events: readonly ChatEventSearchResult[]
  count: number
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatPrice(event: ChatEventSearchResult) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: event.currencyCode,
  }).format(event.ticketPriceCents / 100)
}

export function EventSearchResults({ events, count }: EventSearchResultsProps) {
  if (count === 0 || events.length === 0) {
    return <p className="rounded-control border border-border-subtle bg-surface-card px-space-3 py-space-2 text-label text-text-secondary">No matching events found.</p>
  }

  return (
    <div className="grid gap-space-2" aria-label={`${count} matching events`}>
      {events.map((event) => (
        <Card key={event.id} size="full" padding="sm" variant="outlined" className="grid gap-space-2">
          <CardTitle className="text-body-sm">{event.name}</CardTitle>
          <CardContent className="grid gap-space-1 text-label text-text-secondary">
            <p>{event.descriptionPreview}</p>
            <span className="flex items-center gap-space-2"><MapPin aria-hidden="true" className="size-icon-sm shrink-0" />{event.location}</span>
            <span className="flex items-center gap-space-2"><CalendarDays aria-hidden="true" className="size-icon-sm shrink-0" />{formatDate(event.startsAt)}</span>
            <span className="flex items-center gap-space-2"><Ticket aria-hidden="true" className="size-icon-sm shrink-0" />{formatPrice(event)}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
