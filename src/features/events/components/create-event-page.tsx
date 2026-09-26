import { useState, type SubmitEvent } from 'react'
import { Card, CardDescription, CardHeader } from '@/ui'
import { createEvent } from '../api/events-api'
import type { CreateEventInput } from '../types/event'
import { CreateEventForm } from './create-event-form'

function getRequiredString(formData: FormData, fieldName: string, label: string) {
  const value = formData.get(fieldName)
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Enter ${label.toLowerCase()}.`)
  }

  return value.trim()
}

function getInteger(formData: FormData, fieldName: string, label: string) {
  const value = getRequiredString(formData, fieldName, label)
  if (!/^\d+$/.test(value)) {
    throw new Error(`${label} must be a whole number.`)
  }

  const result = Number(value)
  if (!Number.isSafeInteger(result)) {
    throw new Error(`${label} is too large.`)
  }

  return result
}

function getTicketPriceCents(value: string) {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    throw new Error('Enter a ticket price with no more than two decimal places.')
  }

  const [wholeUnits, fractionalUnits = ''] = value.split('.')
  const priceInCents = Number(wholeUnits) * 100 + Number(fractionalUnits.padEnd(2, '0'))
  if (!Number.isSafeInteger(priceInCents)) {
    throw new Error('Ticket price is too large.')
  }

  return priceInCents
}

function getStartsAt(formData: FormData) {
  const localDateTime = getRequiredString(formData, 'startsAt', 'Event date and time')
  const startsAt = new Date(localDateTime)
  if (Number.isNaN(startsAt.getTime())) {
    throw new Error('Enter a valid event date and time.')
  }

  return startsAt.toISOString()
}

function getCreateEventInput(formData: FormData): CreateEventInput {
  const minPeople = getInteger(formData, 'minPeople', 'Minimum guests')
  const maxPeople = getInteger(formData, 'maxPeople', 'Maximum guests')
  const currencyCode = getRequiredString(formData, 'currencyCode', 'Currency code').toUpperCase()

  if (minPeople < 1 || maxPeople < 1) {
    throw new Error('Guest counts must be at least one.')
  }
  if (maxPeople < minPeople) {
    throw new Error('Maximum guests must be at least the minimum guests.')
  }
  if (!/^[A-Z]{3}$/.test(currencyCode)) {
    throw new Error('Enter a three-letter currency code, such as EUR.')
  }

  return {
    name: getRequiredString(formData, 'name', 'Event name'),
    description: getRequiredString(formData, 'description', 'Description'),
    location: getRequiredString(formData, 'location', 'Location'),
    startsAt: getStartsAt(formData),
    minPeople,
    maxPeople,
    ticketPriceCents: getTicketPriceCents(getRequiredString(formData, 'ticketPrice', 'Ticket price')),
    currencyCode,
    servesAlcohol: formData.get('servesAlcohol') === 'on',
  }
}

export function CreateEventPage() {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    setMessage('')
    setIsSuccess(false)

    let input: CreateEventInput
    try {
      input = getCreateEventInput(new FormData(formElement))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Check the event details and try again.')
      return
    }

    setIsSubmitting(true)
    try {
      await createEvent(input)
      formElement.reset()
      setMessage('Event published and will be live soon.')
      setIsSuccess(true)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create the event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main id="main" className="grid min-h-svh place-items-center bg-surface-page px-page-gutter py-section-gap text-text-primary">
      <Card size="lg" padding="lg" className="grid gap-space-6">
        <CardHeader>
          <h1 className="text-title font-semibold leading-tight text-text-primary">Create an event</h1>
          <CardDescription>Share the details, schedule, guest limits, and ticket price for your event.</CardDescription>
        </CardHeader>

        <CreateEventForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        <p aria-live="polite" role={message && !isSuccess ? 'alert' : 'status'} className="min-h-control-sm text-body-sm text-text-secondary">
          {message}
        </p>
      </Card>
    </main>
  )
}
