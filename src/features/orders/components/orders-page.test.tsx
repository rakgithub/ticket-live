import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Order } from '../types/order'
import { OrdersPage } from './orders-page'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function makeOrder(id: string, status: string): Order {
  return {
    id,
    eventId: `event-${id}`,
    event: {
      name: `Event ${id}`,
      location: 'Berlin',
      startsAt: '2026-10-17T16:20:00.000Z',
    },
    quantity: 2,
    status,
    ticketPriceCents: 5000,
    currencyCode: 'EUR',
    totalAmountCents: 10000,
    expiresAt: null,
    paymentStatus: 'succeeded',
    createdAt: '2026-10-17T12:49:00.000Z',
  }
}

function renderOrdersPage(orders: Order[]) {
  const router = createMemoryRouter([
    {
      path: '/orders',
      loader: () => orders,
      element: <OrdersPage />,
    },
  ], { initialEntries: ['/orders'] })

  render(<RouterProvider router={router} />)
}

describe('OrdersPage', () => {
  it.each([
    { status: 'confirmed', classes: ['bg-success-surface', 'text-success'] },
    { status: 'completed', classes: ['bg-success-surface', 'text-success'] },
    { status: 'cancelled', classes: ['bg-danger-surface', 'text-danger'] },
    { status: 'failed', classes: ['bg-danger-surface', 'text-danger'] },
    { status: 'pending', classes: ['bg-warning-surface', 'text-warning'] },
    { status: 'awaiting_payment', classes: ['bg-warning-surface', 'text-warning'] },
    { status: 'in_review', classes: ['bg-surface-subtle', 'text-text-secondary'] },
  ])('uses semantic color tokens for the $status status', async ({ status, classes }) => {
    renderOrdersPage([makeOrder('order-1', status)])

    const card = within(await screen.findByRole('article'))
    expect(card.getByText(status)).toHaveClass(...classes)
  })

  it('changes a confirmed order to cancelled locally without making an API call', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    const order = makeOrder('order-1', 'confirmed')

    renderOrdersPage([order])

    const card = within(await screen.findByRole('article'))
    const cancelButton = card.getByRole('button', { name: `Cancel order ${order.id}` })
    expect(card.getByText('confirmed')).toHaveClass('bg-success-surface', 'text-success')

    await user.click(cancelButton)

    expect(card.getByText('cancelled')).toHaveClass('bg-danger-surface', 'text-danger')
    expect(card.queryByRole('button', { name: `Cancel order ${order.id}` })).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not show the cancel action for non-confirmed orders', async () => {
    renderOrdersPage([makeOrder('order-1', 'pending')])

    const card = within(await screen.findByRole('article'))
    expect(card.getByText('pending')).toHaveClass('bg-warning-surface', 'text-warning')
    expect(card.queryByRole('button', { name: /Cancel order/ })).not.toBeInTheDocument()
  })

  it('shows the empty state when there are no orders', async () => {
    renderOrdersPage([])

    expect(await screen.findByRole('heading', { name: 'No orders yet' })).toBeInTheDocument()
  })
})
