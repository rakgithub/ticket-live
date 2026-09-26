import { useId, type SubmitEventHandler } from 'react'
import { Button, Textbox } from '@/ui'

interface CreateEventFormProps {
  onSubmit: SubmitEventHandler<HTMLFormElement>
  isSubmitting: boolean
}

export function CreateEventForm({ onSubmit, isSubmitting }: CreateEventFormProps) {
  const descriptionId = useId()

  return (
    <form className="grid gap-space-5" onSubmit={onSubmit}>
      <fieldset disabled={isSubmitting} className="grid min-w-0 gap-space-5 border-0 p-0">
        <Textbox
          label="Event name"
          name="name"
          type="text"
          autoComplete="off"
          placeholder="Autumn Supper Club"
          required
        />

        <div className="grid gap-space-2">
          <label htmlFor={descriptionId} className="text-body-sm font-medium text-text-primary">Description</label>
          <textarea
            id={descriptionId}
            name="description"
            className="min-h-control-lg w-full rounded-control border border-border-subtle bg-surface-card px-space-3 py-space-3 text-body-sm text-text-primary placeholder:text-text-muted focus-visible:border-focus-ring focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-surface-page disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted"
            placeholder="A shared dinner with seasonal food."
            required
          />
        </div>

        <Textbox
          label="Location"
          name="location"
          type="text"
          autoComplete="address-level2"
          placeholder="Berlin"
          required
        />

        <Textbox
          label="Event date and time"
          name="startsAt"
          type="datetime-local"
          required
        />

        <div className="grid gap-space-5 sm:grid-cols-2">
          <Textbox
            label="Minimum guests"
            name="minPeople"
            type="number"
            min={1}
            step={1}
            placeholder="8"
            required
          />
          <Textbox
            label="Maximum guests"
            name="maxPeople"
            type="number"
            min={1}
            step={1}
            placeholder="20"
            required
          />
        </div>

        <div className="grid gap-space-5 sm:grid-cols-2">
          <Textbox
            label="Ticket price"
            name="ticketPrice"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="45.00"
            description="Enter the price in whole currency units."
            required
          />
          <Textbox
            label="Currency code"
            name="currencyCode"
            type="text"
            autoCapitalize="characters"
            maxLength={3}
            minLength={3}
            pattern="[A-Za-z]{3}"
            placeholder="EUR"
            description="Use a three-letter code, such as EUR."
            defaultValue="EUR"
            required
          />
        </div>

        <label className="flex min-h-control-md items-center gap-space-3 text-body-sm font-medium text-text-primary">
          <input
            className="size-icon-md accent-primary focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-surface-page"
            name="servesAlcohol"
            type="checkbox"
          />
          Alcohol will be served
        </label>
      </fieldset>

      <Button className="w-full" type="submit" loading={isSubmitting}>Create event</Button>
    </form>
  )
}
