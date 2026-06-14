import type { Meta } from '@storybook/react'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { IconButton } from '../components/ui/IconButton'
import { Badge } from '../components/ui/Badge'

const meta = {
  title: 'Components/Navigation/ScreenHeader',
  component: ScreenHeader,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ScreenHeader>

export default meta

export const Default = {
  name: 'Title only',
  render: () => <ScreenHeader title="My Trips" />,
}

export const WithEyebrow = {
  name: 'With eyebrow',
  render: () => <ScreenHeader eyebrow="Beach Maycation" title="Day 1" />,
}

export const WithMeta = {
  name: 'With meta',
  render: () => (
    <ScreenHeader
      title="Beach Maycation"
      meta={<span className="muted">Jun 7–12 · Orange Beach</span>}
    />
  ),
}

export const WithActions = {
  name: 'With actions',
  render: () => (
    <ScreenHeader
      title="My Trips"
      actions={<IconButton icon="add" label="New trip" variant="primary" />}
    />
  ),
}

export const Full = {
  name: 'All slots',
  render: () => (
    <ScreenHeader
      eyebrow="Beach Maycation"
      title="Day 1"
      meta={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="muted">Sunday, Jun 7</span>
          <Badge tone="accent">3 items</Badge>
        </div>
      }
      actions={<IconButton icon="settings" label="Trip settings" />}
    />
  ),
}
