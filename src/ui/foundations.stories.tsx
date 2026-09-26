import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardDescription, CardHeader, CardTitle } from './components/card'

const meta = {
  title: 'Foundations/Design Tokens',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const colorTokens = [
  { name: 'Page surface', bg: 'bg-surface-page', text: 'text-text-primary', token: '--ds-surface-page' },
  { name: 'Card surface', bg: 'bg-surface-card', text: 'text-text-primary', token: '--ds-surface-card' },
  { name: 'Subtle surface', bg: 'bg-surface-subtle', text: 'text-text-primary', token: '--ds-surface-subtle' },
  { name: 'Primary action', bg: 'bg-action-primary', text: 'text-action-primary-text', token: '--ds-action-primary' },
  { name: 'Selection', bg: 'bg-selection', text: 'text-text-primary', token: '--ds-selection' },
  { name: 'Success', bg: 'bg-success-surface', text: 'text-success', token: '--ds-success' },
  { name: 'Warning', bg: 'bg-warning-surface', text: 'text-warning', token: '--ds-warning' },
  { name: 'Danger', bg: 'bg-danger-surface', text: 'text-danger', token: '--ds-danger' },
]

export const Tokens: Story = {
  render: () => <div className="mx-auto grid max-w-content gap-section-gap">
    <header className="grid gap-space-2">
      <h1 className="text-display font-semibold leading-tight">Foundations</h1>
      <p className="max-w-card-width-lg text-body text-text-secondary">Reference values live in the token stylesheet. Components use semantic aliases so themes can change without editing component code.</p>
    </header>

    <section className="grid gap-space-4">
      <h2 className="text-title font-semibold">Semantic color</h2>
      <div className="grid gap-space-4 sm:grid-cols-2 lg:grid-cols-4">
        {colorTokens.map((token) => <Card key={token.token} size="full" padding="none" className="overflow-hidden">
          <div className={`flex min-h-control-lg items-center px-card-sm ${token.bg} ${token.text}`}><span className="text-body-sm font-semibold">{token.name}</span></div>
          <div className="grid gap-space-1 p-card-sm">
            <code className="font-mono text-label text-text-primary">{token.token}</code>
            <span className="text-label text-text-muted">Light and dark themes</span>
          </div>
        </Card>)}
      </div>
    </section>

    <section className="grid gap-space-4 lg:grid-cols-2">
      <Card size="full">
        <CardHeader><CardTitle>Type scale</CardTitle><CardDescription>Text styles pair named size and line-height tokens.</CardDescription></CardHeader>
        <div className="mt-space-5 grid gap-space-4">
          <p className="text-display font-semibold leading-tight">Display / Tickets</p>
          <p className="text-title font-semibold leading-tight">Title / Recent activity</p>
          <p className="text-title-sm font-medium">Section / Ticket summary</p>
          <p className="text-body">Body / Readable interface content and instructions.</p>
          <p className="text-body-sm text-text-secondary">Supporting / Context and secondary details.</p>
          <p className="text-label text-text-muted">Label / Metadata and helper text</p>
        </div>
      </Card>
      <Card size="full">
        <CardHeader><CardTitle>Spacing and shape</CardTitle><CardDescription>Choose named tokens by role; avoid one-off adjustments.</CardDescription></CardHeader>
        <div className="mt-space-5 grid gap-space-4">
          <div className="flex flex-wrap items-center gap-space-3">
            <span className="rounded-control border border-border-strong px-space-3 py-space-2 text-body-sm">Control radius</span>
            <span className="rounded-card border border-border-strong px-space-3 py-space-2 text-body-sm">Card radius</span>
            <span className="rounded-popover border border-border-strong px-space-3 py-space-2 text-body-sm">Popover radius</span>
          </div>
          <div className="grid gap-space-2">
            {(['space-2', 'space-3', 'space-4', 'space-6', 'space-8'] as const).map((space) => <div key={space} className="flex items-center gap-space-3">
              <span className="w-card-width-sm text-label text-text-muted">{space}</span><span className={`h-control-sm rounded-control bg-selection ${space === 'space-2' ? 'w-space-2' : space === 'space-3' ? 'w-space-3' : space === 'space-4' ? 'w-space-4' : space === 'space-6' ? 'w-space-6' : 'w-space-8'}`} />
            </div>)}
          </div>
        </div>
      </Card>
    </section>

    <section className="grid gap-space-4">
      <h2 className="text-title font-semibold">Elevation</h2>
      <div className="grid gap-space-4 sm:grid-cols-2">
        <Card size="full"><CardTitle>Card elevation</CardTitle><CardDescription className="mt-space-2">Use the card shadow only for grouped content surfaces.</CardDescription></Card>
        <div className="rounded-card border border-border-subtle bg-surface-popover p-card-md shadow-popover"><h3 className="text-title-sm font-semibold">Popover elevation</h3><p className="mt-space-2 text-body-sm text-text-secondary">Reserve stronger elevation for menus and floating content.</p></div>
      </div>
    </section>
  </div>,
}
