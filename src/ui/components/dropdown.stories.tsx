import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dropdown } from './dropdown'

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Use a dropdown menu for commands and navigation actions. For choosing one value in a form, use a select control instead.' } },
  },
  args: {
    label: 'Ticket actions',
    items: [
      { id: 'assign', label: 'Assign to me', shortcut: 'A' },
      { id: 'separator', label: 'Change priority' },
      { id: 'close', label: 'Close ticket' },
    ],
  },
  argTypes: { align: { control: 'select', options: ['start', 'center', 'end'] }, side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] } },
} satisfies Meta<typeof Dropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const DisabledItem: Story = { args: { items: [{ id: 'edit', label: 'Edit ticket' }, { id: 'restricted', label: 'Restricted action', disabled: true }, { id: 'close', label: 'Close ticket', destructive: true }] } }
export const LongLabels: Story = { args: { label: 'More options', items: [{ id: 'long', label: 'Move this ticket to another customer workspace' }, { id: 'short', label: 'Duplicate' }] } }
