import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, getAccessToken, saveAccessToken } from '@/features/auth/api/auth-session'
import { createEvent, getEvents } from './events-api'

afterEach(() => {
  vi.unstubAllGlobals()
  clearAccessToken()
})

describe('createEvent', () => {
  it('posts the event input to the events endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    saveAccessToken('test-token')

    await createEvent({
      name: 'Autumn Supper Club',
      description: 'A shared dinner with seasonal food.',
      location: 'Berlin',
      startsAt: '2026-10-10T17:30:00.000Z',
      minPeople: 8,
      maxPeople: 20,
      ticketPriceCents: 4500,
      currencyCode: 'EUR',
      servesAlcohol: true,
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/events$/),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          name: 'Autumn Supper Club',
          description: 'A shared dinner with seasonal food.',
          location: 'Berlin',
          startsAt: '2026-10-10T17:30:00.000Z',
          minPeople: 8,
          maxPeople: 20,
          ticketPriceCents: 4500,
          currencyCode: 'EUR',
          servesAlcohol: true,
        }),
      }),
    )
  })
})

describe('getEvents', () => {
  it('gets the events list using the stored bearer token', async () => {
    const events = [{
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
    }]
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ events }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    saveAccessToken('test-token')

    await expect(getEvents()).resolves.toEqual(events)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/events$/),
      { method: 'GET', headers: { Authorization: 'Bearer test-token' } },
    )
  })

  it('clears an invalidated token when the API rejects it', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)
    saveAccessToken('test-token')

    await expect(getEvents()).rejects.toThrow('Your session has expired.')
    expect(getAccessToken()).toBeNull()
  })
})
