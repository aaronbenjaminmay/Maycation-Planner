# Token Debt

Gaps between the semantic token layer and actual component usage, identified during audits and Figma component builds.

Entries marked **[RESOLVED]** are retained for architectural context. Pre-v1.25.0 resolutions are summarized in the archive at the bottom of this file.

> **v2.5.0 CSS Co-location note:** during the CSS Co-location Migration (DESIGN_SYSTEM_ROADMAP.md §5 Phase 1, complete as of v1.29.0), open debt values that live in component CSS (e.g., the Button/IconButton base border `rgba(255,255,255,0.12)` and base background `rgba(28,28,30,0.84)`) moved **verbatim** from `App.css` into the component's co-located stylesheet. The migration introduced no new tokens and resolved no debt — it only changed file location. Entries in this document stay open with updated locations until resolved by Component Token Layer (Phase 2) or dedicated token work.

---

## v1.27.0 — CSS Co-location Wave 1: Location Updates

Open debt items that lived in `App.css §10–11` moved verbatim to co-located component stylesheets. Entries remain open — only the file location changed.

| Value | Previous location | Current location |
|---|---|---|
| `rgba(255,255,255,0.12)` base border | `App.css §10–11` | `button.css`, `icon-button.css` |
| `rgba(28,28,30,0.84)` base background | `App.css §10–11` | `button.css`, `icon-button.css` |
| `color-mix()` primary hover | `App.css §10–11` | `button.css`, `icon-button.css` |

---

## ds/v1.30.1 — Component Token Layer

Introduced `tokens/source/component.tokens.json` (6 namespaces: card, modal, badge, input, button, icon-button), each aliasing an existing Semantic token for a component's base recipe. This is the first Component Token Layer work — not a location update like the CSS Co-location waves above, but it deliberately did **not** resolve any open debt item, and it did not create new Semantic tokens as a side effect (per the migration rule: a Component token must alias an existing Semantic token, never a bare literal).

| Debt item | Why it stayed open |
|---|---|
| `rgba(255,255,255,0.12)` base border (`button.css`, `icon-button.css`) | No Semantic token exists to alias. Creating one would have been an undocumented side effect of this migration, not a deliberate token decision. |
| `rgba(28,28,30,0.84)` base background (`button.css`, `icon-button.css`) | Same reason. |

Both remain tracked below, unchanged in value or location. Resolving either requires a deliberate future decision to add the missing Semantic token — not a side effect of any other work.

---

## v1.29.0 — CSS Co-location Wave 3: Location Updates

No open debt items relocated. The three T2 Patterns (DashboardCard, DetailHeader, DayTile) contain zero hardcoded color/opacity values in their new co-located stylesheets (`dashboard-card.css`, `detail-header.css`, `day-tile.css`) — confirmed by inspection. The two debt items associated with DayTile's rendered context stayed in `App.css`, unmoved, because they belong to the `.trip-dashboard .day-tile` product-context override, which Wave 3 intentionally did not migrate:

| Value | Location | Status |
|---|---|---|
| `#fff` text | `App.css`, `.trip-dashboard .day-tile h2` (unchanged) | Open — no pure-white text semantic token |
| `rgba(0,0,0,0.4)` day-tile shadow | `App.css`, `.trip-dashboard .day-tile` (unchanged) | Open — intentional contextual variant, no token |

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

The CSS counterparts for the new hover tokens (`--opacity-interactive-hover-border`, `--opacity-interactive-primary-hover`) are now defined in `tokens/generated/tokens.css`. *Update (v1.26.0):* the hardcoded `rgba(255,255,255,0.22)` hover border and `rgba(255,255,255,0.08)` hover background were wired to these tokens in v1.26.0 (see next section). The `color-mix(...)` primary hover remains and is intentional — no simpler token-driven form exists. Remaining items are tracked under "Remaining Token Migration Debt" in DESIGN_SYSTEM_ROADMAP.md.

---

## [RESOLVED v1.26.0] CSS Token Parity — App.css Hardcoded Values

11 hardcoded values in `App.css` replaced with generated CSS variables. No new tokens, no Figma changes, no visual changes. CSS-only release.

| Was | Now | Location |
|---|---|---|
| `#35b8a8` | `var(--color-accent-default)` | `.planner-item-card.completed` border-left-color (×1) |
| `#35b8a8` in `color-mix()` | `var(--color-accent-default)` | `.planner-item-card.completed` background (×1, dead code cleanup) |
| `#000` | `var(--color-background-default)` | `.trip-dashboard-screen`, `.app-shell` group, `.dashboard-shell` (×3) |
| `rgba(255,255,255,0.22)` | `rgba(255,255,255,var(--opacity-interactive-hover-border))` | `.button:hover`, `.icon-button:hover` border-color (×2) |
| `rgba(255,255,255,0.08)` | `rgba(255,255,255,var(--opacity-interactive-hover))` | `.button:hover`, `.icon-button:hover` background (×2) |
| `999px` | `var(--radius-pill)` | `.icon-button` border-radius (×1) |
| `rgba(0,0,0,0.52)` | `rgba(0,0,0,var(--opacity-header-image-overlay))` | `.dashboard-shell.has-trip-bg::after` background (×1) |

**Intentionally left unchanged** (no matching token or architectural decision required):
- `rgba(28,28,30,0.68/0.76/0.62/0.84)` — intentional variants; no off-scale glass opacity tokens exist
- `rgba(255,255,255,0.12)` base border — documented open debt (no token)
- `rgba(0,0,0,0.22)` mode-toggle — semantic mismatch with `--color-surface-badge`
- `rgba(53,184,168,0.08)` ambient glow — semantic mismatch with `--color-success-surface`
- `rgba(255,255,255,0.04)` header preview — no exact token (closest is 0.05)
- `rgba(0,0,0,0.4)` day-tile shadow — intentional variant; no token
- `#fff` text — no pure-white text semantic token; `--color-text-primary` is `#f5f7fb`
- `color-mix()` primary hover — already optimal; opacity token not directly applicable

---

## Navigation: CSS-Only Effects (Figma Parity Gaps)

Two PageControls properties cannot be represented in Figma variables and are approximated visually.

| Property | CSS value | Figma approach | Gap |
|---|---|---|---|
| `backdrop-filter` | `blur(18px)` | Not applied | Blur effect is CSS-only; no Figma variable binding possible |
| Fill opacity | `0.72` (glass surface) | Static float on paint | `Plugin API setBoundVariableForPaint` does not support `'opacity'` field |
| Border opacity | `0.28` (glass border) | Static float on stroke | Same constraint as above |

These are pre-existing API constraints (documented in Figma API constraints memory), not new gaps.

---

## Archive — Resolved Pre-v1.25.0

Earlier debt items are summarized here. Full detail preserved for architectural context.

| Release | Item | Resolution |
|---------|------|------------|
| v1.7.0 | Badge referenced product-role tokens (`color.role.*`, `color.kind.*`) | Replaced with semantic tokens `--color-info-border`, `--color-warning-border`, `--color-secondary-border`. New primitives: Blue 500, Amber 500, Purple 500. |
| v1.7.0 | Missing `color.warning.border` and `color.info.border` semantic tokens | Created alongside Badge fix. |
| v1.8.0 | Missing `color.success.*` tokens for FeedbackMessage | Added surface, border, text. `opacity.primitive.30` added. |
| v1.8.0 | `opacity.disabled.default` was 0.40; CSS used 0.65 | Token updated to 0.65. Wired in forms.css and App.css. `opacity.primitive.65` added. |
| v1.8.0 | Missing `color.surface.badge` and `color.surface.feedback-neutral` | Added as off-scale composites (0.22, 0.05). Off-scale intentional — snapping to scale would change visual output. |
| v1.8.0 | `#a1a1a6` hardcoded in 5 App.css selectors | All replaced with `var(--color-text-muted)`. SVG data URI in `forms.css` cannot use a CSS variable — retained intentionally. |
| v1.9.0 | `#d7d7dc` hardcoded in `.icon-button--complete` | Added `color.primitive.neutral-250` and `color.icon.complete`. All 14 `rgba(255,255,255,0.08)` border instances replaced with `var(--color-border-glass)`. |
| v1.10.0 | `font-size: 28px` hardcoded in `.screen-header h1` | Replaced with `var(--typography-title-font-size)` (same clamp value). Figma parity gap (static vs. fluid) accepted — CSS-only effect. |
