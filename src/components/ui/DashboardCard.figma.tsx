import figma from '@figma/code-connect'
import { DashboardCard } from './DashboardCard'
import { ProgressPill } from './ProgressPill'

figma.connect(
  DashboardCard,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=208-16',
  {
    variant: { Variant: 'Static', Eyebrow: 'False', Meta: 'False' },
    example: () => <DashboardCard title="Beach Maycation" />,
  }
)

figma.connect(
  DashboardCard,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=208-16',
  {
    variant: { Variant: 'Static', Eyebrow: 'True', Meta: 'False' },
    example: () => <DashboardCard eyebrow="Upcoming" title="Beach Maycation" />,
  }
)

figma.connect(
  DashboardCard,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=208-16',
  {
    variant: { Variant: 'Static', Eyebrow: 'False', Meta: 'True' },
    example: () => (
      <DashboardCard
        title="Beach Maycation"
        subtitle="Jun 7–12 · Orange Beach"
        meta={<ProgressPill tone="default">3 of 7</ProgressPill>}
      />
    ),
  }
)

figma.connect(
  DashboardCard,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=208-16',
  {
    variant: { Variant: 'Interactive', Eyebrow: 'False', Meta: 'False' },
    example: () => (
      <DashboardCard
        title="Beach Maycation"
        subtitle="Jun 7–12 · Orange Beach"
        onClick={() => {}}
      />
    ),
  }
)
