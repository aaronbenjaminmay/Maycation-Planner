import figma from '@figma/code-connect'
import { FeedbackMessage } from './FeedbackMessage'

figma.connect(
  FeedbackMessage,
  'https://www.figma.com/design/vB7eK8TT6cXAVZjtDD3aU0/maycation-design-system?node-id=68-71',
  {
    props: {
      tone: figma.enum('Tone', {
        Neutral: 'neutral',
        Error:   'error',
        Success: 'success',
      }),
      children: figma.string('Message'),
    },
    example: ({ tone, children }) => (
      <FeedbackMessage tone={tone}>{children}</FeedbackMessage>
    ),
  }
)
