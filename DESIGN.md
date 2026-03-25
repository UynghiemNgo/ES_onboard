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

### Color Palette
| Token           | Value     | Usage                        |
|-----------------|-----------|------------------------------|
| `--primary`     | `#1B5E20` | Deep forest green — CTAs     |
| `--primary-light` | `#4CAF50` | Hover states, accents      |
| `--surface`     | `#FAFDF7` | Page background (warm white) |
| `--card`        | `#FFFFFF` | Card backgrounds             |
| `--text`        | `#1A1A1A` | Body text                    |
| `--text-muted`  | `#6B7280` | Labels, hints                |
| `--border`      | `#E5E7EB` | Dividers, input borders      |
| `--accent`      | `#F59E0B` | Warnings, highlights         |
| `--error`       | `#DC2626` | Validation errors            |

### Typography
- **All pages:** Inter (400, 500, 600, 700, 800)
- **No serif fonts** — Newsreader was removed from landing page
- **Fallback:** `'Inter', system-ui, -apple-system, sans-serif`
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

All design tokens live in `shared.css` and are imported by every page:
- `styles.css` — `@import url('shared.css')`
- `dashboard.css` — `@import url('shared.css')`
- `live.css` — `@import url('shared.css')`
- `earthsama.com/index.html` — `<link rel="stylesheet" href="../shared.css">`

Portal HTML files also add `<link rel="stylesheet" href="shared.css">` before other CSS.

### Landing Page Convention
Landing page styles use `.landing-` prefix to avoid specificity conflicts with portal CSS.

### Logo
Standardized inline SVG across all pages (green circle + leaf + upward arrow, 32x32).

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
