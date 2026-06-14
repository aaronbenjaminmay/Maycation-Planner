import type { Meta } from '@storybook/react'
import { StatusButton } from '../components/ui/StatusButton'

const meta = {
  title: 'Components/Feedback/StatusButton',
  component: StatusButton,
  parameters: { layout: 'centered' },
  argTypes: {
    isComplete: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
} satisfies Meta<typeof StatusButton>

export default meta

export const Incomplete = {
  name: 'Incomplete',
  render: () => (
    <StatusButton
      label="Dinner reservation"
      isComplete={false}
      onToggle={() => {}}
    />
  ),
}

export const Complete = {
  name: 'Complete',
  render: () => (
    <StatusButton
      label="Dinner reservation"
      isComplete={true}
      onToggle={() => {}}
    />
  ),
}

export const ReadOnly = {
  name: 'Read-only',
  render: () => (
    <StatusButton
      label="Dinner reservation"
      isComplete={false}
      readOnly
    />
  ),
}

export const Disabled = {
  name: 'Disabled',
  render: () => (
    <StatusButton
      label="Dinner reservation"
      isComplete={false}
      disabled
    />
  ),
}

export const BothStates = {
  name: 'Both states',
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <StatusButton label="Item A" isComplete={false} onToggle={() => {}} />
      <StatusButton label="Item B" isComplete={true} onToggle={() => {}} />
    </div>
  ),
}
