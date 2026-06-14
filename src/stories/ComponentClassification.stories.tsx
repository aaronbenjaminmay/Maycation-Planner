const meta = {
  title: 'Docs/Component Classification',
  parameters: { layout: 'padded' },
}

export default meta

const sectionStyle: React.CSSProperties = { marginBottom: 40 }
const codeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 4,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  fontFamily: 'monospace',
  fontSize: 13,
}
const tierStyle: React.CSSProperties = {
  padding: '16px 20px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(28,28,30,0.74)',
  marginBottom: 12,
}

export const Page = {
  name: 'Component Classification',
  render: () => (
    <div style={{ maxWidth: 680, padding: '32px 16px', fontFamily: 'inherit' }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>Maycation Design System</p>
      <h1 style={{ marginBottom: 16 }}>Component Classification</h1>
      <p style={{ marginBottom: 40 }}>
        Maycation components are classified into four tiers. Each tier has a defined purpose, a set of rules, and a place in the system hierarchy.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        <span style={codeStyle}>Foundation</span>
        <span className="muted">→</span>
        <span style={codeStyle}>Component</span>
        <span className="muted">→</span>
        <span style={codeStyle}>Pattern</span>
        <span className="muted">→</span>
        <span style={codeStyle}>Product</span>
      </div>

      <section style={sectionStyle}>
        <div style={tierStyle}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Tier 0</p>
          <h2 style={{ marginBottom: 8 }}>Foundation</h2>
          <p style={{ marginBottom: 12 }}>
            The raw material of the design system. Foundations are not React components — they are design decisions expressed as tokens, type scales, spacing scales, and color systems.
          </p>
          <p className="muted" style={{ marginBottom: 12 }}>Rules: No React. No props. No behavior. Just values.</p>
          <p><strong>Examples from Maycation:</strong></p>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li>Color tokens (<code>--color-accent-default</code>, <code>--color-surface-glass</code>)</li>
            <li>Spacing scale (<code>--spacing-xs</code> through <code>--spacing-xl</code>)</li>
            <li>Radius scale (<code>--radius-sm</code> through <code>--radius-full</code>)</li>
            <li>Typography scale (eyebrow, label, caption, body, h1)</li>
          </ul>
        </div>

        <div style={tierStyle}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Tier 1</p>
          <h2 style={{ marginBottom: 8 }}>Component</h2>
          <p style={{ marginBottom: 12 }}>
            Domain-agnostic React components. Components are fully reusable in any React application with no imports from <code>lib/</code> and no Maycation-specific logic.
          </p>
          <p className="muted" style={{ marginBottom: 12 }}>Rules: No product domain imports. Storybook-ready. Props drive all behavior.</p>
          <p><strong>Examples from Maycation:</strong></p>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li><code>Button</code>, <code>IconButton</code> — action components</li>
            <li><code>CardSurface</code>, <code>ModalSheet</code> — surface components</li>
            <li><code>Badge</code>, <code>FeedbackMessage</code>, <code>EmptyState</code> — feedback components</li>
            <li><code>TextInput</code>, <code>SelectInput</code>, <code>TextArea</code>, <code>FormRow</code> — form components</li>
            <li><code>ScreenHeader</code>, <code>PageControls</code> — navigation components</li>
            <li><code>Icon</code> — icon system</li>
          </ul>
        </div>

        <div style={tierStyle}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Tier 2</p>
          <h2 style={{ marginBottom: 8 }}>Pattern</h2>
          <p style={{ marginBottom: 12 }}>
            Opinionated compositions built from Components. Patterns encode a specific layout or interaction convention, but remain domain-agnostic. They may import other Components but not product logic.
          </p>
          <p className="muted" style={{ marginBottom: 12 }}>Rules: Composes Components. No product domain imports. Reflects Maycation layout conventions.</p>
          <p><strong>Examples from Maycation:</strong></p>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li><code>DashboardCard</code> — composes <code>CardSurface</code> with an opinionated content layout</li>
            <li><code>DetailHeader</code> — composes <code>PageControls</code> + <code>ScreenHeader</code> for the canonical detail-screen header</li>
          </ul>
        </div>

        <div style={tierStyle}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Tier 3</p>
          <h2 style={{ marginBottom: 8 }}>Product</h2>
          <p style={{ marginBottom: 12 }}>
            Maycation-specific components. Product components carry domain knowledge, import from <code>lib/</code>, and depend on specific data shapes or product flows. They live in <code>src/components/ui/</code> today but are not Storybook-ready.
          </p>
          <p className="muted" style={{ marginBottom: 12 }}>Rules: Can import product logic. Not documented in Storybook. Should migrate toward Components if coupling decreases.</p>
          <p><strong>Examples from Maycation:</strong></p>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li><code>DayTile</code> — accepts <code>iconName?: IconName</code>; icon-to-day-type mapping lives in the screen</li>
            <li>Trip cards, reservation cards, planner item cards (in <code>src/components/</code>)</li>
          </ul>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginBottom: 16 }}>Why this matters</h2>
        <p style={{ marginBottom: 12 }}>
          This classification exists to protect the design system from product coupling and to make components predictable for tooling — Storybook, Figma Code Connect, and AI-assisted development all benefit from components that carry no hidden assumptions about where they are used.
        </p>
        <p>
          When a Component grows product logic, it should be split or promoted to a Pattern. When a Pattern becomes product-specific, it should be moved to Product and replaced with a more general Pattern.
        </p>
      </section>
    </div>
  ),
}
