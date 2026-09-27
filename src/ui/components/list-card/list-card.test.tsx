import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ListCard, ListCardRow } from './list-card'

afterEach(cleanup)

interface Ticket {
  id: string
  title: string
  owner: string
}

const tickets: Ticket[] = [
  { id: 'TK-10', title: 'Payment is delayed', owner: 'Maya Chen' },
  { id: 'TK-11', title: 'Update billing details', owner: 'Jordan Lee' },
]

describe('ListCard', () => {
  it('renders a labeled list in item order with optional actions', () => {
    render(
      <ListCard
        heading="Recent tickets"
        listLabel="Recent tickets"
        items={tickets}
        getKey={(ticket) => ticket.id}
        actions={<button type="button">View all</button>}
        renderItem={(ticket) => <ListCardRow title={ticket.title} description={ticket.owner} />}
      />,
    )

    const list = screen.getByRole('list', { name: 'Recent tickets' })
    const rows = within(list).getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getByText('Payment is delayed')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Update billing details')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument()
  })

  it('renders the default empty state and a caller-provided empty state', () => {
    const { rerender } = render(<ListCard heading="Assigned to me" items={[]} getKey={() => 'none'} renderItem={() => null} />)
    expect(screen.getByText('Nothing to show yet.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()

    rerender(<ListCard heading="Assigned to me" items={[]} getKey={() => 'none'} renderItem={() => null} emptyState={<p>No tickets assigned.</p>} />)
    expect(screen.getByText('No tickets assigned.')).toBeInTheDocument()
    expect(screen.queryByText('Nothing to show yet.')).not.toBeInTheDocument()
  })

  it('renders rows as links, buttons, or static content according to their props', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <>
        <ListCardRow title="Open ticket" href="/tickets/10" />
        <ListCardRow title="Retry request" onClick={onClick} />
        <ListCardRow title="Informational row" description="No action" />
      </>,
    )

    expect(screen.getByRole('link', { name: 'Open ticket' })).toHaveAttribute('href', '/tickets/10')
    await user.click(screen.getByRole('button', { name: 'Retry request' }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.getByText('Informational row').closest('div')).toHaveTextContent('No action')
  })

  it('supports optional row details and stable identifiers', () => {
    render(<ListCardRow id="ticket-row" title="Ticket title" description="Ticket owner" leading={<span>Bug</span>} trailing={<span>Open</span>} aria-label="Ticket TK-12" />)
    const row = screen.getByLabelText('Ticket TK-12')

    expect(row).toHaveAttribute('id', 'ticket-row')
    expect(row).toHaveTextContent('Bug')
    expect(row).toHaveTextContent('Ticket title')
    expect(row).toHaveTextContent('Ticket owner')
    expect(row).toHaveTextContent('Open')
  })
})
