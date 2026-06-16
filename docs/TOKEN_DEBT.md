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

## Hardcoded Color Values (Remaining)

| Location | Property | Hardcoded value | Status |
|---|---|---|---|
| `App.css` `.icon-button--complete` | `color` | `#d7d7dc` | Open — needs `Color/IconButton/Complete` semantic token (no equivalent exists yet) |

---

## Navigation: Missing Fluid Type Token

ScreenHeader `h1` uses `font-size: clamp(1.8rem, 6vw, 2.55rem)` — a fluid/responsive size that has no equivalent in the token system. `Typography/Title` (28px Black) was used as the closest static match.

| CSS property | Current value | Used in Figma | Needed token |
|---|---|---|---|
| `.screen-header h1` `font-size` | `clamp(1.8rem, 6vw, 2.55rem)` | `Typography/Title` (28px) | `Typography/Display` — fluid, viewport-relative |

**Impact:** Figma representation is static (28px); actual rendered size varies from ~29px to ~41px depending on viewport width. This is a visual parity gap on larger screens.

---

## Navigation: CSS-Only Effects (Figma Parity Gaps)

Two PageControls properties cannot be represented in Figma variables and are approximated visually.

| Property | CSS value | Figma approach | Gap |
|---|---|---|---|
| `backdrop-filter` | `blur(18px)` | Not applied | Blur effect is CSS-only; no Figma variable binding possible |
| Fill opacity | `0.74` (glass surface) | Static float on paint | `Plugin API setBoundVariableForPaint` does not support `'opacity'` field |
| Border opacity | `0.28` (glass border) | Static float on stroke | Same constraint as above |

These are pre-existing API constraints (documented in Figma API constraints memory), not new gaps.
