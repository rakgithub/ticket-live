import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Textbox } from './textbox'

afterEach(cleanup)

describe('Textbox', () => {
  it('connects its label and description to the input', () => {
    render(<Textbox label="Work email" type="email" description="Use your company address." required />)
    const textbox = screen.getByRole('textbox', { name: 'Work email' })
    const description = screen.getByText('Use your company address.')

    expect(textbox).toBeRequired()
    expect(textbox).toHaveAttribute('type', 'email')
    expect(textbox.getAttribute('aria-describedby')).toBe(description.id)
  })

  it('exposes errors to assistive technology and keeps any caller description reference', () => {
    render(
      <>
        <p id="external-help">Check the email spelling.</p>
        <Textbox label="Work email" id="email" aria-describedby="external-help" error="Enter a valid address." />
      </>,
    )
    const textbox = screen.getByRole('textbox', { name: 'Work email' })

    expect(textbox).toHaveAttribute('aria-invalid', 'true')
    expect(textbox.getAttribute('aria-describedby')).toBe('external-help email-error')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid address.')
  })

  it('supports controlled input changes and disabled or readonly states', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(<Textbox label="Search" value="tickets" onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: 'Search' })
    await user.type(input, 'x')
    expect(onChange).toHaveBeenCalled()

    rerender(<Textbox label="Search" disabled />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeDisabled()
    rerender(<Textbox label="Search" readOnly value="fixed" />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveAttribute('readonly')
  })

  it('supports a visually hidden label and associated icons', () => {
    render(<Textbox label="Search events" hideLabel leadingIcon={<span data-testid="leading-icon" />} trailingIcon={<span data-testid="trailing-icon" />} />)
    const input = screen.getByRole('textbox', { name: 'Search events' })

    expect(input).toHaveAccessibleName('Search events')
    expect(screen.getByText('Search events')).toHaveClass('sr-only')
    expect(screen.getByTestId('leading-icon')).toBeInTheDocument()
    expect(screen.getByTestId('trailing-icon')).toBeInTheDocument()
  })
})
