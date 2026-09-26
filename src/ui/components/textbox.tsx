import * as React from 'react'
import { cn } from '../lib/cn'

export interface TextboxProps extends Omit<React.ComponentPropsWithRef<'input'>, 'size'> {
  label: string
  description?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  hideLabel?: boolean
}

export function Textbox({ className, label, description, error, size = 'md', id, leadingIcon, trailingIcon, required, hideLabel = false, ref, 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid, ...props }: TextboxProps) {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const descriptionId = `${inputId}-description`
    const errorId = `${inputId}-error`
    const heightClass = { sm: 'h-control-sm', md: 'h-control-md', lg: 'h-control-lg' }[size]
    const describedBy = [ariaDescribedBy, description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

    return (
      <div className="grid w-full gap-space-2">
        <label className={cn('text-body-sm font-medium text-text-primary', hideLabel && 'sr-only')} htmlFor={inputId}>
          {label}{required ? <span aria-hidden="true" className="text-danger"> *</span> : null}
        </label>
        <div className="relative flex items-center">
          {leadingIcon ? <span aria-hidden="true" className="pointer-events-none absolute left-space-3 text-text-muted">{leadingIcon}</span> : null}
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={error ? true : ariaInvalid}
            aria-describedby={describedBy}
            className={cn(
              'w-full rounded-control border bg-surface-card px-space-3 text-body-sm text-text-primary shadow-none transition-colors placeholder:text-text-muted focus-visible:border-focus-ring focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-surface-page disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-text-muted disabled:opacity-disabled read-only:bg-surface-subtle',
              heightClass,
              leadingIcon && 'pl-space-10',
              trailingIcon && 'pr-space-10',
              error ? 'border-danger' : 'border-border-subtle',
              className,
            )}
            {...props}
          />
          {trailingIcon ? <span aria-hidden="true" className="pointer-events-none absolute right-space-3 text-text-muted">{trailingIcon}</span> : null}
        </div>
        {description ? <p id={descriptionId} className="text-label leading-normal text-text-muted">{description}</p> : null}
        {error ? <p id={errorId} className="text-label leading-normal text-danger" role="alert">{error}</p> : null}
      </div>
    )
}
