import { afterEach, describe, expect, it } from 'vitest'
import { clearAccessToken, getAccessToken, saveAccessToken } from '@/features/auth/api/auth-session'
import { redirectAuthenticatedUser, requireAuthentication } from './auth-guards'

afterEach(() => {
  clearAccessToken()
})

describe('authentication route guards', () => {
  it('redirects an unauthenticated user to login', () => {
    expect(() => requireAuthentication()).toThrow(expect.objectContaining({ status: 302 }))

    try {
      requireAuthentication()
    } catch (response) {
      if (!(response instanceof Response)) {
        throw response
      }
      expect(response.headers.get('Location')).toBe('/login')
    }
  })

  it('allows a user with an access token into protected routes', () => {
    saveAccessToken('test-token')

    expect(requireAuthentication()).toBeNull()
  })

  it('redirects an authenticated user away from login', () => {
    saveAccessToken('test-token')

    expect(() => redirectAuthenticatedUser()).toThrow(expect.objectContaining({ status: 302 }))
  })

  it('clears an expired JWT token', () => {
    const expiredPayload = btoa(JSON.stringify({ exp: 1 }))
    saveAccessToken(`header.${expiredPayload}.signature`)

    expect(getAccessToken()).toBeNull()
  })
})
