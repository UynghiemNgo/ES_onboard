# Codex consult — EarthSama pivot to ANYO loan-readiness / microfinancing

Source: Codex session, 2026-06-16, run in repo `Earthsama_V2/mobile`.

---

### USER

# AGENTS.md instructions for /Users/omtse-agent/Earthsama_V2

<INSTRUCTIONS>
<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

</INSTRUCTIONS>
<environment_context>
  <cwd>/Users/omtse-agent/Earthsama_V2</cwd>
  <shell>zsh</shell>
  <current_date>2026-06-16</current_date>
  <timezone>Asia/Manila</timezone>
  <filesystem><workspace_roots><root>/Users/omtse-agent/Earthsama_V2</root></workspace_roots><permission_profile type="managed"><file_system type="restricted"><entry access="read"><special>:root</special></entry><entry access="write"><path>/Users/omtse-agent/Earthsama_V2</path></entry><entry access="write"><special>:slash_tmp</special></entry><entry access="write"><special>:tmpdir</special></entry><entry access="read"><path>/Users/omtse-agent/Earthsama_V2/.git</path></entry><entry access="read"><path>/Users/omtse-agent/Earthsama_V2/.agents</path></entry><entry access="read"><path>/Users/omtse-agent/Earthsama_V2/.codex</path></entry></file_system></permission_profile></filesystem>
</environment_context>

---

### USER

lets review this platform its overbuilt a little bit, if i want build just onboarding part to move them into meeting agri rural cedit program in philippines https://acpc.gov.ph/agri-negosyo-loan-program-anyo/ https://acpc.gov.ph/wp-content/uploads/AGRINEGOSYO-2024.pdf - so integrate this into a digital platform - For individuals:
Business Plan Preparation
Financial Literacy
Credit Worthiness
Simple Bookkeeping
Other relevant trainin

---

### CODEX

I’ll ground this in the actual repo shape and the current ACPC/ANYO requirements, then narrow the platform down to an onboarding-first build. I’m checking whether the project’s graph tools are exposed here before falling back to normal repo inspection.

---

### CODEX

The graph MCP tools named in `AGENTS.md` are not exposed in this session, so I’ll use the normal local inspection path and keep it focused. I’ve also pulled the ACPC page/PDF so the product shape matches the public program details rather than assumptions.

---

### CODEX

This is a broad platform: admin React, Flutter mobile, Supabase, Netlify functions, ML, carbon/compliance, workflow, payments, AI, and offline sync. I’m going to read only the architecture/product docs plus identity/onboarding and bankability surfaces, since that’s where an ANYO onboarding slice would land.

---

### CODEX

The existing PRD already contains the right instinct: “one loop” and “ship the smallest thing.” For an ANYO onboarding product, I’d tighten that further: onboarding should generate a complete referral packet and route the applicant to program briefing/PLC evaluation, not try to become the lender.

---

### CODEX

A useful reuse point already exists: onboarding collects farmer type, address, co-op/program agreement, and there’s an admin “bankability” concept. The mismatch is that the current product builds credit readiness passively from platform activity, while ANYO needs active intake, training completion, document readiness, and referral handoff.

---

### CODEX

I’ve got enough context now. I’m not going to make code edits unless you ask for an implementation pass; this review is mainly scope, product architecture, and what to keep/remove for an ANYO onboarding MVP.

---

### USER

FOR requirements
INDIVIDUAL SFF
ONE (1) GOVERNMENT-ISSUED ID WITH PICTURE
LOAN APPLICATION FORM
FARM PLAN AND BUDGET
PROOF OF ENROLLMENT IN THE REGISTRY SYSTEM
FOR BASIC SECTORS IN AGRICULTURE (RSBSA)
ONE (1) 1X1 PHOTO TAKEN WITHIN
THE LAST 3 MONTHS

---

### CODEX

Yes. For **Individual SFF** onboarding, the platform should be reduced to a document-readiness and training workflow for ANYO, not a full lending system.

Based on the ACPC ANYO page, Individual SFF borrowers need to be RSBSA registered/enrolled, can borrow up to PHP 300,000, and apply through ACPC ACCESS before ACPC forwards complete applications to a Partner Lending Conduit for evaluation. Source: https://acpc.gov.ph/agri-negosyo-loan-program-anyo/

**Individual SFF Onboarding Checklist**
1. Government-issued ID with picture
2. Loan Application Form
3. Farm Plan and Budget
4. Proof of RSBSA enrollment
5. 1x1 photo taken within the last 3 months

**Keep From Existing Platform**
- Identity/onboarding flow
- Photo/ID capture
- Barangay/address capture
- Meeting/training attendance records
- Financial literacy records
- Bankability/readiness dashboard concept
- Admin approval/review queue

**Remove Or Defer**
- Carbon MRV
- Tree task engine
- Disease detection
- Payments
- Blockchain/hash-chain notarization
- AI-heavy task assignment
- Complex multi-role boss/worker workflows
- Full credit scoring as a loan decision engine

**New ANYO-Focused Flow**
1. Farmer creates profile  
   Name, contact, address, farmer type, crop/fishery activity, RSBSA status.

2. Upload/capture requirements  
   ID, 1x1 photo, RSBSA proof, loan application form, farm plan and budget.

3. Guided training path  
   - Business Plan Preparation  
   - Financial Literacy  
   - Credit Worthiness  
   - Simple Bookkeeping  
   - Other relevant training

4. Farm Plan and Budget builder  
   Simple wizard: commodity, area/scale, production cycle, inputs, labor, expected sales, loan amount needed, repayment timing.

5. Readiness review  
   Admin sees missing documents, training completion, farm plan quality, and flags.

6. Program briefing / meeting handoff  
   Once complete, applicant is scheduled for briefing or forwarded to ACPC/PLC process.

**Important product boundary:** the system should say “application readiness” or “referral readiness,” not “loan approval.” PLC still evaluates CI/BI and approves/disapproves the loan.

The clean MVP is: **collect requirements, teach the required modules, generate the Farm Plan and Budget, and move the farmer into ACPC/PLC review.**

---

### USER

take out fishery and so review this pipeline, if we a) organization prepare people and create a business plan for them to do agroforestry, b) they plant the trees and our MRV measures the carbon and SOP C) carbon revenue can actually pay them back for their loan d) instead of applying as a organization is helping multiple 1000s of individual SFFs be loan ready and then do simple bookkeeping and business plan preparation with AI and guiding them without having them to prepare it

---

### CODEX

Yes, that pipeline is stronger if you **do not apply as one organization borrower** and instead make the organization the **loan-readiness + implementation operator** for many Individual SFFs.

The key shift:

**The organization is not the borrower. The farmers are the borrowers. The organization makes them ready, coordinates agroforestry implementation, tracks performance, and helps carbon revenue service the loans.**

**Revised Pipeline**

1. **Recruit Individual SFFs**
   - Only agriculture/agroforestry, no fishery.
   - Confirm each farmer is or can become RSBSA enrolled.
   - Capture the required ANYO documents:
     - Government-issued ID with picture
     - Loan application form
     - Farm Plan and Budget
     - Proof of RSBSA enrollment
     - Recent 1x1 photo

2. **AI-Guided Loan Readiness**
   The platform prepares each farmer without expecting them to write formal documents themselves.

   The app should ask simple guided questions:
   - What land do you farm?
   - What crops/trees will be planted?
   - How many trees?
   - What inputs are needed?
   - Who will do the labor?
   - When will income arrive?
   - How much loan is needed?

   Then the system generates:
   - Farm Plan and Budget
   - Basic business plan
   - Loan-use summary
   - Repayment projection
   - Document checklist
   - Readiness score

3. **Training Completion**
   For each farmer, track:
   - Business Plan Preparation
   - Financial Literacy
   - Credit Worthiness
   - Simple Bookkeeping
   - Agroforestry SOP / planting protocol
   - Carbon/MRV orientation

   This becomes evidence that the applicant is prepared, even if they are low-literacy.

4. **Submit Many Individual SFF Applications**
   The organization batches, reviews, and helps submit thousands of individual applications, but each application remains tied to the individual farmer.

   This fits better with the Individual SFF path under ANYO, where individual SFFs can access up to PHP 300,000 and ACPC/PLC still evaluates the application. Source: https://acpc.gov.ph/agri-negosyo-loan-program-anyo/

5. **Agroforestry Implementation**
   After loan release:
   - Farmer receives planting tasks
   - Organization supplies seedlings/input coordination
   - App guides planting SOP
   - GPS/photo proof records planting
   - Survival monitoring continues over time

6. **MRV And Carbon Accounting**
   Your MRV layer measures:
   - Tree location
   - Species
   - Survival
   - Growth
   - Biomass/carbon estimate
   - Audit trail

   This is where Earth Sama’s existing MRV/carbon stack becomes useful. It should not be part of the loan application MVP, but it becomes the repayment-support engine after planting starts.

7. **Carbon Revenue As Repayment Support**
   The clean thesis is:

   **Loan finances agroforestry setup. Agroforestry creates carbon assets. Carbon revenue helps repay the loan and creates farmer upside.**

   But be careful with wording. Do not promise that carbon will fully repay the loan unless the model proves it. Say:
   - projected carbon revenue
   - repayment support
   - potential offset against loan obligations
   - farmer revenue share

**What The Platform Should Become**

A practical name for the product is:

**Individual SFF Agroforestry Loan Readiness Platform**

It has four core modules:

1. **Applicant Readiness**
   Profile, RSBSA proof, ID/photo, loan form, eligibility status.

2. **AI Business Plan + Farm Plan Builder**
   Converts simple farmer answers into formal loan-ready documents.

3. **Training + Bookkeeping**
   Tracks completion and later records expenses, sales, loan use, and repayments.

4. **Agroforestry MRV + Carbon Revenue**
   Tracks planting, survival, biomass, carbon estimates, and carbon-linked revenue.

**Important Risk**

The weak point is timing. Loans need repayment schedules, but carbon revenue may arrive much later than planting. So the business plan should not rely only on carbon. It should include:

- short-term crop/agroforestry income where possible
- realistic repayment grace period assumptions
- carbon revenue as upside or supplemental repayment
- conservative carbon pricing
- survival-rate risk
- verification/issuance delay risk

**Recommendation**

Build the MVP around **loan-readiness and document generation first**.

Do not start with carbon marketplace, advanced MRV, or automated repayment. Start with:

- Individual SFF intake
- ANYO document checklist
- AI Farm Plan and Budget
- training completion
- simple bookkeeping
- admin review dashboard
- exportable application packet

Then attach MRV after loan approval and planting. This keeps the platform useful immediately while preserving the bigger carbon-backed agroforestry thesis.

---

### USER

we can handle all the enrolment and application

---

### CODEX

Then the platform should position the organization as the **managed enrollment and application operator** for Individual SFF agroforestry borrowers.

That makes the model cleaner:

**Farmer is the borrower. Organization is the operator. Platform is the operating system.**

The organization handles:

1. **RSBSA enrollment support**
   - Collect farmer identity and farm details
   - Help complete/verify RSBSA enrollment evidence
   - Track RSBSA status per farmer
   - Flag missing or inconsistent records

2. **ANYO application preparation**
   - Government ID with picture
   - Loan application form
   - Farm Plan and Budget
   - RSBSA proof
   - Recent 1x1 photo
   - Supporting readiness notes

3. **AI-assisted business planning**
   Farmers should not have to write plans. The app interviews them in simple language and generates:
   - agroforestry business plan
   - farm plan and budget
   - loan amount rationale
   - expected costs
   - repayment projection
   - risk notes
   - implementation schedule

4. **Training and certification**
   Track completion for:
   - Business Plan Preparation
   - Financial Literacy
   - Credit Worthiness
   - Simple Bookkeeping
   - Agroforestry SOP
   - Carbon/MRV orientation

5. **Batch application operations**
   The admin side should support thousands of applicants:
   - status pipeline
   - missing requirement filters
   - document QA
   - duplicate detection
   - application packet export
   - briefing attendance
   - PLC/ACPC submission tracking

6. **Post-loan implementation**
   Once funded:
   - planting tasks
   - seedling/input distribution
   - GPS/photo proof
   - survival checks
   - bookkeeping
   - repayment monitoring
   - MRV/carbon measurement

The strongest pipeline is:

**Enroll SFFs → prepare loan-ready packets → submit individual ANYO applications → deploy agroforestry capital → verify planting/MRV → use agroforestry and carbon revenue to support repayment.**

I would make the MVP workflow statuses something like:

`lead`
`identity_started`
`rsbsa_pending`
`rsbsa_ready`
`documents_incomplete`
`training_in_progress`
`farm_plan_draft`
`application_ready`
`submitted`
`briefing_scheduled`
`under_plc_review`
`approved`
`released`
`planting_active`
`mrv_active`
`repayment_active`

The important design choice: **do not make farmers operate the bureaucracy.** Farmers answer guided questions, attend training, confirm details, and perform planting/bookkeeping tasks. The organization and AI prepare the formal documents and manage the application pipeline.

---

### USER

okay so review the system onboarding and planting because that stuff will come after enrolment or should I just create entirely new application

---

### CODEX

I would **not create an entirely new application**. I would create a **new onboarding/enrollment track inside this platform** and reuse the planting/MRV pieces later.

The current system is overbuilt for the first step, but it already has the hard parts you will eventually need: offline mobile, identity capture, task workflows, GPS/photo proof, meeting/training attendance, simple bankability tables, and MRV/carbon modules. Starting a new app risks rebuilding those same foundations.

**Recommended Structure**

Use this platform, but split the product into two phases:

**Phase 1: Enrollment + Loan Readiness**
This becomes the first real product.

Keep/rework:
- Farmer identity onboarding
- Address/barangay capture
- ID/photo capture
- RSBSA status tracking
- ANYO document checklist
- AI business plan builder
- Farm Plan and Budget builder
- Training completion
- Admin review queue
- Batch application pipeline

Do not expose yet:
- Carbon dashboards
- Tree disease detection
- Payments
- Complex boss/worker workflows
- Full task automation
- Blockchain/compliance extras

**Phase 2: Planting + MRV**
This starts only after a farmer/application is approved or capital is released.

Reuse:
- Task assignment
- GPS planting proof
- Photo evidence
- Land plot/tree marker data
- Offline sync
- Survival checks
- MRV/carbon calculations
- Meeting/training attendance

**How It Maps To The Current System**

The existing onboarding currently ends in generic program enrollment with `pending_approval` in [program_agreement_screen.dart](/Users/omtse-agent/Earthsama_V2/mobile/lib/domains/identity/screens/program_agreement_screen.dart:50). That should become an **ANYO application pipeline**, not a generic program agreement.

The existing bankability schema already has useful pieces: KYC, credit scores, microcredit applications, and financial literacy records in [0016_bankability.sql](/Users/omtse-agent/Earthsama_V2/supabase/migrations/0016_bankability.sql:4). I would reshape this around **application readiness**, not lender-side approval.

The meeting/training system in [0017_meetings.sql](/Users/omtse-agent/Earthsama_V2/supabase/migrations/0017_meetings.sql:4) is directly useful for program briefing, financial literacy, bookkeeping, agroforestry SOP, and carbon orientation.

**Decision**

Use the existing app as the base, but create a new product surface:

**“Agroforestry Loan Readiness”**

It should feel like a narrower app:
1. Enroll farmer
2. Complete RSBSA/application requirements
3. Generate business plan and Farm Plan/Budget
4. Complete required training
5. Submit/track ANYO application
6. After release, unlock planting/MRV workflow

So the system becomes staged:

`Enrollment → Application Readiness → Submission → Approval/Release → Planting → MRV → Repayment Support`

That avoids throwing away useful infrastructure while preventing the first version from feeling like a carbon/MRV platform before the farmer is even loan-ready.

---

### USER

and then I want create it as offline, so farmer can track their progress on items they need to get

---

### CODEX

Yes. Offline farmer progress tracking should be the **core mobile MVP**.

Build it as a local checklist-first app where the farmer, field officer, or organization staff can see exactly what is missing even with no signal.

**Offline Farmer Progress App**

Each farmer gets a local progress record with these sections:

1. **Identity**
   - Name
   - Contact number
   - Address/barangay
   - Farmer type
   - Government ID photo
   - 1x1 photo

2. **RSBSA**
   - Not started
   - Info collected
   - Submitted for enrollment
   - Proof uploaded
   - Verified ready

3. **ANYO Requirements**
   - Government-issued ID
   - Loan application form
   - Farm Plan and Budget
   - RSBSA proof
   - Recent 1x1 photo

4. **Training**
   - Business Plan Preparation
   - Financial Literacy
   - Credit Worthiness
   - Simple Bookkeeping
   - Agroforestry SOP
   - Carbon/MRV orientation

5. **AI Prepared Documents**
   - Business plan draft
   - Farm Plan and Budget draft
   - Loan use summary
   - Repayment projection
   - Ready for admin review

6. **Application Status**
   - Draft
   - Missing requirements
   - Ready for review
   - Submitted
   - Briefing scheduled
   - Under PLC/ACPC review
   - Approved
   - Released

The current app already has the right offline foundation: Flutter mobile, local Drift SQLite, sync queue, photo capture, onboarding screens, meeting/training records, and task-style progress. I would reuse that rather than start from scratch.

The UX should be very simple:

**Farmer home screen**
- Big progress percentage
- “3 items missing”
- Next required action
- Offline/synced status
- One tap to capture missing photo/document
- One tap to listen to instructions

Example:

```text
Loan Readiness: 68%

Missing:
- RSBSA proof
- Farm Plan and Budget
- Financial Literacy training

Next step:
Attend Financial Literacy Training
```

For offline behavior:

- All checklist items live in local SQLite.
- Photo/document captures save locally first.
- Every change is queued in the sync queue.
- When signal returns, the app uploads progress, documents, and timestamps.
- If sync fails, farmer still sees their saved progress.
- Never block the farmer because the network is unavailable.

The product rule should be:

**The farmer should always know what is done, what is missing, and what happens next, even offline.**

---

### USER

now all these documents can route to carbon financing easily?

---

### CODEX

Not directly. The ANYO/loan documents help with **farmer identity, eligibility, planning, and implementation control**, but carbon financing needs a different evidence package.

They are useful upstream, but not sufficient by themselves.

**What Transfers Well**

The loan-readiness documents can support carbon financing because they prove:

- who the farmer is
- where the farm is
- what agroforestry activity is planned
- what budget/resources are needed
- that training was completed
- that the farmer consented to participate
- that implementation can be tracked farmer-by-farmer

So yes, they create a strong operating base.

**What Carbon Financing Still Needs**

Carbon buyers/verifiers will usually need additional MRV and project evidence:

- land boundary or GPS plot data
- baseline land-use condition before planting
- species and planting design
- tree count and spacing
- planting dates
- survival monitoring
- growth measurements
- permanence/risk controls
- leakage risk assessment
- farmer consent and carbon rights assignment/revenue-share agreement
- monitoring reports
- verification-ready audit trail

So the platform should treat the documents like this:

`Loan Application Packet → Agroforestry Implementation Packet → Carbon MRV Packet`

**Best Architecture**

The same farmer record should feed both systems, but with separate readiness tracks:

1. **Loan Readiness**
   - ID
   - RSBSA proof
   - loan application
   - farm plan and budget
   - 1x1 photo
   - training records

2. **Carbon Readiness**
   - land boundary
   - baseline photo/GPS record
   - farmer carbon consent
   - species plan
   - planting proof
   - survival checks
   - MRV measurements
   - revenue-share terms

**Important Point**

Carbon financing becomes easier if the loan onboarding already captures clean farmer identity, farm location, consent, and business plan data. But you still need a carbon-specific legal/MRV layer before routing to buyers or registries.

So the answer is: **yes, routeable, but not automatically financeable.** The app should generate a second carbon packet from the same farmer onboarding and planting data.

---

