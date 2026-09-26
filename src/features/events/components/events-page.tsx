import { Link, useLoaderData, useRevalidator, useRouteError } from 'react-router'
import { CalendarDays, GlassWater, MapPin, Ticket, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button, Card, CardDescription, CardHeader } from '@/ui'
import { eventsLoader } from '../api/events-api'
import type { EventSummary } from '../types/event'

interface EventDetailProps {
  icon: ReactNode
  label: string
  value: string
}

function EventDetail({ icon, label, value }: EventDetailProps) {
  return (
    <div className="flex min-w-0 items-start gap-space-2">
      <span aria-hidden="true" className="mt-space-1 text-text-muted">{icon}</span>
      <div className="grid min-w-0 gap-space-1">
        <dt className="text-label font-medium text-text-muted">{label}</dt>
        <dd className="text-body-sm text-text-primary">{value}</dd>
      </div>
    </div>
  )
}

function formatEventDate(startsAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(startsAt))
}

function formatTicketPrice(event: EventSummary) {
  const currencyCode = event.currencyCode.trim()
  const amount = event.ticketPriceCents / 100

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`
  }
}

function EventCard({ event }: { event: EventSummary }) {
  const ticketsAvailable = Math.max(event.maxPeople - event.reservedQuantity, 0)
  return (
    <Card size="full" padding="sm" className="h-full">
      <article className="grid h-full gap-space-4">
        <header className="flex flex-wrap items-start justify-between gap-space-3">
          <div className="grid min-w-0 gap-space-2">
            <h2 className="text-title-sm font-semibold leading-tight text-text-primary">{event.name}</h2>
            <p className="text-body-sm text-text-secondary">{event.description}</p>
          </div>
          {event.isCancelled ? (
            <span className="rounded-control bg-danger-surface px-space-3 py-space-1 text-label font-medium text-danger">
              Cancelled
            </span>
          ) : null}
        </header>

        <dl className="grid gap-space-3">
          <EventDetail icon={<CalendarDays className="size-icon-sm" />} label="Date and time" value={formatEventDate(event.startsAt)} />
          <EventDetail icon={<MapPin className="size-icon-sm" />} label="Location" value={event.location} />
          <EventDetail icon={<Users className="size-icon-sm" />} label="Availability" value={`${ticketsAvailable} tickets left`} />
          <EventDetail icon={<GlassWater className="size-icon-sm" />} label="Alcohol" value={event.servesAlcohol ? 'Served' : 'Not served'} />
        </dl>

        <footer className="mt-auto flex items-center justify-between gap-space-3 border-t border-border-subtle pt-space-3">
          <div className="flex items-center gap-space-2 text-body-sm font-semibold text-text-primary">
            <Ticket aria-hidden="true" className="size-icon-sm text-text-muted" />
            {formatTicketPrice(event)}
          </div>
          <Button type="button" size="sm">
            Book
          </Button>
        </footer>
      </article>
    </Card>
  )
}

export function EventsPage() {
  const events = useLoaderData<typeof eventsLoader>()

  return (
    <main id="main" className="mx-auto grid w-full max-w-content content-start gap-space-6 px-page-gutter py-section-gap text-text-primary">
      <header className="flex flex-wrap items-end justify-between gap-space-4">
        <div className="grid gap-space-2">
          <h1 className="text-title font-semibold leading-tight text-text-primary">Events</h1>
          <p className="text-body-sm text-text-secondary">Your events and ticket details.</p>
        </div>
        <Link className="inline-flex h-control-md items-center justify-center rounded-control bg-action-primary px-space-4 text-body-sm font-semibold text-action-primary-text no-underline transition-colors duration-motion-fast ease-standard hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-surface-page" to="/events/new">
          Create event
        </Link>
      </header>

      {events.length === 0 ? (
        <Card size="full" padding="lg" className="grid justify-items-start gap-space-4">
          <CardHeader>
            <h2 className="text-title-sm font-semibold text-text-primary">No events yet</h2>
            <CardDescription>Create your first event to see it listed here.</CardDescription>
          </CardHeader>
          <Link className="text-body-sm font-semibold text-text-primary underline underline-offset-2" to="/events/new">
            Create your first event
          </Link>
        </Card>
      ) : (
        <section aria-label="Event list" className="grid gap-space-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => <EventCard key={event.id} event={event} />)}
        </section>
      )}
    </main>
  )
}

export function EventsErrorPage() {
  const error = useRouteError()
  const revalidator = useRevalidator()
  const message = error instanceof Error ? error.message : 'We could not load your events.'

  return (
    <main id="main" className="grid min-h-svh place-items-center bg-surface-page px-page-gutter py-section-gap text-text-primary">
      <Card size="md" padding="lg" className="grid gap-space-5">
        <CardHeader>
          <h1 className="text-title-sm font-semibold text-text-primary">Events could not be loaded</h1>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-space-3">
          <Button loading={revalidator.state === 'loading'} onClick={() => revalidator.revalidate()}>
            Try again
          </Button>
          <Link className="inline-flex h-control-md items-center rounded-control px-space-3 text-body-sm font-medium text-text-secondary underline underline-offset-2" to="/login">
            Sign in again
          </Link>
        </div>
      </Card>
    </main>
  )
}
