# Landing Redesign (Nature Distilled) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `earthsama.com/index.html` into a modern, premium, credible "Nature Distilled" marketing landing while keeping the earth/gold brand DNA.

**Architecture:** Extract the page's inline `<style>` into `earthsama.com/landing.css` and add `earthsama.com/landing.js` for scroll motion. Introduce a warm earthen palette as **landing-scoped CSS variables** (not in `shared.css`). Add AI-generated farmland imagery under `earthsama.com/img/`. No build tooling, no new runtime dependencies.

**Tech Stack:** Plain HTML/CSS/JS. Existing Google Fonts (Newsreader + Jost). Vanilla `IntersectionObserver`. Imagery generated via a design skill at Task 2.

## Global Constraints

- Zero-build static site — no npm, no bundler, no new CDN dependency. (CLAUDE.md)
- Do NOT modify `shared.css` this round — new palette lives as landing-scoped vars in `landing.css`. Platform (`form/dashboard/live`) and `pitch.html` must stay byte-identical.
- Keep existing copy/claims — do not invent new metrics or messaging.
- Keep 44px minimum touch targets; honor `prefers-reduced-motion: reduce`.
- All imagery requires descriptive `alt` text.
- Branch: `redesign/landing-nature-distilled`. Frequent commits, never force-push, never commit to main.
- Verification is visual: load the page in the gstack `/browse` (or playwright) browser and screenshot desktop (1280px) + mobile (390px). There is no unit-test runner.

---

### Task 1: Extract inline styles to `landing.css` (no visual change)

Refactor-only baseline so later visual diffs are isolated.

**Files:**
- Create: `earthsama.com/landing.css`
- Modify: `earthsama.com/index.html` (move `<style>` block out, add `<link>`)

**Interfaces:**
- Produces: `earthsama.com/landing.css` containing all current `.landing-*` rules verbatim; `index.html` links `../shared.css` then `landing.css`.

- [ ] **Step 1: Create `landing.css` from the current inline block**
  Copy the entire contents of the `<style>` element in `index.html` (lines ~12–127) into `earthsama.com/landing.css` unchanged.

- [ ] **Step 2: Replace inline `<style>` with a link**
  In `index.html` `<head>`, delete the `<style>...</style>` block and add after the `shared.css` link:
  ```html
  <link rel="stylesheet" href="../shared.css">
  <link rel="stylesheet" href="landing.css">
  ```

- [ ] **Step 3: Verify no visual change**
  Open `earthsama.com/index.html` in the browser. Screenshot desktop + mobile. Compare against the pre-change page (git stash / previous commit): must be pixel-identical.
  Expected: identical render, no console errors.

- [ ] **Step 4: Commit**
  ```bash
  git add earthsama.com/index.html earthsama.com/landing.css
  git commit -m "refactor(landing): extract inline styles to landing.css"
  ```

---

### Task 2: Generate farmland imagery

**Files:**
- Create: `earthsama.com/img/hero-agroforestry.webp` (or .jpg)
- Create: `earthsama.com/img/section-texture.webp` (or .jpg)

**Interfaces:**
- Produces: two local image files referenced by Tasks 4 and 7.

- [ ] **Step 1: Generate the hero image**
  Use a design/image-generation skill (e.g. `banner-design` / `design` ai-artist). Prompt intent: "wide landscape photo, golden-hour Philippine smallholder agroforestry — coconut palms intercropped with coffee/cacao/moringa, lush, warm earthy tones, soft natural light, no text, no people in foreground, photographic, premium." Target ~2000px wide, optimized < 400KB.

- [ ] **Step 2: Generate the supporting texture/accent image**
  Prompt intent: "close, soft-focus warm soil / woven natural fiber / leaf texture, muted terracotta and olive tones, subtle, no text." ~1200px, < 200KB.

- [ ] **Step 3: Save and verify**
  Save both to `earthsama.com/img/`. Open each to confirm they render and look on-brief (warm, premium, no text artifacts). Regenerate if off-brief.
  Expected: two reasonable images, each under target size.

- [ ] **Step 4: Commit**
  ```bash
  git add earthsama.com/img/
  git commit -m "feat(landing): add AI-generated farmland imagery"
  ```

---

### Task 3: Palette, warm surfaces, and grain texture

**Files:**
- Modify: `earthsama.com/landing.css` (add landing-scoped `:root`-level vars + grain + body surface)

**Interfaces:**
- Produces: CSS vars `--ls-terracotta`, `--ls-warm-clay`, `--ls-sand`, `--ls-cream`, `--ls-olive`, and a `.landing-grain` overlay utility consumed by later tasks.

- [ ] **Step 1: Add landing-scoped palette vars at the top of `landing.css`**
  ```css
  /* Nature Distilled — landing-scoped tokens (do NOT move to shared.css this round) */
  .landing-header, .landing-hero, .landing-kpis, .landing-section, .landing-footer, .landing-cta-band {
    --ls-terracotta: #C67B5C;
    --ls-warm-clay:  #B5651D;
    --ls-sand:       #D4C4A8;
    --ls-cream:      #F5F0E1;
    --ls-olive:      #6B7B3C;
  }
  ```

- [ ] **Step 2: Warm the page surface**
  Replace the flat `body { background: var(--surface); }` behavior by adding:
  ```css
  body { background:
    radial-gradient(1200px 600px at 80% -10%, rgba(198,123,92,0.10), transparent 60%),
    linear-gradient(180deg, var(--ls-cream), #efe9dc 60%, var(--ls-cream));
    background-attachment: fixed; }
  ```

- [ ] **Step 3: Add a reusable grain overlay**
  ```css
  .landing-grain::after {
    content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.10;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    mix-blend-mode: multiply;
  }
  ```

- [ ] **Step 4: Verify**
  Reload page. Surface should read as warm cream with a faint gradient; no layout breakage. Screenshot desktop + mobile.

- [ ] **Step 5: Commit**
  ```bash
  git add earthsama.com/landing.css
  git commit -m "feat(landing): warm Nature Distilled palette + grain texture"
  ```

---

### Task 4: Hero redesign (full-bleed image + scrim + display type)

**Files:**
- Modify: `earthsama.com/index.html` (hero markup)
- Modify: `earthsama.com/landing.css` (`.landing-hero*` rules)

**Interfaces:**
- Consumes: `img/hero-agroforestry.*` (Task 2), palette vars (Task 3).
- Produces: `.landing-hero` with class `landing-grain`; `.landing-btn-primary` restyled to a filled gold CTA.

- [ ] **Step 1: Update hero markup**
  Wrap the hero in a full-bleed container with the image and a scrim; keep existing eyebrow/headline/sub/CTAs copy.
  ```html
  <section class="landing-hero landing-grain">
    <img class="landing-hero-img" src="img/hero-agroforestry.webp"
         alt="Golden-hour view of Philippine agroforestry — coconut palms intercropped with coffee and cacao">
    <div class="landing-hero-inner">
      <div class="landing-eyebrow">Digital Public Infrastructure</div>
      <h1>Building <em>digital capacity</em> for agricarbon and food security</h1>
      <p>Earth Sama is the upstream digital endpoint for land verification, project case development, and rural value chains across the Philippines.</p>
      <div class="landing-hero-ctas">
        <a class="landing-btn-primary" href="../index.html">Submit Your Land &rarr;</a>
        <a class="landing-btn-ghost" href="../live.html">View Live Map</a>
      </div>
    </div>
  </section>
  ```

- [ ] **Step 2: Style the hero**
  ```css
  .landing-hero { position: relative; max-width: none; padding: 0; min-height: 78vh; display: flex; align-items: flex-end; overflow: hidden; }
  .landing-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; }
  .landing-hero::before { content: ""; position: absolute; inset: 0; z-index: -1;
    background: linear-gradient(90deg, rgba(30,28,24,0.72) 0%, rgba(30,28,24,0.35) 55%, transparent 100%),
                linear-gradient(0deg, var(--ls-cream) 2%, transparent 28%); }
  .landing-hero-inner { max-width: 1120px; margin: 0 auto; padding: 0 1.25rem 4rem; width: 100%; }
  .landing-hero h1 { color: #fff; font-size: clamp(2.4rem, 6vw, 4.4rem); line-height: 1.04; max-width: 14ch; }
  .landing-hero h1 em { color: var(--ls-sand); }
  .landing-hero .landing-eyebrow { color: rgba(255,255,255,0.78); }
  .landing-hero p { color: rgba(255,255,255,0.86); font-size: 1.15rem; max-width: 48ch; }
  ```

- [ ] **Step 3: Restyle primary CTA to filled gold**
  ```css
  .landing-btn-primary { background: var(--primary); color: #fff; border: 1px solid var(--primary);
    box-shadow: 0 6px 18px rgba(139,105,20,0.28); }
  .landing-btn-primary:hover { background: var(--primary-light); border-color: var(--primary-light); }
  .landing-hero .landing-btn-ghost { color: #fff; border-color: rgba(255,255,255,0.5); }
  .landing-hero .landing-btn-ghost:hover { background: rgba(255,255,255,0.12); color: #fff; }
  ```

- [ ] **Step 4: Verify contrast + layout**
  Reload. Confirm headline/sub/CTAs are clearly legible over the image at desktop and mobile (scrim ensures AA). Screenshot both. Check no horizontal scroll on mobile.

- [ ] **Step 5: Commit**
  ```bash
  git add earthsama.com/index.html earthsama.com/landing.css
  git commit -m "feat(landing): full-bleed hero with imagery, scrim, and filled CTA"
  ```

---

### Task 5: KPI strip — elevated cards + count-up

**Files:**
- Modify: `earthsama.com/landing.css` (`.landing-kpi*`)
- Create: `earthsama.com/landing.js`
- Modify: `earthsama.com/index.html` (KPI markup `data-count`, `<script>` tag)

**Interfaces:**
- Consumes: palette vars.
- Produces: `landing.js` exposing scroll-triggered count-up keyed off `[data-count]`; reused for reveals in Task 9.

- [ ] **Step 1: Add data attributes to KPI numbers**
  For numeric KPIs, mark the value: `<strong data-count="17">17</strong>`, `data-count="82"`. Leave non-numeric ones ("100K ha", "10K ha") as static text (no `data-count`).

- [ ] **Step 2: Elevate the KPI cards**
  ```css
  .landing-kpis { margin-top: -3rem; position: relative; z-index: 2; }
  .landing-kpi { background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 1.25rem; box-shadow: 0 10px 30px rgba(30,28,24,0.08); transition: transform .25s ease, box-shadow .25s ease; }
  .landing-kpi:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(30,28,24,0.12); }
  .landing-kpi strong { font-size: 2.2rem; color: var(--ls-warm-clay); }
  ```

- [ ] **Step 3: Create `landing.js` with count-up**
  ```js
  (function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const counters = document.querySelectorAll('[data-count]');
    if (reduce) { counters.forEach(el => el.textContent = el.dataset.count); }
    else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const el = e.target, target = parseInt(el.dataset.count, 10);
          let cur = 0; const step = Math.max(1, Math.round(target / 40));
          const tick = () => { cur = Math.min(target, cur + step); el.textContent = cur;
            if (cur < target) requestAnimationFrame(tick); };
          tick(); obs.unobserve(el);
        });
      }, { threshold: 0.6 });
      counters.forEach(el => io.observe(el));
    }
  })();
  ```

- [ ] **Step 4: Load the script**
  Before `</body>` in `index.html`: `<script src="landing.js" defer></script>`

- [ ] **Step 5: Verify**
  Reload. KPI cards sit elevated overlapping the hero base; "17" and "82" count up when scrolled into view; with OS reduce-motion on, they show final values instantly. Screenshot.

- [ ] **Step 6: Commit**
  ```bash
  git add earthsama.com/index.html earthsama.com/landing.css earthsama.com/landing.js
  git commit -m "feat(landing): elevated KPI cards with scroll count-up"
  ```

---

### Task 6: How It Works — richer timeline

**Files:**
- Modify: `earthsama.com/landing.css` (`.landing-timeline*`)

**Interfaces:**
- Consumes: palette vars. Markup unchanged from current 3-step timeline.

- [ ] **Step 1: Restyle markers + connector**
  ```css
  .landing-timeline-dot { width: 44px; height: 44px; border-radius: 12px; font-size: 1.05rem;
    background: linear-gradient(135deg, var(--ls-terracotta), var(--ls-warm-clay)); color: #fff;
    box-shadow: 0 6px 16px rgba(181,101,29,0.30); }
  .landing-timeline-line { width: 2px; background: linear-gradient(var(--ls-terracotta), var(--ls-sand)); }
  .landing-timeline-content h3 { font-size: 1.15rem; }
  ```

- [ ] **Step 2: Verify**
  Reload, scroll to How It Works. Markers are warm gradient chips, connector is a soft gradient line. Screenshot.

- [ ] **Step 3: Commit**
  ```bash
  git add earthsama.com/landing.css
  git commit -m "feat(landing): richer How It Works timeline markers"
  ```

---

### Task 7: Problem & Opportunity cards — icons + hover-lift

**Files:**
- Modify: `earthsama.com/index.html` (inline SVG icons into the 6 cards)
- Modify: `earthsama.com/landing.css` (`.landing-card*`)

**Interfaces:**
- Consumes: palette vars, `section-texture` image (optional accent on one section).
- Produces: `.landing-card-icon` style.

- [ ] **Step 1: Add an inline SVG icon to each card**
  Prepend each `.landing-card` with a simple stroke SVG wrapped in `<span class="landing-card-icon">…</span>` (e.g. shield, document, coin for Problem; people, growth, factory for Opportunity). Use `currentColor`, 24×24, `stroke-width="1.6"`.

- [ ] **Step 2: Style cards + icons**
  ```css
  .landing-card { border-radius: 16px; padding: 1.5rem; background: var(--card);
    box-shadow: 0 4px 14px rgba(30,28,24,0.05); transition: transform .25s ease, box-shadow .25s ease; }
  .landing-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(30,28,24,0.12); }
  .landing-card-icon { display:inline-flex; width:44px; height:44px; align-items:center; justify-content:center;
    border-radius: 12px; margin-bottom: .8rem; color: var(--ls-warm-clay);
    background: color-mix(in srgb, var(--ls-terracotta) 18%, transparent); }
  .landing-card h3 { font-size: 1.1rem; }
  ```

- [ ] **Step 3: Verify**
  Reload. Each card shows a warm icon chip; cards lift on hover; grid still reflows to 2-col / 1-col at the existing breakpoints. Screenshot desktop + mobile.

- [ ] **Step 4: Commit**
  ```bash
  git add earthsama.com/index.html earthsama.com/landing.css
  git commit -m "feat(landing): card icons and hover-lift for problem/opportunity"
  ```

---

### Task 8: Closing CTA band + warmer footer

**Files:**
- Modify: `earthsama.com/index.html` (add `.landing-cta-band` before footer)
- Modify: `earthsama.com/landing.css` (`.landing-cta-band`, `.landing-footer`)

**Interfaces:**
- Consumes: palette vars, `img/section-texture.*` (background accent).

- [ ] **Step 1: Add the CTA band markup** (before `<footer>`):
  ```html
  <section class="landing-cta-band landing-grain">
    <div class="landing-cta-inner">
      <h2>Your land can build a project case.</h2>
      <p>Submit your parcel in minutes — draw your boundaries, we handle verification.</p>
      <a class="landing-btn-primary" href="../index.html">Submit Your Land &rarr;</a>
    </div>
  </section>
  ```

- [ ] **Step 2: Style band + footer**
  ```css
  .landing-cta-band { position: relative; overflow: hidden; margin-top: 3rem;
    background: linear-gradient(135deg, var(--ls-warm-clay), #7a4a14); color: #fff; }
  .landing-cta-inner { max-width: 1120px; margin: 0 auto; padding: 4rem 1.25rem; text-align: center; }
  .landing-cta-band h2 { font-family: var(--font-display); font-weight: 300; font-size: clamp(1.8rem,4vw,2.8rem); }
  .landing-cta-band p { color: rgba(255,255,255,0.85); margin: .6rem auto 1.6rem; max-width: 46ch; }
  .landing-cta-band .landing-btn-primary { background:#fff; color: var(--ls-warm-clay); border-color:#fff; }
  .landing-footer { background: #211d16; color: rgba(255,255,255,0.7); max-width: none; }
  .landing-footer > * { max-width: 1120px; margin-left:auto; margin-right:auto; }
  .landing-footer a { color: var(--ls-sand); }
  ```

- [ ] **Step 3: Verify**
  Reload. A warm gradient CTA band sits above a dark footer; white CTA button is legible. Screenshot.

- [ ] **Step 4: Commit**
  ```bash
  git add earthsama.com/index.html earthsama.com/landing.css
  git commit -m "feat(landing): closing CTA band and warmer footer"
  ```

---

### Task 9: Scroll-reveal motion + reduced-motion + header blur

**Files:**
- Modify: `earthsama.com/landing.js` (reveal observer)
- Modify: `earthsama.com/landing.css` (reveal + header scroll states, reduced-motion guard)
- Modify: `earthsama.com/index.html` (add `data-reveal` to sections)

**Interfaces:**
- Consumes: `landing.js` from Task 5.

- [ ] **Step 1: Add `data-reveal` to each major section/card group** in `index.html` (hero excluded).

- [ ] **Step 2: Reveal CSS + reduced-motion guard**
  ```css
  [data-reveal] { opacity: 0; transform: translateY(16px); transition: opacity .6s ease, transform .6s ease; }
  [data-reveal].is-in { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) {
    [data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }
  }
  .landing-header { position: sticky; top: 0; z-index: 1000; transition: background .3s ease, backdrop-filter .3s ease; }
  .landing-header.is-scrolled { background: rgba(249,247,244,0.82); backdrop-filter: blur(10px); }
  ```

- [ ] **Step 3: Extend `landing.js`** (append):
  ```js
  (function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      const io = new IntersectionObserver((es) => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }), { threshold: 0.15 });
      document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
    }
    const header = document.querySelector('.landing-header');
    if (header) {
      const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }
  })();
  ```

- [ ] **Step 4: Verify both motion paths**
  Reload (motion on): sections fade/slide in on scroll; header gains blur after scrolling. Toggle OS reduce-motion: everything appears immediately, no animation, no count-up. Screenshot both states.

- [ ] **Step 5: Commit**
  ```bash
  git add earthsama.com/index.html earthsama.com/landing.css earthsama.com/landing.js
  git commit -m "feat(landing): scroll reveals, sticky blur header, reduced-motion support"
  ```

---

### Task 10: Accessibility pass + cross-surface no-regression

**Files:**
- Modify: `earthsama.com/landing.css` / `index.html` as needed for fixes only.

- [ ] **Step 1: Contrast audit**
  Check hero text, CTA buttons, KPI numbers, footer links meet WCAG AA (4.5:1 body, 3:1 large). Adjust scrim opacity / text color if any fail.

- [ ] **Step 2: Touch targets + keyboard**
  Confirm all links/buttons ≥44px and have visible focus outlines; tab through the page.

- [ ] **Step 3: Confirm platform + pitch unchanged**
  ```bash
  git diff --name-only origin/main -- shared.css form.html index.html dashboard.* live.* app.js earthsama.com/pitch.html
  ```
  Expected: NO output (none of these touched). If any appear, revert that change.

- [ ] **Step 4: Final screenshots**
  Capture desktop (1280px) + mobile (390px) of the full page. Confirm: warm premium look, legible, no overflow, images load.

- [ ] **Step 5: Commit any fixes**
  ```bash
  git add -A earthsama.com/
  git commit -m "fix(landing): accessibility and contrast adjustments"
  ```

---

## Notes for execution

- After all tasks: run `/review` before `/ship` (CLAUDE.md hard rule). Then open a PR from `redesign/landing-nature-distilled`.
- `shared.css` token promotion is explicitly deferred to the platform/pitch rounds — do not do it here.
