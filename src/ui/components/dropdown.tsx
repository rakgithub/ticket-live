import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { Button } from './button'
import { cn } from '../lib/cn'

export interface DropdownItemData {
  id: string
  label: string
  onSelect?: () => void
  disabled?: boolean
  destructive?: boolean
  shortcut?: string
}

export interface DropdownProps {
  label: string
  items: DropdownItemData[]
  disabled?: boolean
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  triggerVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
}

const contentClassName = 'z-popover min-w-popover-min overflow-hidden rounded-popover border border-border-subtle bg-surface-popover p-space-1 text-text-primary shadow-popover outline-none'
const itemClassName = 'flex min-h-control-sm cursor-default select-none items-center gap-space-3 rounded-control px-space-3 text-body-sm outline-none focus:bg-selection data-[disabled]:pointer-events-none data-[disabled]:opacity-disabled'

export function Dropdown({ label, items, disabled, align = 'end', side = 'bottom', triggerVariant = 'outline' }: DropdownProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button variant={triggerVariant} disabled={disabled}>
          {label}<ChevronDown aria-hidden="true" />
        </Button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          side={side}
          sideOffset={0}
          className={contentClassName}
        >
          {items.map((item) => (
            <DropdownMenuPrimitive.Item
              key={item.id}
              disabled={item.disabled}
              onSelect={item.onSelect}
              className={cn(
                itemClassName,
                item.destructive && 'text-danger focus:bg-danger-surface',
              )}
            >
              <span className="flex-1">{item.label}</span>
              {item.shortcut ? <span className="text-label text-text-muted">{item.shortcut}</span> : null}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuGroup = DropdownMenuPrimitive.Group
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal
export const DropdownMenuSub = DropdownMenuPrimitive.Sub
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

export function DropdownMenuContent({ className, sideOffset = 0, ref, ...props }: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Content>) {
  return (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(contentClassName, className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({ className, inset, ref, ...props }: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }) {
  return (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn('relative', itemClassName, inset && 'pl-space-10', className)}
    {...props}
  />
  )
}

export function DropdownMenuCheckboxItem({ className, children, checked, ref, ...props }: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    checked={checked}
    className={cn('relative flex min-h-control-sm cursor-default select-none items-center rounded-control py-space-1 pl-space-10 pr-space-3 text-body-sm outline-none focus:bg-selection data-[disabled]:pointer-events-none data-[disabled]:opacity-disabled', className)}
    {...props}
  >
    <span className="absolute left-space-3 flex size-icon-sm items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator><Check className="size-icon-sm" /></DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
  )
}

export function DropdownMenuLabel({ className, inset, ref, ...props }: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
  return <DropdownMenuPrimitive.Label ref={ref} className={cn('px-space-3 py-space-2 text-label font-semibold text-text-muted', inset && 'pl-space-10', className)} {...props} />
}

export function DropdownMenuSeparator({ className, ref, ...props }: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn('mx-space-1 my-space-1 h-hairline bg-border-subtle', className)} {...props} ref={ref} />
}

export function DropdownMenuSubTrigger({ className, inset, children, ref, ...props }: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
  <DropdownMenuPrimitive.SubTrigger ref={ref} className={cn('flex min-h-control-sm cursor-default select-none items-center rounded-control px-space-3 text-body-sm outline-none focus:bg-selection data-[state=open]:bg-selection', inset && 'pl-space-10', className)} {...props}>
    {children}<ChevronRight className="ml-auto size-icon-sm" />
  </DropdownMenuPrimitive.SubTrigger>
  )
}

export function DropdownMenuSubContent({ className, ref, ...props }: React.ComponentPropsWithRef<typeof DropdownMenuPrimitive.SubContent>) {
  return <DropdownMenuPrimitive.SubContent ref={ref} className={cn(contentClassName, className)} {...props} />
}
