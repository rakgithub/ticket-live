import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HeaderBar } from './header-bar'

afterEach(cleanup)

describe('HeaderBar', () => {
  it('renders its title, home link, navigation, and caller actions', () => {
    render(
      <HeaderBar
        title="Ticket Live"
        navigation={<a href="#events">Events</a>}
        actions={<button type="button">Create event</button>}
      />,
    )

    expect(screen.getByRole('link', { name: 'Ticket Live home' })).toHaveAttribute('href', '#main')
    expect(screen.getByRole('link', { name: 'Events' })).toHaveAttribute('href', '#events')
    expect(screen.getByRole('button', { name: 'Create event' })).toBeInTheDocument()
  })

  it('opens and closes the mobile navigation with an accessible toggle', async () => {
    const user = userEvent.setup()
    render(<HeaderBar title="Ticket Live" navigation={<a href="#events">Events</a>} />)

    const openButton = screen.getByRole('button', { name: 'Open navigation' })
    const controlledId = openButton.getAttribute('aria-controls')
    expect(controlledId).toBeTruthy()
    expect(openButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation', { name: 'Mobile primary' })).not.toBeInTheDocument()

    await user.click(openButton)
    const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile primary' })
    expect(mobileNavigation).toHaveAttribute('id', controlledId)
    expect(screen.getByRole('button', { name: 'Close navigation' })).toHaveAttribute('aria-expanded', 'true')
    expect(within(mobileNavigation).getByRole('link', { name: 'Events' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close navigation' }))
    expect(screen.queryByRole('navigation', { name: 'Mobile primary' })).not.toBeInTheDocument()
  })

  it('toggles the theme and selects account actions', async () => {
    const user = userEvent.setup()
    const onThemeChange = vi.fn()
    const onSelect = vi.fn()
    render(
      <HeaderBar
        title="Ticket Live"
        theme="light"
        onThemeChange={onThemeChange}
        accountName="Morgan Lee"
        accountItems={[{ id: 'profile', label: 'Profile settings', onSelect }]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(onThemeChange).toHaveBeenCalledWith('dark')
    await user.click(screen.getByRole('button', { name: 'Morgan Lee' }))
    await user.click(screen.getByRole('menuitem', { name: 'Profile settings' }))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('uses supplied brand content and displays optional notifications', () => {
    render(
      <HeaderBar title="Workspace" brand={<span>Acme brand</span>} notifications={<button type="button">Notifications</button>} />,
    )

    expect(screen.getByRole('link', { name: 'Ticket Live home' })).toHaveTextContent('Acme brand')
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
  })
})
