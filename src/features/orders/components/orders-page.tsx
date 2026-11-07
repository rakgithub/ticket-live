import { Link, useLoaderData, useRevalidator, useRouteError } from 'react-router'
import { useState } from 'react'
import { Button, Card, CardDescription, CardHeader } from '@/ui'
import { ordersLoader } from '../api/orders-api'
import type { Order } from '../types/order'

const statusColorClasses: Record<string, string> = {
  confirmed: 'bg-success-surface text-success',
  complete: 'bg-success-surface text-success',
  completed: 'bg-success-surface text-success',
  fulfilled: 'bg-success-surface text-success',
  paid: 'bg-success-surface text-success',
  succeeded: 'bg-success-surface text-success',
  cancelled: 'bg-danger-surface text-danger',
  canceled: 'bg-danger-surface text-danger',
  expired: 'bg-danger-surface text-danger',
  failed: 'bg-danger-surface text-danger',
  rejected: 'bg-danger-surface text-danger',
  'awaiting confirmation': 'bg-warning-surface text-warning',
  'awaiting payment': 'bg-warning-surface text-warning',
  pending: 'bg-warning-surface text-warning',
  processing: 'bg-warning-surface text-warning',
}

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase().replace(/[_-]+/g, ' ')
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatAmount(amountCents: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amountCents / 100)
  } catch {
    return `${currencyCode} ${(amountCents / 100).toFixed(2)}`
  }
}

interface OrderCardProps {
  order: Order
}

function OrderCard({ order }: OrderCardProps) {
  const [status, setStatus] = useState(order.status)
  const normalizedStatus = normalizeStatus(status)
  const canCancel = normalizedStatus === 'confirmed'
  const statusColorClass = statusColorClasses[normalizedStatus] ?? 'bg-surface-subtle text-text-secondary'

  return (
    <Card size="full" padding="md">
      <article className="grid gap-space-3">
        <header className="flex flex-wrap items-start justify-between gap-space-3">
          <div className="grid gap-space-1">
            <h2 className="text-title-sm font-semibold text-text-primary">{order.event.name}</h2>
            <p className="text-body-sm text-text-secondary">{order.event.location} · {formatDate(order.event.startsAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-space-2">
            <span className={`rounded-control px-space-3 py-space-1 text-label font-medium ${statusColorClass}`}>
              {status}
            </span>
            {canCancel ? (
              <Button
                type="button"
                size="sm"
                aria-label={`Cancel order ${order.id}`}
                onClick={() => setStatus('cancelled')}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </header>

        <dl className="grid gap-space-2 border-t border-border-subtle pt-space-2 sm:grid-cols-3">
          <div className="grid gap-space-1">
            <dt className="text-label font-medium text-text-muted">Tickets</dt>
            <dd className="text-body-sm text-text-primary">{order.quantity} {order.quantity === 1 ? 'ticket' : 'tickets'}</dd>
          </div>
          <div className="grid gap-space-1">
            <dt className="text-label font-medium text-text-muted">Payment</dt>
            <dd className="text-body-sm text-text-primary">{order.paymentStatus}</dd>
          </div>
          <div className="grid gap-space-1">
            <dt className="text-label font-medium text-text-muted">Order date</dt>
            <dd className="text-body-sm text-text-primary">{formatDate(order.createdAt)}</dd>
          </div>
          {order.expiresAt ? (
            <div className="grid gap-space-1">
              <dt className="text-label font-medium text-text-muted">Expires</dt>
              <dd className="text-body-sm text-text-primary">{formatDate(order.expiresAt)}</dd>
            </div>
          ) : null}
        </dl>

        <footer className="flex flex-wrap items-center justify-between gap-space-3 border-t border-border-subtle pt-space-2">
          <span className="text-label text-text-muted">Order {order.id}</span>
          <span className="text-body-sm font-semibold text-text-primary">
            {formatAmount(order.totalAmountCents, order.currencyCode)}
          </span>
        </footer>
      </article>
    </Card>
  )
}

export function OrdersPage() {
  const orders = useLoaderData<typeof ordersLoader>()

  return (
    <main id="main" className="mx-auto grid min-h-svh w-full max-w-content content-start gap-space-6 px-page-gutter py-section-gap text-text-primary">
      <header className="grid gap-space-2">
        <h1 className="text-title font-semibold leading-tight">Orders</h1>
        <p className="text-body-sm text-text-secondary">Review your ticket orders and payment details.</p>
      </header>

      {orders.length === 0 ? (
        <Card size="full" padding="lg">
          <CardHeader>
            <h2 className="text-title-sm font-semibold text-text-primary">No orders yet</h2>
            <CardDescription>Your ticket orders will appear here after checkout.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <section aria-label="Order history" className="grid gap-space-3">
          {orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </section>
      )}
    </main>
  )
}

export function OrdersErrorPage() {
  const error = useRouteError()
  const revalidator = useRevalidator()
  const message = error instanceof Error ? error.message : 'We could not load your orders.'

  return (
    <main id="main" className="grid min-h-svh place-items-center bg-surface-page px-page-gutter py-section-gap text-text-primary">
      <Card size="md" padding="lg" className="grid gap-space-5">
        <CardHeader>
          <h1 className="text-title-sm font-semibold text-text-primary">Orders could not be loaded</h1>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-space-3">
          <Button loading={revalidator.state === 'loading'} onClick={() => revalidator.revalidate()}>
            Try again
          </Button>
          <Link className="inline-flex h-control-md items-center rounded-control px-space-3 text-body-sm font-medium text-text-secondary underline" to="/login">
            Sign in again
          </Link>
        </div>
      </Card>
    </main>
  )
}
