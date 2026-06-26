# Maycation Design System — Principles

Last updated: v1.27.0

This document is the single source of truth for how the Maycation design system is built, extended, and maintained. It consolidates principles from [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [FIGMA_FOUNDATIONS.md](./FIGMA_FOUNDATIONS.md), and the Storybook `Docs/Design Principles` story.

For component inventory and implementation detail, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md). For token architecture and Figma variable structure, see [FIGMA_FOUNDATIONS.md](./FIGMA_FOUNDATIONS.md).

---

## 1. Design Principles

**1. Prefer subtraction over addition.**
Before adding anything — a field, a label, a card, a component — ask whether removing it makes the interface clearer. The best design decision is often the one that removes something. The system should feel calm.

**2. Reuse existing components.**
If a component already exists in the system, use it. If a pattern already exists, follow it. Do not create a new component for a problem the system already solves. A component that appears in multiple places should be a shared component — shared components cascade changes everywhere they appear.

**3. One system for each concern.**
One card system. One form system. One modal system. One icon system. One spacing system. One typography system. When there is only one way to do something, there is no ambiguity about how it should be done. Duplicate systems create divergence. Divergence creates debt.

**4. Tokens before hardcoded values.**
Before writing any color, shadow, spacing, or radius value, check `tokens/generated/tokens.css`. Use the token. Only hardcode if a token genuinely does not exist and you are prepared to add one. Hardcoded values cannot be changed from one place. Tokens can.

**5. The system should know more than it shows.**
Every screen answers a single primary question. Information that does not support that question should be removed, combined, demoted, or moved closer to where it is needed. Users spend their attention on trip content, not interface chrome.

**6. The visual benchmark is calm, focused, and predictable.**
The objective is consistency, clarity, simplicity, and restraint — not visual complexity or novelty. Reduce cognitive load. Assume user context. Avoid explaining the interface. The system should feel calm, focused, confident, and predictable.

**7. Explicit over inferred.**
Item behavior must come from stored fields (type, status, starts_at, assigned_to), not from parsing titles or display text. Component behavior must come from explicit props, not from CSS class names inferred from context.

---

## 2. Component Rules

**Tier classification — see [DESIGN_SYSTEM.md §Component Classification](./DESIGN_SYSTEM.md#component-classification) for the full taxonomy.**

| Tier | Name | Rule |
|------|------|------|
| T0 | Foundation | Design tokens only. Not React components. |
| T1 | Component | Domain-agnostic. No imports from `src/lib/`. Storybook-documented. |
| T2 | Pattern | Opinionated composition of T1 Components. Domain-agnostic. Encodes Maycation layout conventions. |
| T3 | Product | Maycation-specific. Depends on product data shapes. Not in Storybook. |

**One canonical definition per class.**
Every selector must have exactly one source-of-truth file. Duplication across `App.css` and component CSS is a bug, not a convention.

**T1 Components have no domain imports.**
A component in `src/components/ui/` must not import from `src/lib/`. Domain mappings (e.g., `dayTypeIconMap`) belong in the product screen that uses the component.

**No feature flags or compatibility shims.**
When a class or component is removed, delete all its CSS. Do not leave commented-out rules or `.old-*` aliases.

**New components require a demonstrated gap.**
Do not add a T1 Component or T2 Pattern unless existing components cannot solve the problem without duplication. The system grows only when a gap is clearly identified.

---

## 3. Token Rules

**Three-layer DTCG architecture:**

| Layer | Name | Rule |
|-------|------|------|
| 0 | Primitive | Raw values. Opaque colors only. Referenced by Semantic, never by components. |
| 1 | Semantic | Context-aware aliases. Used by components in CSS and Figma. |
| 2 | Component | Per-component overrides. Deferred — not yet implemented. |

**Primitive colors are always opaque.**
Alpha/transparency is never baked into a primitive color token. Composited RGBA colors (glass surfaces, overlays, border alpha) exist only at the semantic layer, expressed as inline `rgba()` values documented with their primitive components.

**Adding a new token requires a clear semantic use case.**
Do not add a token that overlaps an existing one. Do not add a product-specific token to the semantic namespace. Run `npm run build:tokens` after any change to `tokens/source/*.tokens.json`. If the token has a Figma counterpart, create the matching Figma variable in the same release.

**Do not use the semantic layer for product-domain values.**
Product colors (kind/role badges) use `color.kind.*` and `color.role.*` namespaces. Semantic tokens (`color.surface.*`, `color.text.*`, etc.) are system-level, not product-level.

---

## 4. CSS Implementation Rules

**CSS Ownership (see [DESIGN_SYSTEM.md §CSS Ownership Rules](./DESIGN_SYSTEM.md#css-ownership-rules) for full detail):**

1. **Component CSS** belongs co-located with its component (`badge.css`, `forms.css`). Never redefine in `App.css`.
2. **App.css** owns product-screen layout, shell structure, the visual system passes, and product-pattern utilities.
3. **No duplicates.** A class in both a component file and `App.css` is a guaranteed conflict between app and Storybook.
4. **Token variables everywhere.** `var(--color-*)`, `var(--spacing-*)`, etc. are defined in `tokens/generated/tokens.css`. Use them.
5. **tokens-bridge.css** maps legacy shorthand variables to token names. New code must use full token names, not bridge shorthands.

**App.css is layered by design.**
`App.css` has multiple refinement passes (§1–13). Later passes override earlier ones. Do not remove an early-pass definition without verifying the later-pass override covers all the same selectors.

---

## 5. Opacity Handling

The Maycation opacity rule is the single most important implementation constraint. It applies to both CSS and Figma.

**The rule: primitive colors are always opaque. Transparency is a separate concern applied at the correct layer.**

**In CSS:**
- Use composited `rgba()` values on containers, never element-level `opacity:` — element-level opacity dims all children including text.
- Use the token composite: `background: var(--color-surface-glass)` (outputs `rgba(28, 28, 30, 0.72)`).
- Intentional variants that deviate from the canonical value use inline `rgba()` with a documentation comment: `/* Color/Neutral 800 × 0.68 — intentional variant */`.

**In Figma:**
- Use opaque color primitives (`Color/Neutral 800`, `Color/White`, `Color/Black`).
- Apply opacity as a separate `Opacity/*` variable at the paint/fill/stroke layer (not element-level opacity on the component frame).

**When element-level opacity is acceptable:**

| Case | Reason |
|------|--------|
| Disabled state (`opacity: var(--opacity-disabled-default)`) | Disabled components dim all properties uniformly; no live text interaction |
| `::before`/`::after` pseudo-element overlays | Pseudo-elements have no children |
| `.modal-backdrop` (standalone element, no text children) | `rgba()` preferred but element opacity also safe |

See [FIGMA_FOUNDATIONS.md §8](./FIGMA_FOUNDATIONS.md) for the full Figma vs. CSS comparison table and the complete semantic composite documentation.

---

## 6. Figma Rules

**Variable naming:**
- Figma uses Title Case with spaces. CSS uses `kebab-case`. Transform: `color.surface.glass` → Figma: `Surface/Glass` → CSS: `--color-surface-glass`.
- Groups use `/` prefix notation. Everything before the last `/` is the folder.
- Primitive names describe the value, not the role: `Neutral 800`, not `Card Background`.
- Semantic names describe the role, not the appearance: `Surface/Glass`, not `Surface/Dark Transparent`.
- Do not include the collection name in the variable name.

**Variable binding:**
- Bind component fills and strokes to Semantic variables, not to Primitive colors directly.
- Bind fill and stroke opacity to Semantic opacity variables (`Semantic/Opacity/*`).
- COMPONENT_SET fills (canvas background frames) are editor-only artifacts. Do not bind them — they have no production effect.
- Do not use element-level opacity in Figma to simulate surface transparency.

**Code Connect:**
- Every T1 Component and T2 Pattern should have a Code Connect `.figma.tsx` mapping.
- Code Connect prop names must match React prop names exactly.
- Figma variant values must match React prop values exactly (case-sensitive).

See [FIGMA_FOUNDATIONS.md §8 — MCP / Code Connect Considerations](./FIGMA_FOUNDATIONS.md) for the current wiring status and naming alignment table.
