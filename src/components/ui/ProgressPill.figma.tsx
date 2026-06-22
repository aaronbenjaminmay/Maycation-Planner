import figma from '@figma/code-connect'
import { ProgressPill } from './ProgressPill'

figma.connect(
  ProgressPill,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=76-76',
  {
    props: {
      tone: figma.enum('Progress', {
        Default:   'default',
        Complete:  'complete',
        Attention: 'attention',
      }),
    },
    example: ({ tone }) => <ProgressPill tone={tone}>3 of 7</ProgressPill>,
  }
)
