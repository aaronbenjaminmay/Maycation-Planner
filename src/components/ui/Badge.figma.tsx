import figma from '@figma/code-connect'
import { Badge } from './Badge'

figma.connect(
  Badge,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=67-77',
  {
    props: {
      tone: figma.enum('Tone', {
        Neutral:   'neutral',
        Accent:    'accent',
        Info:      'info',
        Secondary: 'secondary',
        Warning:   'warning',
        Danger:    'danger',
      }),
    },
    example: ({ tone }) => <Badge tone={tone}>Label</Badge>,
  }
)
