import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { ChatBox, type ChatBoxProps, type ChatMessage } from './chat-box'

const initialMessages: ChatMessage[] = [
  { id: 'welcome', author: 'agent', text: 'Hi! How can we help with your ticket today?' },
]

const meta = {
  title: 'Components/ChatBox',
  component: ChatBox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A fixed support chat widget for a page corner. The parent owns the conversation messages and handles delivery through onSend; the widget owns its draft and can be controlled with isOpen.',
      },
    },
  },
  args: {
    title: 'Ticket Live support',
    defaultOpen: true,
    onSend: fn(),
    messages: [],
  },
  argTypes: {
    isOpen: { control: false },
    onOpenChange: { control: false },
    onSend: { control: false },
    messages: { control: false },
  },
} satisfies Meta<typeof ChatBox>

export default meta
type Story = StoryObj<typeof meta>

function InteractiveChatBox(props: ChatBoxProps) {
  const [messages, setMessages] = useState<readonly ChatMessage[]>(props.messages ?? initialMessages)

  function handleSend(message: string) {
    props.onSend(message)
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: `visitor-${currentMessages.length + 1}`, author: 'visitor', text: message },
    ])
  }

  return <ChatBox {...props} messages={messages} onSend={handleSend} />
}

export const Interactive: Story = {
  render: (args) => <InteractiveChatBox {...args} />,
  args: { messages: initialMessages },
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Message' })
    await userEvent.type(input, 'I need help with my order.')
    await userEvent.click(canvas.getByRole('button', { name: 'Send message' }))
    await canvas.findByText('I need help with my order.')
    await expect(args.onSend).toHaveBeenCalledWith('I need help with my order.')
  },
}

export const Minimized: Story = {
  args: { defaultOpen: false },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open chat' }))
    await canvas.findByRole('region', { name: 'Ticket Live support' })
  },
}

export const EmptyInput: Story = {}

export const LongConversation: Story = {
  args: {
    messages: [
      ...initialMessages,
      { id: 'question', author: 'visitor', text: 'Could you check whether the venue has accessible seating available for this event?' },
      { id: 'reply', author: 'agent', text: 'Certainly. I can check the event details and follow up with the available options.' },
    ],
  },
}

export const MobileViewport: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
