import type { Meta } from '@storybook/react'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'

const meta = {
  title: 'Components/Feedback/EmptyState',
  component: EmptyState,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof EmptyState>

export default meta

export const Default = {
  name: 'Title only',
  render: () => (
    <div style={{ width: 320 }}>
      <EmptyState title="No trips yet" />
    </div>
  ),
}

export const WithBody = {
  name: 'With body text',
  render: () => (
    <div style={{ width: 320 }}>
      <EmptyState title="No items for this day">
        <p>Add reservations, activities, and notes to build your day plan.</p>
      </EmptyState>
    </div>
  ),
}

export const WithAction = {
  name: 'With action',
  render: () => (
    <div style={{ width: 320 }}>
      <EmptyState
        title="No trips yet"
        action={<Button variant="primary">Create your first trip</Button>}
      />
    </div>
  ),
}

export const Full = {
  name: 'With body and action',
  render: () => (
    <div style={{ width: 320 }}>
      <EmptyState
        title="No items for this day"
        action={<Button variant="primary">Add an item</Button>}
      >
        <p>Reservations, activities, travel, and notes all go here.</p>
      </EmptyState>
    </div>
  ),
}
