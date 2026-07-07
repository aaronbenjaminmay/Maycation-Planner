import figma from '@figma/code-connect'
import { DayTile } from './DayTile'

figma.connect(
  DayTile,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=256-96',
  {
    variant: { Variant: 'WithDate', Progress: 'Default' },
    example: () => (
      <DayTile
        completedCount={2}
        date="Mon, Jun 9"
        dayNumber={1}
        iconName="plane"
        itemCount={5}
        onOpen={() => {}}
        title="Travel Day"
      />
    ),
  }
)

// Figma's "WithDate, Progress=Complete" variant reuses the same title/date/day
// text as "WithDate, Progress=Default" — only the ProgressPill tone changes
// (completedCount === itemCount). Matches the actual Figma node content
// rather than Storybook's differently-worded "Complete" story.
figma.connect(
  DayTile,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=256-96',
  {
    variant: { Variant: 'WithDate', Progress: 'Complete' },
    example: () => (
      <DayTile
        completedCount={5}
        date="Mon, Jun 9"
        dayNumber={1}
        iconName="plane"
        itemCount={5}
        onOpen={() => {}}
        title="Travel Day"
      />
    ),
  }
)

figma.connect(
  DayTile,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=256-96',
  {
    variant: { Variant: 'WithSubtitle', Progress: 'Default' },
    example: () => (
      <DayTile
        completedCount={1}
        dayNumber={4}
        iconName="calendar"
        itemCount={3}
        onOpen={() => {}}
        subtitle="Disney Springs · 7:00 PM"
        title="Reservations"
      />
    ),
  }
)

// Same reasoning as "WithDate, Progress=Complete" above — Figma reuses the
// "Reservations" / "Disney Springs · 7:00 PM" text for both Progress states.
figma.connect(
  DayTile,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=256-96',
  {
    variant: { Variant: 'WithSubtitle', Progress: 'Complete' },
    example: () => (
      <DayTile
        completedCount={3}
        dayNumber={4}
        iconName="calendar"
        itemCount={3}
        onOpen={() => {}}
        subtitle="Disney Springs · 7:00 PM"
        title="Reservations"
      />
    ),
  }
)

figma.connect(
  DayTile,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=256-96',
  {
    variant: { Variant: 'NoProgress', Progress: 'None' },
    example: () => (
      <DayTile
        completedCount={0}
        date="Wed, Jun 11"
        dayNumber={3}
        iconName="compass"
        itemCount={0}
        onOpen={() => {}}
        title="Explore Day"
      />
    ),
  }
)
