import figma from '@figma/code-connect'
import { TextInput } from './TextInput'

figma.connect(
  TextInput,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=85-50',
  {
    props: {
      disabled: figma.enum('State', {
        Disabled: true,
      }),
      hint: figma.boolean('Show Hint', {
        true: 'Hint text here',
      }),
    },
    example: ({ disabled, hint }) => (
      <TextInput
        label="Trip Name"
        value="Beach Maycation"
        onChange={() => {}}
        disabled={disabled}
        hint={hint}
      />
    ),
  }
)
