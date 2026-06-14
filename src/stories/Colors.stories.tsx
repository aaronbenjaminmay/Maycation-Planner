import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Foundation/Colors',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

type SwatchProps = {
  token: string
  label: string
  note?: string
}

function Swatch({ token, label, note }: SwatchProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `var(${token})`,
          border: '1px solid rgba(255,255,255,0.12)',
          flexShrink: 0,
        }}
      />
      <div>
        <code style={{ fontSize: 12, color: '#f5f7fb', display: 'block' }}>{token}</code>
        <span style={{ fontSize: 12, color: '#a1a1a6' }}>{label}</span>
        {note ? <span style={{ fontSize: 11, color: '#5a5a5e', display: 'block' }}>{note}</span> : null}
      </div>
    </div>
  )
}

type GroupProps = {
  title: string
  children: React.ReactNode
}

function Group({ title, children }: GroupProps) {
  return (
    <div style={{ marginBottom: 36 }}>
      <p
        style={{
          margin: '0 0 16px',
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#a1a1a6',
        }}
      >
        {title}
      </p>
      {children}
    </div>
  )
}

export const ColorPalette: Story = {
  name: 'Color Palette',
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Group title="Background">
        <Swatch token="--color-background-default" label="App background" note="#000000" />
        <Swatch token="--color-surface-default" label="Panel background" note="#121316" />
        <Swatch token="--color-surface-elevated" label="Elevated control surface" note="#1a1c20" />
        <Swatch token="--color-surface-glass" label="Card / modal surface (glass)" note="rgba(28, 28, 30, 0.74)" />
        <Swatch token="--color-surface-input" label="Form input background" note="rgba(0, 0, 0, 0.28)" />
      </Group>

      <Group title="Border">
        <Swatch token="--color-border-default" label="Opaque border" note="#2b2d32" />
        <Swatch token="--color-border-glass" label="Glass surface border" note="rgba(255, 255, 255, 0.08)" />
        <Swatch token="--color-border-control" label="Interactive control border" note="rgba(255, 255, 255, 0.1)" />
      </Group>

      <Group title="Text">
        <Swatch token="--color-text-primary" label="Headings, strong text, labels" note="#f5f7fb" />
        <Swatch token="--color-text-secondary" label="Body text" note="#b6bfcc" />
        <Swatch token="--color-text-muted" label="Metadata, summaries" note="#a1a1a6" />
      </Group>

      <Group title="Accent">
        <Swatch token="--color-accent-default" label="Brand accent" note="#35b8a8" />
        <Swatch token="--color-accent-text" label="Text on accent backgrounds" note="#061312" />
      </Group>

      <Group title="Danger">
        <Swatch token="--color-danger-surface" label="Danger action background" note="rgba(168, 75, 75, 0.2)" />
        <Swatch token="--color-danger-border" label="Danger action border" note="#a84b4b" />
        <Swatch token="--color-danger-text" label="Danger state text" note="#ffd7d7" />
      </Group>

      <Group title="Overlay">
        <Swatch token="--color-overlay-default" label="Modal backdrop" note="rgba(0, 0, 0, 0.78)" />
      </Group>
    </div>
  ),
}
