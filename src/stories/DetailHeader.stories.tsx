import type { Meta } from '@storybook/react'
import { DetailHeader } from '../components/ui/DetailHeader'
import { IconButton } from '../components/ui/IconButton'

const meta = {
  title: 'Patterns/DetailHeader',
  component: DetailHeader,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DetailHeader>

export default meta

export const Default = {
  name: 'Back and title',
  render: () => (
    <DetailHeader title="Day 1" onBack={() => {}} />
  ),
}

export const WithEyebrow = {
  name: 'With eyebrow',
  render: () => (
    <DetailHeader eyebrow="Beach Maycation" title="Day 1" onBack={() => {}} />
  ),
}

export const WithAction = {
  name: 'With trailing action',
  render: () => (
    <DetailHeader
      title="Day 1"
      onBack={() => {}}
      action={<IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />}
    />
  ),
}

export const WithSettings = {
  name: 'With settings action',
  render: () => (
    <DetailHeader
      title="Beach Maycation"
      onBack={() => {}}
      action={<IconButton icon="settings" label="Trip settings" onClick={() => {}} />}
    />
  ),
}

export const Full = {
  name: 'All slots',
  render: () => (
    <DetailHeader
      eyebrow="Beach Maycation"
      title="Day 1"
      meta={<span className="muted">Sunday, Jun 7</span>}
      onBack={() => {}}
      action={<IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />}
    />
  ),
}
