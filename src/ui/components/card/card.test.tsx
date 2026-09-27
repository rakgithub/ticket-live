import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

afterEach(cleanup)

describe('Card', () => {
  it('composes its semantic sections and forwards attributes', () => {
    render(
      <Card aria-label="Event summary" data-testid="event-card">
        <CardHeader>
          <CardTitle>Autumn Supper Club</CardTitle>
          <CardDescription>Seasonal dinner in Berlin.</CardDescription>
        </CardHeader>
        <CardContent>12 seats remain</CardContent>
        <CardFooter>Booking open</CardFooter>
      </Card>,
    )

    expect(screen.getByTestId('event-card')).toHaveAttribute('data-slot', 'card')
    expect(screen.getByRole('heading', { name: 'Autumn Supper Club' })).toHaveAttribute('data-slot', 'card-title')
    expect(screen.getByText('Seasonal dinner in Berlin.')).toHaveAttribute('data-slot', 'card-description')
    expect(screen.getByText('12 seats remain')).toHaveAttribute('data-slot', 'card-content')
    expect(screen.getByText('Booking open')).toHaveAttribute('data-slot', 'card-footer')
  })

  it('applies the expected finite width and padding variants', () => {
    const sizes = [
      ['sm', 'max-w-card-width-sm', 'p-card-sm'],
      ['md', 'max-w-card-width-md', 'p-card-md'],
      ['lg', 'max-w-card-width-lg', 'p-card-lg'],
      ['full', 'w-full', 'p-card-md'],
    ] as const
    const { rerender } = render(<Card data-testid="card" />)

    for (const [size, widthClass, paddingClass] of sizes) {
      rerender(<Card data-testid="card" size={size} />)
      expect(screen.getByTestId('card')).toHaveClass(widthClass, paddingClass)
    }
  })

  it('supports outlined and no-padding presentation', () => {
    render(<Card data-testid="outlined" variant="outlined" padding="none" />)
    const card = screen.getByTestId('outlined')

    expect(card).toHaveClass('border-border-strong', 'shadow-none')
    expect(card).not.toHaveClass('p-card-md')
  })

  it('accepts explicit padding and custom classes', () => {
    render(<Card data-testid="custom" size="sm" padding="lg" className="custom-token-class" />)
    expect(screen.getByTestId('custom')).toHaveClass('p-card-lg', 'custom-token-class')
  })
})
