import type { Meta, StoryObj } from '@storybook/react'
import { IconButton } from '../components/ui/IconButton'

const meta = {
  title: 'Components/Actions/IconButton',
  component: IconButton,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'destructive', 'complete'],
    },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof IconButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: 'settings',
    label: 'Settings',
    variant: 'default',
  },
}

export const Primary: Story = {
  args: {
    icon: 'add',
    label: 'Add item',
    variant: 'primary',
  },
}

export const Destructive: Story = {
  args: {
    icon: 'delete',
    label: 'Delete',
    variant: 'destructive',
  },
}

export const Complete: Story = {
  name: 'Complete (unchecked)',
  args: {
    icon: 'check',
    label: 'Mark complete',
    variant: 'complete',
    selected: false,
  },
}

export const CompleteSelected: Story = {
  name: 'Complete (checked)',
  args: {
    icon: 'check',
    label: 'Completed',
    variant: 'complete',
    selected: true,
  },
}

export const Disabled: Story = {
  args: {
    icon: 'settings',
    label: 'Settings',
    disabled: true,
  },
}

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <IconButton icon="settings" label="Default" variant="default" />
      <IconButton icon="add" label="Primary" variant="primary" />
      <IconButton icon="delete" label="Destructive" variant="destructive" />
      <IconButton icon="check" label="Complete" variant="complete" />
      <IconButton icon="check" label="Complete selected" variant="complete" selected />
      <IconButton icon="settings" label="Disabled" disabled />
    </div>
  ),
}
