import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Dropdown } from './dropdown'

afterEach(cleanup)

describe('Dropdown', () => {
  it('opens the menu and invokes the selected item action', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Dropdown label="More actions" items={[
      { id: 'edit', label: 'Edit event', onSelect },
      { id: 'archive', label: 'Archive event' },
    ]} />)

    await user.click(screen.getByRole('button', { name: 'More actions' }))
    const menu = screen.getByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: 'Edit event' })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: 'Archive event' })).toBeInTheDocument()

    await user.click(within(menu).getByRole('menuitem', { name: 'Edit event' }))
    expect(onSelect).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('keeps disabled items inactive and presents shortcuts', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Dropdown label="Actions" items={[
      { id: 'copy', label: 'Copy link', shortcut: '⌘C', disabled: true, onSelect },
    ]} />)

    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const item = screen.getByRole('menuitem', { name: /Copy link⌘C/ })
    expect(item).toHaveAttribute('aria-disabled', 'true')
    await user.click(item)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('closes with Escape', async () => {
    const user = userEvent.setup()
    render(<Dropdown label="View options" items={[]} />)
    const trigger = screen.getByRole('button', { name: 'View options' })
    await user.click(trigger)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('renders a disabled trigger in the disabled state', () => {
    render(<Dropdown label="View options" items={[]} disabled />)
    const trigger = screen.getByRole('button', { name: 'View options' })
    expect(trigger).toBeDisabled()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
