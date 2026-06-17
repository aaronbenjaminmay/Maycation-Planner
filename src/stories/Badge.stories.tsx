import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '../components/ui/Badge'
import type { BadgeTone } from '../components/ui/Badge'

const meta = {
  title: 'Components/Feedback/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'accent', 'info', 'secondary', 'warning', 'danger'] satisfies BadgeTone[],
    },
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  args: { children: 'Neutral', tone: 'neutral' },
}

export const Accent: Story = {
  args: { children: 'Accent', tone: 'accent' },
}

export const Info: Story = {
  args: { children: 'Info', tone: 'info' },
}

export const Secondary: Story = {
  args: { children: 'Secondary', tone: 'secondary' },
}

export const Warning: Story = {
  args: { children: 'Warning', tone: 'warning' },
}

export const Danger: Story = {
  args: { children: 'Danger', tone: 'danger' },
}

export const AllTones: Story = {
  name: 'All Tones',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="accent">Accent</Badge>
      <Badge tone="info">Info</Badge>
      <Badge tone="secondary">Secondary</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
    </div>
  ),
}
