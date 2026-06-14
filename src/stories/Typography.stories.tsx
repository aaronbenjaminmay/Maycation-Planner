import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Foundation/Typography',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const TypeScale: Story = {
  name: 'Type Scale',
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 40 }}>
        <p
          style={{
            margin: '0 0 4px',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#a1a1a6',
          }}
        >
          Tokens: typography.eyebrow
        </p>
        <p className="eyebrow" style={{ margin: 0 }}>Trip Dashboard</p>
        <code style={{ fontSize: 11, color: '#5a5a5e', marginTop: 6, display: 'block' }}>
          11px · weight 900 · tracking 0.18em · uppercase
        </code>
      </div>

      <div style={{ marginBottom: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28 }}>
        <p
          style={{
            margin: '0 0 4px',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#a1a1a6',
          }}
        >
          Tokens: typography.label
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--typography-label-font-size)',
            fontWeight: 'var(--typography-label-font-weight)',
            letterSpacing: 'var(--typography-label-letter-spacing)',
            lineHeight: 'var(--typography-label-line-height)',
            textTransform: 'var(--typography-label-text-transform)' as React.CSSProperties['textTransform'],
            color: 'var(--color-text-primary)',
          }}
        >
          Destination
        </p>
        <code style={{ fontSize: 11, color: '#5a5a5e', marginTop: 6, display: 'block' }}>
          12px · weight 900 · tracking 0.08em · uppercase
        </code>
      </div>

      <div style={{ marginBottom: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28 }}>
        <p
          style={{
            margin: '0 0 4px',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#a1a1a6',
          }}
        >
          Tokens: typography.caption · Base body text (index.css)
        </p>
        <p style={{ margin: 0, fontSize: 'var(--typography-caption-font-size)', color: 'var(--color-text-secondary)' }}>
          Beach Maycation · Jun 7–12 · Orange Beach
        </p>
        <code style={{ fontSize: 11, color: '#5a5a5e', marginTop: 6, display: 'block' }}>
          13px · weight 400 · system-ui
        </code>
      </div>

      <div style={{ marginBottom: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28 }}>
        <p
          style={{
            margin: '0 0 4px',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#a1a1a6',
          }}
        >
          Body text · .muted utility class
        </p>
        <p className="muted" style={{ margin: 0 }}>
          3 of 7 items completed
        </p>
        <code style={{ fontSize: 11, color: '#5a5a5e', marginTop: 6, display: 'block' }}>
          font-size: inherit · color: #a1a1a6 (--color-text-muted)
        </code>
      </div>

      <div style={{ marginBottom: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28 }}>
        <p
          style={{
            margin: '0 0 4px',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#a1a1a6',
          }}
        >
          Display heading (h1)
        </p>
        <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 10vw, 3.25rem)' }}>Maycation</h1>
        <code style={{ fontSize: 11, color: '#5a5a5e', marginTop: 6, display: 'block' }}>
          clamp(2rem, 10vw, 3.25rem) · weight 700 · color-text-primary
        </code>
      </div>
    </div>
  ),
}
