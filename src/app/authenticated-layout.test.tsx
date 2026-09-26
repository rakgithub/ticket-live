import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, saveAccessToken } from '@/features/auth/api/auth-session'
import { AuthenticatedLayout } from './authenticated-layout'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  clearAccessToken()
})

function renderAuthenticatedLayout() {
  const router = createMemoryRouter([
    {
      path: '/events',
      element: <AuthenticatedLayout />,
      children: [{ index: true, element: <main id="main">Event content</main> }],
    },
    { path: '/login', element: <main>Sign in</main> },
  ], { initialEntries: ['/events'] })

  render(<RouterProvider router={router} />)
}

describe('AuthenticatedLayout', () => {
  it('shows the Ticket Live header around authenticated content', () => {
    renderAuthenticatedLayout()

    expect(screen.getByRole('link', { name: 'Ticket Live home' })).toBeInTheDocument()
    expect(screen.getByText('Ticket Live')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
    expect(screen.getByText('Event content')).toBeInTheDocument()
  })

  it('logs out and returns to sign in', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    saveAccessToken('test-token')
    const user = userEvent.setup()
    renderAuthenticatedLayout()

    await user.click(screen.getByRole('button', { name: 'Log out' }))

    expect(await screen.findByText('Sign in')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/logout$/),
      { method: 'POST', headers: { Authorization: 'Bearer test-token' } },
    )
  })
})
