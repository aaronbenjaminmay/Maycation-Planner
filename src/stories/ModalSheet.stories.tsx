import type { Meta, StoryObj } from '@storybook/react'
import { ModalSheet } from '../components/ui/ModalSheet'
import { Button } from '../components/ui/Button'

const meta = {
  title: 'Components/ModalSheet',
  component: ModalSheet,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ModalSheet>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Edit Trip',
    ariaLabel: 'Edit trip details',
    onClose: () => {},
    children: (
      <div style={{ padding: '0 24px 24px' }}>
        <p className="muted">Form fields would appear here.</p>
      </div>
    ),
  },
}

export const WithEyebrow: Story = {
  name: 'With eyebrow',
  args: {
    title: 'Edit Trip',
    eyebrow: 'Beach Maycation',
    ariaLabel: 'Edit trip details',
    onClose: () => {},
    children: (
      <div style={{ padding: '0 24px 24px' }}>
        <p className="muted">The eyebrow appears above the title when provided.</p>
      </div>
    ),
  },
}

export const WithContent: Story = {
  name: 'With form content',
  args: {
    title: 'Add Item',
    ariaLabel: 'Add planner item',
    onClose: () => {},
    children: (
      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p className="muted">This story shows the modal with realistic content dimensions.</p>
        <p className="muted">Close is triggered by pressing Escape or clicking the × button. In this story, close is a no-op.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save</Button>
        </div>
      </div>
    ),
  },
}
