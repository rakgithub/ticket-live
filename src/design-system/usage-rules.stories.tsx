import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardDescription, CardHeader, CardTitle } from './components/card'

const meta = {
  title: 'Foundations/Usage Rules',
  tags: ['autodocs'],
  parameters: { docs: { description: { page: 'Rules for contributing to and consuming the shared design system.' } } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ConsumerRules: Story = {
  render: () => <div className="mx-auto grid max-w-card-width-lg gap-space-4">
    {[
      ['Use public exports', 'Import Button, Textbox, Dropdown, HeaderBar, Card, and ListCard from the design-system entry point. Keep underlying shadcn primitives private.'],
      ['Use semantic tokens', 'Choose role names such as surface-card, text-secondary, and action-primary. Reference palette values only inside the token source.'],
      ['Choose finite variants', 'Use a supported size or variant. If a repeated need is missing, propose a named token and component variant with a story.'],
      ['Preserve accessibility', 'Use labels, accessible names for icon actions, visible focus, keyboard behavior, and error descriptions. Review both themes.'],
      ['Keep app code visual-value free', 'Do not add arbitrary Tailwind values, inline visual styles, raw color literals, or private primitive imports to consuming screens.'],
    ].map(([title, description]) => <Card key={title} size="full">
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
    </Card>)}
  </div>,
}
