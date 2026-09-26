import { Link } from 'react-router'
import { Card, CardDescription, CardHeader } from '@/design-system'

export function EventsPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-surface-page px-page-gutter py-section-gap text-text-primary">
      <Card size="md" padding="lg" className="grid gap-space-6">
        <CardHeader>
          <h1 className="text-title font-semibold leading-tight text-text-primary">Events</h1>
          <CardDescription>Create an event to start selling tickets.</CardDescription>
        </CardHeader>
        <Link className="inline-flex h-control-md items-center justify-center rounded-control bg-action-primary px-space-4 text-body-sm font-semibold text-action-primary-text no-underline transition-colors duration-motion-fast ease-standard hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-surface-page" to="/events/new">
          Create event
        </Link>
      </Card>
    </main>
  )
}
