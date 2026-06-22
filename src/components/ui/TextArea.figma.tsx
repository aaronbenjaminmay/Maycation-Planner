import figma from '@figma/code-connect'
import { TextArea } from './TextArea'

figma.connect(
  TextArea,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=85-66',
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
      <TextArea
        label="Notes"
        value="Notes about this trip"
        onChange={() => {}}
        disabled={disabled}
        hint={hint}
      />
    ),
  }
)
