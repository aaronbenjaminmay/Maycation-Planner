/**
 * Do not edit directly, this file was auto-generated.
 * Run `npm run build:tokens` to regenerate.
 */

export const colorBackgroundDefault = "#000000"; // App-level page background
export const colorSurfaceDefault = "#121316"; // Fallback panel background; used before glass morphism is applied
export const colorSurfaceElevated = "#1a1c20"; // Elevated control surfaces; mode-toggle, account-strip
export const colorSurfaceInput = "#0d0f12"; // Input field background; the darkest surface in the system
export const colorSurfaceGlass = "rgba(28, 28, 30, 0.74)"; // Primary surface for cards, panels, and modals with backdrop blur
export const colorBorderDefault = "#2b2d32"; // Opaque border for non-glass contexts
export const colorBorderGlass = "rgba(255, 255, 255, 0.08)"; // Translucent white border for glass surfaces
export const colorTextPrimary = "#f5f7fb"; // Headings, strong text, labels on dark backgrounds
export const colorTextSecondary = "#b6bfcc"; // Body text; maps to CSS --text variable
export const colorTextMuted = "#a1a1a6"; // Metadata, summaries, day-tile subheadings; differs from text.secondary — see unresolved note in token inventory
export const colorAccentDefault = "#35b8a8"; // Brand accent; used on eyebrows, interactive focus rings, hover borders
export const colorAccentText = "#061312"; // Text color for use on accent-colored backgrounds
export const colorDangerSurface = "rgba(168, 75, 75, 0.2)"; // Danger action background fill
export const colorDangerBorder = "#a84b4b"; // Danger action border
export const colorDangerText = "#ffd7d7"; // Danger state text; readable on dark surfaces
export const colorKindActivity = "#35b8a8"; // Activity planner item kind badge border; shares the brand accent color
export const colorKindTravel = "#3483fa"; // Travel planner item kind badge border
export const colorKindReservation = "#f2a93b"; // Reservation planner item kind badge border
export const colorKindNote = "#9b8cff"; // Note planner item kind badge border
export const colorRoleOwner = "#35b8a8"; // Owner role pill border; shares the brand accent color
export const colorRoleEditor = "#3483fa"; // Editor role pill border
export const colorRoleViewer = "#9b8cff"; // Viewer role pill border
export const colorOverlayDefault = "rgba(0, 0, 0, 0.78)"; // Modal backdrop; applied to the full-screen dim layer
export const iconSm = "16px"; // Small icon; maps to Icon size='small' in the Icon component
export const iconMd = "18px"; // Default icon size; maps to Icon size='default'. Used in most UI contexts
export const iconLg = "20px"; // Large icon; maps to Icon size='large'. Used in primary action buttons and selected states
export const radiusSm = "8px"; // Small surface radius; account-strip
export const radiusMd = "14px"; // Input fields and feedback messages
export const radiusLg = "20px"; // Dominant radius for all card and panel surfaces; card-surface, dashboard-card, trip-card, day-tile, planner-item-card, modal-sheet
export const radiusFull = "999px"; // Pills and circular elements; progress-pill, role-pill, status-pill, icon-button, form buttons
export const radiusCard = "20px"; // Semantic alias for the main card surface radius. References radius.lg so card radius can change independently of the ordinal scale
export const radiusInput = "14px"; // Semantic alias for input field radius. References radius.md
export const shadowSm = "0 10px 28px 0 rgba(0, 0, 0, 0.34)"; // Component card shadow; used on dashboard-card, trip-card, day-tile, planner-item-card. From Visual System consolidation pass
export const shadowMd = "0 12px 34px 0 rgba(0, 0, 0, 0.36)"; // Panel surface shadow; used on card-surface, auth-panel, dashboard-panel, modal-sheet. From Visual System consolidation pass
export const shadowLg = "0 18px 50px 0 rgba(0, 0, 0, 0.28)"; // Large ambient shadow; matches the CSS --shadow variable value from index.css
export const spacing2xs = "4px"; // Tightest spacing; account-strip inner gap
export const spacingXs = "8px"; // Small gap; tag clusters, pill groups, screen-header actions gap
export const spacingSm = "12px"; // Form grid gap, list item gap (trips, members, planner items)
export const spacingMd = "16px"; // Standard layout gap; dashboard-header, modal-sheet header, detail-header
export const spacingLg = "18px"; // Dominant spacing value in Maycation. Card padding, page-shell gap, dashboard grid gap, modal-sheet gap, day-tile gap. Intentionally 18px — preserves established visual rhythm, not normalized to 20px
export const spacingXl = "24px"; // App-shell horizontal padding, panel padding (dashboard-panel, auth-panel)
export const spacing2xl = "32px"; // Reserved for future large-spacing needs; no current prominent usage in canonical CSS
export const typographyEyebrowFontSize = "11px";
export const typographyEyebrowFontWeight = 900;
export const typographyEyebrowLetterSpacing = "0.18em";
export const typographyEyebrowLineHeight = 1.15;
export const typographyEyebrowTextTransform = "uppercase";
export const typographyLabelFontSize = "12px";
export const typographyLabelFontWeight = 900;
export const typographyLabelLetterSpacing = "0.08em";
export const typographyLabelLineHeight = 1.2;
export const typographyLabelTextTransform = "uppercase";
export const typographyCaptionFontSize = "13px";
export const typographyCaptionFontWeight = 700;
export const typographyCaptionLineHeight = 1.35;
export const typographyActionFontSize = "14px";
export const typographyActionFontWeight = 900;
export const typographyActionLineHeight = 1.5;
export const typographyHeadingFontSize = "1rem";
export const typographyHeadingFontWeight = 900;
export const typographyHeadingLineHeight = 1.15;
export const typographySectionFontSize = "1.35rem";
export const typographySectionFontWeight = 900;
export const typographySectionLineHeight = 1.05;
export const typographyTitleFontSize = "clamp(1.8rem, 6vw, 2.55rem)"; // Fluid type scale. $type is string to prevent Style Dictionary from applying dimension transforms to the clamp() function
export const typographyTitleFontWeight = 900;
export const typographyTitleLineHeight = 0.98;
