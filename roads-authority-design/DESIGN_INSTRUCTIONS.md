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
| `headerPrimary` | `#00B4E6` | Header background, bottom nav bar (RA primary) |
| `headerPrimaryLight` | `#33C4ED` | Geometric pattern overlay, subtle accents |
| `headerGradientTop` | `#0099CC` | Gradient top edge |

Use **Roads Authority primary** `#00B4E6` (Namibian Sky Blue) for header/nav and main UI. Rest of the app uses theme primary and neutrals.

### Content & surfaces

- **Content background**: White `#FFFFFF` or off-white `#F8F9FA`.
- **Cards**: White with subtle border; 12–16pt radius.
- **Text on header/nav**: White `#FFFFFF`.

---

## 3. Typography

- **Screen title (in header)**: 20–24pt, white, bold.
- **Card titles**: 18–20pt, bold, dark blue.
- **Body**: 15–17pt, regular.
- **Labels**: 12–14pt, semibold; above inputs.
- **Captions**: 11–13pt, muted.

---

## 4. Spacing & layout

- **Base unit**: 8pt (8, 12, 16, 24, 32).
- **Screen padding**: 16–24pt horizontal; respect safe areas.
- **Touch targets**: Minimum 44×44pt (iOS) / 48×48dp (Android).

---

## 5. Core components

| Component | Purpose |
|-----------|--------|
| **AppHeader** | Deep blue header with back, logo, title, menu |
| **SearchBar** | White search below header; 48pt min height |
| **ScreenContainer** | Scrollable content area; rounded top |
| **ServiceTile** | Single service tile (icon + label) |
| **ServiceGrid** | 3-column grid of ServiceTiles |
| **InfoCard** | White card with title + content |
| **IconGridCard** | Horizontal row of colored icon cells |
| **BottomNavBar** | 5-item bottom nav (deep blue) |
| **FormInput** | Label + input; required * support |
| **DropdownSelector** | Label + dropdown with modal list |
| **InfoBox** | Light blue instruction box |

---

## 6. File structure (standalone app)

```
roads-authority-design/          ← Run this folder on its own (Expo)
├── package.json
├── app.json
├── App.js
├── babel.config.js
├── DESIGN_INSTRUCTIONS.md       (this file)
├── designTokens.js
├── theme/
│   ├── index.js
│   ├── spacing.js
│   ├── typography.js
│   ├── borderRadius.js
│   └── colors.js
├── components/
│   ├── index.js
│   ├── AppHeader.js
│   ├── SearchBar.js
│   ├── ScreenContainer.js
│   ├── ServiceTile.js
│   ├── ServiceGrid.js
│   ├── InfoCard.js
│   ├── IconGridCard.js
│   ├── BottomNavBar.js
│   ├── FormInput.js
│   ├── DropdownSelector.js
│   └── InfoBox.js
└── assets/
    ├── icon.png
    ├── splash.png
    ├── adaptive-icon.png
    └── favicon.png
```

---

## 7. How to run

From the project root:

```bash
cd roads-authority-design
npm install
npx expo start
```

Then press `a` for Android or `i` for iOS, or scan the QR code with Expo Go.

---

## 8. Checklist per screen

- [ ] Header: back (if needed), logo, title, optional menu.
- [ ] Typography: max 4 levels; clear hierarchy.
- [ ] Spacing: 8pt grid; 44pt touch targets.
- [ ] Color: header/nav blue; content white/cards.
- [ ] No decorative-only elements.
