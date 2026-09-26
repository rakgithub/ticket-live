import { afterEach, describe, expect, it, vi } from 'vitest'
import { logout } from './auth-api'
import { clearAccessToken, saveAccessToken } from './auth-session'

afterEach(() => {
  vi.unstubAllGlobals()
  clearAccessToken()
})

describe('logout', () => {
  it('posts to the logout endpoint with the bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    saveAccessToken('test-token')

    await logout()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/logout$/),
      { method: 'POST', headers: { Authorization: 'Bearer test-token' } },
    )
  })
})
