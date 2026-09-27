import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRight, Download, Plus, Search } from 'lucide-react'
import { Button, IconButton } from './button'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Use buttons for immediate actions. Pick one primary action per view and use icon-only buttons only when the accessible name is explicit.' } },
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { args: { children: 'Create ticket', variant: 'primary', size: 'md' } }

export const Variants: Story = {
  render: () => <div className="flex flex-wrap items-center gap-space-3">
    <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button><Button variant="destructive">Destructive</Button>
  </div>,
}

export const SizesAndIcons: Story = {
  render: () => <div className="flex flex-wrap items-center gap-space-3">
    <Button size="sm" leadingIcon={<Download aria-hidden="true" />}>Small</Button>
    <Button size="md" trailingIcon={<ArrowRight aria-hidden="true" />}>Medium</Button>
    <Button size="lg">Large</Button>
    <Button size="icon" aria-label="Search"><Search aria-hidden="true" /></Button>
    <IconButton aria-label="Add ticket"><Plus aria-hidden="true" /></IconButton>
  </div>,
}

export const LoadingAndDisabled: Story = {
  render: () => <div className="flex flex-wrap items-center gap-space-3">
    <Button loading>Saving changes</Button><Button disabled variant="outline">Unavailable</Button>
  </div>,
}
