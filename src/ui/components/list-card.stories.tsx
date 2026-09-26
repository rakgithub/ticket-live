import type { Meta, StoryObj } from '@storybook/react-vite'
import { UserRound } from 'lucide-react'
import { Button } from './button'
import { ListCard, ListCardRow } from './list-card'

const records = [
  { id: 'TK-2481', title: 'Checkout confirmation is delayed', description: 'Payments · Maya Chen', status: 'In progress' },
  { id: 'TK-2479', title: 'Update billing contact for Northstar', description: 'Account · Jordan Lee', status: 'Open' },
  { id: 'TK-2476', title: 'Mobile event pass does not refresh', description: 'Mobile app · Sam Patel', status: 'Open' },
]

const meta = {
  title: 'Components/ListCard',
  component: ListCard,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'ListCard composes Card with a heading, optional actions, and a typed list. Keep interactive controls inside a row separate from a clickable parent link.' } },
  },
  args: { heading: 'Recent tickets', items: [], getKey: () => 'item', renderItem: () => null },
} satisfies Meta<typeof ListCard>

export default meta
type Story = StoryObj<typeof meta>

export const TicketList: Story = {
  render: () => <ListCard
    heading="Recent tickets"
    size="lg"
    listLabel="Recent tickets"
    items={records}
    getKey={(item) => item.id}
    actions={<Button size="sm" variant="outline">View all</Button>}
    renderItem={(item) => <ListCardRow title={item.title} description={`${item.id} · ${item.description}`} leading={<UserRound aria-hidden="true" className="size-icon-md" />} trailing={<span className="text-label text-text-muted">{item.status}</span>} href={`#${item.id.toLowerCase()}`} />}
  />,
}

export const Empty: Story = {
  render: () => <ListCard heading="Assigned to me" items={[]} getKey={() => 'empty'} renderItem={() => null} size="md" />,
}

export const CustomRows: Story = {
  render: () => <ListCard
    heading="Quick links"
    items={[{ id: 'guide', title: 'Support guide' }, { id: 'status', title: 'Service status' }]}
    getKey={(item) => item.id}
    size="sm"
    renderItem={(item) => <ListCardRow title={item.title} href={`#${item.id}`} />}
  />,
}
