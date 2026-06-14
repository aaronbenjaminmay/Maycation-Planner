import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '../components/ui/Badge'
import type { BadgeTone } from '../components/ui/Badge'

const meta = {
  title: 'Components/Badge',
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
  args: { children: 'Activity', tone: 'accent' },
}

export const Info: Story = {
  args: { children: 'Editor', tone: 'info' },
}

export const Secondary: Story = {
  args: { children: 'Viewer', tone: 'secondary' },
}

export const Warning: Story = {
  args: { children: 'Reservation', tone: 'warning' },
}

export const Danger: Story = {
  args: { children: 'Danger', tone: 'danger' },
}

export const AllTones: Story = {
  name: 'All Tones',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="accent">Activity</Badge>
      <Badge tone="info">Editor</Badge>
      <Badge tone="secondary">Viewer</Badge>
      <Badge tone="warning">Reservation</Badge>
      <Badge tone="danger">Danger</Badge>
    </div>
  ),
}
