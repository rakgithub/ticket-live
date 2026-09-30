import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatBox, type ChatMessage } from './chat-box'

afterEach(cleanup)

describe('ChatBox', () => {
  it('starts open by default and shows the empty conversation state', () => {
    render(<ChatBox onSend={() => undefined} />)

    expect(screen.getByRole('region', { name: 'Chat with support' })).toBeInTheDocument()
    expect(screen.getByRole('log', { name: 'Conversation' })).toHaveTextContent('No messages yet.')
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
  })

  it('sends trimmed text, clears the draft, and enables sending only for nonblank input', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatBox onSend={onSend} />)
    const input = screen.getByRole('textbox', { name: 'Message' })
    const sendButton = screen.getByRole('button', { name: 'Send message' })

    await user.type(input, '   ')
    expect(sendButton).toBeDisabled()
    await user.clear(input)
    await user.type(input, '  Please check my order.  ')
    expect(sendButton).toBeEnabled()
    await user.click(sendButton)

    expect(onSend).toHaveBeenCalledExactlyOnceWith('Please check my order.')
    expect(input).toHaveValue('')
    expect(sendButton).toBeDisabled()
  })

  it('submits with Enter and does not send whitespace-only form submissions', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatBox onSend={onSend} />)
    const input = screen.getByRole('textbox', { name: 'Message' })

    await user.type(input, '   ')
    await user.keyboard('{Enter}')
    expect(onSend).not.toHaveBeenCalled()

    await user.clear(input)
    await user.type(input, 'Thanks for your help{Enter}')
    expect(onSend).toHaveBeenCalledExactlyOnceWith('Thanks for your help')
    expect(input).toHaveValue('')
  })

  it('minimizes and restores the chat while notifying the owner', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ChatBox onSend={() => undefined} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: 'Minimize chat' }))
    expect(screen.queryByRole('region', { name: 'Chat with support' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open chat' })).toHaveAttribute('aria-expanded', 'false')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    await user.click(screen.getByRole('button', { name: 'Open chat' }))
    expect(screen.getByRole('region', { name: 'Chat with support' })).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
  })

  it('requests open changes without changing a controlled state', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ChatBox isOpen={false} onOpenChange={onOpenChange} onSend={() => undefined} />)

    await user.click(screen.getByRole('button', { name: 'Open chat' }))

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true)
    expect(screen.queryByRole('region', { name: 'Chat with support' })).not.toBeInTheDocument()
  })

  it('renders supplied messages and supports an initially minimized widget', () => {
    const messages: ChatMessage[] = [
      { id: 'agent-1', author: 'agent', text: 'Welcome!' },
      { id: 'visitor-1', author: 'visitor', text: 'Hello there.' },
    ]
    const { rerender } = render(<ChatBox defaultOpen={false} messages={messages} onSend={() => undefined} />)

    expect(screen.getByRole('button', { name: 'Open chat' })).toBeInTheDocument()
    expect(screen.queryByRole('log')).not.toBeInTheDocument()

    rerender(<ChatBox isOpen messages={messages} onSend={() => undefined} />)
    expect(screen.getByRole('log', { name: 'Conversation' })).toHaveTextContent('Welcome!')
    expect(screen.getByRole('log', { name: 'Conversation' })).toHaveTextContent('Hello there.')
  })
})
