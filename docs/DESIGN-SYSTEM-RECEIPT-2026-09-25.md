# Fleetline Design-System Program Receipt — 2026-09-25

**Program:** full design system per CEO order — entire interview contract →
token/spec system + implementation → full design-skill catalog (28, per CCO
amendment) → tastecheck **v1.7.0** gate. Zero spend. English. Branch
`design/redesign-20260925` (commit `design/system-20260925`; not pushed, not
merged; `docs/UPSTREAM-PR-2026-09-25.md` untouched). Server
http://127.0.0.1:3000. `npm test` **14/14 green** (before/during/after).

**CEO design rulings this program executed (verbatim, via CCO lane):**
R1 "i like your second design with the yellow. so don't forget about it" →
Ops = register of record (default). R2 "press is a good start to a light
theme but it must be aligned to seem of a pair with ops" → Press = light
half of one system. R3 "remove signal its messy to have a random third
style" → Signal deleted; exactly two modes.

**Gate order (CEO, verbatim):** "ok show me after tastecheck /before video
so i may approve" — tastecheck ran first; this receipt + menu v2 carry the
verdicts; video starts only on his word.

---

## Phase 1 — Interview (complete contract)

`docs/INTERVIEW-2026-09-25.md`: all 9 required dimensions + optional motion,
headless self-interview mode, every answer evidence-cited (E1–E6), every
status marked; contradictions C1–C4 surfaced and resolved explicitly (never
averaged); refusals R-list; decision map; ready-to-build check all-pass.
Artifact state `approval-ready` (assumptions A2–A8 await the one-pass
confirmation — the checklist is in menu v2). CEO rulings R1–R3 recorded as
committed with verbatim words; A1/A4 resolved by R1/R2/R3.

## Phase 2 — The system + implementation

Artifacts: `docs/DESIGN-SYSTEM.md` (direction, two-mode architecture, color
with per-plane primitives/semantics + contrast floors, typography scale with
tabular-nums law, spacing ladder + density, grid + breakpoints, flat-material
laws, 10 component specs + full states matrix, motion contract, iconography,
a11y rules, refusals, canonical token block, open decisions, build order) —
**design-claim-gate: PASS, 0 blocking, 0 advisory** after fixing two real
drifts it caught (stale `#167a4a` prose vs shipped `#135e3e`; feed
line-height 1.35 claimed but unimplemented → now implemented).

Implementation (one anatomy, one tokens file, token-only mode remaps):
- `public/tokens.css` (NEW): `:root` = shared scales + Ops (dark, default);
  `[data-theme="press"]` = light-plane remap. Dead tokens pruned by
  mechanical sweep (24 candidates removed/wired; ladder rungs kept as scale
  contract).
- `public/style.css` (rewritten): anatomy only; consumes semantic tokens;
  material tokens (`--canvas-layers`, `--stat-led`, `--bar-*-image`, rule
  tokens) carry mode materials; color-mix derives badge/chip tints from
  semantics (registers never hand-set tints).
- `public-src/simulator.ts` (presentational only): structured **report
  view** (briefing/audit parsed into document + PASS/FAIL verdict chips +
  3-source expander), SVG phase icons, tool-chip **error state** (`ERR`),
  mission-history de-emphasis (beyond 3 → collapsed), skeleton/`—` loading
  states, worker rows carry literal status words, console brackets
  aria-hidden, empty-submit → focus input, **in-flight duplicate-dispatch
  guard** (submit + chips), voice icon swap, mic `type=button` +
  `aria-pressed`. MCP client/router/protocol behavior untouched.
- `public/index.html`: two-mode boot (default ops) pre-paint; inline-SVG
  icon sprite; `role="status"` conn; `role="group"` stats; feed
  `aria-live="off"`; chat keeps `aria-live="polite"`; skeletons in initial
  paint; favicon SVG + PNG fallback (`favicon-32.png`, new).
- Deleted: `theme-signal.css`, `theme-ops.css`, `theme-press.css` (replaced
  by tokens.css). README updated (two-mode description).
- `DESIGN.md` (repo root, NEW): the `design` skill's required contract
  layer, indexing DESIGN-SYSTEM.md as authority.

**Offline contrast verification (node, WCAG 2.x math on declared pairs):**
Ops 16/16 pairs pass (min 5.44 feed-time; primary-ink/amber 10.34). Press:
one fail found pre-ship — completed-badge tint 4.17:1 → Press success
darkened `#167a4a→#135e3e` (badge tint now 5.90, on paper 7.08) → 16/16.
Measured accent anchors: deep-amber `#8a5c00` on paper 5.29:1; primary-ink
`#14100a` on amber fill 10.34:1 (both planes).

## Phase 3 — Full 28-skill catalog (one row per skill)

| # | Skill | Applied where / law that shows / exclusion reason |
|---|---|---|
| 1 | `design` | Repo-root `DESIGN.md` contract (required structure, evidence, open questions), citing DESIGN-SYSTEM.md as token authority — future UI work cites it. |
| 2 | `art-direction` | No-imagery stance + one inline-SVG monoline set (16px grid, 1.5px, currentColor) replacing the emoji mic; SVG favicon primary + PNG fallback (qlmanage-rendered); OG/touch icons honestly n/a (no deployed public URL — contest artifact is a repo + video). |
| 3 | `design-system-interview` | Phase 1: complete 9+1-dimension contract, canonical format, statuses, ready-to-build check. |
| 4 | `design-critique` | Closing Mode-C pass (findings + fixes below); UX laws applied throughout (billboard hierarchy, one primary action, conventions). |
| 5 | `design-claim-gate` | Ran `claim-gate.py` on DESIGN-SYSTEM.md: caught 2 real prose-vs-implementation drifts (fixed) → PASS 0/0. Menu re-checked against receipt references. |
| 6 | `design-control-loop` | Process-level application: sensor = computed audit instrument, controller = fix rules, actuator = this agent, dampener = the Phase-4 gate (0-fail floors block landing). Not a UI-surface skill; no repo control-loop built (out of mandate scope). |
| 7 | `design-taste-frontend` (taste-skill) | Anti-emoji policy (mic fixed); cockpit-mode mono numerals; off-black not #000; no purple/lila; tactile `:active` translateY; skeletons; one-accent family (amber) + semantic cyan identity; grid-not-flex-math. Documented deliberate exceptions: serif folio numerals in Press (CEO R2 authority), system mono as committed stance (interview C3). |
| 8 | `tasteroll` | Audit→fix→lock pipeline applied: craft findings fixed deterministically (contrast/reflow/focus), dimensions LOCKED by CEO R1–R3 (no re-roll on committed direction); rolls n/a — no open dimensions remain. |
| 9 | `tastecheck-pass` | Phase 4 (below) — fast lane, verdict-first, v1.7.0 gestalt-first law honored. |
| 10 | `color-system` | OKLCH-anchored hue families with jobs (amber/phosphor, cyan operator, plane-adjusted states); used-stops-only ramps; measured pairs; no color-alone (shape+text redundancy everywhere). |
| 11 | `spacing-system` | One 4/8 ladder `--space-1..8`; role map (attachment→group); compact density both planes; off-scale sweep done during rewrite (all literals now ladder or documented). |
| 12 | `web-typography` | Role map (scanning vs reading), rem-based scale with 12px floor, unitless line-heights, measure 68ch report, tabular numerals for every metric, weights-as-hierarchy, no webfonts (loading plan = none needed; system stacks are the documented choice). |
| 13 | `component-states` | Full matrices: hover/active/focus-visible/pressed (voice, mic aria-pressed); loading (skeletons + aria-busy); async guard against duplicate dispatch; disabled = n/a (no disabled controls exist; subject absent). |
| 14 | `empty-states` | Region matrix: every region's empty/loading/error/success with next-move hints; skeletons geometry-stable; errors blameless with recovery (conn-down copy + chip ERR state). |
| 15 | `form-ux` | Composer field contract: aria-label + placeholder, autocomplete off, submit on Enter; empty submit returns focus (not silent); validation n/a (free-text command, no field rules). Fixes landed this pass. |
| 16 | `micro-motion` | Purpose-only choreography (entry/bar/pulse); token durations in skill bands (120/180/240); compositor-safe (opacity; bar width = data, documented); reduced-motion = full equivalent state; no JS-driven motion (grep clean: no transform/rAF writes); no-JS shows static shell (JS-only MCP client by nature — honest boundary). |
| 17 | `theming` | Semantic-only consumption; two tuned (not inverted) planes; `color-scheme` per mode; pre-paint boot (no flash — default IS :root); forced-colors not overridden (system authoritative; note recorded); per-plane contrast re-verified. |
| 18 | `glass-ui-laws` | Post-Signal-deletion the applicable laws live on: glow = live state only (LED/halos/rec mic); luminance budget discipline → 2.2%-white instrument grid; measurement laws → instrument validated (color-mix parser bug found by re-running with fixed rig — law 19-20 in action); prose-vs-CSS sweep → claim-gate (law 22). Frosted-glass laws n/a (subject deleted per R3). |
| 19 | `deslop-ui` | Detector pairs swept: no purple/gradients/pills/glassmorphism/emoji icons/centered hero/3-card marketing rows; mono-first = committed stance; gate-audit warns judged against spec (below). |
| 20 | `a11y-pass` | WCAG 2.2 AA floors measured per text node (0 fails both planes); keyboard trace + focus rings (input outline defect found by tab-trace probe → fixed); 320/400% reflow (header overflow found → fixed); landmarks/headings/live regions; skip-link n/a with evidence (zero focusables before main). |
| 21 | `cognitive-a11y` | Literal status words ("idle · 5 done", "completed", PASS/FAIL); plain labels; empty states name the next move; no time pressure; one primary action; calm motion (reduced-motion honored); short caps labels only (no all-caps blocks). |
| 22 | `responsive-layout` | Content-led breakpoints only (960 stack / 560 stats+roster); minmax(0,fr) + min-width:0 everywhere; ellipsis+anywhere-wrap; verified at 320px/390px/1440. |
| 23 | `i18n-ready` | `lang="en"`; longest-string-safe (ellipsis + wrap containers); honest boundary: physical rails (not logical props) + browser-locale time — EN-only contest surface (assumption A5); no fabricated locales. |
| 24 | `data-viz` | Dashboard treated as viz: table-for-lookup genre (mission rows, audit verdicts), zero-baseline progress bars as redundant encoding under literal text truth ("3/3 tasks"), direct labels everywhere (no legends), tabular numerals, no chartjunk, both planes pass contrast; no invented data. |
| 25 | `hud` | Skill is OMX-TUI-scoped (Codex statusline) — not a web-UI law source; its dense-instrument patterns ARE the Ops register's design vocabulary (LED cells, compact density, boxed cells, mono data). Cited as pattern inspiration only, honestly. |
| 26 | `chance-design` | **Skipped with reason:** seeded randomness is for open directions; this surface is CEO-committed (R1–R3) and judging-critical — its own law escalates shipped surfaces to the strict gate, which this program ran. No random tokens shipped. |
| 27 | `gstack-design-review` | Its QA checklist run as final audit pass (visual consistency/spacing/hierarchy/slop/slow interactions): findings = the two reflow/focus defects + claim-gate drifts (all fixed + re-verified with fresh evidence); gstack session machinery not installed here (method applied, honestly scoped). |
| 28 | `karpathy-guidelines` + `performance-goal` + `format-archaeology` | Karpathy: surgical diffs (MCP logic untouched), dead tokens pruned only where my own rewrite orphaned them, simplicity (one tokens file replaced three theme files). Performance: render budget honored — innerHTML swaps of small capped lists (60-line feed), compositor-safe animation, no layout animators; no OMX goal loop (machinery n/a; budgets documented instead). Format-archaeology: built against live rendered DOM + shipped SDK patterns (working examples), never doc assumptions. |

**EXCLUDED (named by the CCO amendment, with reason):** gstack-ios-design-review (iOS-only surface), small-business-* (wrong product class), cloudflare-startups-ops / openart-mcp-auth / build-iterated-agentic-loop / edit-article (not design-surface skills).

### design-critique closing pass (Mode C, on own output — findings → fixes)

1. [P0, fixed] 320px header overflow 121px (flex:none head-right + collapsible wordmark) → flex-shrink + nowrap wordmark + ellipsized conn; re-verified 0px both planes.
2. [P0, fixed] Input keyboard focus showed no outline (specificity bug) → :focus-visible ring restored; re-verified in tab trace.
3. [P1, fixed] Press completed-badge contrast 4.17 → success stop darkened; re-measured 5.90.
4. [P1, fixed] Emoji mic icon + color-only worker status → SVG icon set + literal status words.
5. [P2, fixed] Bracket pseudo-content polluted SR output → aria-hidden spans; "· " system prefix removed.
6. [P2, judged] gate-audit "uniform mission list" warn → a job queue is uniform by nature (data list, history de-emphasized beyond 3); dismissed against committed instrument-stack spec.
7. [P2, judged] "stat-counter band" warn (press) → live fleet telemetry with LED state, not social-proof counters; dismissed with spec citation.

## Phase 4 — tastecheck v1.7.0 (fast lane, verdict-first)

**Instrument:** `tastecheck-pass` v1.7.0 fast lane — `assets/cdp-qa.mjs`
(zero-dep CDP driver, system Chrome headless, temp profile, 1440x900) +
`assets/gate-audit.js` tells counter + an in-page per-text-node contrast/
geometry instrument (alpha-blended effective backgrounds, WCAG 2.x, large-
text tiers). **Verdict basis named:** `docs/DESIGN-SYSTEM.md` (committed
spec). Scope: fast lane, both modes, `?autodemo=1` end-state + idle, fresh
loads, 2026-09-25, revision design/system-20260925.

**Gestalt-first (recorded BEFORE element probes — v1.7.0 law):** *"The
whole reads as one authored instrument — an amber mission-control console
where voice commands left drive a live engine-room right — not a template:
asymmetric two-surface composition, mono instrument DNA, literal state
words, and one shared pulse carry a single point of view across both
planes."* Element results agree → no divergence finding → no
soullessness-detector block.

**Honest instrument disclosure:** no in-harness pixel-vision lane exists
(harness image-read returns a URL without rendering; external uploads of
the new UI are banned), so visual judgment = computed evidence (contrast,
geometry, reflow, computed styles) + structural reads (a11y trees, DOM).
No still of the new UI was uploaded anywhere. CEO's eyes = final gate
(glass law 7); video gated on his word.

### VERDICTS

**Ops (dark, default): SHIP** (fast-lane, this revision, both stills in
menu v2). **Press (light): SHIP** (same scope). Gated items listed below
block video, not the build.

### Battery output (verbatim)

**gate-audit.js (Ops, fresh load):**
```
log: TASTECHECK GATE AUDIT — fresh-load + tells (paste into the gate report)
⚠ WARN uniform card grid: 3× identical div.mission in div#missions.missions (equal size, bordered/rounded — the "three cards" tell?)
⚠ WARN uniform card grid: 9× identical div.mission in div#missions.missions (equal size, bordered/rounded — the "three cards" tell?)
— display face resolves to "ui-monospace"
verdict: REVIEW WARNS — 0 fail / 2 warn · 10 checks · gateAudit() to re-run
Scope: light DOM only — shadow roots and iframes are not audited.
Reminder: run on a FRESH load. Warns are evidence for judgment against the committed spec, not verdicts.
```
**gate-audit.js (Press, fresh load):** same two mission warns +
`⚠ WARN stat-counter band: 4 numeric callouts in div#stats.stats (the SaaS social-proof tell?)` +
`— display face resolves to "New York"` → `verdict: REVIEW WARNS — 0 fail / 3 warn · 10 checks`.
**Judgment (against DESIGN-SYSTEM.md):** mission rows = a live job queue
(data list; entries beyond 3 render collapsed — deliberately non-uniform
history); stat cells = live telemetry with LED state, not social proof;
display faces = the committed mono-first stance (Press serif confined to
masthead + folio numerals per A7). Warns dismissed with spec citations;
0 fails.

**Keyboard tab trace (Ops; Press identical order, deep-amber rings):**
```
button#voice-btn.voice | outline:solid 2px rgb(255, 176, 0)
button (chips ×5)     | outline:solid 2px rgb(255, 176, 0)
input#utterance       | outline:none 3px rgb(232, 228, 216)   ← pre-fix; POST-FIX: solid 2px amber (re-verified)
button#mic            | outline:solid 2px rgb(255, 176, 0)
button.send           | outline:solid 2px rgb(255, 176, 0)
div#feed.feed         | outline:solid 2px rgb(255, 176, 0)   (scroll container; browser-default focusable)
```
No traps; order = DOM order; zero focusables before main → skip link n/a.

**Reflow (cdp-qa, pre-fix → post-fix):** Ops 320px `scrollW 441 → 320`
(0 overflow; wordmark retained, conn ellipsizes, stats 2×2, roster 1-col);
Press `→ 320` (0). 390px clean. 1440px h-overflow 0 both.

**Contrast (per-text-node instrument, alpha-blended incl. color-mix
surfaces; large-text 3:1 tier applied):**
```
OPS   : theme=ops   textNodes=141 wcagFails=0 minFontPx=12 hOverflowPx=0 workerGlyphOverlaps=0
PRESS : theme=press textNodes=139 wcagFails=0 minFontPx=12 hOverflowPx=0 workerGlyphOverlaps=0
```
Instrument validated mid-run (glass measurement law): first pass
mis-parsed `color(srgb …)` serialization → false black backgrounds →
rig fixed and BOTH modes re-run clean (the 23 "Press fails" were rig
artifacts; Ops re-run too because the buggy rig could mask). Declared-pair
offline math: Ops 16/16, Press 16/16 (after the badge fix).

**Reduced motion (emulated `prefers-reduced-motion: reduce`):**
```
matchMedia: true · busyDotAnimation: none · skeletonPulse: none · evt entry: none
```

**Tap targets:** `smallTargets: []` (all interactive ≥40px at 320px).

**Console (cold load, fresh profile):** only
`Failed to load resource: 400 (Bad Request) @ /mcp` — the documented
pre-existing SDK pre-initialize handshake (MCP wiring out of scope since
the substrate pass; zero new errors, zero 404s — favicon.svg,
favicon-32.png, tokens.css, style.css, simulator.js all 200).

**Leaks:** rendered surface carries no names/PII/machine paths (a11y-tree
+ DOM sweep). **Shadow roots / iframes:** none (subject absent).

**Claim-gate (design-claim-gate, on the deliverable docs):**
```
DESIGN-SYSTEM.md — first run: FAIL 2 blocking (stale #167a4a; feed 1.35 unimplemented) + 2 advisory
                  — fixes landed → re-run: CLEAN — PASS — 0 blocking, 0 advisory
```

---

## GATED (blocks video / final claim, with owner)

1. **CEO one-pass confirmation** of A2–A8 (checklist in menu v2) — owner:
   CEO. Nothing records until his word.
2. **Pixel-vision gestalt** — this battery's SHIP is scoped to computed +
   structural evidence; the CEO's eyes are the final visual gate (instrument
   limitation recorded above).
3. **`?theme=signal` now falls back to Ops** (boot script accepts only
   ops|press) — any external deep-link using signal silently shows the
   default; none known (README/docs updated).

## Verification log

- `npm run build` (tsc + esbuild) clean; `npm test` 14/14 (final run below).
- Server live; both modes exercised end-to-end via `?autodemo=1` per probe.
- Stills: `.playwright-mcp/fleetline-v2/final/{ops,press}-{idle,mid}.png`
  (1440x900, CSS scale) — embedded base64 in menu v2 (self-contained,
  852KB). tastecheck evidence: `.playwright-mcp/fleetline-v2/tastecheck/
  {ops,press}/evidence.json` + screenshots (session workspace, org-hq).
- Evidence rerun after every fix (fresh loads; no stale claims).

**Status: DONE — program complete; GATED on CEO one-pass (A2–A8) + his eyes
before any video. Menu: `docs/DESIGN-MENU-V2-2026-09-25.html`.**

---

# LITERAL PAIRING FIX — pass 2 (same branch, later 2026-09-25)

**Mandate (CCO lane, verbatim CEO spec):** "I wanted them both to look like
they were the same thing but in dark and light mode. And they still are very
different." Pass 1 kept editorial flavor; this pass is ZERO flavor: Press =
Ops with the colors inverted to a light plane, nothing else differs.

## What changed (ONE file + truth-fixed docs)

- `public/tokens.css` — the `[data-theme="press"]` block rewritten to a
  **colors-only remap**. Deleted from the block (now inherited from `:root`
  unchanged): the serif `--font-display`/`--font-num` stacks (Press is mono
  everywhere), `--step-3`/`--step-4` plane levers (30px folio numerals /
  24px masthead → the exact Ops 21px/17px), all `--radius-*` zeros (→ Ops
  2/3px), `--h3-rule`/`--stats-rule`/`--foot-rule` ink rules (1px/2px → the
  Ops `0 solid transparent`), `--msg-*-rail-w` widths, `--msg-frame-pad`,
  `--input-border-w`, and every density/label token that merely restated Ops
  values. Rewired to color-only equivalents: `--canvas-layers` = the same
  28px-pitch instrument grid as ink-alpha lines instead of white-alpha
  (was: `none`), `--bar-track-image`/`--bar-fill-image` = the same 90deg
  repeating 6px/8px segmentation in paper/ink-amber colors (was: `none`,
  solid), `--stat-led` deleted (inherits Ops wiring `var(--color-success)`
  → plane value `#135e3e`). Amber family untouched beyond the existing AA
  plane variant (`#8a5c00`, 5.29:1 on paper).
- `docs/DESIGN-SYSTEM.md` — R4 recorded verbatim; superseded press-flavor
  rows marked inline (serif faces, step levers, solid bars, ink rules,
  A7/A8 clauses). Keeps the committed spec == shipped code for the
  claim-gate.
- `docs/DESIGN-MENU-V3-2026-09-25.html` — NEW decision menu: true-pair
  side-by-side (same demo state, fresh server per mode), verdicts, the
  diff-proof, updated checklist. Supersedes menu V2 (kept for the record).
- `docs/UPSTREAM-PR-2026-09-25.md` untouched. No push, no merge.

## Grep-verify (the remap contains color values and nothing else)

The press block declares exactly: 8 primitives + 21 semantic `--color-*` +
`--canvas-layers` + `--bar-track-image`/`--bar-fill-image` +
`--scroll-thumb` + `--head-rule`/`--head-cell-bg` + `--msg-user-rail-c`/
`--msg-alexa-rail-c` + `--input-bg`/`--input-line` + `--chart-grid` +
`color-scheme: light`. Every value is a color (hex/rgb/gradient-of-colors);
the two gradient tokens carry Ops geometry verbatim (28px grid, 6px/8px
stops) with plane colors. No font, size, radius, spacing, rule-width, or
motion token remains.

## Gates

1. **Build + tests:** `npm run build` clean; `npm test` **14/14**.
2. **tastecheck v1.7.0 fast lane, both modes** (same procedure as Phase 4:
   zero-dep CDP rig on system Chrome headless, temp profile, 1440x900,
   fresh server per mode so fleet state is identical):
   - Contrast (per-text-node, alpha-blended, WCAG 2.x + large-text tiers):
     **Ops 0 fails** (109 nodes idle + end, min 5.28) · **Press 0 fails**
     (109 nodes idle + end, min 4.67). Required gate met.
   - gate-audit end-state: **CLEAN 0 fail / 0 warn BOTH modes**; display
     face resolves `ui-monospace` in BOTH (serif deleted; V2's press
     stat-band warn is gone).
   - Tab traces identical order both modes (amber vs deep-amber rings =
     color-only); reflow 320/390 = exact viewport both modes; tap targets
     0 undersized; reduced-motion honored; leaks none; console only the
     documented pre-existing `/mcp` 400.
   - **Gestalt (recorded before element probes):** "the whole reads as one
     authored instrument — and the two planes now read as the SAME
     instrument with the lights on: identical layout, type, and components
     at every pixel; only the palette flips phosphor-on-black ↔
     ink-on-paper." Element results agree (no divergence finding).
3. **DIFF-PROOF (the receipt's load-bearing evidence):** computed styles of
   43 matched elements (header/brand/mark/conn, stat cell incl. the LED
   `::before`, mission card incl. bar+fill, chat msgs + tool chip +
   report + verdict chip, composer, chips, worker + status dot, feed,
   footer, body), 92 properties + bounding rects, `?autodemo=1` end-state,
   1440x900: **0 non-color differences / 366 color-only differences.**
   Differing property set = `color · background-color · background-image ·
   border-{top,right,bottom,left}-color · outline-color · box-shadow ·
   caret-color · -webkit-text-fill-color · LED background/boxShadow` —
   colors only. Color-stripped structural compare: canvas grid and bar
   segmentation byte-identical modulo colors; all rects identical.
   **On-screen text: byte-identical between modes** (0 diffs across title,
   brand, labels, chips, chat, missions, badges, footer).

Evidence: `.playwright-mcp/fleetline-v2/pairfix/` (session workspace,
org-hq) — `qa.mjs` (rig), `{ops,press}/evidence.json`, `diff-proof.json`,
still `{idle,end}.png` per mode.

## New finding (pre-existing, NOT from this fix; reported, not fixed)

Cold idle load keeps the Missions pane at `aria-busy="true"` + skeleton
indefinitely (identically in both modes): `refreshBoard()` in
`public-src/simulator.ts` fires before `connect()` resolves, the first
`fleet_status` throws, and nothing retries. Renders fine after any user
action or `?autodemo=1`; gate-audit end-state is CLEAN; Phase-4 battery
never saw it because every probe used autodemo. Per tastecheck law 6 a fix
is a separate authorization — one-line fix proposal (call `refreshBoard()`
inside `connect().then`) queued behind the CEO's word (menu v3 checklist
line 7). Owner: product/CTO lane.

## Honest instrument notes

- Same limitation as Phase 4: no pixel-vision rendered in-harness; judgment
  = computed + structural evidence. CEO's eyes remain the final gate.
- The harness's image-read mechanism uploaded the four local PNGs to a
  transient signed CDN URL (auto-transport, expires; not a publication
  channel); noted for the leak ledger. No other external lane was used.
- Rig self-audit: two false leads were caught and fixed before the recorded
  run — reference-inequality flagging identical rects, and a shared-server
  fleet-state leak between modes (fixed with per-mode servers; both modes
  then showed identical 109 text nodes / 3-mission state).

**Status: DONE — literal pairing landed, all gates green (14/14, 0 contrast
fails both modes, 0 non-color diffs, text identical). GATED on CEO eyes +
one-pass. Menu: `docs/DESIGN-MENU-V3-2026-09-25.html`.**
