import figma from '@figma/code-connect'
import { FormActions } from './FormActions'
import { Button } from './Button'
import { IconButton } from './IconButton'

figma.connect(
  FormActions,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=92-65',
  {
    variant: { Layout: 'Two Buttons' },
    example: () => (
      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save Trip</Button>
      </FormActions>
    ),
  }
)

figma.connect(
  FormActions,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=92-65',
  {
    variant: { Layout: 'With Leading' },
    example: () => (
      <FormActions
        leading={<IconButton icon="delete" label="Delete trip" variant="destructive" />}
      >
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </FormActions>
    ),
  }
)

figma.connect(
  FormActions,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=92-65',
  {
    variant: { Layout: 'Destructive Confirm Pattern' },
    example: () => (
      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button variant="destructive">Delete Trip</Button>
      </FormActions>
    ),
  }
)

figma.connect(
  FormActions,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=92-65',
  {
    variant: { Layout: 'Single Action' },
    example: () => (
      <FormActions>
        <div />
        <Button variant="primary">Create Trip</Button>
      </FormActions>
    ),
  }
)
