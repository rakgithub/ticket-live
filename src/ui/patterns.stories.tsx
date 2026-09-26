import type { Meta, StoryObj } from '@storybook/react-vite'
import { CalendarDays, CircleHelp, Search, TicketCheck } from 'lucide-react'
import { Button } from './components/button'
import { Card } from './components/card'
import { Dropdown } from './components/dropdown'
import { HeaderBar } from './components/header-bar'
import { ListCard, ListCardRow } from './components/list-card'
import { Textbox } from './components/textbox'

const meta = {
  title: 'Patterns/Ticket workspace',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const tickets = [
  { id: 'TK-2481', title: 'Checkout confirmation is delayed', detail: 'Payments · Maya Chen', status: 'In progress', updated: '12 min ago' },
  { id: 'TK-2479', title: 'Update billing contact for Northstar', detail: 'Account · Jordan Lee', status: 'Open', updated: '38 min ago' },
  { id: 'TK-2476', title: 'Mobile event pass does not refresh', detail: 'Mobile app · Sam Patel', status: 'Open', updated: '1 hr ago' },
]

export const SupportWorkspace: Story = {
  render: () => <div className="min-h-svh bg-surface-page">
    <HeaderBar title="Ticket Live" accountName="Morgan Lee" navigation={<><a href="#tickets" className="rounded-control bg-selection px-space-3 py-space-2 text-body-sm font-medium text-text-primary no-underline">Tickets</a><a href="#customers" className="rounded-control px-space-3 py-space-2 text-body-sm text-text-secondary no-underline">Customers</a></>} />
    <main className="mx-auto grid max-w-content gap-section-gap px-page-gutter py-section-gap">
      <section className="flex flex-col justify-between gap-space-4 sm:flex-row sm:items-end">
        <div className="grid gap-space-2"><p className="text-body-sm font-medium text-action-primary">Workspace / Support</p><h1 className="text-display font-semibold leading-tight">Tickets</h1><p className="text-body text-text-secondary">Track customer requests and keep the conversation moving.</p></div>
        <Button>New ticket</Button>
      </section>
      <section aria-label="Ticket stats" className="grid gap-space-4 sm:grid-cols-3">
        <Card size="full" className="grid gap-space-4"><div className="flex items-center justify-between"><span className="text-body-sm text-text-secondary">Open tickets</span><TicketCheck aria-hidden="true" className="size-icon-md text-action-primary" /></div><strong className="text-display font-semibold">24</strong></Card>
        <Card size="full" className="grid gap-space-4"><div className="flex items-center justify-between"><span className="text-body-sm text-text-secondary">Response time</span><CalendarDays aria-hidden="true" className="size-icon-md text-text-muted" /></div><strong className="text-display font-semibold">18m</strong></Card>
        <Card size="full" className="grid gap-space-4"><div className="flex items-center justify-between"><span className="text-body-sm text-text-secondary">Satisfaction</span><CircleHelp aria-hidden="true" className="size-icon-md text-success" /></div><strong className="text-display font-semibold">96.4%</strong></Card>
      </section>
      <ListCard
        heading="Recent tickets"
        size="full"
        listLabel="Recent tickets"
        items={tickets}
        getKey={(ticket) => ticket.id}
        actions={<><div className="hidden min-w-card-width-sm sm:block"><Textbox label="Search tickets" hideLabel type="search" placeholder="Search tickets" leadingIcon={<Search aria-hidden="true" className="size-icon-sm" />} /></div><Dropdown label="Filter" items={[{ id: 'all', label: 'All tickets' }, { id: 'open', label: 'Open tickets' }]} /></>}
        renderItem={(ticket) => <ListCardRow title={<span className="flex flex-wrap items-center gap-space-3"><span>{ticket.title}</span><span className="rounded-control bg-surface-subtle px-space-2 py-space-1 text-label text-text-secondary">{ticket.status}</span></span>} description={`${ticket.id} · ${ticket.detail}`} trailing={<span className="hidden text-label text-text-muted md:inline">{ticket.updated}</span>} href={`#${ticket.id.toLowerCase()}`} />}
      />
    </main>
  </div>,
}
