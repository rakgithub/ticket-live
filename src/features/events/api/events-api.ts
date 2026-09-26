import type { CreateEventInput, EventSummary } from '../types/event'
import { getAccessToken } from '@/features/auth'
import { clearAccessToken } from '@/features/auth/api/auth-session'

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
    if (typeof body === 'object' && body !== null) {
      if ('message' in body && typeof body.message === 'string') return body.message
      if ('error' in body && typeof body.error === 'string') return body.error
    }
  } catch {
    return fallbackMessage
  }

  return fallbackMessage
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isEventSummary(value: unknown): value is EventSummary {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.description === 'string'
    && typeof value.location === 'string'
    && typeof value.startsAt === 'string'
    && !Number.isNaN(new Date(value.startsAt).getTime())
    && typeof value.minPeople === 'number'
    && Number.isSafeInteger(value.minPeople)
    && typeof value.maxPeople === 'number'
    && Number.isSafeInteger(value.maxPeople)
    && typeof value.reservedQuantity === 'number'
    && Number.isSafeInteger(value.reservedQuantity)
    && typeof value.ticketPriceCents === 'number'
    && Number.isSafeInteger(value.ticketPriceCents)
    && typeof value.currencyCode === 'string'
    && typeof value.servesAlcohol === 'boolean'
    && typeof value.isCancelled === 'boolean'
}

function parseEventsResponse(value: unknown): EventSummary[] {
  if (!isRecord(value) || !Array.isArray(value.events) || !value.events.every(isEventSummary)) {
    throw new Error('The server returned an invalid events response.')
  }

  return value.events
}

export async function getEvents() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('Sign in before viewing events.')
  }

  const response = await fetch(getEndpoint('/events'), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken()
      throw new Error('Your session has expired. Sign in again to view events.')
    }
    throw new Error(await getErrorMessage(response))
  }

  return parseEventsResponse(await response.json())
}

export async function eventsLoader() {
  const events = await getEvents()
  return events
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
