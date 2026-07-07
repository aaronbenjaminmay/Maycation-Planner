import figma from '@figma/code-connect'
import { ScreenHeader } from './ScreenHeader'
import { IconButton } from './IconButton'
import { Badge } from './Badge'

figma.connect(
  ScreenHeader,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=111-115',
  {
    variant: { Layout: 'Title Only' },
    example: () => <ScreenHeader title="My Trips" />,
  }
)

figma.connect(
  ScreenHeader,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=111-115',
  {
    variant: { Layout: 'With Eyebrow' },
    example: () => <ScreenHeader eyebrow="Beach Maycation" title="Day 1" />,
  }
)

figma.connect(
  ScreenHeader,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=111-115',
  {
    variant: { Layout: 'With Meta' },
    example: () => (
      <ScreenHeader
        title="Beach Maycation"
        meta={<span className="muted">Jun 7–12 · Orange Beach</span>}
      />
    ),
  }
)

figma.connect(
  ScreenHeader,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=111-115',
  {
    variant: { Layout: 'With Actions' },
    example: () => (
      <ScreenHeader
        title="My Trips"
        actions={<IconButton icon="add" label="New trip" variant="primary" />}
      />
    ),
  }
)

figma.connect(
  ScreenHeader,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=111-115',
  {
    variant: { Layout: 'All Slots' },
    example: () => (
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
)
