const meta = {
  title: 'Docs/Design Principles',
  parameters: { layout: 'padded' },
}

export default meta

export const Page = {
  name: 'Design Principles',
  render: () => (
    <div style={{ maxWidth: 680, padding: '32px 16px', fontFamily: 'inherit' }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>Maycation Design System</p>
      <h1 style={{ marginBottom: 32 }}>Design Principles</h1>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>1. Prefer subtraction over addition</h2>
        <p>Before adding anything — a field, a label, a card, a component — ask whether removing it would make the interface clearer. The best design decision is often the one that removes something.</p>
        <p style={{ marginTop: 12 }}>The system should feel calm. A screen that does less, does it better.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>2. Reuse existing components</h2>
        <p>If a component already exists in the system, use it. If a pattern already exists, follow it. Do not create a new component for a problem the system already solves.</p>
        <p style={{ marginTop: 12 }}>A component that appears in multiple places once should be a shared component. Shared components cascade changes everywhere they appear.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>3. One system for each concern</h2>
        <p>One card system. One form system. One modal system. One icon system. One spacing system. One typography system.</p>
        <p style={{ marginTop: 12 }}>When there is only one way to do something, there is no ambiguity about how it should be done. Duplicate systems create divergence. Divergence creates debt.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>4. Tokens before hardcoded values</h2>
        <p>Before writing any color, shadow, spacing, or radius value, check <code>tokens/generated/tokens.css</code>. Use the token. Only hardcode if a token genuinely does not exist and you are prepared to add one.</p>
        <p style={{ marginTop: 12 }}>Hardcoded values cannot be changed from one place. Tokens can.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>5. The system should know more than it shows</h2>
        <p>Every screen should answer a single primary question. Information that does not support that question should be removed, combined, demoted, or moved closer to where it is actually needed.</p>
        <p style={{ marginTop: 12 }}>Users spend their attention on trip content, not interface chrome.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>6. Disney Mayhem is the visual benchmark</h2>
        <p>Disney Mayhem succeeded because it reduced cognitive load. It assumed user context. It avoided administrative interfaces. It avoided explaining itself.</p>
        <p style={{ marginTop: 12 }}>The objective is not visual imitation. The objective is consistency, clarity, simplicity, and restraint — the same qualities that made Disney Mayhem feel right to use on a real family vacation day.</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 16 }}>7. Explicit over inferred</h2>
        <p>Item behavior must come from stored fields (type, status, starts_at, assigned_to), not from parsing titles or display text. Components must not infer intent from user-entered prose.</p>
        <p style={{ marginTop: 12 }}>This rule applies to the design system too: component behavior should come from explicit props, not from CSS class names inferred from context.</p>
      </section>
    </div>
  ),
}
