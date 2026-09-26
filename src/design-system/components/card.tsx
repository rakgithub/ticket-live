import * as React from 'react'
import { cn } from '../lib/cn'

export type CardSize = 'sm' | 'md' | 'lg' | 'full'

const widthClasses: Record<CardSize, string> = {
  sm: 'w-full max-w-card-width-sm',
  md: 'w-full max-w-card-width-md',
  lg: 'w-full max-w-card-width-lg',
  full: 'w-full',
}

const paddingClasses: Record<CardSize, string> = {
  sm: 'p-card-sm',
  md: 'p-card-md',
  lg: 'p-card-lg',
  full: 'p-card-md',
}

export interface CardProps extends React.ComponentPropsWithRef<'div'> {
  size?: CardSize
  variant?: 'default' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ className, size = 'md', variant = 'default', padding, ref, ...props }: CardProps) {
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        'rounded-card border bg-surface-card text-text-primary',
        variant === 'default' && 'border-border-subtle shadow-card',
        variant === 'outlined' && 'border-border-strong shadow-none',
        widthClasses[size],
        padding === 'none' ? null : paddingClasses[padding ?? (size === 'full' ? 'md' : size)],
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ref, ...props }: React.ComponentPropsWithRef<'div'>) {
  return <div ref={ref} data-slot="card-header" className={cn('grid gap-space-2', className)} {...props} />
}

export function CardTitle({ className, ref, ...props }: React.ComponentPropsWithRef<'h3'>) {
  return <h3 ref={ref} data-slot="card-title" className={cn('text-title-sm font-semibold leading-tight text-text-primary', className)} {...props} />
}

export function CardDescription({ className, ref, ...props }: React.ComponentPropsWithRef<'p'>) {
  return <p ref={ref} data-slot="card-description" className={cn('text-body-sm leading-relaxed text-text-secondary', className)} {...props} />
}

export function CardContent({ className, ref, ...props }: React.ComponentPropsWithRef<'div'>) {
  return <div ref={ref} data-slot="card-content" className={cn('text-body-sm', className)} {...props} />
}

export function CardFooter({ className, ref, ...props }: React.ComponentPropsWithRef<'div'>) {
  return <div ref={ref} data-slot="card-footer" className={cn('flex items-center gap-space-3 border-t border-border-subtle pt-space-4', className)} {...props} />
}
