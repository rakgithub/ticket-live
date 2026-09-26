import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthPage } from './auth-page'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('AuthPage', () => {
  it('shows the login form first with labeled required fields', () => {
    render(<AuthPage />)

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Work email' })).toBeRequired()
    expect(screen.getByLabelText(/Password/)).toBeRequired()
    expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeInTheDocument()
  })

  it('does not accept an empty or malformed login form', async () => {
    const user = userEvent.setup()
    render(<AuthPage />)

    const email = screen.getByRole('textbox', { name: 'Work email' }) as HTMLInputElement
    const password = screen.getByLabelText(/Password/) as HTMLInputElement
    expect(email.checkValidity()).toBe(false)
    expect(password.checkValidity()).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(document.querySelector('[aria-live="polite"]')).toBeEmptyDOMElement()

    await user.type(email, 'not-an-email')
    expect(email.checkValidity()).toBe(false)
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
    expect(document.querySelector('[aria-live="polite"]')).toBeEmptyDOMElement()
  })

  it('sends valid login credentials to the login endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<AuthPage />)

    await user.type(screen.getByRole('textbox', { name: 'Work email' }), 'person@example.com')
    await user.type(screen.getByLabelText(/Password/), 'correct-horse-battery')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/login$/),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email: 'person@example.com', password: 'correct-horse-battery' }),
      }),
    )
    expect(await screen.findByText('Signed in successfully.')).toBeInTheDocument()
  })

  it('switches to signup with required fields and a password length constraint, then switches back', async () => {
    const user = userEvent.setup()
    render(<AuthPage />)

    await user.click(screen.getByRole('button', { name: 'Create an account' }))
    expect(screen.getByRole('heading', { name: 'Create your account' })).toBeInTheDocument()

    const signupForm = screen.getByRole('button', { name: 'Create account' }).closest('form')
    expect(signupForm?.checkValidity()).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(document.querySelector('[aria-live="polite"]')).toBeEmptyDOMElement()

    expect(screen.getByRole('textbox', { name: 'Full name' })).toBeRequired()
    expect(screen.getByRole('textbox', { name: 'Work email' })).toBeRequired()
    const password = screen.getByLabelText(/Password/) as HTMLInputElement
    expect(password).toBeRequired()
    expect(password.minLength).toBe(8)
    await user.type(password, 'short')
    expect(password.value).toHaveLength(5)

    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })

  it('sends valid registration credentials to the register endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<AuthPage />)

    await user.click(screen.getByRole('button', { name: 'Create an account' }))
    await user.type(screen.getByRole('textbox', { name: 'Full name' }), 'Taylor Example')
    await user.type(screen.getByRole('textbox', { name: 'Work email' }), 'taylor@example.com')
    await user.type(screen.getByLabelText(/Password/), 'long-enough-password')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/register$/),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ name: 'Taylor Example', email: 'taylor@example.com', password: 'long-enough-password' }),
      }),
    )
    expect(await screen.findByText('Account created successfully.')).toBeInTheDocument()
  })

  it('shows the API error message when login fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Invalid credentials.' }), { status: 401 })))
    const user = userEvent.setup()
    render(<AuthPage />)

    await user.type(screen.getByRole('textbox', { name: 'Work email' }), 'person@example.com')
    await user.type(screen.getByLabelText(/Password/), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Invalid credentials.')).toBeInTheDocument()
  })
})
