import type { Meta, StoryObj } from '@storybook/react-vite'
import { Search } from 'lucide-react'
import { Textbox } from './textbox'

const meta = {
  title: 'Components/Textbox',
  component: Textbox,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Textboxes always have a programmatic label. Use description for guidance and error for validation feedback; do not rely on placeholder text as a label.' } },
  },
  args: { label: 'Email address', placeholder: 'name@example.com' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] }, type: { control: 'select', options: ['text', 'email', 'search', 'password'] } },
} satisfies Meta<typeof Textbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const WithDescription: Story = { args: { label: 'Workspace name', description: 'This name is visible to everyone in your workspace.' } }
export const WithError: Story = { args: { label: 'Email address', value: 'not-an-email', error: 'Enter a valid email address.', type: 'email' } }
export const WithLeadingIcon: Story = { args: { label: 'Search tickets', type: 'search', placeholder: 'Search tickets', leadingIcon: <Search aria-hidden="true" /> } }
export const DisabledAndReadOnly: Story = {
  render: () => <div className="grid max-w-card-width-md gap-space-5"><Textbox label="Disabled" disabled value="Cannot edit" /><Textbox label="Read only" readOnly value="Reference value" /></div>,
}
