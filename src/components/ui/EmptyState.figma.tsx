import figma from '@figma/code-connect'
import { EmptyState } from './EmptyState'
import { Button } from './Button'

figma.connect(
  EmptyState,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=69-79',
  {
    variant: { Content: 'Title Only' },
    example: () => <EmptyState title="No trips yet" />,
  }
)

figma.connect(
  EmptyState,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=69-79',
  {
    variant: { Content: 'With Body' },
    example: () => (
      <EmptyState title="No items for this day">
        <p>Add reservations, activities, and notes to build your day plan.</p>
      </EmptyState>
    ),
  }
)

figma.connect(
  EmptyState,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=69-79',
  {
    variant: { Content: 'With Action' },
    example: () => (
      <EmptyState
        title="No trips yet"
        action={<Button variant="primary">Create your first trip</Button>}
      />
    ),
  }
)

figma.connect(
  EmptyState,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=69-79',
  {
    variant: { Content: 'Full' },
    example: () => (
      <EmptyState
        title="No items for this day"
        action={<Button variant="primary">Add an item</Button>}
      >
        <p>Reservations, activities, travel, and notes all go here.</p>
      </EmptyState>
    ),
  }
)
