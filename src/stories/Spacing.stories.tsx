import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Foundation/Spacing & Radius',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const spacingTokens = [
  { token: '--spacing-2xs', label: '2xs', note: '4px · Tightest spacing' },
  { token: '--spacing-xs', label: 'xs', note: '8px · Tag clusters, pill groups, screen-header gaps' },
  { token: '--spacing-sm', label: 'sm', note: '12px · Form grid gap, list item gap' },
  { token: '--spacing-md', label: 'md', note: '16px · Standard layout gap; modal header, detail header' },
  { token: '--spacing-lg', label: 'lg', note: '18px · Dominant — card padding, page-shell gap, modal gap' },
  { token: '--spacing-xl', label: 'xl', note: '24px · App-shell horizontal padding, panel padding' },
  { token: '--spacing-2xl', label: '2xl', note: '32px · Reserved for future large-spacing use' },
]

const radiusTokens = [
  { token: '--radius-sm', label: 'sm', note: '8px · Small surface radius (account-strip)' },
  { token: '--radius-md', label: 'md', note: '14px · Input fields and feedback messages' },
  { token: '--radius-lg', label: 'lg', note: '20px · Dominant — all card and panel surfaces' },
  { token: '--radius-full', label: 'full', note: '999px · Pills and circular elements' },
]

export const SpacingScale: Story = {
  name: 'Spacing Scale',
  render: () => (
    <div style={{ maxWidth: 500 }}>
      <p
        style={{
          margin: '0 0 20px',
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#a1a1a6',
        }}
      >
        Spacing tokens
      </p>
      {spacingTokens.map(({ token, label, note }) => (
        <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div
            style={{
              height: 20,
              width: `var(${token})`,
              background: 'var(--color-accent-default)',
              borderRadius: 3,
              flexShrink: 0,
              minWidth: 4,
            }}
          />
          <div style={{ flex: 1 }}>
            <code style={{ fontSize: 12, color: '#f5f7fb' }}>
              {token} <span style={{ color: '#5a5a5e' }}>({label})</span>
            </code>
            <span style={{ fontSize: 11, color: '#a1a1a6', display: 'block' }}>{note}</span>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const RadiusScale: Story = {
  name: 'Radius Scale',
  render: () => (
    <div style={{ maxWidth: 540 }}>
      <p
        style={{
          margin: '0 0 20px',
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#a1a1a6',
        }}
      >
        Radius tokens
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {radiusTokens.map(({ token, label, note }) => (
          <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, width: 220 }}>
            <div
              style={{
                width: 80,
                height: 80,
                background: 'var(--color-surface-glass)',
                border: '1px solid var(--color-border-glass)',
                borderRadius: `var(${token})`,
              }}
            />
            <div>
              <code style={{ fontSize: 12, color: '#f5f7fb', display: 'block' }}>
                {token} <span style={{ color: '#5a5a5e' }}>({label})</span>
              </code>
              <span style={{ fontSize: 11, color: '#a1a1a6' }}>{note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
}
