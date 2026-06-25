# Token Debt

Gaps between the current semantic token layer and actual component usage, discovered during Figma component builds (Feedback group, 2026-06-15) and the Token Cleanup Audit (2026-06-15).

Items marked **[RESOLVED v1.7.0]** or **[RESOLVED v1.8.0]** have been fixed and are retained for audit trail only.

---

## [RESOLVED v1.7.0] Product-Role Tokens Leaking Into Badge

Three Badge variants previously referenced product-domain tokens directly. This violated the semantic layer contract — components must not depend on product tokens.

**Fix applied in v1.7.0:**
- `color.info.border` → `Color/Blue 500` (replaces `color.role.editor`)
- `color.warning.border` → `Color/Amber 500` (replaces `color.kind.reservation`)
- `color.secondary.border` → `Color/Purple 500` (replaces `color.role.viewer`)

`badge.css` now references only `--color-info-border`, `--color-warning-border`, and `--color-secondary-border`.

---

## [RESOLVED v1.7.0] Missing Warning Semantic Token

`color.warning.border` created in v1.7.0. See above.

---

## [RESOLVED v1.7.0] Missing Info Semantic Token

`color.info.border` created in v1.7.0. See above.

---

## [RESOLVED v1.8.0] Missing Success Semantic Tokens

Three semantic tokens created for FeedbackMessage success state.

**Fix applied in v1.8.0:**
- `color.success.surface` → `rgba(53,184,168,0.08)` (Teal 500 × 8%)
- `color.success.border` → `rgba(53,184,168,0.30)` (Teal 500 × 30%)
- `color.success.text` → `{color.accent.default}` (Teal 500 fully opaque)
- `opacity.primitive.30` added to primitive scale for Figma binding
- `opacity.success.surface` and `opacity.success.border` added for Figma binding

`App.css .feedback--success` now references `var(--color-success-border)`, `var(--color-success-surface)`, `var(--color-success-text)`.

---

## [RESOLVED v1.8.0] Disabled Opacity Not Wired

`opacity.disabled.default` token existed at 0.4 but CSS used hardcoded 0.65 — a discrepancy between the token value and the current rendered appearance.

**Fix applied in v1.8.0:**
- Updated `opacity.disabled.default` from 0.4 → 0.65 to match the current visual appearance.
- Added `opacity.primitive.65` to the primitive scale.
- Wired `opacity: var(--opacity-disabled-default)` in: `forms.css .form-control:disabled`, `App.css .auth-form button:disabled`, `App.css .button:disabled`, `App.css .icon-button:disabled`.

---

## [RESOLVED v1.8.0] Missing Neutral Surface Opacity Tokens

Two off-scale opacity values had no semantic aliases. Chose to tokenize at actual values (not snap to scale) to preserve visual output.

**Fix applied in v1.8.0:**
- `color.surface.badge` → `rgba(0,0,0,0.22)` (Black × 22%) + `opacity.primitive.22` + `opacity.surface.badge`
- `color.surface.feedback-neutral` → `rgba(255,255,255,0.05)` (White × 5%) + `opacity.primitive.5` + `opacity.surface.feedback-neutral`
- `badge.css` updated: `background: var(--color-surface-badge)`
- `App.css .feedback` updated: `background: var(--color-surface-feedback-neutral)`, `border-color: var(--color-border-glass)`

**Decision:** Added off-scale primitives (5, 22, 30) intentionally rather than snapping to scale neighbors. Snapping would have changed the visual appearance, which was out of scope for v1.8.0.

---

## [RESOLVED v1.8.0] Muted Color Inconsistency

`#a1a1a6` hardcoded in 5 App.css selectors. All replaced with `var(--color-text-muted)`.

**Remaining:** `forms.css select.form-control background-image` SVG stroke (`%23a1a1a6`) cannot use a CSS variable — it is URL-encoded inside a `data:image/svg+xml` value. This is a known browser limitation; the hardcoded value is retained intentionally.

| Location | Status |
|---|---|
| `App.css .trip-intel-card dt` | Fixed |
| `App.css .trip-dashboard .day-tile__icon` | Fixed |
| `App.css .trip-dashboard .day-tile__summary` | Fixed |
| `App.css .screen-header__meta, .muted, .day-tile__summary, .planner-item-card p` | Fixed |
| `App.css .day-tile__icon` | Fixed |
| `forms.css select.form-control background-image SVG stroke` | **Cannot fix** — data URL limitation |

---

## [RESOLVED v1.9.0] Hardcoded Color in icon-button--complete

`App.css .icon-button--complete` previously used `color: #d7d7dc` (hardcoded).

**Fix applied in v1.9.0:**
- Added `color.primitive.neutral-250` primitive (`#d7d7dc`) to `color.tokens.json`
- Added `color.icon.complete` semantic token aliasing neutral-250
- Rebuilt token pipeline — `--color-icon-complete: #d7d7dc` emitted in `tokens/generated/tokens.css`
- `App.css .icon-button--complete` updated: `color: var(--color-icon-complete)`

All 14 `rgba(255,255,255,0.08)` and one `rgba(255,255,255,0.07)` border instances were also replaced with `var(--color-border-glass)` in the same release.

---

## [RESOLVED v1.10.0] Fluid Type Token

`--typography-title-font-size: clamp(1.8rem, 6vw, 2.55rem)` now exists in the token pipeline. The token was already present in `tokens/generated/tokens.css` at the time of the v1.10.0 audit.

**Fix applied in v1.10.0:**
- `App.css §7 .screen-header h1` updated: `font-size: var(--typography-title-font-size)` (no visual change — same clamp value)
- Figma parity gap (static 28px vs. fluid render) remains a CSS-only effect; cannot be represented as a variable binding. This is an accepted parity limitation documented in Navigation: CSS-Only Effects below.

---

## [RESOLVED v1.25.0] Tranche B — Deferred Figma Token Bindings

Remaining 36 hardcoded production Figma values from the v1.24.0 audit, resolved by deliberate architecture decisions. 28 bound; 5 left unchanged by intent; 3 already in CSS, closed without new tokens.

**New primitives added to `opacity.tokens.json` and Figma Primitives collection:**

| Variable | Value | Figma ID |
|---|---|---|
| `Color/Black/Opacity 34` | `rgba(0,0,0,0.34)` | `VariableID:292:3` |
| `Color/White/Opacity 14` | `rgba(255,255,255,0.14)` | `VariableID:292:4` |
| `Color/White/Opacity 22` | `rgba(255,255,255,0.22)` | `VariableID:292:5` |

Corresponding opacity semantics added: `--opacity-interactive-hover-border: 0.22`, `--opacity-interactive-primary-hover: 0.14`.

**Bindings applied (28 nodes):**

| Value | Action | Variable | Affected |
|---|---|---|---|
| `rgba(0,0,0,0.34)` | Bound | `Color/Black/Opacity 34` | PageControls ×5, DashboardCard ×4, DayTile ×5 |
| `rgba(0,0,0,0.36)` | Corrected → 0.34, bound | `Color/Black/Opacity 34` | EmptyState ×4 |
| `#757a8a` | Corrected → `Color/Text/Muted` (#a1a1a6) | `Color/Text/Muted` | CardSurface ×2, ModalSheet ×2 |
| `rgba(255,255,255,0.04)` | Corrected → 0.05, bound | `Color/White/Opacity 5` | CardSurface ×1, ModalSheet ×2 |
| `rgba(255,255,255,0.14)` | Bound | `Color/White/Opacity 14` | Button Primary Hover ×1 |
| `rgba(255,255,255,0.22)` | Bound | `Color/White/Opacity 22` | Button Secondary Hover stroke ×1 |
| `rgba(53,184,168,0.12)` | Corrected → 0.08, bound | `Color/Success/Surface` | DashboardCard ProgressPill slot ×1 |

**Left unchanged by intent (5 nodes):**

`#171a1d` on COMPONENT_SET frames (Button, IconButton, CardSurface, ModalSheet, Icon). These are canvas background fills visible only in the Figma editor — not rendered in production. Closest token is `Color/Surface/Elevated` (#1a1c20), but the values differ by 3 units per channel and binding would have no production effect.

**CSS migration still open:**

The CSS counterparts for the new hover tokens (`--opacity-interactive-hover-border`, `--opacity-interactive-primary-hover`) are now defined in `tokens/generated/tokens.css`. App.css still uses hardcoded `rgba(255,255,255,0.22)` and `color-mix(...)` for button hover states. CSS migration is tracked under "Remaining Token Migration Debt" in DESIGN_SYSTEM_ROADMAP.md.

---

## Navigation: CSS-Only Effects (Figma Parity Gaps)

Two PageControls properties cannot be represented in Figma variables and are approximated visually.

| Property | CSS value | Figma approach | Gap |
|---|---|---|---|
| `backdrop-filter` | `blur(18px)` | Not applied | Blur effect is CSS-only; no Figma variable binding possible |
| Fill opacity | `0.74` (glass surface) | Static float on paint | `Plugin API setBoundVariableForPaint` does not support `'opacity'` field |
| Border opacity | `0.28` (glass border) | Static float on stroke | Same constraint as above |

These are pre-existing API constraints (documented in Figma API constraints memory), not new gaps.
