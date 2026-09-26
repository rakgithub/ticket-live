import { cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, saveAccessToken } from '@/features/auth/api/auth-session'
import { eventsLoader } from '../api/events-api'
import type { EventSummary } from '../types/event'
import { EventsErrorPage, EventsPage } from './events-page'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  clearAccessToken()
})

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

    renderEventsPage()

    expect(await screen.findByRole('heading', { name: 'Autumn Supper Club' })).toBeInTheDocument()
    expect(screen.getByText('A shared dinner with seasonal food.')).toBeInTheDocument()
    expect(screen.getByText('Berlin')).toBeInTheDocument()
    expect(screen.getByText('17 tickets left')).toBeInTheDocument()
    expect(screen.getByText(/45\.00/)).toBeInTheDocument()
    expect(screen.getByText('Served')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Book' })).toBeDisabled()
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

  it('shows the API error and retry action when loading fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Events service unavailable.' }), { status: 503 })))
    saveAccessToken('test-token')

    renderEventsPage()

    expect(await screen.findByRole('heading', { name: 'Events could not be loaded' })).toBeInTheDocument()
    expect(screen.getByText('Events service unavailable.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
