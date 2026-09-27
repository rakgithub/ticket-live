import { clearAccessToken, getAccessToken } from '@/features/auth/api/auth-session'
import type { CheckoutOrderInput } from '../types/checkout-order'

const baseUrl = import.meta.env.BASE_API_URL

function getCheckoutEndpoint(): string {
  if (!baseUrl) {
    throw new Error('The BASE_API_URL environment variable is not configured.')
  }

  return `${baseUrl.replace(/\/$/, '')}/orders/checkout`
}

async function getErrorMessage(response: Response): Promise<string> {
  const fallbackMessage = `Checkout failed with status ${response.status}.`

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
