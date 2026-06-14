import type { Meta, StoryObj } from '@storybook/react'
import { Icon } from '../components/ui/Icon'
import type { IconName } from '../components/ui/Icon'

const meta = {
  title: 'Components/Icon',
  component: Icon,
  parameters: { layout: 'centered' },
  argTypes: {
    name: { control: 'select' },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
    },
  },
} satisfies Meta<typeof Icon>

export default meta

type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: {
    name: 'calendar',
    size: 'default',
  },
}

const allIcons: IconName[] = [
  'add',
  'back',
  'bed',
  'calendar',
  'check',
  'chevron-right',
  'close',
  'compass',
  'delete',
  'edit',
  'image',
  'plane',
  'refresh',
  'settings',
  'sign-out',
  'star',
  'ticket',
  'tree-palm',
  'user-plus',
  'utensils',
  'x-circle',
]

export const Catalog: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 8,
        maxWidth: 560,
      }}
    >
      {allIcons.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '12px 8px',
            background: 'var(--color-surface-glass)',
            border: '1px solid var(--color-border-glass)',
            borderRadius: 10,
          }}
        >
          <Icon name={name} size="default" />
          <code style={{ fontSize: 10, color: '#a1a1a6', textAlign: 'center', wordBreak: 'break-all' }}>{name}</code>
        </div>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Icon name="star" size="small" />
        <code style={{ fontSize: 11, color: '#a1a1a6' }}>small (16px)</code>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Icon name="star" size="default" />
        <code style={{ fontSize: 11, color: '#a1a1a6' }}>default (18px)</code>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Icon name="star" size="large" />
        <code style={{ fontSize: 11, color: '#a1a1a6' }}>large (20px)</code>
      </div>
    </div>
  ),
}
