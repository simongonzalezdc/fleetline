# Fleetline Design-System Interview — 2026-09-25

**Instrument:** `design-system-interview` v1 (org skill) + canonical contract
`references/interview-contract.generated.md` (greenfield, 9 required dimensions
+ 1 optional). Run in **headless self-interview mode** per
`references/session-protocol.md`: the CEO order mandates the complete contract
answered from product truth, with every forcing question surfaced as a
recommended, overridable assumption. Per the skill's own law: assumptions are
not approval. The CEO confirms in **one pass** via the checklist in
`docs/DESIGN-MENU-V2-2026-09-25.html`.

**Artifact state: `approval-ready`** — all nine required dimensions answered
with evidence; recommendations complete; awaits the CEO confirmation pass.
Nothing in this document silently averaged a fork; every dimension names the
forks considered and the evidence that picked one.

---

## Evidence base (cited by ID throughout)

| ID | Source | What it proves |
| --- | --- | --- |
| E1 | `README.md`, `SUBMISSION.md` | Product truth: self-hosted MCP server + Agent Skill; a voice assistant (Alexa+) operates a local agent fleet; Alexa+ track of the Amazon Build-Ship-Shape hackathon; demo video is the judges' surface; runs fully local, zero paid APIs, zero API keys. |
| E2 | `docs/DESIGN-2026-09-25.md` (design PM receipt) | Three registers exist (signal/ops/press), all pass computed WCAG AA audit at 1440x900; Signal is the declared default for video/judges; CEO saw menu v1 and ordered this program on top of it. |
| E3 | Live session reads, 2026-09-25 (this run): server live at 127.0.0.1:3000, autodemo exercised per register, accessibility-tree + DOM structure captured at 1440x900 idle and mid/post-mission. | Actual anatomy: header band; left conversation pane (You / MCP tool-chip / Alexa+ messages, suggestion chips, composer with mic + send); right instrument column (stat strip 4 cells, role-grouped roster 4+3+1, missions with progress bars + status badges, live event feed with phase icons + timestamps); footer disclosure. |
| E4 | Org canon, `~/workspaces/kyanite-labs`: `kyanite-landing/static/css/kyanite-system.css` (house tokens: void/basalt dark surfaces, cyan signal, fluid clamp steps, measure 66ch, Space Grotesk/Plus Jakarta/JetBrains Mono, motion curve) and `achiote-internal-docs/DESIGN-SYSTEM.md` (org maturity exemplar: locked tokens, contrast rules as hard law, weight-as-hierarchy, self-hosted fonts, reduced-motion gating). | The org's house design language and its discipline level. Dogfooding law: org products should read as org machinery. |
| E5 | CEO mandate 2026-09-25 (this program order). | Full design system; three registers = one system, three conformant skins; judged by tastecheck v1.7.0; zero spend; no external uploads of the new UI. |
| E6 | `public/style.css` + `theme-{signal,ops,press}.css` (current token inventory). | What exists today: theme-agnostic anatomy layer + per-theme variable sets; register-level overrides already partially structural (ops boxed header, press column rule). |

---

## Session rules honored (from the generated contract)

- Complete contract run: all 9 required dimensions + optional `motion` —
  no dimension skipped.
- Existing-direction shortcut considered: the PM's three registers cover
  reference/aesthetic/color/density partially (≥5 partial), so per
  session-protocol this run **restates and completes** rather than re-derives
  from zero; gaps filled; all statuses re-marked against evidence.
- Contradictions surfaced explicitly (C1–C4 below), never silently resolved.
- Forks recorded as poles; no "bit of both" answers accepted from myself.

---

## Dimension 1 — `reference` (Visual reference / personality anchor)

**Contract question:** What real artifact anchors the direction, and what does
it earn?

**Forks considered:**
- A. Generic "modern dev tool" (Linear/Raycast imitation) — earns category
  recognition, costs being one of a thousand.
- B. The org's own house system (kyanite-system.css: void-dark, signal cyan,
  instrument panels) + historical mission-control consoles — earns family
  resemblance to org machinery (dogfooding law) and an authored, non-template
  read in the first 3 seconds of the judges' video.

**Answer:** B. The anchor artifacts are (1) Kyanite's own house system (E4) —
Fleetline must read as org machinery, and the house language is already a
dark instrument-panel grammar — and (2) the Apollo-era mission-control console
tradition: an operator watching a machine work. What the anchor earns: instant
"serious 2026 tool" register without imitating any named competitor, and
brand coherence with the org that built it.

**Status:** `committed` (E4 + E2: the PM's Signal direction already encodes a
house-adjacent language; the CEO ordered the system built on that substrate).

**Consequence:** tokens inherit house discipline (fluid steps, measure caps,
hairline discipline) with Fleetline's own hue identity (indigo signal rather
than house cyan as primary, cyan kept as secondary signal color).

---

## Dimension 2 — `personality` (Brand personality spectrum)

**Contract question:** Which pole on the spectrum — not the middle?

**Forks considered:**
- A. Theatrical/playful (consumer voice assistant vibe: bubbles, rounded,
  exclamation) — wrong for an operator console; reads as toy in a Tech-judged
  contest.
- B. Cold-corporate sterile — undermines the voice-first warmth; the product's
  differentiator is talking to your fleet.
- C. **Calm mission-control authority** — the machine is precise; the voice is
  warm; the surface stays composed under live load.

**Answer:** C, stated as a pole: "the composed console of a machine you trust
with your voice." Warmth lives in the conversation register (language, voice),
not in decoration.

**Status:** `committed` (E1: solo operator trusts it hands-free; E2: all three
PM registers already sit at this pole).

**Consequence:** no playful motion, no confetti, no decorative illustration;
state changes are quiet and precise; the chat transcript is a first-class
reading surface, not a bubble cartoon.

---

## Dimension 3 — `aesthetic` (Aesthetic territory)

**Contract question:** One concrete phrase predicting hierarchy and material.

**Forks considered:**
- A. Showroom minimal (lots of air, hero-scale statements) — wastes the
  1440x900 frame judges actually see; this is a working console.
- B. **Layered instrument panel**: a dark glass conversation surface (dominant,
  left) beside a continuous instrument stack (right), separated by structure,
  not decoration.

**Answer:** "A voice console over a live engine room": conversation pane
dominant (~58% width), instrument column stacked stats → roster → missions →
feed; materials per register — Signal: layered low-alpha glass on near-black;
Ops: flat phosphor instrument panel; Press: printed broadsheet column split.
One system, three registers: identical anatomy, identical semantic tokens,
register-level material and density overrides only.

**Status:** `committed` for the system anatomy (E3: the two-pane asymmetric
composition is the product's working truth); register materials `committed`
(E2/E5: substrate ordered as-is). 

**Consequence:** every component spec in DESIGN-SYSTEM.md is written once
against semantic tokens, with three register columns for material/density
values — never three separate component designs.

---

## Dimension 4 — `type` (Typography stance)

**Contract question:** Binding evidence for faces; display/body stance;
language and measure risk.

**Forks considered:**
- A. Webfont identity face (Space Grotesk/JetBrains self-hosted, house-style)
  — violates the demo's deterministic/offline constraint: judges clone and
  `npm start`; zero-spend order (E5); font files add build surface for no
  judge-visible gain at console densities.
- B. **System stacks, precisely tuned** — SF Pro/Segoe-class sans (Signal),
  system mono (Ops), New York/Georgia serif display (Press).

**Answer:** B. Binding evidence: E1 (deterministic clean-clone demo, zero
external dependencies), E5 (zero spend). Stance per register: Signal = system
sans display+body, mono for data/labels; Ops = mono-first (data is the
identity); Press = serif display numerals/headlines (New York with Georgia
fallback), system sans body. Language: English-only product (contest copy).
Measure: chat/report text capped 66–74ch; the report view is a reading
surface. Metrics use tabular numerals (already in stat cells; extended to all
numeric data). Risk recorded: Press serif rendering differs across platforms
(New York only on Apple; Georgia is the cross-platform pole) — accepted as an
editorial-register characteristic, not a defect; both poles pass the same
contrast/size floors.

**Status:** `committed` (E1/E5 force system stacks; E2 confirms all three
registers already audit-clean at these stacks). The one assumption inside:
"system stacks suffice for a top-decile Design score" —
`assumption awaiting confirmation` (CEO pass, checklist item A2).

**Consequence:** typography spec defines fluid steps, weights-as-hierarchy,
tabular-nums law, and per-register family maps; no `@import`/webfont in the
bundle.

---

## Dimension 5 — `color_mode` (Color and mode)

**Contract question:** Dominant hue, accent job, light/dark commitment.

**Forks considered:**
- A. One mode only (dark) — cleanest, but the three-register substrate (E2,
  E5) exists and demonstrates range to Design judges.
- B. **Dark-committed with one deliberate light register**: Signal (default,
  dark, indigo/cyan), Ops (dark, amber phosphor), Press (light, paper/ink,
  kyanite blue). 

**Answer:** B. Dominant hue per register: Signal = indigo signal family
(accent job: state and action — busy/progress/send), Ops = amber phosphor
(accent job: attention on black), Press = kyanite blue on paper (accent job:
editorial emphasis). Semantic state colors (ok/warn/bad/busy) are
system-wide roles with per-register value maps; every text pair ≥4.5:1, UI
pairs ≥3:1 (audit-enforced, E2's instrument carried forward). Mode
commitment: dark default for the product and video; Press light mode is an
alternate register, not a theme toggle — each register is a complete skin.

**Status:** `committed` (E2: computed AA across all three; E5: substrate
confirmed by order). `color-scheme` correctly declared per register.

**Consequence:** color spec = primitive ramps (OKLCH-defined) → semantic
roles → register maps; contrast pairs table published per register; the
audit instrument re-run in Phase 4 must reproduce 0 fails.

---

## Dimension 6 — `density_shape` (Density and shape language)

**Contract question:** Density and shape derived from content, interaction,
platform, brand — not an imported recipe.

**Forks considered:**
- A. Spacious showroom density — wastes the operator's scan; judges see a
  toy.
- B. **Dense operational** — one 1440x900 frame holds the whole live story:
  8 workers, missions, events, stats, conversation.

**Answer:** B. Density: dense-but-breathing; 4/8px spacing rhythm; density is
a register property (Ops densest 4px-base, Signal standard 8px-base, Press
airy 8px-base with editorial leading). Shape: radius is a register signature,
numeric and bounded — Signal 8–14px (glass panes), Ops 0–3px (instrument),
Press 0px (print); pill radius reserved for tags/chips only, never CTAs
(deslop law). Elevation: Signal = layered glass + inset top highlights +
one ambient glow pair under a luminance budget; Ops = flat, hairline rules,
zero shadow; Press = zero shadow, hairline rules, ink bars.

**Status:** `committed` (E3: the frame's content volume demands it; E2/E6:
register radii/elevation already in substrate).

**Consequence:** spacing scale defined on 4/8; density modes documented per
register; shape tokens (`--radius-control/card/pill`) with per-register
values; elevation rules written as laws (what may cast shadow: only floating
layers over the base canvas in Signal; never in Ops/Press).

---

## Dimension 7 — `structure_rhythm` (Layout structure and rhythm)

**Contract question:** Composition, spatial motif, sectional cadence — and
the one structural signature (recorded under `signature`).

**Forks considered:**
- A. Centered single column — kills the two-surface product truth (talk left,
  watch right).
- B. **Asymmetric two-pane console**: conversation left (dominant), instrument
  column right, header band, footer disclosure.

**Answer:** B. Composition: asymmetric, focal logic = "the voice is primary;
the engine is visible." Spatial motif: the **instrument stack** — the right
column reads as one continuous console (stats strip as its LED readout,
roster as its crew panel, missions as its job queue, feed as its wire) — not
a stack of generic cards. Rhythm: steady operational cadence — sections keep
a consistent frame and vary by *data type*, not by decoration (stat cells vs
roster rows vs mission blocks vs feed lines are structurally distinct
treatments; that is the syncopation). Section order fixed by information
pressure: read the pulse (stats) → who's working (roster) → what's running
(missions) → what just happened (feed). Single-column stack below 960px with
conversation first.

**Status:** `committed` (E3: live DOM proves this structure carries the
product; E6: grid already `7fr/5fr`-class).

**Consequence:** layout spec fixes the grid, breakpoints (960px stack point,
320px floor), and per-section structural treatments; deslop audit checks
against this structure (no uniform card grid may replace the instrument
stack).

---

## Dimension 8 — `signature` (Signature element)

**Contract question:** One memorable move — behavior or structure, not
decoration accumulation.

**Forks considered:**
- A. A decorative signature (animated logo, gradient hero) — slop risk,
  judged as noise.
- B. **The fleet pulse**: the whole interface beats with the live fleet —
  busy-worker dots pulse on one shared heartbeat, the event feed ticks in
  phase-iconged lines, mission bars fill in sync, and the "busy now" stat
  lights while anyone works. The signature is the product's realness made
  visible: you *see* eight agents work because the surface breathes with
  them.

**Answer:** B — the fleet pulse, on all three registers (each in its own
material: glass shimmer / phosphor blink / ink-quiet fade).

**Status:** `committed` (E3: dots/bars/feed already exist; this names and
unifies them as the signature; implementation aligns their timing to one
rhythm).

**Consequence:** motion spec defines the shared heartbeat (period, easing,
reduced-motion floor: pulse becomes steady state under
`prefers-reduced-motion`); the signature is cited in the tastecheck gestalt
judgment basis.

---

## Dimension 9 — `imagery_iconography` (Imagery and iconography approach)

**Contract question:** Source/treatment or absence; one icon system; rights
and accessibility evidence.

**Forks considered:**
- A. Stock/AI imagery for "hero" feel — wrong product class (a console), and
  generic-imagery is a named slop tell.
- B. **Absence of imagery, one inline icon system**: the "imagery" is the
  live data itself. Functional iconography = one inline-SVG set, 16px grid,
  monoline, `currentColor`, monochrome.

**Answer:** B. Icon system: single geometric language derived from the fleet
chevron mark (E3 header). Scope: mic, voice-on/off, connection state, event
phase glyphs (started ▸ / completed ✓ / failed ✕ / info ·), worker status.
The current mic control's emoji (🎙, E3/E6) is a defect against this decision
— replaced in implementation. Event phase glyphs move from text characters to
the SVG set with text alternatives retained for assistive tech. No
photographic imagery anywhere; illustration absent by decision.

**Status:** `committed` (product class evidence E1; slop law cited in
deslop-ui).

**Consequence:** iconography spec defines the grid, stroke, sizes (16/12/8),
and the a11y rule (decorative `aria-hidden`, meaningful = labeled); the
emoji-icon fix lands in Phase 2b.

---

## Dimension 10 (optional) — `motion` (Motion and transition character)

**Contract question:** Purpose, interruption tolerance, reduced-motion
behavior — only where motion changes comprehension.

**Forks considered:**
- A. Expressive motion (springs, parallax) — off-pole for a calm console;
  video risk (fake camera-motion law adjacency).
- B. **State-legibility motion only**: things move to show state change,
  nothing else.

**Answer:** B. Purpose: (1) fleet pulse heartbeat (see signature); (2) new
event/message entry (single 140–160ms fade-in, no slide); (3) progress bar
width transition (240ms ease); (4) busy dot pulse (1.2s). Interruption
tolerance: all motion is interruptible and non-blocking; nothing animates
layout (no size/position changes). What never moves: pane positions, header,
the grid; no parallax, no zoom, no entrance choreography for static content.
Reduced motion: `prefers-reduced-motion: reduce` stops pulse/entry animation
entirely — the states remain distinguishable by color/shape alone (pulse is
redundant encoding, per a11y law).

**Status:** `committed` (E3: these motions exist; spec tightens them to one
system).

**Consequence:** motion tokens (`--dur-*`, `--ease-*`) in the system; audit
checks reduced-motion honored.

---

## Contradictions surfaced (session-protocol: never silently resolved)

- **C1 — deslop-ui "glassmorphism tell" vs Signal's glass register.**
  Resolution: deslop-ui condemns *template* glassmorphism (frosted cards over
  colorful gradient backgrounds). Signal's glass is an authored material per
  the org `glass-ui-laws` skill: low-alpha layering on near-black, luminance
  budget (ambient glow held under budget, E2 measured), blur confined to the
  sticky header. The distinction is recorded as law in DESIGN-SYSTEM.md
  (glass rules section) and is auditable. **Status: resolved by explicit
  rule, `committed`.**
- **C2 — "one default theme for judges" (PM audit directive, E2) vs
  three-register system (CEO order, E5).** Resolution: the *system* has three
  registers; the *product default* remains Signal; judges' video/README use
  the default. Both statements hold at different layers. **Status: resolved,
  `committed`.**
- **C3 — system stacks (offline determinism, E1) vs house identity fonts
  (E4).** Resolution: E1 wins (deterministic clean-clone demo; zero spend);
  house *discipline* (steps, measures, weights) is inherited without house
  *files*. Recorded as refusal R2 below. **Status: resolved, `committed`.**
- **C4 — emoji mic icon (current DOM) vs one-icon-system decision (this
  interview).** Not a direction contradiction; an implementation defect.
  Fixed in Phase 2b. **Status: resolved by fix.**

---

## CEO design rulings — 2026-09-25 (committed, verbatim)

Mid-program, the CEO issued three rulings that resolve the register
questions this interview had marked open. Recorded here as `committed`
decisions with his verbatim words; the artifact remains `approval-ready`
for the remaining assumptions.

- **R1 — register of record:** *"i like your second design with the
  yellow. so don't forget about it"* → **Ops (amber mission-control) is the
  pick**: default mode, README surface, demo-video register. Amber becomes
  the brand accent of record (semantic treatment + full contrast pairing
  in DESIGN-SYSTEM.md). Resolves the default-register fork of D3/D5.
- **R2 — pairing:** *"press is a good start to a light theme but it must
  be aligned to seem of a pair with ops"* → Press is promoted to the
  **light half of one dark/light system**: identical anatomy, components,
  states, motion; paper-and-ink as light-plane material; shared DNA made
  explicit (decisions A7/A8 below). Amends D3/D5's three-register stance.
- **R3 — two modes only:** *"remove signal its messy to have a random
  third style"* → Signal deleted entirely; the theme system is exactly
  Ops (dark) + Press (light). Supersedes assumption A1.

Evidence note: rulings arrive via the CCO lane (coordinator relays, CEO
verbatim quotes, 2026-09-25); treated as CEO word per org law.

**Shared-DNA decisions made explicit under R2 (now A7/A8):**

- **A7 — amber across planes + serif scope:** brand FILLS stay phosphor
  amber `#ffb000` with ink `#14100a` in both planes (the pair's shared
  action color); accent TEXT uses the plane variant (bright amber on
  black; deep amber `#8a5c00` on paper, contrast-verified). Mono-first
  typography is the shared DNA; the Press serif is confined to exactly two
  surfaces — the masthead wordmark and the stat folio numerals.
- **A8 — component parity:** every Ops component (boxed header cells, LED
  stat dots, transcript chat, tool chips, report/audit views, worker rows,
  mission blocks) exists identically in Press with the same states and
  motion; the single sanctioned material difference is the progress bar
  fill (segmented phosphor in Ops, solid ink-amber in Press).

---

## Refusals (the system's negative space — taste as constraint)


1. No webfonts/font downloads — deterministic offline demo (C3).
2. No stock or AI imagery; no illustration; the data is the imagery (D9).
3. No pill CTAs — pill radius reserved for tags/chips/status badges only.
4. No decorative gradient surfaces; gradients only as quantized material
   (glow under luminance budget in Signal; segmented bars in Ops).
5. No layout animation, no parallax, no entrance choreography (D10).
6. No uniform card grid — the instrument stack's sections differ by data
   type (D7).
7. No raw JSON in user-facing surfaces — structured chips/details (E2 fix
   carried forward as law).

---

## Decision map (canonical format)

| Dimension / conflict | Evidence | Decision or assumption | Consequence | Confirmation / owner |
| --- | --- | --- | --- | --- |
| reference | E4, E2 | committed: org house system + mission-control tradition | house-discipline tokens, indigo identity | — |
| personality | E1, E2 | committed: calm mission-control authority | precision surfaces, warmth in language only | — |
| aesthetic | E3, E2, E5 | committed: "voice console over engine room," glass/panel/broadsheet materials | one anatomy, three register material maps | — |
| type | E1, E5 | committed: system stacks per register; assumption A2 that stacks suffice for Design score | fluid steps, weights-as-hierarchy, tabular-nums law | A2 → CEO pass |
| color_mode | E2, E5 | committed: dark default + light press register; semantic roles with register maps | contrast pair tables per register | — |
| density_shape | E3, E6 | committed: dense operational; 4/8 rhythm; radius per register bounded | spacing scale + density modes + shape tokens | — |
| structure_rhythm | E3, E6 | committed: asymmetric console; instrument-stack motif; steady operational cadence | fixed section order/treatments; no card-grid | — |
| signature | E3, E5 | committed: the fleet pulse across all registers | shared heartbeat timing; reduced-motion floor | — |
| imagery_iconography | E1, E3 | committed: no imagery; one inline-SVG monoline set | emoji icon replaced; phase glyphs → SVG | — |
| motion (optional) | E3 | committed: state-legibility only; interruptible; reduced-motion honored | motion tokens; audit hook | — |
| C1 glass vs deslop | deslop-ui, glass-ui-laws | resolved: authored glass under luminance budget ≠ template glassmorphism | glass rules section in spec | — |
| C2 one default vs 3 registers | E2, E5 | resolved: system=3, default=Signal | README/video use Signal | — |
| C3 fonts offline vs house | E1, E4 | resolved: system stacks + house discipline | refusal R1 | — |

**Assumptions awaiting CEO confirmation (the one-pass checklist):**

- ~~**A1** Register set~~ — **resolved by CEO rulings R1/R3**: two modes,
  Ops (default) + Press (light half); Signal deleted.
- **A2** System stacks (no webfonts) suffice for a top Design score.
- **A3** Fleet pulse as the system signature (vs. a purely static signature).
- ~~**A4** Press stays light-paper~~ — **resolved by R2**: Press is the
  light half of the Ops pair.
- **A5** English-only UI copy is correct for the contest (no bilingual
  surface).
- **A6** Compact operational density in both planes (no user-facing density
  toggle).
- **A7** Amber pairing strategy (shared phosphor fills, plane-variant accent
  text; serif confined to masthead + folio numerals).
- **A8** Component parity list incl. the one sanctioned material difference
  (segmented vs solid progress fill).

**Blocked by contradiction:** none.

---

## Ready-to-build check (per skill)

| Check | Status | Evidence / provenance | Reason | Remediation |
| --- | --- | --- | --- | --- |
| Nine required dimensions decided | pass | D1–D9 above, all answered | every dimension has a committed answer or named assumption | — |
| Existing-direction shortcut or full interview justified | pass | session rules section; PM substrate ≥5 partial → completed, not re-derived | headless full-contract order honored | — |
| Contradictions and trust-critical rationale resolved | pass | C1–C4 resolved explicitly | none silently averaged | — |
| DESIGN-SYSTEM.md and canonical token block complete | pass | `docs/DESIGN-SYSTEM.md` (next artifact), canonical token names from tokens.md | emitted with this interview | — |
| Downstream handoff explicit | pass | skill-by-skill table in `docs/DESIGN-SYSTEM-RECEIPT-2026-09-25.md` | every downstream skill named with its law | — |

**Readiness state: `approval-ready`.** The direction is buildable and this
program builds it under the CEO's standing order (E5 counts as authority to
implement while the confirmation pass remains open for the listed
assumptions); the artifact itself does not claim `approved` until the CEO
confirms.

The committed direction in one line: *"A voice console over a live engine
room — asymmetric glass-panel hierarchy, indigo-signal dark register with two
deliberate alternates, system-stack type with mono data discipline, dense
8px-rhythm instrument anatomy, signature = the fleet pulse."*
