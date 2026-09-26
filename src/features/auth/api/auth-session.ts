const accessTokenStorageKey = 'ticket-live.access-token'

function getTokenExpiration(accessToken: string) {
  const [, payload] = accessToken.split('.')
  if (!payload) {
    return null
  }

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '='))
    const value: unknown = JSON.parse(decoded)
    if (typeof value === 'object' && value !== null && 'exp' in value && typeof value.exp === 'number') {
      return value.exp
    }
  } catch {
    return null
  }

  return null
}

export function getAccessToken() {
  const accessToken = window.sessionStorage.getItem(accessTokenStorageKey)
  if (!accessToken) {
    return null
  }

  const expiration = getTokenExpiration(accessToken)
  if (expiration !== null && expiration * 1000 <= Date.now()) {
    clearAccessToken()
    return null
  }

  return accessToken
}

export function saveAccessToken(accessToken: string) {
  window.sessionStorage.setItem(accessTokenStorageKey, accessToken)
}

export function clearAccessToken() {
  window.sessionStorage.removeItem(accessTokenStorageKey)
}
