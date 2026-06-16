import type { Meta, StoryObj } from '@storybook/react'
import { CardSurface } from '../components/ui/CardSurface'

const meta = {
  title: 'Components/CardSurface',
  component: CardSurface,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CardSurface>

export default meta

type Story = StoryObj<typeof meta>

const cardContent = (
  <div style={{ padding: 20 }}>
    <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Beach Maycation</p>
    <p className="muted" style={{ margin: 0 }}>Jun 7–12 · Orange Beach</p>
  </div>
)

export const Static: Story = {
  name: 'Static (div)',
  render: () => (
    <CardSurface style={{ width: 280 }}>
      {cardContent}
    </CardSurface>
  ),
}

export const Interactive: Story = {
  name: 'Interactive (div — cursor only)',
  render: () => (
    <CardSurface interactive style={{ width: 280 }}>
      {cardContent}
    </CardSurface>
  ),
}

export const AsButton: Story = {
  name: 'As button',
  render: () => (
    <CardSurface as="button" style={{ width: 280, textAlign: 'left' }} onClick={() => {}}>
      {cardContent}
    </CardSurface>
  ),
}

export const WithClassName: Story = {
  name: 'With className — intentional variant (trip-intel-card 0.68)',
  render: () => (
    <CardSurface className="trip-intel-card" style={{ width: 280 }}>
      <div className="trip-intel-card__header">
        <strong>Trip summary</strong>
      </div>
      <dl>
        <div>
          <dt>Days</dt>
          <dd>6</dd>
        </div>
        <div>
          <dt>Complete</dt>
          <dd>4 / 12</dd>
        </div>
      </dl>
    </CardSurface>
  ),
}
