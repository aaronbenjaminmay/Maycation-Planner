import figma from '@figma/code-connect'
import { Button } from './Button'

figma.connect(
  Button,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=21-2',
  {
    props: {
      variant: figma.enum('Variant', {
        Primary:     'primary',
        Secondary:   'secondary',
        Destructive: 'destructive',
      }),
      disabled: figma.enum('State', {
        Disabled: true,
      }),
      children: figma.string('Label'),
    },
    example: ({ variant, disabled, children }) => (
      <Button variant={variant} disabled={disabled}>{children}</Button>
    ),
  }
)
