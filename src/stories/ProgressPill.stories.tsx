import type { Meta } from '@storybook/react'
import { ProgressPill } from '../components/ui/ProgressPill'

const meta = {
  title: 'Components/Feedback/ProgressPill',
  component: ProgressPill,
  parameters: { layout: 'centered' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'complete', 'attention'],
    },
  },
} satisfies Meta<typeof ProgressPill>

export default meta

export const Default = {
  name: 'In progress',
  render: () => <ProgressPill tone="default">3 of 7</ProgressPill>,
}

export const Complete = {
  name: 'Complete',
  render: () => <ProgressPill tone="complete">7 of 7</ProgressPill>,
}

export const Attention = {
  name: 'Needs attention',
  render: () => <ProgressPill tone="attention">0 of 7</ProgressPill>,
}

export const AllTones = {
  name: 'All tones',
  render: () => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <ProgressPill tone="default">3 of 7</ProgressPill>
      <ProgressPill tone="complete">7 of 7</ProgressPill>
      <ProgressPill tone="attention">0 of 7</ProgressPill>
    </div>
  ),
}
