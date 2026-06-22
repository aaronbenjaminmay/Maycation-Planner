import figma from '@figma/code-connect'
import { FormRow } from './FormRow'

figma.connect(
  FormRow,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=86-42',
  {
    example: () => (
      <FormRow label="Label">
        {/* form control */}
      </FormRow>
    ),
  }
)
