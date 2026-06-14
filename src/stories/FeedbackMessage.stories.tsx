import type { Meta, StoryObj } from '@storybook/react'
import { FeedbackMessage } from '../components/ui/FeedbackMessage'

const meta = {
  title: 'Components/FeedbackMessage',
  component: FeedbackMessage,
  parameters: { layout: 'centered' },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'error', 'success'],
    },
  },
} satisfies Meta<typeof FeedbackMessage>

export default meta

type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  args: {
    children: 'Your changes have been saved.',
    tone: 'neutral',
  },
}

export const Error: Story = {
  args: {
    children: 'Unable to save trip. Please try again.',
    tone: 'error',
  },
}

export const Success: Story = {
  args: {
    children: 'Trip created successfully.',
    tone: 'success',
  },
}

export const AllTones: Story = {
  name: 'All Tones',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
      <FeedbackMessage tone="neutral">Your changes have been saved.</FeedbackMessage>
      <FeedbackMessage tone="error">Unable to save trip. Please try again.</FeedbackMessage>
      <FeedbackMessage tone="success">Trip created successfully.</FeedbackMessage>
    </div>
  ),
}
