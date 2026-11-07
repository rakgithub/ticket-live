import { expect, test, type Page } from '@playwright/test'

const credentials = { email: 'person@example.com', password: 'example-password' }
const accessToken = 'e2e-test-token'
const event = {
  id: 'event-1',
  name: 'Autumn Supper Club',
  description: 'A seasonal dinner with local food.',
  location: 'Berlin',
  startsAt: '2027-11-25T18:30:00.000Z',
  minPeople: 1,
  maxPeople: 12,
  reservedQuantity: 2,
  ticketPriceCents: 4500,
  currencyCode: 'EUR',
  servesAlcohol: false,
  isCancelled: false,
}
const order = {
  id: 'order-1',
  eventId: event.id,
  event: { name: event.name, location: event.location, startsAt: event.startsAt },
  quantity: 2,
  status: 'confirmed',
  ticketPriceCents: event.ticketPriceCents,
  currencyCode: 'EUR',
  totalAmountCents: 9000,
  expiresAt: null,
  paymentStatus: 'paid',
  createdAt: '2026-10-31T12:00:00.000Z',
}

async function mockLogin(page: Page) {
  await page.route('**/api/login', async (route) => {
    await route.fulfill({ json: { accessToken, tokenType: 'Bearer' } })
  })
}

async function enterCredentials(page: Page, email = credentials.email, password = credentials.password) {
  await page.getByLabel('Work email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

async function signIn(page: Page, events = [event]) {
  await mockLogin(page)
  await page.route('**/api/events', async (route) => {
    await route.fulfill({ json: { events } })
  })
  await page.goto('/login')
  await enterCredentials(page)
  await expect(page).toHaveURL(/\/events$/)
}

test('guest is sent to sign in and sees invalid credential feedback', async ({ page }) => {
  await page.route('**/api/login', async (route) => {
    await route.fulfill({
      status: 401,
      json: { message: 'Invalid credentials.' },
    })
  })

  await page.goto('/events')
  await expect(page).toHaveURL(/\/login$/)
  await enterCredentials(page, 'person@example.com', 'wrong-password')
  await expect(page.getByText('Invalid credentials.')).toBeVisible()
  await expect(page.getByLabel('Work email')).toHaveValue('person@example.com')
})

test('member signs in, books tickets, reviews order, and logs out', async ({ page }) => {
  await mockLogin(page)
  await page.route('**/api/events', async (route) => {
    expect(route.request().headers().authorization).toBe(`Bearer ${accessToken}`)
    await route.fulfill({ json: { events: [event] } })
  })
  await page.route('**/api/orders/checkout', async (route) => {
    expect(route.request().headers().authorization).toBe(`Bearer ${accessToken}`)
    expect(route.request().postDataJSON()).toEqual({ eventId: event.id, quantity: 2 })
    await route.fulfill({ status: 201 })
  })
  await page.route('**/api/orders', async (route) => {
    expect(route.request().headers().authorization).toBe(`Bearer ${accessToken}`)
    await route.fulfill({ json: { orders: [order] } })
  })
  await page.route('**/api/logout', async (route) => {
    expect(route.request().headers().authorization).toBe(`Bearer ${accessToken}`)
    await route.fulfill({ status: 204 })
  })

  await page.goto('/login')
  await enterCredentials(page)
  await expect(page).toHaveURL(/\/events$/)
  await expect(page.getByRole('heading', { name: event.name })).toBeVisible()

  await page.getByRole('button', { name: 'Book' }).click()
  await expect(page.getByRole('dialog', { name: 'Confirm your booking' })).toBeVisible()
  await page.getByLabel('No. of seats').selectOption('2')
  await page.getByRole('button', { name: 'Pay' }).click()
  await expect(page.getByRole('status')).toContainText('Payment successful')

  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByRole('link', { name: 'Orders' }).click()
  await expect(page).toHaveURL(/\/orders$/)
  await expect(page.getByRole('heading', { name: event.name })).toBeVisible()
  await expect(page.getByText('2 tickets')).toBeVisible()
  await expect(page.getByText('paid')).toBeVisible()

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/orders')
  await expect(page).toHaveURL(/\/login$/)
})

test('member can create an event from the events menu', async ({ page }) => {
  await signIn(page, [])
  await expect(page.getByRole('heading', { name: 'No events yet' })).toBeVisible()

  await page.getByRole('button', { name: 'Events' }).click()
  await page.getByRole('menuitem', { name: 'Add Events' }).click()
  await expect(page).toHaveURL(/\/events\/new$/)
  await expect(page.getByRole('heading', { name: 'Create an event' })).toBeVisible()

  await page.route('**/api/events', async (route) => {
    expect(route.request().method()).toBe('POST')
    expect(route.request().headers().authorization).toBe(`Bearer ${accessToken}`)
    const requestBody = route.request().postDataJSON()
    expect(requestBody).toMatchObject({
      name: 'Winter Market',
      description: 'A neighborhood winter market.',
      location: 'Berlin',
      minPeople: 5,
      maxPeople: 30,
      ticketPriceCents: 1250,
      currencyCode: 'EUR',
      servesAlcohol: true,
    })
    expect(Number.isNaN(Date.parse(requestBody.startsAt))).toBe(false)
    await route.fulfill({ status: 201 })
  })

  await page.getByRole('textbox', { name: 'Event name' }).fill('Winter Market')
  await page.getByRole('textbox', { name: 'Description' }).fill('A neighborhood winter market.')
  await page.getByRole('textbox', { name: 'Location' }).fill('Berlin')
  await page.getByLabel('Event date and time').fill('2027-11-25T18:30')
  await page.getByRole('spinbutton', { name: 'Minimum guests' }).fill('5')
  await page.getByRole('spinbutton', { name: 'Maximum guests' }).fill('30')
  await page.getByRole('spinbutton', { name: 'Ticket price' }).fill('12.50')
  await page.getByRole('checkbox', { name: 'Alcohol will be served' }).check()
  await page.getByRole('button', { name: 'Create event' }).click()

  await expect(page.getByRole('status')).toHaveText('Event published and will be live soon.')
  await expect(page.getByRole('textbox', { name: 'Event name' })).toHaveValue('')
})

test('new member can create an account and reaches events', async ({ page }) => {
  await page.route('**/api/register', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      name: 'Taylor Example',
      email: 'taylor@example.com',
      password: 'long-enough-password',
    })
    await route.fulfill({ status: 201, json: { accessToken, tokenType: 'Bearer' } })
  })
  await page.route('**/api/events', async (route) => {
    await route.fulfill({ json: { events: [] } })
  })

  await page.goto('/login')
  await page.getByRole('button', { name: 'Create an account' }).click()
  await page.getByRole('textbox', { name: 'Full name' }).fill('Taylor Example')
  await page.getByRole('textbox', { name: 'Work email' }).fill('taylor@example.com')
  await page.getByLabel('Password').fill('long-enough-password')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/events$/)
  await expect(page.getByRole('heading', { name: 'No events yet' })).toBeVisible()
})

test('member can ask the event assistant for suggestions', async ({ page }) => {
  await signIn(page, [event])
  await page.route('**/api/chat/events/stream', async (route) => {
    expect(route.request().headers().authorization).toBe(`Bearer ${accessToken}`)
    expect(route.request().postDataJSON()).toEqual({ message: 'Find a dinner in Berlin', limit: 5 })
    await route.fulfill({
      contentType: 'text/event-stream',
      body: [
        `event: results\ndata: ${JSON.stringify({ requestId: 'chat-1', events: [{ id: event.id, name: event.name, descriptionPreview: event.description, location: event.location, startsAt: event.startsAt, minPeople: event.minPeople, maxPeople: event.maxPeople, ticketPriceCents: event.ticketPriceCents, currencyCode: event.currencyCode, servesAlcohol: event.servesAlcohol }], count: 1 })}\n\n`,
        `event: delta\ndata: ${JSON.stringify({ requestId: 'chat-1', text: 'This dinner in Berlin looks like a match.' })}\n\n`,
        `event: done\ndata: ${JSON.stringify({ requestId: 'chat-1', finishReason: 'stop' })}\n\n`,
      ].join(''),
    })
  })

  await page.getByRole('textbox', { name: 'Message' }).fill('Find a dinner in Berlin')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('This dinner in Berlin looks like a match.')).toBeVisible()
  await expect(page.getByText(event.name).last()).toBeVisible()
  await expect(page.getByLabel('1 matching events')).toBeVisible()
})

test('event list can recover from a failed request and show an empty result', async ({ page }) => {
  await mockLogin(page)
  let requestCount = 0
  await page.route('**/api/events', async (route) => {
    requestCount += 1
    if (requestCount === 1) {
      await route.fulfill({ status: 503, json: { message: 'Events are temporarily unavailable.' } })
      return
    }
    await route.fulfill({ json: { events: [] } })
  })

  await page.goto('/login')
  await enterCredentials(page)
  await expect(page.getByRole('heading', { name: 'Events could not be loaded' })).toBeVisible()
  await expect(page.getByText('Events are temporarily unavailable.')).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('heading', { name: 'No events yet' })).toBeVisible()
})

test('checkout failure is shown and can be retried', async ({ page }) => {
  await signIn(page)
  let checkoutCount = 0
  await page.route('**/api/orders/checkout', async (route) => {
    checkoutCount += 1
    if (checkoutCount === 1) {
      await route.fulfill({ status: 409, json: { message: 'There are not enough seats available.' } })
      return
    }
    await route.fulfill({ status: 201 })
  })

  await page.getByRole('button', { name: 'Book' }).click()
  await page.getByRole('button', { name: 'Pay' }).click()
  await expect(page.getByRole('alert')).toHaveText('There are not enough seats available.')
  await page.getByRole('button', { name: 'Pay' }).click()
  await expect(page.getByRole('status')).toContainText('Payment successful')
  expect(checkoutCount).toBe(2)
})

test('member can cancel a confirmed order', async ({ page }) => {
  await signIn(page)
  await page.route('**/api/orders', async (route) => {
    await route.fulfill({ json: { orders: [order] } })
  })

  await page.getByRole('link', { name: 'Orders' }).click()
  await expect(page.getByRole('heading', { name: event.name })).toBeVisible()
  await page.getByRole('button', { name: 'Minimize chat' }).click()
  await page.getByRole('button', { name: 'Cancel order order-1' }).click()

  await expect(page.getByText('cancelled')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cancel order order-1' })).toHaveCount(0)
})
