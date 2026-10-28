import { clearAccessToken, getAccessToken } from '@/features/auth/api/auth-session'
import type { CheckoutOrderInput } from '../types/checkout-order'
import type { Order } from '../types/order'

const baseUrl = import.meta.env.BASE_API_URL

function getCheckoutEndpoint(): string {
  if (!baseUrl) {
    throw new Error('The BASE_API_URL environment variable is not configured.')
  }

  return `${baseUrl.replace(/\/$/, '')}/orders/checkout`
}

function getOrdersEndpoint(): string {
  if (!baseUrl) {
    throw new Error('The BASE_API_URL environment variable is not configured.')
  }

  return `${baseUrl.replace(/\/$/, '')}/orders`
}

async function getErrorMessage(response: Response): Promise<string> {
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

function isOrder(value: unknown): value is Order {
  if (!isRecord(value) || !isRecord(value.event)) return false

  return typeof value.id === 'string'
    && typeof value.eventId === 'string'
    && typeof value.event.name === 'string'
    && typeof value.event.location === 'string'
    && typeof value.event.startsAt === 'string'
    && !Number.isNaN(new Date(value.event.startsAt).getTime())
    && typeof value.quantity === 'number'
    && Number.isSafeInteger(value.quantity)
    && value.quantity > 0
    && typeof value.status === 'string'
    && typeof value.ticketPriceCents === 'number'
    && Number.isSafeInteger(value.ticketPriceCents)
    && value.ticketPriceCents >= 0
    && typeof value.currencyCode === 'string'
    && typeof value.totalAmountCents === 'number'
    && Number.isSafeInteger(value.totalAmountCents)
    && value.totalAmountCents >= 0
    && (value.expiresAt === null || (typeof value.expiresAt === 'string' && !Number.isNaN(new Date(value.expiresAt).getTime())))
    && typeof value.paymentStatus === 'string'
    && typeof value.createdAt === 'string'
    && !Number.isNaN(new Date(value.createdAt).getTime())
}

function parseOrdersResponse(value: unknown): Order[] {
  if (!isRecord(value) || !Array.isArray(value.orders) || !value.orders.every(isOrder)) {
    throw new Error('The server returned an invalid orders response.')
  }

  return value.orders
}

export async function getOrders(): Promise<Order[]> {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('Sign in before viewing orders.')
  }

  const response = await fetch(getOrdersEndpoint(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken()
      throw new Error('Your session has expired. Sign in again to view orders.')
    }
    throw new Error(await getErrorMessage(response))
  }

  return parseOrdersResponse(await response.json())
}

export async function ordersLoader(): Promise<Order[]> {
  return getOrders()
}

export async function checkoutOrder(input: CheckoutOrderInput): Promise<void> {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('Sign in before checking out.')
  }

  const endpoint = getCheckoutEndpoint()
  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify(input),
    })
  } catch {
    throw new Error('Checkout could not be reached. Check your connection and try again.')
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken()
      throw new Error('Your session has expired. Sign in again to continue checkout.')
    }

    throw new Error(await getErrorMessage(response))
  }
}
