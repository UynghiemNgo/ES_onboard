# EarthSama — Unified Design Spec

## Overview
A clean, trustworthy web platform for landowners to submit their land parcels for carbon credit eligibility assessment. Replaces a broken Google Forms + email + Airtable pipeline.

All pages share a unified green brand via `shared.css` design tokens. The landing page (`earthsama.com/index.html`) and portal pages (form, dashboard, live map) use the same color palette, typography, and logo.

---

## Design Principles
1. **Trust-first** — Landowners are giving sensitive property info. The UI must feel institutional and secure.
2. **Progressive disclosure** — Don't overwhelm. Multi-step form, one concern per screen.
3. **Map-native** — The land *is* the product. Map interaction is central, not an afterthought.
4. **Mobile-ready** — Landowners are often on-site. Must work on phones.

---

## User Flow

```
Landing Page
  │
  ▼
Step 1: Owner Details
  (Name, email, phone, entity type)
  │
  ▼
Step 2: Land Details
  (Acreage, land type, current use, years owned)
  │
  ▼
Step 3: Location Selection ★
  (Google Maps with search bar)
  (Click to drop pin OR draw polygon)
  (Auto-fills coordinates + address)
  │
  ▼
Step 4: Review & Submit
  (Summary card with map preview)
  (Edit buttons to go back)
  │
  ▼
Confirmation
  (Reference number, next steps, timeline)
```

---

## Visual Design

### Color Palette (matched to pitch deck)
| Token           | Value                    | Usage                        |
|-----------------|--------------------------|------------------------------|
| `--primary`     | `#8B6914`                | Gold accent — CTAs, brand    |
| `--primary-light` | `#a67c1a`              | Hover states                 |
| `--surface`     | `#f4f2ee`                | Pearl/warm white background  |
| `--card`        | `#f9f7f4`                | Card backgrounds             |
| `--text`        | `#1e1c18`                | Body text (warm dark)        |
| `--text-muted`  | `rgba(50,45,35,0.6)`     | Labels, hints                |
| `--border`      | `rgba(120,110,90,0.18)`  | Dividers, input borders      |
| `--accent`      | `#8B6914`                | Same as primary              |
| `--accent-green`| `#4a6741`                | Secondary green accent       |
| `--error`       | `#DC2626`                | Validation errors            |

### Typography
- **Display:** Newsreader (300, 400, italic) — headings, titles, large numbers
- **Body:** Jost (300, 400, 500) — UI text, labels, paragraphs
- **Matched to pitch deck** — same fonts across landing, portal, and pitch
- **Scale:** 16px base, 1.6 line-height

### Layout
- Max-width: 720px content area (form steps)
- Map step: full-width with side panel on desktop, stacked on mobile
- Card-based sections with subtle shadows
- Step indicator bar at top

### Components
- **Step Indicator** — Horizontal progress dots with labels
- **Input Fields** — Label above, hint text below, green focus ring
- **Map Panel** — Full interactive Google Map with:
  - Search bar (Google Places Autocomplete)
  - Pin drop on click
  - Polygon drawing tool for boundaries
  - Area calculation display
- **Summary Cards** — Key-value pairs with edit icons
- **CTA Buttons** — Full-width on mobile, right-aligned on desktop

---

## Responsive Breakpoints
| Breakpoint | Behavior                            |
|------------|-------------------------------------|
| < 640px    | Single column, stacked map          |
| 640–1024px | Centered form, map below inputs     |
| > 1024px   | Map step gets side-by-side layout   |

---

## Data Model (per submission)

```json
{
  "id": "sub_xxxx",
  "created_at": "2026-03-23T...",
  "status": "submitted",
  "owner": {
    "name": "",
    "email": "",
    "phone": "",
    "entity_type": "individual | company | trust | other"
  },
  "land": {
    "acreage": 0,
    "land_type": "forest | grassland | cropland | wetland | mixed",
    "current_use": "agriculture | timber | conservation | unused | other",
    "years_owned": 0,
    "has_encumbrances": false
  },
  "location": {
    "address": "",
    "lat": 0,
    "lng": 0,
    "polygon": [[lat, lng], ...],
    "calculated_area_acres": 0
  }
}
```

---

## Token Architecture

All design tokens live in `shared.css` and are loaded via `<link>` tag in every HTML page:
- `index.html` — `<link rel="stylesheet" href="shared.css">`
- `dashboard.html` — `<link rel="stylesheet" href="shared.css">`
- `live.html` — `<link rel="stylesheet" href="shared.css">`
- `earthsama.com/index.html` — `<link rel="stylesheet" href="../shared.css">`

The `<link>` tag is placed before page-specific CSS to ensure correct cascade order. CSS custom properties defined in `shared.css` are available to all subsequent stylesheets on the page.

### Landing Page Convention
Landing page styles use `.landing-` prefix to avoid specificity conflicts with portal CSS.

### Logo
Standardized `logo-icon.png` (earth-tone seedling from pitch deck) loaded via `<img>` tag across all pages. Source: `earthsama.com/pitch-assets/logo-icon.png`, copy at root `logo-icon.png`. Three variants available in `pitch-assets/`: icon-only, with wordmark, and combined.

### Vertical Timeline Component
Used on landing page "How It Works" section. Three-step vertical layout with numbered dots, connecting line, and content. Replaces 3-column card grid.

### Mobile Navigation
CSS-only hamburger menu at 640px breakpoint (checkbox hack, no JS). 44px minimum touch targets.

---

## Future Considerations
- Backend API + database (Supabase or similar)
- Document upload (title deeds, survey reports)
- Email notifications on status changes
- Satellite imagery overlay for land assessment
