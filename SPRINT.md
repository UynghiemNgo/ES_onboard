# EarthSama — Sprint Board

## Current Sprint

**Sprint:** _unnamed — set sprint name when starting_
**Started:** _not started_
**Branch:** _none active_

### To Do

- [ ] _add tasks here_

### In Progress

_none_

### Done

_none_

---

## Blocked

_nothing blocked_

---

## Known Issues (from pipeline review 2026-03-25)

### Critical

- [ ] **Acres vs. hectares confusion** — Form label says "hectares", field named `acreage`, downstream converts with `* 0.404686` (acres→ha). All area calculations may be wrong by ~2.47x. Affects threshold tracking.
- [ ] **No authentication on admin dashboard** — `dashboard.html` is fully open. Anyone with URL can view PII, change statuses, delete records, export data.
- [ ] **localStorage as sole data store** — ~5MB limit, no backup, no multi-device, data lost on browser clear.
- [ ] **PH Data Privacy Act (RA 10173) non-compliance** — PII collected with no privacy policy, no data consent, no right-to-delete.

### High

- [ ] **`unhighlightRegion()` key mismatch** — `live.js:417` compares human region name against PSGC code. Unhighlight always fails.
- [ ] **No SRI hashes on CDN scripts** — Leaflet & JSZip loaded from unpkg without integrity verification.
- [ ] **PII exposed on public live map** — `live.js:444` shows first name + email with no auth gate.
- [ ] **No CSP headers** — No Content-Security-Policy or clickjacking protection.
- [ ] **Nominatim API abuse risk** — No rate limiting, no User-Agent header, no caching.
- [ ] **Submission ID collisions** — `Date.now().toString(36)` with no random suffix. Same-ms submissions collide.
- [ ] **No numeric input validation** — Acreage/years accept negative, zero, NaN, or absurd values.
- [ ] **No carbon credit verification workflow** — Status via dropdown, no audit log, no multi-party sign-off.

### Medium

- [ ] **Duplicated utilities** — `esc()`, `escXml()`, label maps defined independently in 3 files.
- [ ] **Schema drift** — Entity types differ across HANDOFF.md, DESIGN.md, app.js, dashboard.js.
- [ ] **Live map markers never refresh** — 30s auto-refresh updates stats but not map markers.
- [ ] **Global namespace pollution** — ~40+ global functions in app.js, no modules.
- [ ] **Documents lost on page close** — Base64 in memory only, never persisted.
- [ ] **No .gitignore** — Risk of committing .env, .DS_Store, IDE configs.
- [ ] **No tests** — Zero unit/integration/e2e tests.

---

## Notes for Claude

- Check this file at the start of each session to know what's in progress
- Move tasks between sections as work progresses
- Add new issues discovered during development
- Reference issue IDs (C1, H1, M1, etc.) from the pipeline review when working on fixes
- Always branch before starting work — never commit to main
