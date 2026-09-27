import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../button/button'
import { Modal } from './modal'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
})

function installDialogMocks() {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }),
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open')
    }),
  })
}

function ModalHarness() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open event details</Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Event details"
        description="Review the event before publishing."
        footer={<Button>Publish</Button>}
      >
        Event details go here.
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('opens from a trigger and closes using its close button', async () => {
    installDialogMocks()
    const user = userEvent.setup()
    render(<ModalHarness />)

    await user.click(screen.getByRole('button', { name: 'Open event details' }))

    const dialog = screen.getByRole('dialog', { name: 'Event details' })
    expect(dialog).toHaveAccessibleDescription('Review the event before publishing.')
    expect(screen.getByText('Event details go here.')).toBeInTheDocument()
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Close dialog' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledOnce()
  })

  it('requests a controlled close when Escape is pressed', () => {
    installDialogMocks()
    const onOpenChange = vi.fn()
    render(
      <Modal isOpen onOpenChange={onOpenChange} title="Confirm action">
        Continue?
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Confirm action' })
    const cancelEvent = new Event('cancel', { cancelable: true })
    fireEvent(dialog, cancelEvent)

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(cancelEvent.defaultPrevented).toBe(true)
    expect(dialog).toBeInTheDocument()
  })

  it('requests a controlled close when the backdrop is clicked', () => {
    installDialogMocks()
    const onOpenChange = vi.fn()
    render(
      <Modal isOpen onOpenChange={onOpenChange} title="Confirm action">
        Continue?
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Confirm action' })
    fireEvent.click(screen.getByText('Continue?'))

    expect(onOpenChange).not.toHaveBeenCalled()

    fireEvent.click(dialog)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('keeps an initially closed dialog closed', () => {
    installDialogMocks()
    render(
      <Modal isOpen={false} onOpenChange={vi.fn()} title="Hidden details">
        Hidden content.
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled()
  })

  it('prevents dismissal while dismissal is disabled', async () => {
    installDialogMocks()
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Modal isOpen onOpenChange={onOpenChange} title="Processing payment" isDismissDisabled>
        Please wait.
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Processing payment' })
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Close dialog' }))
    const cancelEvent = new Event('cancel', { cancelable: true })
    fireEvent(dialog, cancelEvent)
    fireEvent.click(dialog)

    expect(cancelEvent.defaultPrevented).toBe(true)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(dialog).toBeInTheDocument()
  })
})
