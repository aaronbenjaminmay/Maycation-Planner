import figma from '@figma/code-connect'
import { ModalSheet } from './ModalSheet'

figma.connect(
  ModalSheet,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=35-89',
  {
    props: {
      title: figma.string('Title'),
      eyebrow: figma.enum('Variant', {
        WithEyebrow: 'Trip Details',
      }),
    },
    example: ({ title, eyebrow }) => (
      <ModalSheet
        title={title}
        eyebrow={eyebrow}
        ariaLabel="Modal"
        onClose={() => {}}
      >
        <p>Modal body content</p>
      </ModalSheet>
    ),
  }
)
