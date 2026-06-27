# Maycation Figma Foundations

Last updated: v1.26.0

This document defines the token architecture, variable collection structure, naming conventions, and implementation path for Maycation's Figma design system. It is the source of truth for how code tokens map to Figma Variables, Tokens Studio, and future Code Connect work.

---

## 1. Token Architecture

Maycation uses a three-layer token architecture aligned with DTCG (Design Tokens Community Group) conventions.

### Layer 0: Primitive Tokens

Raw values with no semantic meaning. These never appear directly in component CSS. They exist only to be referenced by Semantic tokens.

**Primitive tokens are not exported to Figma as stand-alone variables in most cases.** They are the backing values behind Semantic tokens. In Figma, they appear inside the `Primitives/Color` collection as a reference palette — available to see, not to use directly in components.

Current primitive namespaces:

```
color.primitive.*   — opaque color values only (neutrals, teal, blues, reds, white, black)
opacity.primitive.* — raw opacity values (0.08 – 0.78)
spacing.*           — raw spacing scale (2xs through 2xl)
radius.*            — raw radius scale (sm, md, lg, full)
shadow.*            — raw shadow values (sm, md, lg)
typography.*        — raw type scale (eyebrow, label, caption, etc.)
icon.*              — raw icon size values (sm, md, lg)
```

**Rule: primitive colors are always opaque.** Alpha/transparency is never baked into a primitive color value. Composited RGBA colors (glass surface, overlay, border alpha) exist only at the semantic layer and are expressed as inline `rgba()` values documented with their primitive components. See §8 Opacity Handling Rule.

Note: `spacing`, `radius`, `shadow`, `typography`, and `icon` are named without a `primitive.` prefix in the source JSON. They function as primitives (no semantic meaning, just raw values). A future migration may add the `primitive.` prefix for consistency. Do not rename until a full migration is planned.

---

### Layer 1: Semantic Tokens

Context-aware tokens with intentional meaning. These are what components reference in CSS. They map to Figma Variables that components and styles use.

Current semantic namespaces:

```
color.background.*   — app-level backgrounds
color.surface.*      — card and panel surfaces (opaque token; CSS uses rgba composite)
color.border.*       — borders in various contexts (opaque token; CSS uses rgba composite where alpha needed)
color.text.*         — text colors by hierarchy
color.accent.*       — brand accent (teal)
color.danger.*       — destructive/error states
color.success.*      — success UI state (v1.8.0; surface, border, text)
color.info.*         — info UI state (v1.7.0; currently border only)
color.warning.*      — warning UI state (v1.7.0; currently border only)
color.secondary.*    — secondary UI state (v1.7.0; currently border only)
color.countdown.*    — trip milestone and temporal emphasis (see §3)
color.overlay.*      — modal and overlay layers
opacity.overlay.*    — semantic opacity values for overlay compositing
opacity.surface.*    — semantic opacity values for surface compositing (includes badge, feedback-neutral — v1.8.0)
opacity.border.*     — semantic opacity values for border compositing
opacity.danger.*     — semantic opacity values for danger surface compositing
opacity.success.*    — semantic opacity values for success surface/border compositing (v1.8.0)
opacity.disabled.*   — semantic opacity values for disabled state (updated to 0.65 — v1.8.0)
opacity.header-image.* — semantic opacity for trip background image dim
opacity.interactive.*  — semantic opacity for hover overlay fills
radius.card          — semantic alias for card surface radius
radius.input         — semantic alias for input field radius
radius.pill          — semantic alias for pill/circular radius
shadow.surface.*     — semantic shadow aliases (card, panel, overlay)
```

These are the variables that Figma component properties should reference. Every time a designer sets a card background, they should use `Surface/Glass`, not the underlying primitive hex.

---

### Layer 2: Component Tokens (recommended, not yet implemented)

Component-specific tokens that reference Semantic tokens. They allow a component's visual properties to be changed without editing raw semantic values, and they create a clear contract between design and code.

Recommended component token namespaces for future implementation:

```
component.button.*     — button background, border, text, hover
component.card.*       — card background, border, radius, shadow
component.input.*      — input background, border, focus ring
component.badge.*      — badge background, border, text
component.icon-button.* — icon button background, border, selected state
component.modal.*      — modal background, border, shadow
```

**This is the correct next step after Figma foundations are established.** Do not add component tokens until Figma variables are in place and token aliases can be validated visually.

---

## 2. Current Token Audit

### Color Tokens

**Primitive palette (`color.primitive.*`)**

All primitives are opaque. No alpha-composited colors in the primitive layer.

| Token | Value | Description |
|-------|-------|-------------|
| `black` | `#000000` | Page background |
| `white` | `#ffffff` | Base for glass borders, control borders, overlay compositions |
| `teal-500` | `#35b8a8` | Brand accent (Maycation teal) |
| `teal-950` | `#061312` | Near-black teal; text on teal backgrounds |
| `blue-500` | `#3483fa` | Role/kind usage (travel, editor) |
| `blue-vivid` | `#0a84ff` | Apple System Blue; countdown/milestone |
| `amber-500` | `#f2a93b` | Reservation kind, attention state |
| `purple-500` | `#9b8cff` | Note kind, viewer role |
| `red-500` | `#a84b4b` | Danger borders |
| `red-100` | `#ffd7d7` | Soft pink; danger message text |
| `neutral-100` | `#f5f7fb` | Primary text |
| `neutral-200` | `#b6bfcc` | Secondary body text |
| `neutral-300` | `#a1a1a6` | Muted metadata |
| `neutral-700` | `#2b2d32` | Opaque border |
| `neutral-800` | `#1c1c1e` | Glass surface base (opaque; combine with Opacity/Surface/Glass in Figma) |
| `neutral-850` | `#1a1c20` | Elevated control surface |
| `neutral-900` | `#121316` | Panel background |
| `neutral-950` | `#0d0f12` | Retained as primitive for legacy reference |

**Removed primitives (v1.7.0):** `teal-on` (→ `teal-950`), `danger-text` (→ `red-100`), `danger-bg`, `glass-surface`, `glass-border`, `white-a10`, `overlay`, `blue-vivid-a28`, `black-a28`. All were alpha-composited derived values or semantic-intent names. Their composited rgba() values now live in the semantic layer with inline documentation.

**Opacity primitives (`opacity.primitive.*`)**

| Token | Value | Composition usage |
|-------|-------|-------------------|
| `opacity.primitive.5` *(v1.8.0)* | `0.05` | FeedbackMessage neutral background (white × 5%); intentionally off-scale |
| `opacity.primitive.8` | `0.08` | Glass border (white × 8%); success surface (teal-500 × 8%) |
| `opacity.primitive.10` | `0.10` | Control border (white × 10%) |
| `opacity.primitive.20` | `0.20` | Danger surface (red-500 × 20%) |
| `opacity.primitive.22` *(v1.8.0)* | `0.22` | Badge background (black × 22%); intentionally off-scale |
| `opacity.primitive.28` | `0.28` | Input surface (black × 28%); countdown border (blue-vivid × 28%) |
| `opacity.primitive.30` *(v1.8.0)* | `0.30` | Success border (teal-500 × 30%); intentionally off-scale |
| `opacity.primitive.34` *(v1.25.0)* | `0.34` | Card shadow alpha — black at 34% |
| `opacity.primitive.40` | `0.40` | Scale step (reserved) |
| `opacity.primitive.52` | `0.52` | Header image overlay |
| `opacity.primitive.65` *(v1.8.0)* | `0.65` | Disabled component state |
| `opacity.primitive.72` *(v1.13.0)* | `0.72` | Glass surface (neutral-800 × 72%) |
| `opacity.primitive.78` | `0.78` | Overlay backdrop (black × 78%) |

**Semantic color tokens**

Tokens marked † contain an inline `rgba()` CSS composite value (not a primitive alias) because Figma and CSS handle opacity differently. See §8 Opacity Handling Rule.

| Token | CSS value | Figma color binding | Figma opacity binding |
|-------|-----------|--------------------|-----------------------|
| `color.background.default` | `#000000` | `Color/Black` | — |
| `color.surface.default` | `#121316` | `Color/Neutral 900` | — |
| `color.surface.elevated` | `#1a1c20` | `Color/Neutral 850` | — |
| `color.surface.input` † | `rgba(0,0,0,0.28)` | `Color/Black` | `Opacity/Surface/Input` |
| `color.surface.glass` † *(v1.13.0: 0.72)* | `rgba(28,28,30,0.72)` | `Color/Neutral 800` | `Opacity/Surface/Glass` |
| `color.surface.badge` † *(v1.8.0)* | `rgba(0,0,0,0.22)` | `Color/Black` | `Opacity/Surface/Badge` |
| `color.surface.feedback-neutral` † *(v1.8.0)* | `rgba(255,255,255,0.05)` | `Color/White` | `Opacity/Surface/FeedbackNeutral` |
| `color.border.default` | `#2b2d32` | `Color/Neutral 700` | — |
| `color.border.glass` † | `rgba(255,255,255,0.08)` | `Color/White` | `Opacity/Border/Glass` |
| `color.border.control` † | `rgba(255,255,255,0.10)` | `Color/White` | `Opacity/Border/Control` |
| `color.text.primary` | `#f5f7fb` | `Color/Neutral 100` | — |
| `color.text.secondary` | `#b6bfcc` | `Color/Neutral 200` | — |
| `color.text.muted` | `#a1a1a6` | `Color/Neutral 300` | — |
| `color.accent.default` | `#35b8a8` | `Color/Teal 500` | — |
| `color.accent.text` | `#061312` | `Color/Teal 950` | — |
| `color.danger.surface` † | `rgba(168,75,75,0.20)` | `Color/Red 500` | `Opacity/Danger/Surface` |
| `color.danger.border` | `#a84b4b` | `Color/Red 500` | — |
| `color.danger.text` | `#ffd7d7` | `Color/Red 100` | — |
| `color.success.surface` † *(v1.8.0)* | `rgba(53,184,168,0.08)` | `Color/Teal 500` | `Opacity/Success/Surface` |
| `color.success.border` † *(v1.8.0)* | `rgba(53,184,168,0.30)` | `Color/Teal 500` | `Opacity/Success/Border` |
| `color.success.text` *(v1.8.0)* | `#35b8a8` | `Color/Teal 500` | — |
| `color.info.border` *(v1.7.0)* | `#3483fa` | `Color/Blue 500` | — |
| `color.warning.border` *(v1.7.0)* | `#f2a93b` | `Color/Amber 500` | — |
| `color.secondary.border` *(v1.7.0)* | `#9b8cff` | `Color/Purple 500` | — |
| `color.countdown.default` | `#0a84ff` | `Color/Blue Vivid` | — |
| `color.countdown.border` † | `rgba(10,132,255,0.28)` | `Color/Blue Vivid` | `Opacity/Countdown/Border` |
| `color.overlay.default` † | `rgba(0,0,0,0.78)` | `Color/Black` | `Opacity/Overlay/Default` |

**Semantic opacity tokens (`opacity.*`)**

CSS variables generated for these (e.g., `--opacity-surface-glass: 0.72`). Primarily used to document the design system; in CSS, prefer `var(--color-surface-glass)` (which outputs the full rgba composite) over inline rgba literals for the canonical glass surface. Element-level `opacity:` is acceptable only for disabled state and pseudo-element overlays.

| Token | Value | Use |
|-------|-------|-----|
| `opacity.overlay.default` | `0.78` | Modal backdrop opacity |
| `opacity.surface.glass` *(v1.13.0: 0.72)* | `0.72` | Glass surface fill opacity |
| `opacity.surface.input` | `0.28` | Input surface fill opacity |
| `opacity.border.glass` | `0.08` | Glass border stroke opacity |
| `opacity.border.control` | `0.10` | Control border stroke opacity |
| `opacity.danger.surface` | `0.20` | Danger fill opacity |
| `opacity.success.surface` *(v1.8.0)* | `0.08` | Success background fill opacity |
| `opacity.success.border` *(v1.8.0)* | `0.30` | Success border stroke opacity |
| `opacity.surface.badge` *(v1.8.0)* | `0.22` | Badge background fill opacity |
| `opacity.surface.feedback-neutral` *(v1.8.0)* | `0.05` | FeedbackMessage neutral fill opacity |
| `opacity.countdown.border` | `0.28` | Countdown/completed border opacity |
| `opacity.disabled.default` *(updated v1.8.0)* | `0.65` | Disabled state (element-level opacity is acceptable here) |
| `opacity.header-image.overlay` | `0.52` | Trip bg image dim (pseudo-element, element opacity acceptable) |
| `opacity.interactive.hover` *(v1.10.0: 0.08)* | `0.08` | Hover overlay fill opacity |
| `opacity.interactive.hover-border` *(v1.25.0)* | `0.22` | Hover border opacity — Button, IconButton |
| `opacity.interactive.primary-hover` *(v1.25.0)* | `0.14` | Primary button hover brightening overlay |

**Product color tokens** (kind/role — planner-item and member badges)

| Token | Value | Use |
|-------|-------|-----|
| `color.kind.activity` | `#35b8a8` | Activity badge border |
| `color.kind.travel` | `#3483fa` | Travel badge border |
| `color.kind.reservation` | `#f2a93b` | Reservation badge border |
| `color.kind.note` | `#9b8cff` | Note badge border |
| `color.role.owner` | `#35b8a8` | Owner role border |
| `color.role.editor` | `#3483fa` | Editor role border |
| `color.role.viewer` | `#9b8cff` | Viewer role border |

---

### Spacing Tokens

All spacing is ordinal scale. The dominant value is `--spacing-lg: 18px`, which intentionally deviates from a normalized 20px grid to preserve visual rhythm established in Disney Mayhem.

| Token | Value | Primary use |
|-------|-------|-------------|
| `spacing.2xs` | `4px` | Account-strip inner gap |
| `spacing.xs` | `8px` | Pill groups, tag clusters |
| `spacing.sm` | `12px` | Form grid gap, list item gap |
| `spacing.md` | `16px` | Standard layout gap |
| `spacing.lg` | `18px` | Card padding, page-shell gap (dominant) |
| `spacing.xl` | `24px` | App-shell horizontal padding |
| `spacing.2xl` | `32px` | Reserved |

---

### Radius Tokens

| Token | Value | Use |
|-------|-------|-----|
| `radius.sm` | `8px` | Account-strip, small surfaces |
| `radius.md` | `14px` | Input fields, feedback messages |
| `radius.lg` | `20px` | All card and panel surfaces |
| `radius.full` | `999px` | Pills, icon buttons, form buttons |
| `radius.card` | `20px` | Semantic alias for `radius.lg` |
| `radius.input` | `14px` | Semantic alias for `radius.md` |
| `radius.pill` | `999px` | Semantic alias for `radius.full` — for pill/circular components |

---

### Shadow Tokens

Ordinal primitives (backward-compatible CSS output) plus semantic aliases added in v1.7.0:

| Token | CSS output | Figma effect style | Use |
|-------|------------|-------------------|-----|
| `shadow.sm` / `shadow.surface.card` | `0 10px 28px 0 rgba(0,0,0,0.34)` | `Shadow/Surface/Card` | Component cards |
| `shadow.md` / `shadow.surface.panel` *(v1.13.0)* | `0 18px 50px 0 rgba(0,0,0,0.26)` | `Shadow/Surface/Panel` | Panel surfaces (card-surface, modal-sheet) |
| `shadow.lg` / `shadow.surface.overlay` | `0 18px 50px 0 rgba(0,0,0,0.28)` | `Shadow/Surface/Overlay` | Ambient / legacy `--shadow` bridge |

---

### Typography Tokens

| Token | Size | Weight | Tracking | Use |
|-------|------|--------|----------|-----|
| `typography.eyebrow` | 11px | 900 | 0.18em | Kickers, dates, status markers |
| `typography.label` | 12px | 900 | 0.08em | Form field labels |
| `typography.caption` | 13px | 700 | — | Muted metadata, body text |
| `typography.action` | 14px | 900 | — | Button text, action labels |
| `typography.heading` | 1rem | 900 | — | Card headings |
| `typography.section` | 1.35rem | 900 | — | Modal headings, empty-state headings |
| `typography.title` | fluid | 900 | — | Screen-level h1 |

Note: `typography.eyebrow` and `typography.label` are distinct type scales, but both produce uppercase uppercase labels. See §4 for the naming confusion this creates.

---

### Icon Tokens

| Token | Value | Use |
|-------|-------|-----|
| `icon.sm` | `16px` | Small icons |
| `icon.md` | `18px` | Default (most contexts) |
| `icon.lg` | `20px` | Primary action, selected state |

---

## 3. Accent Blue Decision

### Decision: `color.countdown.default` — `#0a84ff`

**Implemented in v1.6.0.** Two hardcoded uses replaced with tokens. One dead use in `index.css` identified but retained (see below).

### Color in question

`#0a84ff` — Apple System Blue. Distinct from the existing `color.primitive.blue-500` (`#3483fa`), which is a less saturated medium blue used for travel and editor role badges.

### Active usages (confirmed in code)

| Location | Selector | Role |
|----------|----------|------|
| `App.css:494` | `.trip-intel-card__header span` | Countdown/phase label ("Trip starts in", "Today") |
| `App.css:1214` | `.planner-item-card.completed` | Completed item card border (at 28% opacity) |

### Dead usage

| Location | Selector | Status |
|----------|----------|--------|
| `index.css:9` | `--accent: #0a84ff` | Light-mode fallback, overridden by `tokens-bridge.css` for all modes. Not visible in production. |

The light-mode `--accent` in `index.css` is dead code: `tokens-bridge.css` maps `--accent: var(--color-accent-default)` without a media query, so the bridge override applies to all color schemes. Do not remove this until the light-mode token strategy is resolved.

### Why `countdown`, not `accent.blue` or `info`

| Option | Reason against |
|--------|---------------|
| `color.accent.blue` | Confuses the brand accent system; `color.accent.*` is teal |
| `color.accent.primary` | Wrong — the primary accent IS teal |
| `color.info.default` | Too generic; not "informational" in the UI sense |
| `color.system.blue` | Accurate to the origin but not to the role |

`countdown.default` is correct because:
1. The primary use is on trip intel card labels ("Trip starts in", "Today") — temporal/anticipatory moments
2. The secondary use (completed item border) is a trip milestone moment — the completion of a planned activity
3. The constitution explicitly names "trip countdowns, anticipation moments, high-emphasis trip milestones" as the intended role
4. The name is specific enough to be meaningful in Figma (`countdown/default`) without being too narrow to cover the completed-item use

### Tokens added

```
color.primitive.blue-vivid       = #0a84ff
color.primitive.blue-vivid-a28   = rgba(10, 132, 255, 0.28)

color.countdown.default          → color.primitive.blue-vivid
color.countdown.border           → color.primitive.blue-vivid-a28
```

### Generated CSS variables

```css
--color-countdown-default: #0a84ff;
--color-countdown-border: rgba(10, 132, 255, 0.28);
```

### Do not create a full blue ramp

`blue-vivid` is a standalone primitive. There is no `blue-vivid-100`, `blue-vivid-200`, etc. If future UI needs additional blue shades, that decision should be made deliberately at that time with a clear semantic use case, not preemptively.

---

## 4. Label Terminology

The word "label" has three distinct meanings in the Maycation system. Confusion between them is a risk for both documentation and Figma work.

### The three "labels"

**1. `typography.label` — the type scale token**

A CSS/token concept: the font-size/weight/tracking combination used for form field labels. Currently outputs:
```css
--typography-label-font-size: 12px;
--typography-label-font-weight: 900;
--typography-label-letter-spacing: 0.08em;
```

**2. The `.label` and `.eyebrow` CSS utility classes**

Two interchangeable CSS classes that produce visually identical results (all-caps, 11px, 900 weight, 0.18em tracking). They reference `typography.eyebrow`, not `typography.label`. The `.label` class exists because some design contexts call the element a "label" informally, but it uses eyebrow styles.

**3. "Label" in DTCG / token tooling**

In token systems (Tokens Studio, Style Dictionary, Figma Variables), a "label" is the name given to a token or variable. This is purely administrative.

### The confusion

`typography.label` (a type scale) is named after what it styles (a form field label element), but it produces *different output* than the `.label` CSS class (which uses eyebrow styles). A designer seeing "Label" in Figma typography will not know whether it means the form-label scale or the eyebrow/kicker scale.

### Recommendation

**Rename `typography.label` to `typography.field-label` in a future token cleanup sprint.**

This makes the distinction explicit:
- `typography.eyebrow` → kickers, date markers, eyebrow text
- `typography.field-label` → form field labels (slightly larger, slightly tighter tracking)

The CSS classes `.label` and `.eyebrow` should remain as-is (they are utility classes, not token references). The only change is the token name in `typography.tokens.json` and the generated CSS variables (`--typography-field-label-*`).

**Do not implement this rename in v1.6.0.** It requires updating `forms.css` which references `--typography-label-*`. Plan for v1.7.0 or a dedicated token migration sprint.

---

## 5. Figma Variable Structure

### Recommended collections and groups

Figma Variables are organized into **Collections**, each with **Groups** (folder-style prefixes using `/`). Modes can be added to a collection for theming.

#### Collection 1: `Primitives`

Mode: `Default` (single mode; raw values never change per theme)

All primitive colors are opaque. No alpha-composited colors in this collection.

```
Primitives/
  Color/
    Black           #000000
    White           #ffffff
    Teal 500        #35b8a8
    Teal 950        #061312
    Blue 500        #3483fa
    Blue Vivid      #0a84ff
    Amber 500       #f2a93b
    Purple 500      #9b8cff
    Red 500         #a84b4b
    Red 100         #ffd7d7
    Neutral 100     #f5f7fb
    Neutral 200     #b6bfcc
    Neutral 300     #a1a1a6
    Neutral 700     #2b2d32
    Neutral 800     #1c1c1e
    Neutral 850     #1a1c20
    Neutral 900     #121316
    Neutral 950     #0d0f12
  Opacity/
    5               0.05   (v1.8.0 — FeedbackMessage neutral bg)
    8               0.08
    10              0.10
    20              0.20
    22              0.22   (v1.8.0 — Badge bg)
    28              0.28
    30              0.30   (v1.8.0 — Success border)
    34              0.34   (v1.25.0 — Card shadow)
    40              0.40
    52              0.52
    65              0.65   (v1.8.0 — Disabled state)
    72              0.72   (v1.13.0 — Glass surface, was 74)
    78              0.78
  Spacing/
    2xs    (4px)
    xs     (8px)
    sm     (12px)
    md     (16px)
    lg     (18px)
    xl     (24px)
    2xl    (32px)
  Radius/
    sm     (8px)
    md     (14px)
    lg     (20px)
    full   (999px)
  Typography/
    Eyebrow/font-size, font-weight, letter-spacing, line-height
    Field Label/font-size, font-weight, letter-spacing, line-height
    Caption/font-size, font-weight, line-height
    Action/font-size, font-weight, line-height
    Heading/font-size, font-weight, line-height
    Section/font-size, font-weight, line-height
    Title/font-size, font-weight, line-height
  Icon/
    sm     (16px)
    md     (18px)
    lg     (20px)
```

#### Collection 2: `Semantic`

Mode: `Dark` (initial; add `Light` mode later if needed)

```
Semantic/
  Color/
    Background/Default
    Surface/Default, Elevated, Input†, Glass†
    Border/Default, Glass†, Control†
    Text/Primary, Secondary, Muted
    Accent/Default, Text
    Danger/Surface†, Border, Text
    Countdown/Default, Border†
    Overlay/Default†
  Opacity/
    Overlay/Default          → Opacity/78
    Surface/Glass            → Opacity/72   (v1.13.0 — was 74)
    Surface/Input            → Opacity/28
    Surface/Badge            → Opacity/22   (v1.8.0)
    Surface/FeedbackNeutral  → Opacity/5    (v1.8.0)
    Border/Glass             → Opacity/8
    Border/Control           → Opacity/10
    Danger/Surface           → Opacity/20
    Success/Surface          → Opacity/8    (v1.8.0)
    Success/Border           → Opacity/30   (v1.8.0)
    Countdown/Border         → Opacity/28
    Disabled/Default         → Opacity/65   (v1.8.0 — was 40)
    HeaderImage/Overlay      → Opacity/52
    Interactive/Hover        → Opacity/8    (v1.10.0 — was 10)
    Interactive/HoverBorder  → Opacity/22   (v1.25.0)
    Interactive/PrimaryHover → 0.14         (v1.25.0 — direct value; no opacity primitive; Figma: Color/White/Opacity 14 in Primitives/Color)
  Radius/
    Card    → Radius/lg (20px)
    Input   → Radius/md (14px)
    Pill    → Radius/full (999px)
```

† These semantic color variables point to **opaque primitive colors** in Figma (e.g., `Color/Neutral 800`). The transparency is applied via a separate `Opacity/*` variable at the paint layer. In CSS, the generated token outputs the composited `rgba()` value directly — do not use element-level `opacity:`. See §8 Opacity Handling Rule.

All non-† values in the Semantic collection alias Primitive variables directly.

#### Collection 3: `Product` (optional, defer)

For kind/role tokens that are Maycation-specific:

```
Product/
  Color/
    Kind/
      Activity
      Travel
      Reservation
      Note
    Role/
      Owner
      Editor
      Viewer
```

These can alias Primitive colors. Defer this collection until product UI work begins in earnest.

#### Collection 4: `Component` (future)

Do not create until semantic tokens are validated in Figma and at least two components have been built against them.

```
Component/
  Button/ (primary-background, primary-border, primary-text, etc.)
  Card/
  Input/
  Badge/
  IconButton/
  Modal/
```

---

### Naming rules

1. **Names use Title Case with spaces in Figma.** CSS uses `kebab-case`. Mapping: `color.surface.glass` → Figma: `Surface/Glass`.
2. **Groups use `/` prefix notation.** Everything before the last `/` is the group folder.
3. **Primitive names should be descriptive, not semantic.** `Neutral 800`, not `Card Background`.
4. **Semantic names should describe role, not appearance.** `Surface/Glass`, not `Surface/Dark Transparent`.
5. **Do not include the collection name in the variable name.** The collection already scopes it. `Primitives/Color/Teal 500`, not `Primitives/Color/Primitive Teal 500`.
6. **Font composite variables are not yet supported in Figma.** Define each property (size, weight, etc.) as a separate number/string variable. Future Figma font variable support may consolidate these.

---

### Figma → Code mapping table

| Figma variable (Semantic) | CSS custom property | CSS value | Figma value |
|---------------------------|---------------------|-----------|-------------|
| `Semantic/Color/Surface/Glass` | `--color-surface-glass` | `rgba(28,28,30,0.72)` | `Color/Neutral 800` + fill opacity `Opacity/Surface/Glass` |
| `Semantic/Color/Border/Glass` | `--color-border-glass` | `rgba(255,255,255,0.08)` | `Color/White` + stroke opacity `Opacity/Border/Glass` |
| `Semantic/Color/Surface/Input` | `--color-surface-input` | `rgba(0,0,0,0.28)` | `Color/Black` + fill opacity `Opacity/Surface/Input` |
| `Semantic/Color/Overlay/Default` | `--color-overlay-default` | `rgba(0,0,0,0.78)` | `Color/Black` + fill opacity `Opacity/Overlay/Default` |
| `Semantic/Color/Text/Primary` | `--color-text-primary` | `#f5f7fb` | `Color/Neutral 100` |
| `Semantic/Color/Accent/Default` | `--color-accent-default` | `#35b8a8` | `Color/Teal 500` |
| `Semantic/Color/Countdown/Default` | `--color-countdown-default` | `#0a84ff` | `Color/Blue Vivid` |
| `Semantic/Color/Countdown/Border` | `--color-countdown-border` | `rgba(10,132,255,0.28)` | `Color/Blue Vivid` + stroke opacity `Opacity/Countdown/Border` |
| `Semantic/Opacity/Surface/Glass` | `--opacity-surface-glass` | `0.72` | `Opacity/72` |
| `Semantic/Opacity/Disabled/Default` | `--opacity-disabled-default` | `0.65` | `Opacity/65` |
| `Semantic/Radius/Card` | `--radius-card` | `20px` | `Radius/lg` |
| `Semantic/Radius/Pill` | `--radius-pill` | `999px` | `Radius/full` |
| `Primitives/Spacing/lg` | `--spacing-lg` | `18px` | — |
| Effect style `Shadow/Surface/Panel` | `--shadow-surface-panel` / `--shadow-md` | `0 18px 50px 0 rgba(0,0,0,0.26)` | Effect style (not a variable) |

---

## 6. Storybook → Figma Mapping

### How Storybook and Figma should correspond

| Storybook | Figma |
|-----------|-------|
| `Foundation/Colors` stories | `Semantic/Color/*` variable collection |
| `Foundation/Spacing & Radius` stories | `Primitives/Spacing/*` and `Semantic/Radius/*` |
| `Foundation/Typography` stories | `Primitives/Typography/*` |
| `Components/Button` stories | `Component/Button` component |
| `Components/CardSurface` stories | `Component/Card` component |
| `Components/Forms/*` stories | `Component/Input` and form components |
| `Components/Navigation/*` stories | Navigation pattern components |
| `Patterns/DashboardCard` stories | `DashboardCard` pattern (composed in Figma from Card component) |
| `Patterns/DetailHeader` stories | `DetailHeader` pattern |
| `Docs/Component Classification` | Figma file organization README |
| `Docs/Design Principles` | Figma file README or cover page |

### Storybook status (v1.26.0)

**`FeedbackMessage` group placement — resolved.** `FeedbackMessage.stories.tsx` title is `Components/Feedback/FeedbackMessage`. All feedback components are correctly grouped under `Components/Feedback/`.

**`CardSurface` interactive story name — resolved (v1.15.0).** The "Interactive (div with hover)" story was renamed to "Interactive (div — cursor only)" to reflect that `interactive` on a div only adds `cursor: pointer` with no hover visual state. The `WithClassName` story was retitled to clarify it demonstrates the intentional `trip-intel-card` opacity variant (0.68).

**Consider adding a `CardSurface` story that uses countdown blue.**
A story showing the countdown label color would validate the token end-to-end in Storybook. Not required before Figma work begins.

---

## 7. Token System Integrity Notes

### What is in good shape

- Primitive colors are all opaque — no alpha values baked into primitives (as of v1.7.0)
- Opacity primitives (`opacity.primitive.*`) provide raw alpha values for both Figma and CSS reference
- Semantic opacity tokens document the design system's composition model
- Style Dictionary filter correctly excludes tokens with 'primitive' in path from generated output
- `tokens-bridge.css` correctly routes all legacy variable names to token values
- `radius.card`, `radius.input`, `radius.pill` are semantic aliases for ordinal scale values
- Shadow tokens have both ordinal (`shadow.sm`) and semantic (`shadow.surface.card`) names

### Token debt remaining after v1.7.0

| Debt item | Scope | Severity |
|-----------|-------|----------|
| `typography.label` naming collision with `.label` CSS class | Token rename to `field-label` | Medium — wait for forms CSS migration |
| Hardcoded `#a1a1a6` in App.css | Should be `var(--color-text-muted)` | Low |
| Inline rgba() in App.css without documentation comments | Add `/* Color/X × Opacity/Y */` comments | Low |
| Hardcoded `rgba(255, 69, 58, ...)` in App.css §10–11 | Should be `var(--color-danger-*)` | Low |
| `--accent: #0a84ff` in `index.css` light-mode block | Dead code; safe to remove only after light-mode strategy is decided | Low |
| Spacing/Radius primitives not yet aliasing from a unified Size/* scale | Future migration — no breaking change needed now | Deferred |
| No component tokens yet | Future — after Figma variable setup | Planned |

### What is not a token but probably should be

| Value | Current usage | Potential token |
|-------|---------------|-----------------|
| Hover overlay fills (`rgba(255,255,255,0.08–0.14)`) | Interactive hover on buttons, cards | Component token layer |
| Trip image overlay `rgba(0,0,0,0.52)` | Background dim for trip header image | `opacity.header-image.overlay` available; migrate via pseudo-element |

These are candidates for the Component token layer once that is established.

---

## 8. MCP / Code Connect Considerations

### Goal

The future state: a Figma component's properties map to a React component's props without manual re-annotation.

For Code Connect to work well, the Figma and React systems need to share:
1. Component names (1:1 mapping)
2. Prop names and types (or a clear mapping table)
3. Variant names (Figma variant values = React prop values)

### Current readiness

| Component | Figma | React | Code Connect |
|-----------|-------|-------|-------------|
| `Button` | ✅ | ✅ | ✅ |
| `IconButton` | ✅ | ✅ | ✅ |
| `CardSurface` | ✅ | ✅ | ✅ — `as` prop not mapped; `Variant=Interactive` maps to `interactive` boolean only |
| `ModalSheet` | ✅ | ✅ | ✅ |
| `DashboardCard` | ✅ `04 Patterns` — component set `208:16` | ✅ | ❌ not yet wired |
| `DetailHeader` | ✅ `04 Patterns` — component set `236:81`; PageControls (`position: fixed`) + ScreenHeader (in-flow); 3 variants (Default / WithAction / Full) | ✅ | ❌ not yet wired |
| `DayTile` | ✅ `04 Patterns` *(v1.23.0)* | ✅ | ❌ not yet wired |
| `Badge` | ✅ *(v1.8.0)* | ✅ | ✅ *(v1.8.0)* |
| `FeedbackMessage` | ✅ *(v1.8.0)* | ✅ | ✅ *(v1.8.0)* |
| `EmptyState` | ✅ *(v1.8.0)* | ✅ | ❌ not yet wired (Figma node 69:79; fill opacity Figma API constraint documented) |
| `ProgressPill` | ✅ *(v1.8.0)* | ✅ | ✅ *(v1.8.0)* |
| `StatusButton` | ✅ *(v1.8.0)* | ✅ | ❌ not yet wired (Figma node 76:93) |
| Form controls (`TextInput`, `TextArea`, `SelectInput`, `FormRow`) | ✅ *(v1.8.0)* | ✅ | ✅ |
| Form layout (`FormGrid`, `FormActions`) | ✅ *(v1.8.0)* | ✅ | ❌ not yet wired (Figma nodes 86:54, 92:65) |
| Navigation (`ScreenHeader`, `PageControls`) | ✅ *(v1.8.0)* | ✅ | ❌ not yet wired (Figma nodes 111:115, 111:158) |
| `Icon` | ✅ | ✅ | ❌ not yet wired — deferred (known Storybook rendering defect) |
| `PlaceInput` | ❌ pending Phase 5 Figma | ✅ | ❌ not yet wired — deferred until Figma component exists |

### Naming alignment to preserve

When building Figma components, use these prop/variant names to align with the React components:

| React component | React prop | Figma variant property |
|----------------|------------|----------------------|
| `Button` | `variant: 'primary' \| 'secondary' \| 'destructive'` | `Variant: Primary / Secondary / Destructive` |
| `IconButton` | `variant: 'default' \| 'primary' \| 'destructive' \| 'complete'` | `Variant: Default / Primary / Destructive / Complete` |
| `IconButton` | `selected: boolean` | `Selected: True / False` |
| `Badge` | `tone: 'neutral' \| 'accent' \| ...` | `Tone: Neutral / Accent / ...` |
| `CardSurface` | `as: 'div' \| 'button'` | `Interactive: True / False` |
| `TextInput` | `disabled: boolean` | `State: Default / Disabled` |

### MCP considerations

When Figma MCP is in use, the tool will inspect Figma frames and attempt to generate or validate component usage. For this to produce correct output:

1. Token names in Figma must match CSS variable names (with transformation: `Semantic/Color/Surface/Glass` → `--color-surface-glass`)
2. Typography properties in Figma must reference font variables, not hardcoded values
3. Every component in Figma should map to exactly one React component

The three-layer architecture (Primitive → Semantic → Component) supports MCP because it creates a traceable chain from Figma variable to CSS property to React component.

---

## 9. Opacity Handling Rule

Maycation models opacity as a design-system primitive, but Figma and CSS express it differently. This rule is the single source of truth for how transparency is applied.

### The rule

**Primitive colors are always opaque.** Alpha/transparency is never encoded into a primitive color token. Instead, opacity is a separate primitive (`Opacity/8`, `Opacity/74`, etc.) that is applied at the correct layer for each output target.

### In Figma

Use opaque color primitives. Apply opacity as a **separate `Opacity/*` variable at the paint/fill/stroke layer**.

```
CardSurface fill:
  Color  → Color/Neutral 800    (opaque #1c1c1e)
  Opacity → Opacity/Surface/Glass  (0.72)

Glass border stroke:
  Color  → Color/White           (opaque #ffffff)
  Opacity → Opacity/Border/Glass  (0.08)
```

Never set element-level opacity on a component in Figma to simulate surface transparency — it dims nested text and icons.

### In CSS

Do **not** use `opacity:` on container components (cards, modals, buttons, inputs). Use composited `rgba()` values directly so text and child elements remain fully opaque.

```css
/* Correct — token variable outputs the rgba() composite directly */
.card-surface {
  background: var(--color-surface-glass); /* rgba(28,28,30,0.72) — Color/Neutral 800 × Opacity/Surface/Glass */
  border: 1px solid var(--color-border-glass); /* rgba(255,255,255,0.08) — Color/White × Opacity/Border/Glass */
}

/* Wrong — element opacity dims child text */
.card-surface {
  background: #1c1c1e; /* Color/Neutral 800 opaque */
  opacity: 0.72; /* ❌ affects all children — text becomes translucent */
}
```

### When element-level opacity IS acceptable in CSS

| Case | Reason |
|------|--------|
| Disabled state (`opacity: 0.65` on whole component — `--opacity-disabled-default`) | Disabled components uniformly dim all visual properties; no live text interaction expected |
| `::before` / `::after` pseudo-element overlays | Pseudo-elements have no children |
| `.modal-backdrop` (separate element, no text children) | rgba() is preferred but element opacity is also safe |

### CSS variable output note *(updated v1.13.0)*

The CSS token `--color-surface-glass` outputs `rgba(28,28,30,0.72)` — the fully composited value. **Use `var(--color-surface-glass)` directly in CSS for standard glass surfaces.** The §7 `:where()` canonical blocks use it this way. Do not repeat the raw `rgba()` literal for the canonical value — use the token.

Intentional surface variants that deviate from the canonical value (`trip-intel-card` 0.68, `planner-item-card` 0.76) continue to use inline `rgba()` with a documentation comment because no semantic token exists for those specific alpha values yet.

CSS opacity tokens (`--opacity-surface-glass: 0.72`, etc.) are generated and available for Figma variable binding references and non-container opacity contexts (pseudo-elements, standalone overlays).

### Summary table

| Token | Figma expression | CSS expression |
|-------|-----------------|----------------|
| `color.surface.glass` | `Color/Neutral 800` + `Opacity/Surface/Glass` fill | `rgba(28, 28, 30, 0.72)` / `var(--color-surface-glass)` |
| `color.surface.input` | `Color/Black` + `Opacity/Surface/Input` fill | `rgba(0, 0, 0, 0.28)` |
| `color.border.glass` | `Color/White` + `Opacity/Border/Glass` stroke | `rgba(255, 255, 255, 0.08)` |
| `color.border.control` | `Color/White` + `Opacity/Border/Control` stroke | `rgba(255, 255, 255, 0.10)` |
| `color.danger.surface` | `Color/Red 500` + `Opacity/Danger/Surface` fill | `rgba(168, 75, 75, 0.20)` |
| `color.overlay.default` | `Color/Black` + `Opacity/Overlay/Default` fill | `rgba(0, 0, 0, 0.78)` |
| `color.countdown.border` | `Color/Blue Vivid` + `Opacity/Countdown/Border` stroke | `rgba(10, 132, 255, 0.28)` |

---

## 10. Style Dictionary Configuration Notes

The current `sd.config.mjs` filters primitive tokens out of generated output:

```javascript
filter: (token) => !token.path.includes('primitive'),
```

This is correct — primitives are backing values, not consumable variables. Both the CSS and TypeScript outputs apply this filter.

When component tokens are added (Layer 2), they will be filtered **in** to the output since they are consumable. No config change required; the filter already handles this correctly.

---

## Appendix: Token Source Files

| File | Contents |
|------|----------|
| `tokens/source/color.tokens.json` | All color tokens (opaque primitives, semantic with rgba composites, product) |
| `tokens/source/opacity.tokens.json` | Opacity primitives (0.08–0.78) and semantic opacity aliases |
| `tokens/source/spacing.tokens.json` | Spacing scale |
| `tokens/source/radius.tokens.json` | Radius scale + semantic aliases (card, input, pill) |
| `tokens/source/shadow.tokens.json` | Shadow values — ordinal (sm/md/lg) + semantic (surface/card, surface/panel, surface/overlay) |
| `tokens/source/typography.tokens.json` | Type scale |
| `tokens/source/icon.tokens.json` | Icon sizes |
| `tokens/generated/tokens.css` | Generated CSS custom properties (do not edit) |
| `tokens/generated/tokens.ts` | Generated TypeScript constants (do not edit) |
| `src/tokens-bridge.css` | Legacy variable bridge; maps `--text`, `--accent`, etc. to token values |

To regenerate after editing source files:

```bash
npm run build:tokens
```
