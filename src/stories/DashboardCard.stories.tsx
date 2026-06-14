import type { Meta } from '@storybook/react'
import { DashboardCard } from '../components/ui/DashboardCard'
import { Badge } from '../components/ui/Badge'
import { ProgressPill } from '../components/ui/ProgressPill'

const meta = {
  title: 'Patterns/DashboardCard',
  component: DashboardCard,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DashboardCard>

export default meta

export const Default = {
  name: 'Default (static)',
  render: () => (
    <div style={{ width: 300 }}>
      <DashboardCard title="Beach Maycation" />
    </div>
  ),
}

export const WithSubtitle = {
  name: 'With subtitle',
  render: () => (
    <div style={{ width: 300 }}>
      <DashboardCard title="Beach Maycation" subtitle="Jun 7–12 · Orange Beach" />
    </div>
  ),
}

export const WithEyebrow = {
  name: 'With eyebrow',
  render: () => (
    <div style={{ width: 300 }}>
      <DashboardCard eyebrow="Upcoming" title="Beach Maycation" subtitle="Jun 7–12 · Orange Beach" />
    </div>
  ),
}

export const Interactive = {
  name: 'Interactive (as button)',
  render: () => (
    <div style={{ width: 300 }}>
      <DashboardCard
        title="Beach Maycation"
        subtitle="Jun 7–12 · Orange Beach"
        onClick={() => {}}
      />
    </div>
  ),
}

export const WithMeta = {
  name: 'With meta content',
  render: () => (
    <div style={{ width: 300 }}>
      <DashboardCard
        eyebrow="Trip"
        title="Beach Maycation"
        subtitle="Jun 7–12 · Orange Beach"
        meta={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <ProgressPill tone="default">3 of 7</ProgressPill>
            <Badge tone="accent">Active</Badge>
          </div>
        }
        onClick={() => {}}
      />
    </div>
  ),
}

export const AllVariants = {
  name: 'Card gallery',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
      <DashboardCard title="Static card" />
      <DashboardCard title="With subtitle" subtitle="Jun 7–12 · Orange Beach" />
      <DashboardCard eyebrow="Upcoming" title="With eyebrow" subtitle="Jun 7–12" />
      <DashboardCard title="Interactive" subtitle="Tap to open" onClick={() => {}} />
    </div>
  ),
}
