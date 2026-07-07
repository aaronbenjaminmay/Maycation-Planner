import figma from '@figma/code-connect'
import { StatusButton } from './StatusButton'

figma.connect(
  StatusButton,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=76-93',
  {
    variant: { State: 'Incomplete' },
    example: () => (
      <StatusButton label="Dinner reservation" isComplete={false} onToggle={() => {}} />
    ),
  }
)

figma.connect(
  StatusButton,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=76-93',
  {
    variant: { State: 'Complete' },
    example: () => (
      <StatusButton label="Dinner reservation" isComplete={true} onToggle={() => {}} />
    ),
  }
)

figma.connect(
  StatusButton,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=76-93',
  {
    variant: { State: 'ReadOnly' },
    example: () => (
      <StatusButton label="Dinner reservation" isComplete={false} readOnly />
    ),
  }
)

figma.connect(
  StatusButton,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=76-93',
  {
    variant: { State: 'Disabled' },
    example: () => (
      <StatusButton label="Dinner reservation" isComplete={false} disabled />
    ),
  }
)
