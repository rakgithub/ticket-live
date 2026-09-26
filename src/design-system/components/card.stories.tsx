import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowUpRight } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Cards group related information. Choose one of the finite size options; responsive layout should determine the available width.' } },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'full'] },
    variant: { control: 'select', options: ['default', 'outlined'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Standard: Story = {
  render: (args) => <Card {...args}>
    <CardHeader><CardTitle>Ticket summary</CardTitle><CardDescription>A quick snapshot of the current request.</CardDescription></CardHeader>
    <CardContent className="mt-space-5 text-text-secondary">The customer needs help updating the billing contact on their account.</CardContent>
    <CardFooter className="mt-space-5"><Button size="sm">Open ticket <ArrowUpRight aria-hidden="true" /></Button></CardFooter>
  </Card>,
  args: { size: 'md', variant: 'default', padding: 'md' },
}

export const SizeScale: Story = {
  render: () => <div className="grid w-full gap-space-4 lg:grid-cols-2">
    {(['sm', 'md', 'lg', 'full'] as const).map((size) => <Card key={size} size={size} padding="sm"><CardTitle>Size: {size}</CardTitle><CardDescription className="mt-space-2">Widths and padding come from named tokens.</CardDescription></Card>)}
  </div>,
}

export const Variants: Story = {
  render: () => <div className="grid w-full gap-space-4 md:grid-cols-3">
    <Card size="full"><CardTitle>Default</CardTitle><CardDescription className="mt-space-2">Subtle border and elevation.</CardDescription></Card>
    <Card size="full" variant="outlined"><CardTitle>Outlined</CardTitle><CardDescription className="mt-space-2">Clear edge with no shadow.</CardDescription></Card>
    <a href="#ticket-details" className="block rounded-card focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-surface-page"><Card size="full"><CardTitle>Linked card</CardTitle><CardDescription className="mt-space-2">Wrap a Card in a semantic link when the entire surface has one destination.</CardDescription></Card></a>
  </div>,
}
