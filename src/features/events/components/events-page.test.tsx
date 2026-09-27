import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, saveAccessToken } from '@/features/auth/api/auth-session'
import { eventsLoader } from '../api/events-api'
import { formatEventPrice } from '../lib/event-formatters'
import type { EventSummary } from '../types/event'
import { EventsErrorPage, EventsPage } from './events-page'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
  clearAccessToken()
})

function installDialogMocks() {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }),
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open')
    }),
  })
}

const eventFixture: EventSummary = {
  id: 'event-1',
  name: 'Autumn Supper Club',
  description: 'A shared dinner with seasonal food.',
  location: 'Berlin',
  startsAt: '2026-10-10T17:30:00.000Z',
  minPeople: 8,
  maxPeople: 20,
  reservedQuantity: 3,
  ticketPriceCents: 4500,
  currencyCode: 'EUR',
  servesAlcohol: true,
  isCancelled: false,
}

function renderEventsPage() {
  const router = createMemoryRouter([
    {
      path: '/events',
      loader: eventsLoader,
      element: <EventsPage />,
      errorElement: <EventsErrorPage />,
    },
  ], { initialEntries: ['/events'] })

  render(<RouterProvider router={router} />)
}

describe('EventsPage', () => {
  it('loads the protected event list and displays event details in a card', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ events: [eventFixture] }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    saveAccessToken('test-token')
    installDialogMocks()
    const user = userEvent.setup()

    renderEventsPage()

    expect(await screen.findByRole('heading', { name: 'Autumn Supper Club' })).toBeInTheDocument()
    const eventCard = within(screen.getByRole('article'))
    expect(eventCard.getByText('A shared dinner with seasonal food.')).toBeInTheDocument()
    expect(eventCard.getByText('Berlin')).toBeInTheDocument()
    expect(eventCard.getByText('17 tickets left')).toBeInTheDocument()
    expect(eventCard.getByText(/45\.00/)).toBeInTheDocument()
    expect(eventCard.getByText('Served')).toBeInTheDocument()
    const bookButton = screen.getByRole('button', { name: 'Book' })
    expect(bookButton).toBeEnabled()

    await user.click(bookButton)

    const bookingDialog = screen.getByRole('dialog', { name: 'Confirm your booking' })
    expect(within(bookingDialog).getByText('Autumn Supper Club')).toBeInTheDocument()
    const seatSelect = within(bookingDialog).getByRole('combobox', { name: 'No. of seats' })
    expect(seatSelect).toHaveValue('1')
    expect(within(seatSelect).getAllByRole('option')).toHaveLength(17)
    await user.selectOptions(seatSelect, '2')
    expect(within(bookingDialog).getByText(formatEventPrice(9000, 'EUR'))).toBeInTheDocument()

    await user.click(within(bookingDialog).getByRole('button', { name: 'Close' }))
    await user.click(bookButton)
    expect(within(screen.getByRole('dialog', { name: 'Confirm your booking' })).getByRole('combobox', { name: 'No. of seats' })).toHaveValue('1')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/events$/),
      { method: 'GET', headers: { Authorization: 'Bearer test-token' } },
    )
  })

  it('shows an empty state when the API returns no events', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ events: [] }), { status: 200 })))
    saveAccessToken('test-token')

    renderEventsPage()

    expect(await screen.findByRole('heading', { name: 'No events yet' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create your first event' })).toHaveAttribute('href', '/events/new')
  })

  it('disables booking for cancelled events and events with no seats left', async () => {
    const cancelledEvent: EventSummary = { ...eventFixture, id: 'event-cancelled', name: 'Cancelled dinner', isCancelled: true }
    const soldOutEvent: EventSummary = { ...eventFixture, id: 'event-sold-out', name: 'Sold out dinner', reservedQuantity: 20 }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ events: [cancelledEvent, soldOutEvent] }), { status: 200 })))
    saveAccessToken('test-token')

    renderEventsPage()

    const bookButtons = await screen.findAllByRole('button', { name: 'Book' })
    expect(bookButtons).toHaveLength(2)
    expect(bookButtons[0]).toBeDisabled()
    expect(bookButtons[1]).toBeDisabled()
  })

  it('locks booking controls while checkout is pending and shows success after payment', async () => {
    installDialogMocks()
    let finishCheckout: (response: Response) => void = () => undefined
    const checkoutResponse = new Promise<Response>((resolve) => {
      finishCheckout = resolve
    })
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ events: [eventFixture] }), { status: 200 }))
      .mockReturnValueOnce(checkoutResponse)
    vi.stubGlobal('fetch', fetchMock)
    saveAccessToken('test-token')
    const user = userEvent.setup()

    renderEventsPage()
    await user.click(await screen.findByRole('button', { name: 'Book' }))

    const bookingDialog = screen.getByRole('dialog', { name: 'Confirm your booking' })
    const seatSelect = within(bookingDialog).getByRole('combobox', { name: 'No. of seats' })
    await user.selectOptions(seatSelect, '2')
    await user.click(within(bookingDialog).getByRole('button', { name: 'Pay' }))

    expect(within(bookingDialog).getByRole('button', { name: 'Pay' })).toBeDisabled()
    expect(within(bookingDialog).getByRole('button', { name: 'Close' })).toBeDisabled()
    expect(within(bookingDialog).getByRole('button', { name: 'Close dialog' })).toBeDisabled()
    expect(seatSelect).toBeDisabled()
    const cancelEvent = new Event('cancel', { cancelable: true })
    fireEvent(bookingDialog, cancelEvent)
    expect(cancelEvent.defaultPrevented).toBe(true)
    expect(bookingDialog).toBeInTheDocument()

    await act(async () => {
      finishCheckout(new Response(null, { status: 201 }))
    })

    expect(await within(bookingDialog).findByRole('status')).toHaveTextContent('Payment successful.')
    expect(within(bookingDialog).getByRole('button', { name: 'Pay' })).toBeDisabled()
    expect(seatSelect).toBeDisabled()
    expect(within(bookingDialog).getByRole('button', { name: 'Close' })).toBeEnabled()
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringMatching(/\/orders\/checkout$/),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        body: JSON.stringify({ eventId: eventFixture.id, quantity: 2 }),
      }),
    )
  })

  it('shows a checkout error and re-enables payment controls', async () => {
    installDialogMocks()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ events: [eventFixture] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Only two seats remain.' }), { status: 409 }))
    vi.stubGlobal('fetch', fetchMock)
    saveAccessToken('test-token')
    const user = userEvent.setup()

    renderEventsPage()
    await user.click(await screen.findByRole('button', { name: 'Book' }))
    const bookingDialog = screen.getByRole('dialog', { name: 'Confirm your booking' })
    await user.click(within(bookingDialog).getByRole('button', { name: 'Pay' }))

    expect(await within(bookingDialog).findByRole('alert')).toHaveTextContent('Only two seats remain.')
    expect(within(bookingDialog).getByRole('button', { name: 'Pay' })).toBeEnabled()
    expect(within(bookingDialog).getByRole('combobox', { name: 'No. of seats' })).toBeEnabled()
    expect(within(bookingDialog).getByRole('button', { name: 'Close' })).toBeEnabled()
  })

  it('shows the API error and retry action when loading fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Events service unavailable.' }), { status: 503 })))
    saveAccessToken('test-token')

    renderEventsPage()

    expect(await screen.findByRole('heading', { name: 'Events could not be loaded' })).toBeInTheDocument()
    expect(screen.getByText('Events service unavailable.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
