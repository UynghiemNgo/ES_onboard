# EarthSama — Cursor Handoff

## Project Overview

EarthSama is a Philippines-first carbon credit land submission platform. This repo contains:

1. **Land Submission Portal** (`index.html` + `app.js` + `styles.css`) — Typeform-style intake form for farmers/landowners
2. **Admin Dashboard** (`dashboard.html` + `dashboard.js` + `dashboard.css`) — Review, filter, status management, multi-format export
3. **Live Map** (`live.html` + `live.js` + `live.css`) — Real-time hectare tracking against regional thresholds
4. **Pitch Site** (`earthsama.com/pitch.html`) — Investor pitch deck (self-contained HTML presentation)
5. **App Demo** (`earthsama.com/demo.html` + `demo-frames/`) — Interactive mobile app prototype

---

## Architecture

- **Zero backend** — All data stored in `localStorage` under key `earthsama_submissions`
- **No build tools** — Plain HTML/CSS/JS, no npm/webpack
- **Maps** — Leaflet.js with OpenStreetMap tiles, Nominatim for reverse geocoding
- **PH Geography** — `ph-geo.js` (regions/provinces/municipalities) + `ph-barangays.js` (546KB barangay data with PSGC codes)

---

## Data Schema (v1.1)

Each submission in `localStorage` has this shape:

```json
{
  "id": "ES-M3ABC12",
  "created_at": "2026-03-24T10:00:00.000Z",
  "updated_at": "2026-03-24T12:00:00.000Z",
  "status": "submitted | in_review | in_discussion | approved | needs_docs",
  "owner": {
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "region": "string | null",
    "region_code": "string | null (PSGC)",
    "province": "string | null",
    "province_code": "string | null (PSGC)",
    "municipality": "string | null",
    "municipality_code": "string | null (PSGC)",
    "barangay": "string | null",
    "entity_type": "individual | cooperative | corporation | ngo | government"
  },
  "land": {
    "acreage": 0.0,
    "land_type": "agricultural | forest | wetland | grassland | agroforestry | mixed",
    "current_use": "crops | livestock | fallow | forest | mixed | unused",
    "years_owned": 0,
    "has_encumbrances": false,
    "encumbrance_detail": "string | null"
  },
  "location": {
    "address": "string | null",
    "lat": 0.0,
    "lng": 0.0,
    "polygon": [[lat, lng], ...],
    "area_acres": 0.0
  },
  "documents": [
    { "name": "filename.pdf", "size": 12345, "type": "application/pdf" }
  ],
  "kml": "<kml>...</kml>"
}
```

---

## Export Formats (dashboard.js)

The dashboard exports to 7 formats via `buildXxxPayload()` functions:

| Format | Function | Use Case |
|--------|----------|----------|
| KML | `buildBulkKML()` | Google Earth |
| KMZ | `exportKMZ()` | Google Earth (zipped) |
| GeoJSON | `buildGeoJSON()` | Web maps, APIs |
| CSV | `buildCSV()` | Spreadsheets |
| Restor.eco | `buildRestorPayload()` | restor.eco site import |
| Google Earth Engine | `buildGEEPayload()` | GEE asset upload |
| **EarthSama** | `buildEarthSamaPayload()` | **Downstream farm/carbon platform** |
| ZIP Bundle | `exportFullZip()` | All formats + README |

---

## EarthSama API Payload (v1.1) — Key for Downstream

The `buildEarthSamaPayload()` in `dashboard.js` produces the keypair contract for the farm & carbon platform:

### Envelope
- `_format`: "earthsama"
- `_version`: "1.1"
- `_schema`: "1.0"
- `_count`: number of parcels
- `_total_hectares`: aggregate
- `api.endpoint`: `/api/v1/parcels/bulk-import`
- `api.idempotency`: `external_id` (safe re-import)

### Per Parcel Keypairs

#### Identity
- `external_id` — unique ID from onboard portal (e.g. "ES-M3ABC12")
- `source` — "earthsama-onboard"
- `status` — submission status
- `created_at`, `updated_at` — ISO timestamps

#### Owner
- `name`, `email`, `phone`, `entity_type`
- `region` + `region_code` (PSGC-aligned)
- `province` + `province_code`
- `municipality` + `municipality_code`
- `barangay`

#### Parcel
- `acreage` + `hectares` (both units)
- `land_type` + `land_type_label` (code + human-readable)
- `current_use` + `current_use_label`
- `years_owned`, `has_encumbrances`, `encumbrance_detail`

#### Geospatial
- `center` — `{ lat, lng }`
- `boundary` — polygon or point object
- `geojson` — RFC 7946 GeoJSON geometry (ready for any map API)
- `area_acres_calculated`, `area_hectares_calculated`

#### Carbon / Agricarbon (null slots for downstream)
- `eligible` — boolean (true when approved)
- `assessment_status`, `submitted_at`, `approved_at`
- `project_id` — null, assign after carbon project creation
- `methodology` — null, e.g. "AR-ACM0003" or "VM0042"
- `baseline_year` — null, set during field verification
- `crediting_period_years` — null, typically 25 for agroforestry
- `estimated_annual_tco2e` — null, calculated after baseline

#### Value Chain (null slots for downstream)
- `crop_types[]` — populate after farmer enrollment
- `harvest_cycle` — e.g. "quarterly", "annual"
- `cooperative_id` — link to cooperative entity
- `supply_chain_tier` — e.g. "producer", "aggregator"
- `traceability_id` — blockchain/supply chain trace ID

#### Documents
- `filename`, `size_bytes`, `mime_type`
- `storage_url` — null until uploaded to cloud storage
- `verified` — false until doc verification

#### KML
- Raw KML string for direct GIS ingestion

#### Metadata
- `schema_version`, `source_platform`, `source_version`
- `thresholds` — `{ region_goal_ha: 100000, province_goal_ha: 10000 }`

---

## Thresholds

- **Region**: 100,000 hectares approved → qualifies for OMTSE + Apl team support
- **Province**: 10,000 hectares approved → qualifies the province

---

## File Map

```
ES_onboard/
├── index.html              # Land submission form (Typeform-style)
├── app.js                  # Submission logic, map drawing, KML gen
├── styles.css              # Shared styles
├── dashboard.html          # Admin review panel
├── dashboard.js            # Status mgmt, filtering, 7 export formats
├── dashboard.css           # Dashboard-specific styles
├── live.html               # Live hectare tracker + map
├── live.js                 # Regional aggregation, threshold tracking
├── live.css                # Live dashboard styles
├── ph-geo.js               # PH regions/provinces/municipalities (PSGC)
├── ph-barangays.js         # 42,000+ barangays with codes
├── error-logger.js         # Client-side error capture
├── earthsama.com/
│   ├── index.html          # Landing page
│   ├── pitch.html          # Investor pitch deck (15 slides)
│   ├── demo.html           # Interactive app demo
│   ├── demo-frames/        # 61 demo screen frames
│   └── pitch-assets/       # Photos, logos for pitch
```

---

## Next Steps for Downstream Platform

1. **Build API endpoint** — `POST /api/v1/parcels/bulk-import` accepting the EarthSama JSON payload
2. **Farmer ID generation** — Create `farmer_id` on ingest, linking to `owner.email` + `owner.phone`
3. **Cloud document storage** — Upload docs to S3/GCS, populate `documents[].storage_url`
4. **Carbon project linking** — Fill `carbon.project_id`, `methodology`, `baseline_year` after field verification
5. **Value chain enrollment** — Fill `valuechain.*` after farmer joins cooperative/program
6. **Replace localStorage** — Connect to Firebase/Supabase/Postgres for production persistence
7. **Auth** — Add Firebase Auth or similar for farmer and admin login
8. **KYC verification** — Integrate with face + voice biometrics (see pitch slide 7)
