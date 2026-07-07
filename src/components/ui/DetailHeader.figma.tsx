import figma from '@figma/code-connect'
import { DetailHeader } from './DetailHeader'
import { IconButton } from './IconButton'
import { Badge } from './Badge'

figma.connect(
  DetailHeader,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=236-81',
  {
    variant: { Variant: 'Default' },
    example: () => <DetailHeader title="Day 1" onBack={() => {}} />,
  }
)

// The nested PageControls instance for this variant uses Layout="Back / Settings"
// (confirmed via the component's descendant tree) — a settings action, not the
// "Add" action the outer variant name suggests. Matches the WithSettings story's
// content rather than WithAction's.
figma.connect(
  DetailHeader,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=236-81',
  {
    variant: { Variant: 'WithAction' },
    example: () => (
      <DetailHeader
        title="Day 1"
        onBack={() => {}}
        action={<IconButton icon="settings" label="Trip settings" onClick={() => {}} />}
      />
    ),
  }
)

// The nested PageControls instance for this variant uses Layout="Back / Edit / Add"
// (two trailing IconButtons), and the nested ScreenHeader instance uses
// Layout="All Slots" (eyebrow + title + meta, with a Badge in the meta slot).
// This matches the WithMultipleActions story's action composition and reuses
// ScreenHeader's own published "All Slots" meta content (span + Badge), not the
// single-action "Full" story, which doesn't include either.
figma.connect(
  DetailHeader,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=236-81',
  {
    variant: { Variant: 'Full' },
    example: () => (
      <DetailHeader
        eyebrow="Beach Maycation"
        title="Day 1"
        meta={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="muted">Sunday, Jun 7</span>
            <Badge tone="accent">3 items</Badge>
          </div>
        }
        onBack={() => {}}
        action={
          <div style={{ display: 'flex', gap: 4 }}>
            <IconButton icon="edit" label="Edit day" onClick={() => {}} />
            <IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />
          </div>
        }
      />
    ),
  }
)
