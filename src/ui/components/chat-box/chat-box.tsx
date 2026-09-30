import { MessageCircle, Minus, Send } from 'lucide-react'
import * as React from 'react'
import { Button, IconButton } from '../button/button'
import { Textbox } from '../textbox/textbox'
import { cn } from '../../lib/cn'

export interface ChatMessage {
  id: string
  text: string
  author: 'visitor' | 'agent'
}

export interface ChatBoxProps {
  title?: string
  messages?: readonly ChatMessage[]
  onSend: (message: string) => void
  defaultOpen?: boolean
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  placeholder?: string
}

export function ChatBox({
  title = 'Ask anything to AI',
  messages = [],
  onSend,
  defaultOpen = true,
  isOpen: controlledIsOpen,
  onOpenChange,
  placeholder = 'Write a message...',
}: ChatBoxProps) {
  const [internalIsOpen, setInternalIsOpen] = React.useState(defaultOpen)
  const [draft, setDraft] = React.useState('')
  const titleId = React.useId()
  const isControlled = controlledIsOpen !== undefined
  const isOpen = controlledIsOpen ?? internalIsOpen

  function handleOpenChange(nextIsOpen: boolean) {
    if (!isControlled) setInternalIsOpen(nextIsOpen)
    onOpenChange?.(nextIsOpen)
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = draft.trim()
    if (!message) return

    onSend(message)
    setDraft('')
  }

  return (
    <div className="fixed bottom-space-4 right-space-4 z-chat-widget w-chat-panel-width">
      {isOpen ? (
        <section
          aria-labelledby={titleId}
          className="flex h-chat-panel-height flex-col overflow-hidden rounded-card border border-border-subtle bg-surface-card text-text-primary shadow-popover"
        >
          <header className="flex shrink-0 items-center justify-between gap-space-3 border-b border-border-subtle px-space-4 py-space-3">
            <h2 id={titleId} className="text-title-sm font-semibold leading-tight">{title}</h2>
            <IconButton
              type="button"
              aria-label="Minimize chat"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              <Minus aria-hidden="true" />
            </IconButton>
          </header>

          <div role="log" aria-label="Conversation" aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-space-3 overflow-y-auto p-space-4">
            {messages.length === 0 ? (
              <p className="m-auto text-center text-body-sm text-text-muted">No messages yet. Send a message to start the conversation.</p>
            ) : messages.map((message) => {
              const isVisitor = message.author === 'visitor'
              return (
                <div key={message.id} className={cn('flex', isVisitor ? 'justify-end' : 'justify-start')}>
                  <p
                    className={cn(
                      'max-w-full whitespace-pre-wrap break-words rounded-card px-space-3 py-space-2 text-body-sm',
                      isVisitor ? 'bg-action-primary text-action-primary-text' : 'bg-surface-subtle text-text-primary',
                    )}
                  >
                    {message.text}
                  </p>
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} aria-label="Send a message" className="flex shrink-0 items-end gap-space-2 border-t border-border-subtle p-space-3">
            <div className="min-w-0 flex-1">
              <Textbox
                label="Message"
                hideLabel
                autoComplete="off"
                placeholder={placeholder}
                value={draft}
                onChange={(event) => setDraft(event.currentTarget.value)}
              />
            </div>
            <Button
              type="submit"
              aria-label="Send message"
              leadingIcon={<Send aria-hidden="true" />}
              disabled={!draft.trim()}
            >
              Send
            </Button>
          </form>
        </section>
      ) : (
        <div className="flex justify-end">
          <Button
            type="button"
            aria-expanded={false}
            aria-label="Open chat"
            leadingIcon={<MessageCircle aria-hidden="true" />}
            onClick={() => handleOpenChange(true)}
          >
            Open chat
          </Button>
        </div>
      )}
    </div>
  )
}
