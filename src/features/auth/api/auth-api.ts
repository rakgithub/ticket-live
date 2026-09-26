import type { LoginCredentials, RegisterCredentials } from '../types/types'

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

async function sendJson(path: '/login' | '/register', payload: LoginCredentials | RegisterCredentials) {
  const response = await fetch(getEndpoint(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
}

export function login(credentials: LoginCredentials) {
  return sendJson('/login', credentials)
}

export function register(credentials: RegisterCredentials) {
  return sendJson('/register', credentials)
}

export async function logout() {
  const response = await fetch(getEndpoint('/logout'), {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
}
