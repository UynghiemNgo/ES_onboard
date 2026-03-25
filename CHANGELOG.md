# Changelog

All notable changes to EarthSama Onboard will be documented in this file.

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
