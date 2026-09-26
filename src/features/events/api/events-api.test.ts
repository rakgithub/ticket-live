import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, saveAccessToken } from '@/features/auth/api/auth-session'
import { createEvent } from './events-api'

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
