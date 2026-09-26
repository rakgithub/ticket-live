import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/cn'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-space-2 whitespace-nowrap rounded-control text-body-sm font-semibold transition-colors duration-motion-fast ease-standard focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-surface-page disabled:pointer-events-none disabled:opacity-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-action-primary text-action-primary-text hover:bg-action-primary-hover',
        secondary: 'bg-action-secondary text-action-secondary-text hover:bg-surface-subtle',
        outline: 'border border-border-strong bg-surface-card text-text-primary hover:bg-surface-subtle',
        ghost: 'bg-transparent text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
        destructive: 'bg-action-danger text-action-danger-text hover:bg-action-danger',
      },
      size: {
        sm: 'h-control-sm px-space-3 [&_svg]:size-icon-sm',
        md: 'h-control-md px-space-4 [&_svg]:size-icon-md',
        lg: 'h-control-lg px-space-5 [&_svg]:size-icon-lg',
        icon: 'size-target-min p-space-2 [&_svg]:size-icon-md',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends Omit<React.ComponentPropsWithRef<'button'>, 'size'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
}

export function Button({ className, variant, size, loading = false, leadingIcon, trailingIcon, children, disabled, ref, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : null}
      {!loading ? leadingIcon : null}
      {children}
      {trailingIcon}
    </button>
  )
}

export interface IconButtonProps extends Omit<ButtonProps, 'size' | 'children' | 'leadingIcon' | 'trailingIcon'> {
  'aria-label': string
  children: React.ReactNode
}

export function IconButton({ ref, ...props }: IconButtonProps) {
  return <Button ref={ref} {...props} size="icon" />
}
