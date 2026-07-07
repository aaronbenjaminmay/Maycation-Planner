import figma from '@figma/code-connect'
import { PageControls } from './PageControls'
import { IconButton } from './IconButton'
import { Button } from './Button'

figma.connect(
  PageControls,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=111-158',
  {
    variant: { Layout: 'Back / Add' },
    example: () => (
      <PageControls
        leading={<IconButton icon="back" label="Back" onClick={() => {}} />}
        trailing={<IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />}
      />
    ),
  }
)

figma.connect(
  PageControls,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=111-158',
  {
    variant: { Layout: 'Back Only' },
    example: () => (
      <PageControls leading={<IconButton icon="back" label="Back" onClick={() => {}} />} />
    ),
  }
)

figma.connect(
  PageControls,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=111-158',
  {
    variant: { Layout: 'Back / Settings' },
    example: () => (
      <PageControls
        leading={<IconButton icon="back" label="Back" onClick={() => {}} />}
        trailing={<IconButton icon="settings" label="Trip settings" onClick={() => {}} />}
      />
    ),
  }
)

figma.connect(
  PageControls,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=111-158',
  {
    variant: { Layout: 'With Sign out' },
    example: () => (
      <PageControls
        leading={<IconButton icon="back" label="Cancel" onClick={() => {}} />}
        trailing={<Button variant="primary">Save</Button>}
      />
    ),
  }
)

// The "Back / Edit / Add" Figma variant has no dedicated PageControls Storybook
// story, but the same multi-action composition (a flex-wrapped group of
// IconButtons in a single trailing slot) is already an established pattern —
// see DetailHeader's "WithMultipleActions" story, which routes through
// PageControls' trailing slot the same way.
figma.connect(
  PageControls,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=111-158',
  {
    variant: { Layout: 'Back / Edit / Add' },
    example: () => (
      <PageControls
        leading={<IconButton icon="back" label="Back" onClick={() => {}} />}
        trailing={
          <div style={{ display: 'flex', gap: 4 }}>
            <IconButton icon="edit" label="Edit day" onClick={() => {}} />
            <IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />
          </div>
        }
      />
    ),
  }
)
