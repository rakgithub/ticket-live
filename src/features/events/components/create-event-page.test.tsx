import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, saveAccessToken } from '@/features/auth/api/auth-session'
import { CreateEventPage } from './create-event-page'
import { EventsPage } from './events-page'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  clearAccessToken()
})

function renderCreateEventRoute() {
  const router = createMemoryRouter([
    { path: '/events', element: <EventsPage /> },
    { path: '/events/new', element: <CreateEventPage /> },
  ], { initialEntries: ['/events/new'] })

  render(<RouterProvider router={router} />)
}

describe('CreateEventPage', () => {
  it('validates guest limits before submitting', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    saveAccessToken('test-token')
    const user = userEvent.setup()
    renderCreateEventRoute()

    await user.type(screen.getByRole('textbox', { name: 'Event name' }), 'Autumn Supper Club')
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'A shared dinner with seasonal food.')
    await user.type(screen.getByRole('textbox', { name: 'Location' }), 'Berlin')
    fireEvent.change(screen.getByLabelText(/Event date and time/), { target: { value: '2026-10-10T19:30' } })
    await user.type(screen.getByRole('spinbutton', { name: 'Minimum guests' }), '20')
    await user.type(screen.getByRole('spinbutton', { name: 'Maximum guests' }), '8')
    await user.type(screen.getByRole('spinbutton', { name: 'Ticket price' }), '45')
    await user.click(screen.getByRole('button', { name: 'Create event' }))

    expect(await screen.findByText('Maximum guests must be at least the minimum guests.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('publishes the event, shows confirmation, and clears the form', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    saveAccessToken('test-token')
    const user = userEvent.setup()
    renderCreateEventRoute()

    await user.type(screen.getByRole('textbox', { name: 'Event name' }), 'Autumn Supper Club')
    await user.type(screen.getByRole('textbox', { name: 'Description' }), 'A shared dinner with seasonal food.')
    await user.type(screen.getByRole('textbox', { name: 'Location' }), 'Berlin')
    fireEvent.change(screen.getByLabelText(/Event date and time/), { target: { value: '2026-10-10T19:30' } })
    await user.type(screen.getByRole('spinbutton', { name: 'Minimum guests' }), '8')
    await user.type(screen.getByRole('spinbutton', { name: 'Maximum guests' }), '20')
    await user.type(screen.getByRole('spinbutton', { name: 'Ticket price' }), '45.00')
    await user.clear(screen.getByRole('textbox', { name: 'Currency code' }))
    await user.type(screen.getByRole('textbox', { name: 'Currency code' }), 'eur')
    await user.click(screen.getByRole('checkbox', { name: 'Alcohol will be served' }))
    await user.click(screen.getByRole('button', { name: 'Create event' }))

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/events$/),
      expect.objectContaining({
        body: JSON.stringify({
          name: 'Autumn Supper Club',
          description: 'A shared dinner with seasonal food.',
          location: 'Berlin',
          startsAt: new Date('2026-10-10T19:30').toISOString(),
          minPeople: 8,
          maxPeople: 20,
          ticketPriceCents: 4500,
          currencyCode: 'EUR',
          servesAlcohol: true,
        }),
      }),
    )
    expect(await screen.findByText('Event published and will be live soon.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Event name' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Location' })).toHaveValue('')
    expect(screen.getByLabelText(/Event date and time/)).toHaveValue('')
    expect(screen.getByRole('spinbutton', { name: 'Minimum guests' })).toHaveValue(null)
    expect(screen.getByRole('spinbutton', { name: 'Maximum guests' })).toHaveValue(null)
    expect(screen.getByRole('spinbutton', { name: 'Ticket price' })).toHaveValue(null)
    expect(screen.getByRole('textbox', { name: 'Currency code' })).toHaveValue('EUR')
    expect(screen.getByRole('checkbox', { name: 'Alcohol will be served' })).not.toBeChecked()
  })
})
