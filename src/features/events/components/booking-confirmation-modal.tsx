import { useId, useState, type ChangeEvent } from 'react'
import { Button, Modal } from '@/ui'
import { checkoutOrder } from '@/features/orders'
import type { EventSummary } from '../types/event'
import { formatEventDate, formatEventPrice } from '../lib/event-formatters'

export interface BookingConfirmationModalProps {
  event: EventSummary
  availableSeats: number
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function BookingConfirmationModal({ event, availableSeats, isOpen, onOpenChange }: BookingConfirmationModalProps) {
  const [selectedSeatCount, setSelectedSeatCount] = useState(1)
  const [isCheckoutPending, setIsCheckoutPending] = useState(false)
  const [hasCheckoutSucceeded, setHasCheckoutSucceeded] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const seatCountId = useId()
  const safeSeatCount = Math.min(selectedSeatCount, availableSeats)
  const seatOptions = Array.from({ length: availableSeats }, (_, index) => index + 1)

  function handleSeatCountChange(changeEvent: ChangeEvent<HTMLSelectElement>) {
    setSelectedSeatCount(Number(changeEvent.currentTarget.value))
  }

  function handleOpenChange(nextIsOpen: boolean) {
    if (!nextIsOpen && isCheckoutPending) return

    if (!nextIsOpen) setSelectedSeatCount(1)
    if (!nextIsOpen) {
      setHasCheckoutSucceeded(false)
      setCheckoutError(null)
    }
    onOpenChange(nextIsOpen)
  }

  async function handlePay() {
    if (isCheckoutPending || hasCheckoutSucceeded || availableSeats <= 0) return

    setCheckoutError(null)
    setIsCheckoutPending(true)

    try {
      await checkoutOrder({ eventId: event.id, quantity: safeSeatCount })
      setHasCheckoutSucceeded(true)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Checkout could not be completed. Please try again.')
    } finally {
      setIsCheckoutPending(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title="Confirm your booking"
      description={event.name}
      size="sm"
      isDismissDisabled={isCheckoutPending}
      footer={
      <>
        <Button
          type="button"
          loading={isCheckoutPending}
          disabled={hasCheckoutSucceeded || availableSeats <= 0}
          onClick={handlePay}
        >
          Pay
        </Button>
        <Button type="button" variant="outline" disabled={isCheckoutPending} onClick={() => handleOpenChange(false)}>Close</Button>
      </>}
    >
      <div className="grid gap-space-5">
        {checkoutError ? <p className="text-body-sm text-danger" role="alert">{checkoutError}</p> : null}
        {hasCheckoutSucceeded ? <p className="text-body-sm text-success" role="status">Payment successful. Your seats are confirmed.</p> : null}
        <dl className="grid gap-space-3 rounded-control bg-surface-subtle p-card-sm">
          <div className="grid gap-space-1">
            <dt className="text-label font-medium text-text-muted">Date and time</dt>
            <dd className="text-body-sm text-text-primary">{formatEventDate(event.startsAt)}</dd>
          </div>
          <div className="grid gap-space-1">
            <dt className="text-label font-medium text-text-muted">Location</dt>
            <dd className="text-body-sm text-text-primary">{event.location}</dd>
          </div>
        </dl>

        {availableSeats > 0 ? (
          <div className="grid gap-space-2">
            <label htmlFor={seatCountId} className="text-body-sm font-medium text-text-primary">No. of seats</label>
            <select
              id={seatCountId}
              value={safeSeatCount}
              onChange={handleSeatCountChange}
              disabled={isCheckoutPending || hasCheckoutSucceeded}
              className="h-control-md w-full rounded-control border border-border-subtle bg-surface-card px-space-3 text-body-sm text-text-primary focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-surface-card"
            >
              {seatOptions.map((seatCount) => (
                <option key={seatCount} value={seatCount}>
                  {seatCount} {seatCount === 1 ? 'seat' : 'seats'}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-body-sm text-danger" role="status">No seats are currently available.</p>
        )}

        <dl className="grid gap-space-2 border-t border-border-subtle pt-space-4 text-body-sm">
          <div className="flex justify-between gap-space-3">
            <dt className="text-text-secondary">Price per seat</dt>
            <dd className="font-medium text-text-primary">{formatEventPrice(event.ticketPriceCents, event.currencyCode)}</dd>
          </div>
          <div className="flex justify-between gap-space-3 font-semibold" aria-live="polite">
            <dt className="text-text-primary">Total</dt>
            <dd className="text-text-primary">{formatEventPrice(event.ticketPriceCents * safeSeatCount, event.currencyCode)}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  )
}
