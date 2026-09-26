import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpRight, CalendarDays, CircleHelp, Clock3, Plus, Search, TicketCheck, Users } from 'lucide-react'
import {
  Button,
  Card,
  CardDescription,
  CardTitle,
  Dropdown,
  HeaderBar,
  IconButton,
  ListCard,
  ListCardRow,
  Textbox,
} from '@/design-system'

type Ticket = {
  id: string
  title: string
  description: string
  status: 'In progress' | 'Open' | 'Resolved'
  owner: string
  updated: string
}

const tickets: Ticket[] = [
  { id: 'TK-2481', title: 'Checkout confirmation is delayed', description: 'Payments · Reported by Maya Chen', status: 'In progress', owner: 'Alex Morgan', updated: '12 min ago' },
  { id: 'TK-2479', title: 'Update billing contact for Northstar', description: 'Account · Reported by Jordan Lee', status: 'Open', owner: 'Unassigned', updated: '38 min ago' },
  { id: 'TK-2476', title: 'Mobile event pass does not refresh', description: 'Mobile app · Reported by Sam Patel', status: 'Open', owner: 'Riley Adams', updated: '1 hr ago' },
  { id: 'TK-2472', title: 'Duplicate receipt for order 8392', description: 'Orders · Reported by Casey Wong', status: 'Resolved', owner: 'Jamie Rivera', updated: '2 hrs ago' },
]

function StatusPill({ status }: { status: Ticket['status'] }) {
  const style = status === 'Resolved'
    ? 'bg-success-surface text-success'
    : status === 'In progress'
      ? 'bg-warning-surface text-warning'
      : 'bg-surface-subtle text-text-secondary'
  return <span className={`inline-flex items-center rounded-control px-space-2 py-space-1 text-label font-medium ${style}`}>{status}</span>
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'assigned'>('all')
  const [notice, setNotice] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    return () => { delete document.documentElement.dataset.theme }
  }, [theme])

  const filteredTickets = useMemo(() => {
    const search = query.trim().toLowerCase()
    return tickets.filter((ticket) => {
      const matchesSearch = !search || `${ticket.title} ${ticket.id} ${ticket.description}`.toLowerCase().includes(search)
      const matchesFilter = filter === 'all' || (filter === 'open' ? ticket.status !== 'Resolved' : ticket.owner !== 'Unassigned')
      return matchesSearch && matchesFilter
    })
  }, [filter, query])

  const navigation = <>
    <a href="#tickets" aria-current="page" className="rounded-control bg-selection px-space-3 py-space-2 text-body-sm font-medium text-text-primary no-underline">Tickets</a>
  </>

  return (
    <div data-theme={theme} className="min-h-svh bg-surface-page text-text-primary">
      <HeaderBar
        title="Ticket Live"
        navigation={navigation}
        accountName="Morgan Lee"
        theme={theme}
        onThemeChange={setTheme}
        accountItems={[
          { id: 'profile', label: 'Profile settings', onSelect: () => setNotice('Profile settings selected.') },
          { id: 'preferences', label: 'Preferences', onSelect: () => setNotice('Preferences selected.') },
          { id: 'signout', label: 'Sign out', onSelect: () => setNotice('Sign out selected.') },
        ]}
        notifications={<IconButton variant="ghost" aria-label="Show notifications" onClick={() => setNotice('You have no new notifications.')}><TicketCheck aria-hidden="true" /></IconButton>}
      />

      <main id="main" className="mx-auto grid max-w-content gap-section-gap px-page-gutter py-section-gap">
        <section className="flex flex-col justify-between gap-space-6 md:flex-row md:items-end">
          <div className="grid gap-space-2">
            <p className="text-body-sm font-medium text-action-primary">Workspace / Support</p>
            <h1 id="tickets" className="text-display font-semibold leading-tight tracking-tight text-text-primary">Tickets</h1>
            <p className="max-w-card-width-md text-body text-text-secondary">Track requests and keep every customer conversation moving.</p>
          </div>
          <Button onClick={() => setNotice('Create ticket selected.')}><Plus aria-hidden="true" />Create ticket</Button>
        </section>

        <section aria-label="Ticket overview" className="grid gap-space-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card size="full" padding="md" className="grid gap-space-4">
            <div className="flex items-center justify-between gap-space-3">
              <span className="text-body-sm font-medium text-text-secondary">Open tickets</span>
              <span className="flex size-target-min items-center justify-center rounded-card bg-selection text-action-primary"><TicketCheck aria-hidden="true" className="size-icon-md" /></span>
            </div>
            <div className="flex items-end justify-between gap-space-3">
              <strong className="text-display font-semibold leading-tight text-text-primary">24</strong>
              <span className="inline-flex items-center gap-space-1 text-label font-medium text-success"><ArrowDown aria-hidden="true" className="size-icon-sm" />8% this week</span>
            </div>
          </Card>
          <Card size="full" padding="md" className="grid gap-space-4">
            <div className="flex items-center justify-between gap-space-3">
              <span className="text-body-sm font-medium text-text-secondary">Average response</span>
              <span className="flex size-target-min items-center justify-center rounded-card bg-surface-subtle text-text-secondary"><Clock3 aria-hidden="true" className="size-icon-md" /></span>
            </div>
            <div className="flex items-end justify-between gap-space-3">
              <strong className="text-display font-semibold leading-tight text-text-primary">18m</strong>
              <span className="inline-flex items-center gap-space-1 text-label font-medium text-success"><ArrowDown aria-hidden="true" className="size-icon-sm" />12% this week</span>
            </div>
          </Card>
          <Card size="full" padding="md" className="grid gap-space-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between gap-space-3">
              <span className="text-body-sm font-medium text-text-secondary">Customer satisfaction</span>
              <span className="flex size-target-min items-center justify-center rounded-card bg-success-surface text-success"><Users aria-hidden="true" className="size-icon-md" /></span>
            </div>
            <div className="flex items-end justify-between gap-space-3">
              <strong className="text-display font-semibold leading-tight text-text-primary">96.4%</strong>
              <span className="inline-flex items-center gap-space-1 text-label font-medium text-success"><ArrowUp aria-hidden="true" className="size-icon-sm" />2.1% this week</span>
            </div>
          </Card>
        </section>

        <section aria-labelledby="recent-heading" className="grid gap-space-4">
          <div id="all-tickets" className="flex flex-col justify-between gap-space-4 sm:flex-row sm:items-end">
            <div className="grid gap-space-2">
              <h2 id="recent-heading" className="text-title font-semibold leading-tight">Recent tickets</h2>
              <p className="text-body-sm text-text-secondary">A live view of the latest customer requests.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setFilter('all'); setNotice('Showing all tickets.') }}>View all tickets <ArrowUpRight aria-hidden="true" /></Button>
          </div>
          <ListCard
            heading={<span className="sr-only">Recent tickets</span>}
            listLabel="Recent tickets"
            size="full"
            items={filteredTickets}
            getKey={(ticket) => ticket.id}
            actions={
              <>
                <div className="w-full sm:w-card-width-sm">
                  <Textbox
                    label="Search tickets"
                    hideLabel
                    type="search"
                    placeholder="Search tickets"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    leadingIcon={<Search className="size-icon-sm" />}
                  />
                </div>
                <Dropdown label={filter === 'all' ? 'All tickets' : filter === 'open' ? 'Open tickets' : 'Assigned to me'} triggerVariant="outline" items={[
                  { id: 'all', label: 'All tickets', onSelect: () => setFilter('all') },
                  { id: 'open', label: 'Open tickets', onSelect: () => setFilter('open') },
                  { id: 'assigned', label: 'Assigned to me', onSelect: () => setFilter('assigned') },
                ]} />
              </>
            }
            emptyState={<div className="grid justify-items-center gap-space-3"><Search aria-hidden="true" className="size-icon-lg text-text-muted" /><p className="text-body-sm text-text-secondary">No tickets match this search.</p></div>}
            renderItem={(ticket) => (
              <ListCardRow
                title={<span className="inline-flex flex-wrap items-center gap-space-3"><span>{ticket.title}</span><StatusPill status={ticket.status} /></span>}
                description={<span className="inline-flex flex-wrap items-center gap-space-2"><span className="font-mono text-label">{ticket.id}</span><span aria-hidden="true">·</span><span>{ticket.description}</span></span>}
                trailing={<span className="hidden items-center gap-space-5 text-label text-text-muted md:flex"><span>{ticket.owner}</span><span className="inline-flex min-w-card-width-sm items-center gap-space-2"><CalendarDays aria-hidden="true" className="size-icon-sm" />{ticket.updated}</span></span>}
                onClick={() => { setSelectedTicket(ticket.id); setNotice(`${ticket.id} selected.`) }}
                className="gap-space-4"
              />
            )}
          />
        </section>

        <Card size="full" padding="md" variant="outlined" className="flex flex-col items-start justify-between gap-space-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-space-3">
            <CircleHelp aria-hidden="true" className="mt-space-1 size-icon-md shrink-0 text-action-primary" />
            <div className="grid gap-space-1">
              <CardTitle>Need a hand?</CardTitle>
              <CardDescription>Visit the support guide to learn more about managing your workspace.</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setNotice('Support guide selected.')}>Open support guide <ArrowUpRight aria-hidden="true" /></Button>
        </Card>
        <p className="sr-only" aria-live="polite">{notice}{selectedTicket ? ` Selected ticket: ${selectedTicket}.` : ''}</p>
      </main>
    </div>
  )
}

export default App
