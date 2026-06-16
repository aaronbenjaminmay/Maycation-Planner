# Token Debt

Gaps between the current semantic token layer and actual component usage, discovered during Figma component builds (Feedback group, 2026-06-15) and the Token Cleanup Audit (2026-06-15).

Items marked **[RESOLVED v1.7.0]** have been fixed and are retained for audit trail only.

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

## Missing Success Semantic Tokens

The `FeedbackMessage --success` variant uses raw Teal 500 opacity composites with no semantic alias. These values are derived from the same primitive as `Color/Accent/Default` but at different opacities, so a distinct Success token family is needed.

| CSS property | Current value | Needed token |
|---|---|---|
| `.feedback--success` `border-color` | `rgba(53, 184, 168, 0.3)` | `Color/Success/Border` → `Color/Teal 500` × `Opacity/30` |
| `.feedback--success` `background` | `rgba(53, 184, 168, 0.08)` | `Color/Success/Surface` → `Color/Teal 500` × `Opacity/8` |

**Note:** `.feedback--success` `color` currently uses `var(--color-accent-default)` (Teal 500 fully opaque), which is correct and already semantic. Only border and background need new tokens.

---

## Hardcoded Color Values

Values in component CSS that should reference tokens but are written as literals.

| Location | Property | Hardcoded value | Correct token |
|---|---|---|---|
| `App.css` `.icon-button--complete` | `color` | `#d7d7dc` | Needs `Color/IconButton/Complete` semantic token (no equivalent exists yet) |
| `forms.css` `select.form-control` `background-image` | SVG `stroke` | `%23a1a1a6` (`#a1a1a6`) | Should reference `--color-text-muted` (#a1a1a6 matches exactly — cosmetic fix) |
| `App.css` `.form-control:disabled` | `opacity` | `0.65` | `Opacity/Disabled/Default` variable exists (VariableID:44:9) but CSS doesn't reference it — update to `var(--opacity-disabled-default)` |

---

## Missing Neutral Surface Opacity Tokens

Two components use white or black at opacity values that fall outside the established opacity scale (8 / 10 / 20 / 28 / 40 / 52 / 74 / 78).

| Component | Property | Current value | Issue |
|---|---|---|---|
| `Badge` | `background` | `rgba(0, 0, 0, 0.22)` | 22% black not in opacity scale; no semantic alias |
| `FeedbackMessage --neutral` | `background` | `rgba(255, 255, 255, 0.05)` | 5% white not in opacity scale; no semantic alias |

**Options when fixing:**
- Add `Opacity/22` and `Opacity/5` to the primitive opacity scale, then create semantic aliases (`Color/Surface/Badge`, `Color/Surface/FeedbackNeutral`).
- Or: snap Badge background to the nearest scale value (`Opacity/20` = rgba(0,0,0,0.20)) and FeedbackMessage neutral to `Opacity/8` (rgba(255,255,255,0.08)) and adjust visual in code.

**Recommendation:** Snap to nearest scale value + update code, rather than expanding the scale for two components. Verify visual delta is acceptable before merging.

---

## Navigation: Missing Fluid Type Token

ScreenHeader `h1` uses `font-size: clamp(1.8rem, 6vw, 2.55rem)` — a fluid/responsive size that has no equivalent in the token system. `Typography/Title` (28px Black) was used as the closest static match.

| CSS property | Current value | Used in Figma | Needed token |
|---|---|---|---|
| `.screen-header h1` `font-size` | `clamp(1.8rem, 6vw, 2.55rem)` | `Typography/Title` (28px) | `Typography/Display` — fluid, viewport-relative |

**Impact:** Figma representation is static (28px); actual rendered size varies from ~29px to ~41px depending on viewport width. This is a visual parity gap on larger screens.

---

## Navigation: Muted Color Inconsistency

`.muted` class color is hardcoded as `#a1a1a6` in some CSS selectors instead of referencing the token via CSS variable.

| Location | Property | Hardcoded value | Correct token |
|---|---|---|---|
| Various `.muted` selectors | `color` | `#a1a1a6` | Should be `var(--color-text-muted)` (already `VariableID:8:12`) |

**Fix:** Find all `.muted { color: #a1a1a6 }` instances and replace with `var(--color-text-muted)`.

---

## Navigation: CSS-Only Effects (Figma Parity Gaps)

Two PageControls properties cannot be represented in Figma variables and are approximated visually.

| Property | CSS value | Figma approach | Gap |
|---|---|---|---|
| `backdrop-filter` | `blur(18px)` | Not applied | Blur effect is CSS-only; no Figma variable binding possible |
| Fill opacity | `0.74` (glass surface) | Static float on paint | `Plugin API setBoundVariableForPaint` does not support `'opacity'` field |
| Border opacity | `0.28` (glass border) | Static float on stroke | Same constraint as above |

These are pre-existing API constraints (documented in Figma API constraints memory), not new gaps.
