import { afterEach, describe, expect, it, vi } from 'vitest'
import { logout } from './auth-api'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('logout', () => {
  it('posts to the logout endpoint with session credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await logout()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/logout$/),
      { method: 'POST', credentials: 'include' },
    )
  })
})
