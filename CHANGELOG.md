# Changelog

All notable changes to EarthSama Onboard will be documented in this file.

## [0.1.1.0] - 2026-06-24

### Changed
- Rebuilt investor pitch deck (`earthsama.com/pitch.html`) around the LGU-co-funded loan-readiness / microfinance model — 15 slides. New arc: vision → disaster-prevention stakes → solution → workflow → de-risked-account business model → three moats → market → competitors → team → backing → ask.
- Slide 2 reframed to the broad vision (microfinance unlocking agroforestry / climate-smart agriculture financing); carbon demoted from product to repayment upside.
- Pre-launch public-exposure softening: raise terms gated to "terms on request" (no public cap); computer-vision patents reworded to remove ownership claim.

### Added
- "The Stakes" slide — microfinance as disaster prevention, with sourced Alcala flood data (GMA News, 2020).
- Competitors slide with researched names; "AI-supported onboarding and guided readiness" win axis.
- Design spec (`docs/superpowers/specs/2026-06-24-pitch-anyo-rebuild-design.md`) and Codex pivot context (`docs/CODEX_ANYO_PIVOT_writeup.md`).

### Removed
- Figma "live demo" slide from the pitch deck.

## [0.1.0.0] - 2026-03-25

### Added
- Unified green design system via `shared.css` with CSS custom properties for all pages
- Landing page (`earthsama.com/index.html`) rewritten with green brand, Inter typography, inline SVG logo
- CSS-only hamburger menu for mobile navigation (640px breakpoint)
- Vertical timeline component for "How It Works" section
- `.gitignore` for DS_Store files
- Token Architecture section in DESIGN.md

### Changed
- Extracted design tokens from `styles.css` into `shared.css` (single source of truth)
- All HTML pages load `shared.css` via `<link>` tag before page-specific CSS
- Landing page typography switched from Newsreader serif to Inter sans-serif
- Dashboard Google Fonts link updated to include weight 800
- DESIGN.md updated to reflect unified brand conventions
- `earthsama.com/` converted from git submodule to tracked directory
