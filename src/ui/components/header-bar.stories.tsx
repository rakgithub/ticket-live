import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'
import { HeaderBar } from './header-bar'

const meta = {
  title: 'Components/HeaderBar',
  component: HeaderBar,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'A responsive application header with a navigation slot, actions, optional theme toggle, and account dropdown. Keep navigation labels concise and ensure the mobile menu remains keyboard accessible.' } },
  },
  args: { title: 'Ticket Live', accountName: 'Morgan Lee' },
} satisfies Meta<typeof HeaderBar>

export default meta
type Story = StoryObj<typeof meta>

export const Standard: Story = {
  render: (args) => <HeaderBar {...args}
    navigation={<><a href="#inbox" className="rounded-control px-space-3 py-space-2 text-body-sm text-text-secondary no-underline hover:bg-surface-subtle">Inbox</a><a href="#reports" className="rounded-control px-space-3 py-space-2 text-body-sm text-text-secondary no-underline hover:bg-surface-subtle">Reports</a></>}
    actions={<Button variant="ghost" size="sm">Help</Button>}
    accountItems={[{ id: 'profile', label: 'Profile settings' }, { id: 'signout', label: 'Sign out' }]}
  />,
}

export const WithThemeToggle: Story = {
  render: (args) => <HeaderBar {...args} theme="light" onThemeChange={() => undefined} />,
}

export const LongTitle: Story = { args: { title: 'Customer support operations workspace' } }
