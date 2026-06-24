# EarthSama Pitch Rebuild — Design Spec

**Date:** 2026-06-24
**File rebuilt:** `earthsama.com/pitch.html`
**Stack constraint:** zero-build static HTML/CSS/JS, single file, no dependencies beyond what the current deck already uses. Scroll-snap slides + nav dots pattern is kept.

---

## 1. Why this rebuild

The current 15-slide deck is built on carbon MRV + computer-vision disease detection + an Apl.de.Ap ambassador framing. A grilled financial model (recorded below) reshaped the company into a **LGU-co-funded farmer loan-readiness platform** where carbon is demoted from the product to a downstream repayment booster. The deck must follow the model.

---

## 2. The grilled model (the spine of the deck)

This was pressure-tested end to end. It survived every stress test and got stronger each round.

**Problem.** Farmers on upland slopes plant yellow corn. Corn on steep slopes drives erosion and deadly landslides. The LGU wants farmers off it.

**Wedge.** An LGU-co-funded transition. Each farmer gets a **$300 MFI loan + a PHP 1,500 LGU match** (blended finance), tied to financial-literacy training with two completion milestones:
1. Digital sales + expense record-keeping
2. A small business plan

Completing both milestones graduates the farmer toward a larger **ANYO PHP 300,000** loan.

**Two repayment-positive activity tracks.**
1. **Native-tree nursery** — farmer converts a *small subsection* of land to a nursery and sells native trees to the LGU's reforestation + agroforestry programs (a named, near-term buyer). Interim corn income continues so there is no income cliff.
2. **Scale an existing safe crop** — e.g. rice, explicitly not corn.

Transition is phased: keep servicing corn for interim cash, convert the **steepest / highest-risk plots first** so the LGU sees real landslide-risk reduction early while the farmer keeps eating.

**Two farmer tiers — only one borrows.**
- **Titled / leased farmers = borrowers.** Land tenure is collateral; high graduation; they reach the PHP 300k loan. This tier funds the company.
- **Landless / aspiring farmers = NOT loaned.** They join a **free labor marketplace** (open to anyone entering agri without a title), work titled farms, earn wages, and accumulate a **worker rating + income record**. That record is their path to future cash-flow-based bankability — no risky small loan ever fronted.

**Why the two sides reinforce.** Labor supply makes titled farms perform → lower default → banks lend more and pay more. Wages build landless income records → future borrowers acquired for free.

**Revenue — two demand-validated lines, zero credit risk on us.**
- **Customer #1 (now): the LGU.** Program / reforestation budget. LGU is willing to co-fund PHP 1,500/farmer (verbal, to be papered).
- **Customer #2 (later): development / branch banks.** They pay per de-risked, newly-opened farmer account. Development banks (Land Bank / DBP-type) have an agri mandate and were reported willing to buy de-risked accounts; branch banks have cash to deploy.
- We take **no balance-sheet / credit risk** — banks and the LGU fund the loans; we originate and de-risk.

**Demoted to upside, never base case.** Carbon credits (a downstream repayment booster once trees mature) and AI sales-uplift (unproven until we have data). Neither is allowed to carry the model.

**Moats.**
1. **First-mover digital onboarding** — first to put these farmers on a digital system; output is pre-trusted profiles, pre-credit, and a book of business spanning *both* borrowers and rated workers.
2. **Computer vision + edge AI** — agricultural verification; the strategic lock between farmers and bankers.
3. **Distribution** — LGU + reforestation/agroforestry rollout + cooperatives + government programs, plus the landless labor marketplace.

**Stage.** Pre-revenue, product built, web-app first (installable to Android/iOS via PWA, native wrapper later). The single pre-raise milestone is **one signed LGU MOA / budget line** converting verbal willingness into paper.

**Unit economics (illustrative, Case A — no credit risk):** ~+$10,550 profit per 100 titled farmers at a 5% origination fee (~$265/graduate), 70% graduation, ~$80 cost-to-serve. PHP 1,500 LGU match further cuts net cost or farmer default.

---

## 3. The deck — 14 slides

Single-file HTML, scroll-snap, nav dots, progress bar — all kept from the current `pitch.html`. The visual system (warm palette, growth motif) is reused; content and slide order are rebuilt.

| # | Slide | Content |
|---|-------|---------|
| 1 | **Cover** | Simplified. Logo + one line, nothing else. Strip the current cover clutter. |
| 2 | **The hook (quote)** | Yellow corn → landslides. Lead with a quote, not a problem-grid. `[TBD-USER: quote text + attribution]` |
| 3 | **Solution** | "We structure agricultural activity into trusted data." The LGU-co-funded transition loop in one diagram. |
| 4 | **Workflow** | Onboard → $300 + **PHP 1,500 LGU match** → 2 literacy milestones (records, business plan) → 2 tracks (native-tree nursery / scale rice) → graduate to PHP 300k. Phased corn transition, steepest plots first. Carbon shown as a one-line phase-2 booster. |
| 5 | **Business model** | Revenue = LGU program budget (now) + bank de-risked-account fee (later). **Zero credit risk.** Blended finance. Include a "demand signals" callout: LGU PHP 1,500 willingness + development-bank interest. |
| 6 | **Moat 1 — First-mover onboarding** | Pre-trusted profiles, pre-credit, book of business — borrowers *and* rated workers. |
| 7 | **Moat 2 — Computer vision + edge AI** | Agricultural verification; farmer–banker lock. |
| 8 | **Moat 3 — Distribution** | LGU + reforestation/agroforestry rollout + co-ops + gov programs; landless **labor marketplace + ratings**. Field photos + go-to-market folded in here. |
| 9 | **Market — Philippines** | Upland corn farmers, reforestation/agroforestry TAM, graduation-loan TAM. |
| 10 | **Competitors** | NEW. `[TBD-USER: competitor names + the one axis we win on]` |
| 11 | **Team / Why us** | Uynghiem Ngo, Demeter Russafov. |
| 12 | **Backing** | Omtse Ventures + Apl.de.Ap (Apo). Reframe Apl from "ambassador" to backer/distribution unlock. |
| 13 | **The Ask** | Pre-revenue, product built, web-app (installable Android/iOS). **$2M SAFE @ $10M pre.** "Seeking opportunity," not "seeking a lead investor" — we have investors and a seed round. Use of funds leads with: land the LGU MOA + bank pilot, then farmer density. |
| 14 | **Closing** | Landslide-mission callback. |

**Removed from the current deck:** the Figma "live demo" slide.
**Folded:** old "In the Field" photos and the standalone Go-to-Market slide both go into Moat 3 (slide 8).

---

## 4. Open inputs (placeholders to fill)

- `[TBD-USER]` **Slide 2 quote** — exact words + who said it (farmer? Apl? a banker? the founder?).
- `[TBD-USER]` **Slide 10 competitors** — names + the single axis of differentiation (candidates to position against: generic farm-record apps, traditional MFIs, carbon-only platforms, pure job-matching apps).

Everything else is fully specified from the grilled model.

---

## 5. Build approach

- Rebuild `earthsama.com/pitch.html` in place. Keep the existing CSS architecture (slide base, reveal animations, nav dots, progress bar, responsive `--slide-pad` system).
- Reuse existing palette and motion. No new external dependencies (zero-build rule).
- Each slide is one `<section class="slide" data-slide="n">`. Update the nav-dot count and any slide-count constants in the inline JS.
- Placeholders rendered as visible `[TBD]` markers in the deck so the gaps are obvious until filled.

---

## 6. Out of scope

- Building the actual product app (web-app/PWA, marketplace, nursery tracking) — that is a separate project with its own spec.
- The LGU MOA itself (a business-development task, not an engineering one).
- Carbon MRV tooling — downstream, not in this deck beyond a one-line mention.
