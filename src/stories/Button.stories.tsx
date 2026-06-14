import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../components/ui/Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Save trip',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Delete trip',
    variant: 'destructive',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Save trip',
    variant: 'primary',
    disabled: true,
  },
}

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button variant="primary">Save trip</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="destructive">Delete trip</Button>
      <Button variant="primary" disabled>Disabled</Button>
    </div>
  ),
}
