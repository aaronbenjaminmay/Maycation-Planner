import figma from '@figma/code-connect'
import { SelectInput } from './SelectInput'

figma.connect(
  SelectInput,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=85-88',
  {
    props: {
      disabled: figma.enum('State', {
        Disabled: true,
      }),
      hint: figma.boolean('Show Hint', {
        true: 'Hint text here',
        false: undefined,
      }),
    },
    example: ({ disabled, hint }) => (
      <SelectInput
        label="Timezone"
        value="option-1"
        onChange={() => {}}
        options={[
          { value: 'option-1', label: 'Option 1' },
          { value: 'option-2', label: 'Option 2' },
        ]}
        disabled={disabled}
        hint={hint}
      />
    ),
  }
)
