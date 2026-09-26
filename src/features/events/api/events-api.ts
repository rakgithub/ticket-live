import type { CreateEventInput } from '../types/event'
import { getAccessToken } from '@/features/auth'

const baseUrl = import.meta.env.BASE_API_URL

function getEndpoint(path: '/events') {
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

export async function createEvent(event: CreateEventInput) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('Sign in before creating an event.')
  }

  const response = await fetch(getEndpoint('/events'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(event),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }
}
