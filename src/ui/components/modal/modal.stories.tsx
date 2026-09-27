import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../button/button'
import { Modal, type ModalProps } from './modal'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Use a modal dialog for focused tasks that need the user’s attention. The native dialog element provides modal focus behavior and Escape handling.' } },
  },
  args: {
    isOpen: false,
    onOpenChange: fn(),
    title: 'Publish this event?',
    description: 'The event will be visible to people looking for something to attend.',
    children: 'You can update the event details at any time.',
    footer: <><Button variant="outline">Keep editing</Button><Button>Publish event</Button></>,
    size: 'md',
  },
  argTypes: {
    isOpen: { control: false },
    onOpenChange: { control: false },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

function ModalDemo(props: Omit<ModalProps, 'isOpen' | 'onOpenChange'>) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex min-h-control-lg items-center justify-center">
      <Button onClick={() => setIsOpen(true)}>Open dialog</Button>
      <Modal {...props} isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  )
}

export const Interactive: Story = {
  render: (args) => <ModalDemo {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }))
    await canvas.findByRole('dialog', { name: 'Publish this event?' })
  },
}
