import figma from '@figma/code-connect'
import { IconButton } from './IconButton'

figma.connect(
  IconButton,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=25-2',
  {
    props: {
      variant: figma.enum('Variant', {
        Default:     'default',
        Primary:     'primary',
        Destructive: 'destructive',
        Complete:    'complete',
      }),
      selected: figma.enum('State', {
        Selected: true,
      }),
      disabled: figma.enum('State', {
        Disabled: true,
      }),
    },
    example: ({ variant, selected, disabled }) => (
      <IconButton
        variant={variant}
        icon="settings"
        label="Label"
        selected={selected}
        disabled={disabled}
      />
    ),
  }
)
