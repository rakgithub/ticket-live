import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, saveAccessToken } from '@/features/auth/api/auth-session'
import { checkoutOrder } from './orders-api'

afterEach(() => {
  vi.unstubAllGlobals()
  clearAccessToken()
})

describe('checkoutOrder', () => {
  it('posts the selected event and quantity using the stored bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    saveAccessToken('test-token')

    await expect(checkoutOrder({ eventId: 'event-1', quantity: 3 })).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/orders\/checkout$/),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
          'Idempotency-Key': expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
        },
        body: JSON.stringify({ eventId: 'event-1', quantity: 3 }),
      },
    )
  })

  it('returns the API error message so the caller can show it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Only two seats remain.' }), { status: 409 })))
    saveAccessToken('test-token')

    await expect(checkoutOrder({ eventId: 'event-1', quantity: 3 })).rejects.toThrow('Only two seats remain.')
  })

  it('rejects checkout when there is no access token', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(checkoutOrder({ eventId: 'event-1', quantity: 1 })).rejects.toThrow('Sign in before checking out.')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
