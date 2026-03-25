# EarthSama — Carbon Credit Land Submission Platform

## Project Identity

- **Name:** EarthSama Onboard
- **Purpose:** Philippines-first carbon credit land submission portal for farmers/landowners
- **Stack:** Plain HTML/CSS/JS — zero backend, zero build tools, no npm/webpack
- **Maps:** Leaflet.js + Nominatim geocoding + Esri satellite tiles
- **Data:** localStorage (MVP) — schema v1.1 with PSGC-aligned PH geography
- **External deps:** Leaflet 1.9.4, JSZip 3.10.1 (both from unpkg CDN)

## Architecture

```
ES_onboard/
├── index.html + app.js + styles.css       # Typeform-style land submission form
├── dashboard.html + dashboard.js + .css   # Admin: status mgmt, 7 export formats
├── live.html + live.js + live.css         # Public: real-time hectare tracker + map
├── ph-geo.js                              # PH regions/provinces/municipalities (PSGC)
├── ph-barangays.js                        # 42,000+ barangays (546KB)
├── error-logger.js                        # Client-side error capture to localStorage
├── submit.html                            # Post-submission redirect
└── earthsama.com/                         # Pitch deck + mobile app demo
    ├── pitch.html                         # Investor pitch (15 slides)
    ├── demo.html + demo-frames/           # Interactive app prototype (61 frames)
    └── index.html                         # Landing page
```

### Data Flow

1. Landowner fills multi-step form → draws polygon on map → submits
2. Submission stored in `localStorage` under key `earthsama_submissions`
3. Admin dashboard reads same localStorage → filters, updates status, exports
4. Live map aggregates submissions → tracks against regional thresholds
5. Export to 7 formats: KML, KMZ, GeoJSON, CSV, Restor.eco, GEE, EarthSama API

### Key Thresholds

- **Region:** 100,000 hectares approved → qualifies for OMTSE + Apl team support
- **Province:** 10,000 hectares approved → qualifies the province

### Known Architectural Limits

- localStorage is the sole data store (~5MB limit, no backup, single-device only)
- No authentication on any page
- No backend API — `buildEarthSamaPayload()` targets a future `/api/v1/parcels/bulk-import`
- Documents are held in memory as base64, lost on page close
- Acres vs. hectares ambiguity: form says "hectares", field named `acreage`, downstream converts with acres→ha factor

---

## Hard Rules

- One terminal command at a time, wait for output before next
- Verify changes with cat before running anything
- Never auto-fix without showing the issue first
- Never commit directly to main, always branch
- Run /review before /ship always
- Run /cso before any auth, PII, or payment change
- Never force-push

---

## gstack

Use /browse for all web browsing. Never use mcp__claude-in-chrome__* tools.

Available skills: /office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /design-consultation, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse, /qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /retro, /investigate, /document-release, /codex, /cso, /autoplan, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade

If skills aren't loading: cd ~/.claude/skills/gstack && ./setup

---

## Sprint Flow

1. `/office-hours` before any new feature
2. `/plan-eng-review` to lock architecture
3. `/careful` before risky changes
4. Build
5. `/review` before every PR
6. `/cso` before auth, PII, or payment changes
7. `/ship` after review passes
8. `/retro` end of week

---

## Notes for Claude

- This is a zero-build static site. There is no package.json, no node_modules, no bundler. Do not introduce build tooling unless explicitly asked.
- All three apps (form, dashboard, live map) share localStorage and PH geography data but have no shared JS module — utilities like `esc()` are duplicated across files.
- The `earthsama.com/` subdirectory is the marketing/pitch site, not part of the core platform. Do not modify it unless asked.
- HANDOFF.md contains the canonical data schema and API contract. DESIGN.md has the original design spec. DEV_LOG.md has build history. Consult these before making structural changes.
- Entity type enums differ between HANDOFF.md, DESIGN.md, and the JS files. Be aware of this drift.
- The error-logger.js is properly IIFE-wrapped. The other JS files pollute global scope.
