import figma from '@figma/code-connect'
import { FormGrid } from './FormGrid'
import { TextInput } from './TextInput'

figma.connect(
  FormGrid,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=86-54',
  {
    example: () => (
      <FormGrid>
        <TextInput label="Start Date" type="date" value="2025-06-07" onChange={() => {}} />
        <TextInput label="End Date" type="date" value="2025-06-12" onChange={() => {}} />
      </FormGrid>
    ),
  }
)
