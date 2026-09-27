import { X } from 'lucide-react'
import * as React from 'react'
import { IconButton } from '../button/button'
import { cn } from '../../lib/cn'

export type ModalSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-card-width-sm',
  md: 'max-w-card-width-md',
  lg: 'max-w-card-width-lg',
}

export interface ModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
  className?: string
  isDismissDisabled?: boolean
}

export function Modal({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  isDismissDisabled = false,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const titleId = React.useId()
  const descriptionId = React.useId()

  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault()
    if (isDismissDisabled) return
    onOpenChange(false)
  }

  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (!isDismissDisabled && event.target === event.currentTarget) onOpenChange(false)
  }

  return (
    <dialog
      ref={dialogRef}
      data-slot="modal"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'm-auto w-modal-width rounded-card border border-border-subtle bg-surface-card text-text-primary shadow-popover backdrop:bg-modal-overlay',
        sizeClasses[size],
        className,
      )}
      onCancel={handleCancel}
      onClick={handleDialogClick}
    >
      <div className="grid gap-space-5 p-card-md">
        <header className="flex items-start justify-between gap-space-4">
          <div className="grid gap-space-2">
            <h2 id={titleId} className="text-title font-semibold leading-tight">{title}</h2>
            {description ? <p id={descriptionId} className="text-body-sm text-text-secondary">{description}</p> : null}
          </div>
          <IconButton
            type="button"
            aria-label="Close dialog"
            variant="ghost"
            disabled={isDismissDisabled}
            onClick={() => onOpenChange(false)}
          >
            <X aria-hidden="true" />
          </IconButton>
        </header>
        <div className="text-body-sm">{children}</div>
        {footer ? <footer className="flex flex-wrap justify-end gap-space-3 border-t border-border-subtle pt-space-4">{footer}</footer> : null}
      </div>
    </dialog>
  )
}
