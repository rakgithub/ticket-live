import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button, IconButton } from './button'

afterEach(cleanup)

describe('Button', () => {
  it('renders its label and forwards native button props', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button type="submit" aria-label="Save changes" onClick={onClick}>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save changes' })
    expect(button).toHaveAttribute('type', 'submit')
    await user.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders supported variants and sizes', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const
    const sizes = ['sm', 'md', 'lg'] as const
    const { rerender } = render(<Button>Action</Button>)

    for (const variant of variants) {
      for (const size of sizes) {
        rerender(<Button variant={variant} size={size}>Action</Button>)
        expect(screen.getByRole('button', { name: 'Action' })).toBeEnabled()
      }
    }
  })

  it('prevents activation while loading and exposes the busy state', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Saving</Button>)

    const button = screen.getByRole('button', { name: 'Saving' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders leading and trailing content, and gives IconButton its accessible name', () => {
    render(
      <>
        <Button leadingIcon={<span data-testid="leading-icon" />}
          trailingIcon={<span data-testid="trailing-icon" />}>Continue</Button>
        <IconButton aria-label="Close panel"><span data-testid="close-icon" /></IconButton>
      </>,
    )

    expect(screen.getByTestId('leading-icon')).toBeInTheDocument()
    expect(screen.getByTestId('trailing-icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close panel' })).toBeInTheDocument()
  })

  it('respects an explicitly disabled state', () => {
    render(<Button disabled>Unavailable</Button>)
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled()
  })
})
