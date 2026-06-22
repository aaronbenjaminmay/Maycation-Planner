import figma from '@figma/code-connect'
import { CardSurface } from './CardSurface'

figma.connect(
  CardSurface,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=35-63',
  {
    props: {
      interactive: figma.enum('Variant', {
        Interactive: true,
      }),
    },
    example: ({ interactive }) => (
      <CardSurface interactive={interactive}>
        <p>Card content</p>
      </CardSurface>
    ),
  }
)
