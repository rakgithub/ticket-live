import type { LoginCredentials, RegisterCredentials } from '../types/types'
import { clearAccessToken, getAccessToken, saveAccessToken } from './auth-session'

const baseUrl = import.meta.env.BASE_API_URL

function getEndpoint(path: '/login' | '/register' | '/logout') {
  if (!baseUrl) {
    throw new Error('The BASE_API_URL environment variable is not configured.')
  }

  return `${baseUrl.replace(/\/$/, '')}${path}`
}

async function getErrorMessage(response: Response) {
  const fallbackMessage = `Request failed with status ${response.status}.`

  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string') {
      return body.message
    }
  } catch {
    return fallbackMessage
  }

  return fallbackMessage
}

interface AuthenticationResponse {
  accessToken: string
  tokenType: string
}

function isAuthenticationResponse(value: unknown): value is AuthenticationResponse {
  return typeof value === 'object'
    && value !== null
    && 'accessToken' in value
    && typeof value.accessToken === 'string'
    && value.accessToken.length > 0
    && 'tokenType' in value
    && value.tokenType === 'Bearer'
}

async function sendJson(path: '/login' | '/register', payload: LoginCredentials | RegisterCredentials) {
  const response = await fetch(getEndpoint(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  const body: unknown = await response.json()
  if (!isAuthenticationResponse(body)) {
    throw new Error('The server returned an invalid authentication response.')
  }

  saveAccessToken(body.accessToken)
}

export function login(credentials: LoginCredentials) {
  return sendJson('/login', credentials)
}

export function register(credentials: RegisterCredentials) {
  return sendJson('/register', credentials)
}

export async function logout() {
  const accessToken = getAccessToken()
  const response = await fetch(getEndpoint('/logout'), {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  clearAccessToken()
}
