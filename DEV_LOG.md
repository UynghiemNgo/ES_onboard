# EarthSama — Dev Log

## 2026-03-23 — Project Kickoff

### Problem
Landowners want to submit land for carbon credit eligibility. Current workflow (Google Forms → email → Airtable) is fragmented, loses data, and doesn't support geospatial input.

### Solution
A purpose-built web app where landowners can:
1. Submit land details (ownership, acreage, land type, current use)
2. Select their land parcel via Google Maps with search
3. Draw/mark boundaries on the map
4. Track submission status

### Tech Stack
- **Frontend:** HTML/CSS/JS (single-page app, zero build step — fast to ship)
- **Maps:** Leaflet.js + Leaflet.draw (free, no API key)
- **Tiles:** Esri satellite imagery (free), OpenStreetMap, OpenTopoMap
- **Search:** Nominatim geocoder (free, no API key)
- **Styling:** Custom CSS, mobile-first design system
- **Data:** LocalStorage for MVP, backend-ready JSON structure
- **Export:** KML file generation (client-side)

### Work Completed
- [x] Project scaffolding
- [x] Design system & app shell
- [x] Multi-step submission form
- [x] Leaflet map with satellite/street/topo layers
- [x] Nominatim address search (free geocoding)
- [x] Pin drop + polygon drawing for land boundaries
- [x] Real-time area calculation (acres)
- [x] KML file generation & download
- [x] Submission review with mini-map preview
- [x] Mobile-first responsive design (touch-optimized)
- [x] Safe area support for notched phones

---

## 2026-03-23 — V2: Leaflet + KML

### Changes
- **Replaced Google Maps** with Leaflet.js — no API key needed, better mobile touch support
- **Satellite tiles** from Esri (free), plus street (OSM) and topo layer toggles
- **Address search** via Nominatim (OpenStreetMap geocoder) — completely free
- **KML export** — draws polygon → generates valid KML file → user can download
- **Mobile-first rebuild** — 16px base font, 48px min touch targets, `100dvh`, safe area insets, `inputmode` attributes, `touch-action: manipulation` to kill 300ms delay
- **Draw mode default** — most landowners want to draw boundaries, not drop pins
- KML file is stored with submission data and downloadable from review + confirmation screens

---

## 2026-03-23 — V3: Form Polish + KML Import + Docs + Dashboard

### Smooth Form UX
- Slide transitions between steps (forward/back directions)
- Animated progress bar fills proportionally
- Step indicator dots scale on active state
- CSS cubic-bezier easing throughout

### KML Import
- Import button in map toolbar opens file picker (.kml files)
- Drag-and-drop KML onto the map area (green overlay on drag)
- Parses `<Polygon>` and `<Point>` geometry via DOMParser
- Auto-fits map bounds, calculates area, populates location fields
- Round-trip: import KML → edit boundary → export new KML

### Document Upload (optional)
- Drag-and-drop zone in Step 2 (Land Details)
- Supports images, PDFs, docs — max 5 files, 2MB each
- Thumbnail previews for images, file icon for docs
- Remove individual files, shown in review step
- Metadata stored with submission (base64 stripped to save localStorage)

### Admin Dashboard (`dashboard.html`)
- **Stats bar** — Total, Submitted, Reviewing, Approved, Rejected counts
- **Search** — Filter by name, email, reference ID, address
- **Filters** — Status dropdown, land type dropdown
- **Table** — All submission fields, sortable by date
- **Inline status management** — Change status via dropdown in each row
- **Detail panel** — Slide-over with full submission details + mini-map
- **Single KML export** — Download individual submission as .kml
- **Bulk KML export** — Select multiple → export as single multi-placemark .kml
- **Export All** — One-click export of all submissions for Google Earth
- **Delete** — Remove submissions with confirmation
- Responsive: stacks filters, hides columns, full-width detail panel on mobile

### Files
- `index.html` — Updated form with KML import, doc upload, smooth transitions
- `styles.css` — Slide animations, upload zone, progress bar, polish
- `app.js` — KML import/parse, doc upload handling, animated step nav
- `dashboard.html` — New admin dashboard page
- `dashboard.css` — Dashboard-specific styles
- `dashboard.js` — Dashboard logic (CRUD, filters, KML export)

---

## 2026-03-23 — V4: KMZ + Export Hub + Platform APIs

### KMZ Zip Export (JSZip)
- `.kmz` button on the map step and confirmation screen
- KMZ = zipped KML + `metadata.json` (owner, acreage, coords)
- Dashboard: single/bulk/all KMZ export via export modal
- Full ZIP bundle: KML + GeoJSON + CSV + all platform JSONs + individual parcel KMLs + README

### Export Modal (Dashboard)
- Click "Export" → modal with all format options
- Works for single submission, checkbox-selected, or all
- Shows parcel count badge

### File Formats
| Format | Use Case |
|--------|----------|
| `.KMZ` | Google Earth (zipped, smaller) |
| `.KML` | Google Earth, QGIS, ArcGIS |
| `.GeoJSON` | Web maps, Mapbox, APIs, Restor |
| `.CSV` | Excel, Google Sheets, databases |

### Platform API Adapters
| Platform | Format | Notes |
|----------|--------|-------|
| **Restor** | GeoJSON FeatureCollection | Properties mapped: `site_type`, `ecosystem`, `intervention`, `area_ha`. Instructions for restor.eco import included. |
| **Google Earth Engine** | GEE FeatureCollection JSON | Typed `columns` header, `system_index`, hectares. Upload as GEE table asset. |
| **EarthSama** | Custom API JSON | `POST /api/v1/parcels/bulk-import` ready. Includes `parcel`, `location.boundary`, `carbon.eligible`, `documents[]`, `metadata`. |

### Full ZIP Bundle
Downloads everything in one file:
```
earthsama-export-N-parcels-2026-03-23.zip
├── earthsama-2026-03-23.kml
├── earthsama-2026-03-23.geojson
├── earthsama-2026-03-23.csv
├── platforms/
│   ├── restor.json
│   ├── google-earth-engine.json
│   └── earthsama.json
├── individual-parcels/
│   ├── CLR-XXXX.kml
│   └── CLR-YYYY.kml
└── README.txt
```

### Files Modified
- `dashboard.html` — Export modal with format cards
- `dashboard.css` — Modal styles, responsive bottom-sheet on mobile
- `dashboard.js` — All export adapters (KMZ, GeoJSON, CSV, Restor, GEE, EarthSama, full ZIP)
- `index.html` — JSZip CDN, KMZ buttons
- `app.js` — `downloadKMZ()` function

---

## 2026-03-23 — V5: Philippines First + Referrals + Live Dashboard

### Philippines Focus — 17 Regions + 82 Provinces
- Map defaults to Philippines center (`12.8797, 121.7740`, zoom 6)
- PH region dropdown in Step 1 (17 regions: NCR, CAR, Regions I–XIII, BARMM)
- **82 province dropdown** — dynamically populated based on selected region
- Phone placeholder updated to PH format (`+63 9XX XXX XXXX`)
- Region + Province added to submission data model (`owner.region`, `owner.province`)
- Region + Province validation required on Step 1
- Region + Province displayed in Review step, admin detail panel, and all exports

### Qualification Thresholds
- **Region threshold: 100,000 hectares approved** → qualifies for OMTSE + Apl team support
- **Province threshold: 10,000 hectares approved** → province qualifies
- Live dashboard shows progress bars toward both thresholds
- Map markers colored by threshold progress (amber < 50%, green 50-99%, dark green = qualified)
- Hero stats show qualified regions (X / 17) and qualified provinces (X / 82)
- Threshold explainer cards at top of live dashboard

### Status Flow Change
- Removed "Rejected" status entirely — nothing gets rejected
- Added "Needs Info" (`needs_info`) status for submissions needing more information
- Updated across all files: dashboard stats, filters, table dropdowns, CSS badges, export adapters

### Referral System
- Each submission generates a unique referral code (e.g. `CLR-ABC123`)
- Referral code input field on Step 1 (optional, "Referred by a friend?")
- Auto-fills from `?ref=CODE` URL parameter
- Confirmation page shows referral sharing section:
  - Referral code display with copy button
  - Full referral link with copy button
- `referral_code` and `referred_by` added to submission data model
- Referral fields included in CSV export

### Live Public Dashboard (`live.html`)
- **Hero stats** — Total hectares committed, total submissions, approved parcels, active regions
- **Philippines choropleth map** — Circle markers per region, sized and colored by hectares committed
  - Green gradient scale (light → dark green)
  - Tooltips with region name, hectares, submission count, approved count
  - Labels showing hectares above each region marker
- **Regional breakdown sidebar** — All 17 regions ranked by hectares, with color indicators
  - Hover on sidebar highlights corresponding map marker
- **Recent submissions feed** — Last 6 submissions with masked names for privacy
  - Shows hectares, region, and time ago
- **CTA section** — Encourages landowners to submit
- **Auto-refresh** — Stats and list refresh every 30 seconds
- Fully responsive: stacks on mobile, adjusts map height

### Export Updates
- Region field added to: GeoJSON, CSV, GEE, EarthSama adapters
- CSV now includes `referral_code` and `referred_by` columns

### Files
- `index.html` — Referral code input, referral share section, Live Map header link
- `styles.css` — Referral share section styles
- `app.js` — Region validation, referral code generation, referral auto-fill from URL, copy functions
- `dashboard.html` — Status flow: rejected → needs_info, Live Map header link
- `dashboard.css` — Status badge/select colors for needs_info
- `dashboard.js` — Region labels, needs_info status, region in detail panel + all exports
- `live.html` — New live public dashboard page
- `live.css` — Live dashboard styles (hero stats, choropleth, sidebar, recent feed, CTA)
- `live.js` — Live dashboard logic (metrics computation, Leaflet choropleth, region list, auto-refresh)

---
