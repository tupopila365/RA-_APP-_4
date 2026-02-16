# Roads Authority App — Design Instructions (Design v2)

This document defines the visual and interaction design for the Roads Authority mobile application. The system is inspired by professional government/city apps (e.g. City of Windhoek) and follows enterprise UI/UX standards for clarity, trust, and accessibility.

---

## 1. Design principles

- **Professional & authoritative**: Confident typography, ample spacing, no playful or casual elements.
- **Trustworthy**: Consistent patterns, clear hierarchy, no dark patterns.
- **Accessible**: WCAG AA minimum, 44–48pt touch targets, support font scaling.
- **Institutional**: Muted palette, clear section dividers, official-looking headers.

---

## 2. Color palette

### Primary (header & navigation)

| Token | Hex | Usage |
|-------|-----|--------|
| `headerPrimary` | `#1A3A72` (or theme primary) | Header background, bottom nav bar |
| `headerPrimaryLight` | `#2E5090` | Geometric pattern overlay, subtle accents |
| `headerGradientTop` | Lighter blue | Optional gradient top edge |

Use a **deep blue** for the header/nav to convey authority. The rest of the app uses the existing Roads Authority government theme (primary `#00B4E6`, neutrals, status colors).

### Content & surfaces

- **Content background**: White `#FFFFFF` or off-white `#F8F9FA`.
- **Cards**: White with subtle border or shadow (e.g. `#E2E8F0` border, 12–16pt radius).
- **Text on header/nav**: White `#FFFFFF`.

### Accents

- **Links & actions**: Use theme primary (`#00B4E6`) or header primary where appropriate.
- **Information boxes**: Light blue background (e.g. `#E8F7FC`) with dark blue border.
- **Values/category icons**: Distinct background per item (purple, yellow, red, green, etc.) with white icon.

---

## 3. Typography

- **Screen title (in header)**: Large, white, bold (e.g. 20–24pt).
- **Card titles**: Bold, dark blue/primary text (e.g. 18–20pt).
- **Body**: 15–17pt, regular, dark gray.
- **Labels**: 12–14pt, semibold; place above inputs, not as placeholder only.
- **Captions**: 11–13pt, muted gray.

Use the app’s existing `typography` tokens; limit to 3–4 levels per screen.

---

## 4. Spacing & layout

- **Base unit**: 4pt or 8pt; use 8, 12, 16, 24, 32 for consistency.
- **Screen padding**: 16–24pt horizontal; respect safe areas.
- **Card padding**: 16–20pt inside cards.
- **Section spacing**: 16–24pt between sections; 8pt between related items.
- **Touch targets**: Minimum 44×44pt (iOS) / 48×48dp (Android).

---

## 5. Core components (to implement)

### 5.1 App header

- **Background**: Deep blue with optional subtle geometric (triangle/polygon) pattern.
- **Left**: Back button (chevron left) when applicable; white icon.
- **Center**: Logo (emblem) + “Roads Authority” or short “RA” label in a small bordered badge.
- **Right**: Optional overflow menu (three vertical dots).
- **Title**: Current screen name in white, bold, below or beside logo as needed.

Use on: Home, About, Contact, forms, and all secondary screens.

### 5.2 Search bar

- **Position**: Directly below header on home/dashboard.
- **Style**: White, full-width, rounded corners (e.g. 12pt), subtle shadow/border.
- **Content**: Magnifying glass icon (left), placeholder e.g. “Search the RA app” or “Search road status, permits…”.
- **Height**: Minimum 48pt.

### 5.3 Service grid (home/dashboard)

- **Layout**: Grid of tiles (e.g. 2×3 or 3×2); equal-width, square or near-square.
- **Tile**: White card, rounded corners, light gray border, one primary icon (blue) on top, label below.
- **Spacing**: Consistent gap between tiles (e.g. 12–16pt).
- **Examples**: Sign In, Sign Up, Report Road Issue, Apply for Permit, Road Status, Feedback, FAQs, etc.

Each tile is a single touch target (min 44pt); use `ServiceTile` + `ServiceGrid`.

### 5.4 Information cards (e.g. About, Contact)

- **Container**: White card on light gray page background; 12–16pt corner radius.
- **Structure**: Bold title (e.g. “Vision”, “Mission”, “Banking Information”) + body text or structured content below.
- **Dividers**: Optional 1pt light gray between sections inside a card.
- Use for: About Us sections, payment/contact details, instructions.

### 5.5 Values / category icon row

- **Layout**: Horizontal row of square icon cells.
- **Cell**: Colored square (e.g. purple, yellow, red, green), white pictogram, label underneath.
- **Use**: Values, road-safety tips, permit types, reporting categories, etc.
- **Touch**: Each cell min 44pt; consistent padding and gap.

### 5.6 Bottom navigation bar

- **Background**: Same deep blue as header; optional subtle dot pattern.
- **Items**: Up to 5; each: icon + short label (e.g. Home, About, Contact, Emergency, More).
- **Style**: White icon and white label; selected state can be slightly brighter or underlined.
- **Height**: Comfortable thumb zone (e.g. 56–64pt + safe area).

### 5.7 Forms (e.g. Submit Feedback, Report Issue)

- **Container**: Main content in a white card with rounded top corners; scrollable.
- **Instruction block**: Light blue info box at top with dark blue border; support bold for key terms (e.g. “reference numbers”).
- **Fields**: Label above input; required indicator (`*`); 44pt min height; bottom border or outlined style.
- **Types**: Full Name, Email, Phone, Dropdown (e.g. rating or category), Comment (multiline).
- **Dropdown**: Label, placeholder “— select … —”, chevron down; open as modal or inline list.

Use `FormInput`, `DropdownSelector`, `InfoBox`, and `ScreenContainer` from the design-v2 components.

### 5.8 Screen container (content area)

- **Role**: Wraps main content below header.
- **Style**: White or off-white background; optional rounded top corners where it meets the header.
- **Scroll**: Allow vertical scroll for long content (cards, forms, lists).

---

## 6. Iconography

- **Style**: Simple, recognizable, consistent weight (outline or solid).
- **Color**: White on blue; primary blue or dark gray on white.
- **Size**: 24pt for nav/list; 32–40pt for service tiles.
- Prefer `@expo/vector-icons` (e.g. Ionicons) and keep a single icon set across the app.

---

## 7. Anti-patterns to avoid

- More than one accent color for primary UI.
- Placeholder-only inputs without visible labels.
- Inconsistent spacing (e.g. mixing 7px, 13px).
- Touch targets smaller than 44pt.
- Pure black (`#000`) text on pure white; use dark gray.
- Decorative-only borders or shadows that don’t convey hierarchy or state.

---

## 8. Checklist per screen

- [ ] Header: back (if needed), logo, title, optional menu.
- [ ] Typography: max 4 levels; clear hierarchy.
- [ ] Spacing: 8pt grid; 44pt touch targets.
- [ ] Color: header/nav blue; content white/cards; theme primary for actions.
- [ ] Components: use design-v2 components and theme tokens.
- [ ] No decorative-only elements.

---

## 9. File structure (design-v2)

```
app/design-v2/
├── DESIGN_INSTRUCTIONS.md   (this file)
├── designTokens.js         (optional: header blue, spacing overrides)
└── components/
    ├── index.js
    ├── AppHeader.js
    ├── SearchBar.js
    ├── ScreenContainer.js
    ├── ServiceTile.js
    ├── ServiceGrid.js
    ├── InfoCard.js
    ├── IconGridCard.js
    ├── BottomNavBar.js
    ├── FormInput.js
    ├── DropdownSelector.js
    └── InfoBox.js
```

Use these components when building or refactoring screens to match this design. Import theme from `../../theme` and hooks from `../../hooks` so design-v2 stays consistent with the rest of the app.
