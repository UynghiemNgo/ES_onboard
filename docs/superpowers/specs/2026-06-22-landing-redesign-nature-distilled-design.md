# Landing Redesign — Nature Distilled

**Date:** 2026-06-22
**Surface:** `earthsama.com/index.html` (marketing landing — first of three)
**Status:** Approved design, pending implementation plan

## Motivation

Current landing reads dated/amateur: flat low-contrast surfaces, thin gold text,
outline-only buttons, generic card grids, zero imagery/depth/motion. It feels like a
sober government document, not a premium, credible climate/agritech company. Goal:
modern, premium, trustworthy — while keeping the existing earth/gold brand DNA.

This is the **first** of three surfaces to be redesigned (landing → platform → pitch).
The landing establishes the new visual language; tokens promote to `shared.css` only
when the later surfaces are redesigned, so the working platform and pitch stay
byte-identical this round.

## Direction: Nature Distilled

Lean into the land/earth theme. Warm, organic, premium. Keep gold as the brand anchor;
expand with a warm earthen support palette; add real imagery, texture, depth, and
restrained motion.

## Visual Language

### Palette
Gold `--primary #8B6914` stays as brand/CTA anchor. Expanded warm support palette,
introduced as **landing-scoped CSS variables** (NOT added to `shared.css` yet):

| Token | Value | Usage |
|-------|-------|-------|
| `--ls-terracotta` | `#C67B5C` | Warm accent, icons, hover |
| `--ls-warm-clay` | `#B5651D` | Deeper accent, emphasis |
| `--ls-sand` | `#D4C4A8` | Muted fills, dividers |
| `--ls-cream` | `#F5F0E1` | Soft surface base |
| `--ls-olive` | `#6B7B3C` | Secondary green (replaces timid `accent-green` on landing) |

Surfaces become soft cream gradients rather than the flat `#f4f2ee`.

### Typography
Keep Newsreader (display) + Jost (body) — already loaded, already premium. Changes:
larger hero display scale, tighter display leading, stronger size/weight contrast
between display and body. No new font requests.

### Texture & Motion
- Subtle SVG grain overlay (low opacity) for tactile warmth.
- Organic blob shapes behind sections (SVG/CSS), low contrast.
- Layered soft shadows on elevated cards.
- Scroll-reveal fades + light hero parallax via vanilla `IntersectionObserver`.
- **No new external dependencies.**

## Imagery (AI-generated)

Generated at implementation time via a design skill, saved as local assets under
`earthsama.com/img/`:
- **Hero:** full-bleed warm golden-hour Philippine agroforestry (coconut / coffee /
  cacao / moringa). Grain overlay + cream gradient scrim to guarantee text contrast.
- **1 supporting** texture/section accent image.

All images require descriptive `alt` text.

## Page Structure

Elevate existing copy and claims — do not invent new metrics or messaging.

1. **Header** — sticky, subtle blur-on-scroll, existing nav + CSS-only mobile hamburger.
2. **Hero** — full-bleed image + scrim; eyebrow, large display H1, sub-paragraph, two
   CTAs (Submit Your Land / View Live Map).
3. **KPI strip** — elevated soft-shadow cards; count-up animation on scroll
   (17 regions, 82 provinces, 100K ha, 10K ha).
4. **How It Works** — keep vertical 3-step timeline; richer numbered markers and a
   gradient connector line.
5. **The Problem** — 3-card grid with SVG icons, hover-lift.
6. **Philippines First / Opportunity** — stat-emphasis card grid (1M farmers, $5.6B, etc).
7. **Closing CTA band** — new section before footer ("Submit your land").
8. **Footer** — warmer, organized; existing links (App Demo, Full Pitch).

## Technical Approach

- Extract currently-inline landing styles to **`earthsama.com/landing.css`**; add small
  **`earthsama.com/landing.js`** for scroll animations / count-up.
- `index.html` links `../shared.css` first (unchanged), then `landing.css`.
- New palette lives as landing-scoped vars in `landing.css` — **`shared.css` untouched**
  this round. Platform (`form/dashboard/live`) and `pitch.html` remain byte-identical.
- Zero-build preserved: no npm, no bundler, no new CDN deps. Fonts already loaded.

## Accessibility

- Text-over-image contrast guaranteed by gradient scrim; verify AA.
- Maintain 44px minimum touch targets.
- `prefers-reduced-motion: reduce` disables parallax, count-up, and reveal animations.
- Descriptive `alt` on all imagery.

## Verification

- Screenshot desktop + mobile.
- Check AA contrast on hero text and CTAs.
- Confirm reduced-motion path.
- Confirm platform + pitch pages visually unchanged (shared.css diff = none).

## Out of Scope (this round)

- Platform UI redesign (`form/dashboard/live`) — later round.
- Pitch deck redesign (`pitch.html`) — later round.
- Promoting the new palette into `shared.css` — happens when later surfaces are redesigned.

## Future Context (not this round)

User intends follow-up rounds to redesign the **pitch deck** and the **main page**,
repositioning the messaging from a single land-submission portal toward
**"building an ecosystem of applications."** Keep the new landing's structure flexible
enough to absorb that narrative shift later (e.g. the hero headline and closing CTA may
evolve to lead with the ecosystem story).
