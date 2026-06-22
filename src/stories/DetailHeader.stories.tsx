import type { Meta } from '@storybook/react'
import { DetailHeader } from '../components/ui/DetailHeader'
import { IconButton } from '../components/ui/IconButton'

const meta = {
  title: 'Patterns/DetailHeader',
  component: DetailHeader,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DetailHeader>

export default meta

// PageControls renders as position:fixed — it pins to the top of the viewport.
// The shell padding (mirrors .dashboard-shell) clears the fixed pill so ScreenHeader
// content is not overlapped. Without this wrapper the pill overlays the title in Storybook.
const shellStyle = {
  paddingTop: 'calc(var(--spacing-md) + var(--spacing-xs) * 2 + 40px + var(--spacing-md))',
  paddingLeft: 'var(--spacing-xl)',
  paddingRight: 'var(--spacing-xl)',
  paddingBottom: 'var(--spacing-lg)',
  minHeight: '200px',
}

export const Default = {
  name: 'Back and title',
  render: () => (
    <div style={shellStyle}>
      <DetailHeader title="Day 1" onBack={() => {}} />
    </div>
  ),
}

export const WithEyebrow = {
  name: 'With eyebrow',
  render: () => (
    <div style={shellStyle}>
      <DetailHeader eyebrow="Beach Maycation" title="Day 1" onBack={() => {}} />
    </div>
  ),
}

export const WithAction = {
  name: 'With trailing action',
  render: () => (
    <div style={shellStyle}>
      <DetailHeader
        title="Day 1"
        onBack={() => {}}
        action={<IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />}
      />
    </div>
  ),
}

export const WithSettings = {
  name: 'With settings action',
  render: () => (
    <div style={shellStyle}>
      <DetailHeader
        title="Beach Maycation"
        onBack={() => {}}
        action={<IconButton icon="settings" label="Trip settings" onClick={() => {}} />}
      />
    </div>
  ),
}

// All slots filled with a single trailing action. DayDetail is the production
// reference for the maximum-slot pattern — it passes a flex row of two buttons
// via the action prop (see WithMultipleActions below).
export const Full = {
  name: 'All slots',
  render: () => (
    <div style={shellStyle}>
      <DetailHeader
        eyebrow="Beach Maycation"
        title="Day 1"
        meta={<span className="muted">Sunday, Jun 7</span>}
        onBack={() => {}}
        action={<IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />}
      />
    </div>
  ),
}

// titleContent replaces the entire ScreenHeader content area (title, eyebrow, meta are ignored).
// Use this escape hatch when a screen needs product-specific header content — e.g. a trip photo,
// a custom layout, or a media block. The nav bar row (back button + action) is always rendered.
export const WithTitleContent = {
  name: 'titleContent override',
  render: () => (
    <div style={shellStyle}>
      <DetailHeader
        title="Ignored when titleContent is set"
        eyebrow="Also ignored"
        onBack={() => {}}
        action={<IconButton icon="settings" label="Trip settings" onClick={() => {}} />}
        titleContent={
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: '14px 0 2px',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Beach Maycation
            </span>
            <span style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 900, color: 'var(--color-text-primary)', lineHeight: 1.05 }}>
              Custom header block
            </span>
            <span className="muted" style={{ fontSize: 13 }}>
              titleContent replaces ScreenHeader entirely — title/eyebrow/meta props are not rendered
            </span>
          </div>
        }
      />
    </div>
  ),
}

// Matches the DayDetail production usage: two IconButtons in a flex row passed as action.
// action accepts any ReactNode — a single button is conventional but not enforced.
export const WithMultipleActions = {
  name: 'Multiple trailing actions',
  render: () => (
    <div style={shellStyle}>
      <DetailHeader
        eyebrow="Beach Maycation"
        title="Day 1"
        meta={<span className="muted">Sunday, Jun 7</span>}
        onBack={() => {}}
        action={
          <div style={{ display: 'flex', gap: 4 }}>
            <IconButton icon="edit" label="Edit day" onClick={() => {}} />
            <IconButton icon="add" label="Add item" variant="primary" onClick={() => {}} />
          </div>
        }
      />
    </div>
  ),
}
