# Fleetline Design System — 2026-09-25

**Status:** approval-ready (interview complete; CEO design rulings R1–R3 committed verbatim; assumptions A2–A8 await the one-pass confirmation — `docs/INTERVIEW-2026-09-25.md` + the checklist in `docs/DESIGN-MENU-V2-2026-09-25.html`)
**Next move:** implementation on the standing CEO order; tastecheck v1.7.0 gates before any video.

**Source of truth for code:** `public/tokens.css` (the ONE tokens file: shared
scales + Ops block at `:root` + Press light-plane remap) consumed by
`public/style.css` (the ONE anatomy layer). Modes are token overrides only —
no per-mode component CSS.

---

## Design direction summary

> **North star (one line):** *An amber mission-control console for a voice
> operator — one instrument, two planes: phosphor-on-black (Ops) and
> ink-on-paper (Press), mono-first instrument DNA, dense 12px-frame anatomy,
> signature = the fleet pulse.*

- **Reference / anchor:** the org's own house system (kyanite-system
  discipline: fluid steps, measure caps, hairline structure) + Apollo-era
  mission-control consoles. We take the org's *discipline*, not its files.
- **Aesthetic territory:** "voice console over engine room": conversation
  transcript dominant left, instrument stack right; ONE design language in
  two value planes — Ops (dark: near-black panel, amber phosphor, hairline
  instrument grid) and Press (light: warm paper, ink, the exact same
  anatomy — R4: colors-only light-plane remap).
- **Personality:** calm mission-control authority. Precision surfaces;
  warmth lives in language and voice, not decoration.
- **Structure and rhythm:** asymmetric two-pane console; instrument-stack
  motif (stats → roster → missions → feed, each a distinct treatment by data
  type); steady operational cadence; identical anatomy across both modes.
- **Signature:** the **fleet pulse** — busy dots, event ticks, and progress
  fills beat on one shared heartbeat (1.2s); the surface visibly breathes
  with the real fleet. Glow is live state only.
- **Imagery and iconography:** no photographic imagery by decision; one
  inline-SVG monoline icon set on a 16px grid derived from the fleet chevron
  mark; no emoji as UI icons.

### CEO rulings (committed, verbatim — 2026-09-25)

- **R1 — register of record:** "i like your second design with the yellow.
  so don't forget about it" → **Ops is the pick**: default mode, README,
  demo video. Amber is the brand accent of record.
- **R2 — pairing:** "press is a good start to a light theme but it must be
  aligned to seem of a pair with ops" → Press is the **light half of one
  system**, not a third style: same anatomy, same components, same states,
  same motion; paper-and-ink is the light-plane *material*.
- **R3 — two modes only:** "remove signal its messy to have a random third
  style" → Signal deleted. The theme system is exactly **Ops (dark) +
  Press (light)**.
- **R4 — literal pairing (later same day, on seeing the pair):** "I wanted
  them both to look like they were the same thing but in dark and light
  mode. And they still are very different." → **Press is Ops with the
  colors inverted to a light plane — nothing else differs.** The Press
  remap declares color values ONLY; every earlier press-flavor allowance
  (serif masthead/folio numerals, `--step-3/4` plane levers, zero radius,
  hairline ink rules, solid bars, missing canvas grid) is **superseded and
  removed**. Receipt: `docs/DESIGN-SYSTEM-RECEIPT-2026-09-25.md`
  § LITERAL PAIRING FIX.

## System architecture (how the two modes coexist)

One anatomy (`style.css`), one tokens file (`tokens.css`), two planes:

```
tokens.css
  :root                → shared scales (space/motion/steps) + OPS primitives + semantics (default = dark)
  [data-theme="press"] → PRESS light-plane remaps (tokens only, no selectors)
```

Laws:
1. Components reference **semantic tokens only**, never primitives.
2. A mode never adds selectors — it may only re-map tokens.
3. Mode materials that cannot be a plain value (instrument grid, LED dots,
   segmented bars, ink rules) are **material tokens** the anatomy consumes.
4. Canonical token names follow the org glossary (`--color-*`, `--step-*`,
   `--space-*`, `--radius-*`, `--dur-*`, `--ease-*`). Documented extensions
   (each with a real build job): `--color-*-bg/-line`-style derived tints
   (computed via `color-mix` at use sites), `--font-num` (metric numerals),
   `--color-text-label` (mono instrument labels), material/density tokens.
5. **Pairing law (R4, literal):** every component, state, material, and
   motion exists identically in both planes; the ONLY differences are
   color-token values (paper ground, ink text, light-plane borders/halos,
   plane-adjusted state colors, AA-adjusted amber text accent). The
   press-flavor allowances this law superseded (serif masthead/folio
   numerals, plane-lever type sizes, zero radius, ink rules, solid bars,
   no canvas grid) are deleted — Press inherits the Ops type stack, scale,
   radii, materials, and geometry wholesale.

---

## Color (→ color-system)

### Strategy

Amber phosphor is the brand accent of record (R1), carried through BOTH
planes: **fills** stay phosphor amber with ink text in both modes; **text
accents** use the plane-appropriate variant — bright amber on black (Ops),
deep amber `#8a5c00` on paper (Press). Hue families are shared across
planes; only lightness steps differ (that is what makes them a pair).
Every published stop has a real build job.

### Semantic roles (mode-invariant names)

| Token | Job |
| --- | --- |
| `--color-bg` | page ground (Ops near-black `#07090c`; Press paper `#f6f4ee`) |
| `--color-surface-1` / `-2` | pane panel / cells (Ops: solid steel panels; Press: raised paper panels) |
| `--color-text` / `--color-text-muted` / `--color-text-label` | ink / secondary / mono labels |
| `--color-border` / `--color-border-strong` | hairlines / structural rules (Press ink bars) |
| `--color-primary` / `-hover` / `-ink` | primary action fill (amber, both planes), hover, ink on it (`#14100a`) |
| `--color-accent` / `--color-accent-2` | assistant identity (amber plane variant) / operator identity (cyan plane variant) |
| `--color-focus` | focus ring (plane amber variant) |
| `--color-success` / `--color-error` / `--color-warning` / `--color-info` | ok / fail / warn / busy — same hue families, plane-adjusted |
| `--color-feed-time` | event timestamps (dimmest legal text: ≥4.5:1) |

### Primitives (used stops only, with jobs)

| Primitive | Ops (dark plane) | Press (light plane) | Job |
| --- | --- | --- | --- |
| `--brand-400` | `#ffb000` | `#8a5c00` | accent TEXT + assistant identity |
| `--brand-500` | `#ffb000` | `#ffb000` | primary fill (shared phosphor) |
| `--brand-600` | `#ffc233` | `#d99c00` | primary hover step (plane direction) |
| `--accent-400` | `#4dd0e1` | `#0e7490` | operator cyan (rail, user label) |
| `--neutral-950` | `#07090c` | `#1c1a15` | deepest ground (bg / ink) |
| `--neutral-900` | `#0b0e12` | `#f6f4ee` | surface-1 anchor |
| `--neutral-100` | `#c8cdbc` | `#6d6a5f` | labels / muted |
| `--neutral-50` | `#e8e4d8` | `#1c1a15` | primary text |

### State colors per plane

| Role | Ops | Press |
| --- | --- | --- |
| success | `#3ddc84` | `#135e3e` |
| error | `#ff5252` | `#b3362b` |
| warning | `#ffcf40` | `#8a5c00` |
| info (busy) | `#ffb000` (= brand) | `#8a5c00` (= brand variant) |

Non-color law (color-blind safety): every state is shape+text redundant —
worker rows carry literal status words ("idle · 5 done"), badges carry text
("completed"), audit verdicts are literal PASS/FAIL chips, event lines carry
type text; icons are glyph-distinct (chevron / check / cross / dot).

### Contrast pairs (floors and measurement)

Floors: body text ≥4.5:1; large text (≥24px or ≥18.66px bold) and UI
glyphs/borders ≥3:1; focus ring ≥3:1 against adjacent surfaces. Measured on
rendered pairs with the alpha-blending audit instrument; verbatim run in the
receipt (Phase 4). Pair list per plane: text/bg, text/surface-1,
muted/surface-1, muted/surface-2, label/bg, primary-ink/primary,
accent/bg, accent-2/bg, success/error/warning/info as text on bg and on
their tinted badge backgrounds, feed-time/bg, chart-grid contrast.

Measured results: `docs/DESIGN-SYSTEM-RECEIPT-2026-09-25.md` (Phase 4
table — 0 fails required to land).

---

## Typography (→ web-typography)

### Faces per plane (system stacks; refusal R1: no webfonts)

| Role | Ops | Press |
| --- | --- | --- |
| `--font-display` | system mono (wordmark) | same system mono (R4: serif deleted) |
| `--font-body` | system mono (`ui-monospace, SF Mono, JetBrains Mono, Menlo`) | same system mono — shared instrument DNA |
| `--font-mono` | system mono | system mono |
| `--font-num` (metrics) | system mono, tabular | same system mono, tabular (R4: folio serif deleted) |

**Pairing law (R4):** mono-first in BOTH planes, everywhere — Press uses
the exact Ops type stack, scale, and weights; the light mode reads as the
same product, printed.

### Scale (canonical steps; rem-based; console-constant)

| Token | Value | Roles |
| --- | --- | --- |
| `--step--2` | `0.75rem` (12px) | micro labels, tags, feed, tool args, footer — the floor |
| `--step--1` | `0.8125rem` (13px) | worker rows, mission rows, tool chips, report body |
| `--step-0` | `0.9375rem` (15px) | chat body, input, send |
| `--step-1` | `1rem` (16px) | reserved scale rung |
| `--step-3` | `1.3125rem` (21px) | stat numerals (R4: same size both planes) |
| `--step-4` | `1.0625rem` (17px) | wordmark (R4: same size both planes) |

Line-heights: unitless — body 1.5, feed 1.35, headings 1.1. Measure:
`--measure: 68ch` on the report view; chat transcript uses the pane width
with `overflow-wrap: anywhere`. `text-wrap: pretty` on report prose where
supported.

### Laws

- **Tabular numerals for all metrics** — stat cells, done counters, mission
  meta, timestamps, report numbers: numbers never jitter as they tick.
- Weights-as-hierarchy: wordmark 700; labels 700; tool names/goals 600;
  body 400; never bold body paragraphs.
- Uppercase tracked micro-labels (`0.12–0.14em`) are the instrument label
  voice in both planes.
- Language: English (assumption A5).

---

## Spacing (→ spacing-system)

One ladder, 4px base: `--space-1..8` = 4/8/12/16/24/32/48/64px (upper
rungs reserved as the scale contract; this single-screen console uses 1–5).

| Relationship | Token | Use here |
| --- | --- | --- |
| attachment | `--space-1` | dot↔worker id; icon↔label; msg block gap in feed |
| control | `--space-2` | inside chips/buttons/input; msg padding; stat cell padding |
| task | `--space-3` | pane-head padding; roster gap; section padding; composer rows |
| group | `--space-4` | report box padding; chips row; dashboard sections |

Density: **compact instrument** in BOTH planes (identical density — the
pair shares one frame): boxed header cells, 12px pane gaps, 8px chat gap.
Off-scale audit law: any literal not on the ladder is a defect (receipt
lists the sweep).

---

## Layout grid + breakpoints (→ responsive-layout)

- App frame: header band / main grid / footer disclosure, `max-width:
  1440px` centered — identical in both planes.
- Main grid: `minmax(0, 58fr) minmax(0, 42fr)`, gap `--space-3` (both
  planes — pairing law).
- **One column-stack breakpoint at 960px** (conversation first, dashboard
  after); no device-specific breakpoints. 320px floor + 400% zoom: stats
  2×2 below 560px, roster 1-column, no horizontal scroll (Phase 4 reflow
  probe).
- Instrument stack order fixed (pulse → crew → jobs → wire); sections
  differ structurally by data type — the deslop audit guards against any
  uniform card grid replacing it.

## Elevation & material

Both planes are **flat instruments**: zero drop shadow, hairline rules,
depth = rule weight and surface steps, never elevation.

- **Ops (dark):** near-black canvas with a 2.2%-white instrument grid
  (28px pitch); boxed header cells; LED stat dots with a 6px phosphor halo
  (live state); segmented progress bars (6px pitch).
- **Press (light, R4):** paper canvas with the SAME 28px-pitch instrument
  grid at 3%-ink; raised-paper panels; the same boxed header cells in paper
  tones; the same LED dots (success green, plane-adjusted); the same
  segmented progress bars (6px pitch) in ink-amber plane colors. No
  per-plane rules or materials — every geometry token is shared.
- Glow law: **live state only** — LED dots, busy halos, the rec mic. No
  static element glows.

Tokens: `--canvas-layers`, `--canvas-size`, `--stat-led`,
`--bar-track-image`/`--bar-fill-image`, `--scroll-thumb`, rule tokens
(`--stats-rule`, `--h3-rule`, `--foot-rule`, `--head-rule`).

---

## Component specs (→ component-states, form-ux, empty-states)

Anatomy layer classes; all consume semantic tokens; identical in both planes.

### 1. Chat message (`.msg`)
Variants: `user` (operator: cyan rail, `--color-accent-2` label),
`alexa` (assistant: amber rail, `--color-accent` label), `system` (dashed
notice), `tool` (see 2), `report` (see 3). Console transcript in BOTH
planes: no bubbles; rail + bracketed speaker label (brackets decorative,
`aria-hidden`). Text nodes pre-wrap, `overflow-wrap: anywhere`. Entry
animation 180ms fade (reduced-motion: none). Long reports collapse beyond 3
sources behind an `aria-expanded` expander.

### 2. Tool-call chip (`.msg.tool`)
Structure: `MCP` tag → `tools/call <name>` (mono 600) → args JSON (muted
mono). States: success (default), **error** (`.err`: error-tinted border,
`ERR` tag; set when a call throws — the follow-up alexa message carries the
human-readable failure).

### 3. Report view (`.msg.report`)
The fleet briefing/audit as a document: header row (`briefing`/`audit` tag
+ goal), summary line, optional shared-terms line, per-source entries
(title + tabular meta; audit: literal PASS/FAIL verdict chip with
status/latency/size — text verdict, never color alone), bullet key points,
`Composited by` footnote, expander beyond 3 sources. Presentational parse
only; the spoken copy is the raw text.

### 4. Worker row (`.worker`)
Status dot (idle=success, busy=info pulsing+halo, done=success 55%,
failed=error; aria-hidden) · id (mono) · literal status + done counter
("idle · 5 done", muted, tabular). Non-color law satisfied by the literal
status word. Empty: "No workers reported. / Is the fleet engine running?"
Loading: 3 skeleton rows (pulse; static under reduced-motion).

### 5. Stat cell (`.stat`)
Value (`--step-3`, `--font-num`, tabular — mono in both planes per R4) over key
(micro mono uppercase). LED dot top-right (success; `--color-info` when
busy-live). Strip = `role="group" aria-label="Fleet statistics"`. Loading:
value renders `—` until first data.

### 6. Mission block (`.mission`)
Goal (ellipsis) · status badge (text label + state tint) · meta (id · kind
· progress · duration, tabular) · 6px segmented progress bar in BOTH planes
(R4; fill color = status, plane-adjusted). History law: blocks beyond the
3 most recent render collapsed (goal + badge only, 0.75 opacity — still
≥4.5:1) so repeat goals read at a glance.

### 7. Buttons (`.send`, `.chips button`, `.voice`, `#mic`)
Full state matrix: rest / hover (`--dur-fast` color+border shift) / active
(translateY 1px) / focus-visible (2px `--color-focus` ring, offset 2px) /
pressed (`.voice[aria-pressed]`, `#mic.rec`). Send = amber primary fill
with `#14100a` ink (both planes — the pair's brand action); chips = outline
ghost; mic = 40px icon button (SVG; rec state pulses error color).
Minimum target 40px on every control.

### 8. Input (`.composer input`)
Rest / focus (amber border) / filled / placeholder (muted ≥4.5:1).
`aria-label` + visible placeholder; `autocomplete="off"`.

### 9. Event line (`.evt`)
Timestamp (tabular, `--color-feed-time`) · phase icon (SVG: chevron
started / check completed / cross failed / dot info; glyph+color per state)
· type (600) · detail (ellipsis). Feed `aria-live="off"` (conversation
announces; feed churn must not spam screen readers). 60-line cap.

### 10. Connection indicator (`.conn`) — `role="status"`: wait (warning
dot, "connecting…") / up (success dot + halo) / down (error dot).

### States matrix (→ empty-states)

| Component | Empty | Loading | Error | Success |
| --- | --- | --- | --- | --- |
| Chat | welcome system msg | — | connect-fail system msg | — |
| Roster | "No workers reported." + hint | 3 skeleton rows | empty copy (server gone; conn shows down) | live rows |
| Missions | "No missions yet." + first-move hint | skeleton bar | badge `failed` + red bar | badge `completed` + green bar |
| Feed | "Waiting for fleet traffic…" + hint | — | failed lines error-styled | phase-colored lines |
| Stats | `—` values | `—` values | `—` + conn down | live tabular values |
| Report | "no report yet" reply | wait copy | "The mission failed: …" | structured report view |
| Tool chip | — | — | `.err` + ERR tag | default chip |

Layout stability: skeletons and `—` reserve live-data geometry (no shift
on first data).

---

## Motion (→ micro-motion)

Level: **restrained — state-legibility only.**

| Token | Value | Used by |
| --- | --- | --- |
| `--dur-fast` | 120ms | hover/active feedback |
| `--dur-base` | 180ms | event/message entry fade |
| `--dur-slow` | 240ms | progress bar width |
| `--ease-out` | `cubic-bezier(0.32, 0.72, 0, 1)` | all (house curve) |
| `--pulse-period` | 1.2s | fleet heartbeat (busy dot, LED-live, rec mic, skeletons 1.4s) |

Moves: message/event entry (opacity 0.35→1), bar width, busy pulse,
skeleton pulse. **Never moves:** layout, pane positions, the grid; no
parallax, no zoom, no entrance choreography for static content. All motion
non-blocking, interruptible. **Reduced motion:** `prefers-reduced-motion:
reduce` disables pulse/entry animation entirely; every animated state keeps
a static distinguishable encoding (color + shape + literal text). The fleet
pulse degrades to a steady lit state — the information (busy) survives.

---

## Iconography (→ art-direction)

One inline-SVG system: 16px grid, 1.5px monoline stroke, `currentColor`,
square caps, derived from the fleet chevron mark. Set: mic, voice-on,
voice-off, chevron (started), check (completed), cross (failed), dot
(info). Sizes: 16px controls / 12px inline feed. Decorative icons
`aria-hidden="true"`; controls carry accessible names. **No emoji as UI
icons** (the 🎙 mic was replaced in this system).

## A11y rules (→ a11y-pass, cognitive-a11y)

- WCAG 2.2 AA floors: 4.5:1 / 3:1 per the color section; audited
  instrument-blended per text node.
- Focus: everything interactive keyboard-reachable; visible
  `:focus-visible` ring; tab order = DOM order (header → conversation →
  chips → composer → dashboard); no traps.
- Landmarks: banner/main/contentinfo + two labeled regions; heading order
  h1→h2→h3; conn = `role="status"`.
- Announcements: chat `aria-live="polite"`; feed `aria-live="off"`; stats
  static.
- Reduced motion honored (motion section); voice output is user-toggled
  with `aria-pressed`; no autoplaying sound.
- Targets ≥40px; dots are not targets.
- Cognitive: literal status words everywhere numbers/state appear; plain
  English labels; empty states name the next move; one primary action
  (Send); no time pressure.

## Refusals (negative space)

1. No webfonts → system stacks per plane (deterministic clean-clone demo).
2. No stock/AI imagery, no illustration → the live data is the imagery.
3. No pill CTAs → square instrument controls (badge/chip radius ≤4px).
4. No decorative gradients → the instrument grid is a 2.2% hairline field;
   LED halos are live-state signals, not decoration.
5. No layout animation, parallax, entrance choreography → state-legibility
   motion only.
6. No uniform card grid → instrument stack with per-data-type treatments.
7. No raw JSON blobs in user surfaces → structured chips/report views.
8. No emoji as icons → one inline-SVG monoline set.
9. No third style → exactly two planes (CEO R3); no per-mode component CSS.

## Token block (canonical contract; `public/tokens.css` is the live source)

```css
:root {  /* OPS — dark plane, default */
  /* shared scales */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; /* …–8 reserved rungs of the one ladder */
  --step--2: 0.75rem; --step--1: 0.8125rem; --step-0: 0.9375rem; --step-1: 1rem;
  --step-3: 1.3125rem; --step-4: 1.0625rem; --measure: 68ch;
  --dur-fast: 120ms; --dur-base: 180ms; --dur-slow: 240ms;
  --ease-out: cubic-bezier(0.32, 0.72, 0, 1); --pulse-period: 1.2s;
  --icon-size: 16px; --icon-size-sm: 12px;

  /* OPS primitives */
  --brand-400: #ffb000; --brand-500: #ffb000; --brand-600: #ffc233;
  --accent-400: #4dd0e1;
  --neutral-950: #07090c; --neutral-900: #0b0e12;
  --neutral-100: #c8cdbc; --neutral-50: #e8e4d8;

  /* OPS semantics */
  --color-bg: var(--neutral-950);
  --color-surface-1: var(--neutral-900);   /* pane panel */
  --color-surface-2: #0d1116;              /* cells */
  --color-surface-head: #0a0d11;
  --color-text: var(--neutral-50); --color-text-muted: #8b93a1;
  --color-text-label: var(--neutral-100);
  --color-border: #1a202a; --color-border-strong: #2a323e;
  --color-primary: var(--brand-500); --color-primary-hover: var(--brand-600);
  --color-primary-ink: #14100a;
  --color-accent: #ffb000;      /* assistant = phosphor */
  --color-accent-2: #4dd0e1;    /* operator = cyan */
  --color-focus: #ffb000;
  --color-success: #3ddc84; --color-error: #ff5252; --color-warning: #ffcf40;
  --color-info: #ffb000;        /* busy */
  --color-info-halo: rgb(255 176 0 / 0.22); --color-success-halo: rgb(61 220 132 / 0.2);
  --color-feed-time: #7d8698;
  /* fonts, radii (2/3px instrument), canvas grid, LED, segmented bars,
     compact density tokens, rule tokens — full set in tokens.css */
}
[data-theme="press"] {  /* LIGHT plane — token remaps only */
  --brand-400: #8a5c00;  /* deep-amber accent TEXT on paper */
  --brand-500: #ffb000;  /* shared phosphor fill */
  --brand-600: #d99c00;  /* hover darkens on paper */
  --accent-400: #0e7490; /* deep operator cyan */
  --color-bg: #f6f4ee;   /* paper */
  --color-text: #1c1a15; /* ink */
  /* …colors-only remap — full set in tokens.css (R4: no serif, no geometry deltas) */
}
```

## Open decisions

| Decision | Recommendation | Evidence | Owner / confirmation |
| --- | --- | --- | --- |
| A2 system stacks suffice | yes for this surface | E1/E5 | CEO pass |
| A3 fleet-pulse signature | keep | E3 | CEO pass |
| A4 (was Press-light) | resolved by R2: Press = light half of pair | CEO verbatim | confirmed |
| A5 English-only | yes | E1 | CEO pass |
| A6 compact density, no toggle | yes | E3 | CEO pass |
| A7 amber pairing strategy | fills shared phosphor; text accents plane-variant | R1+R2 | CEO pass · serif clause superseded by R4 (mono everywhere) |
| A8 component parity | boxed header + LED dots + transcript in both planes | R2 | CEO pass · "solid Press bars" clause superseded by R4 (segmented bars both planes) |

(A1 — register set — was superseded by R1/R3: two modes, Ops default.)

## Build order

design-system-interview (done; rulings R1–R3 committed) → color-system +
web-typography + spacing + theming (tokens.css) → responsive-layout +
component anatomy (style.css) → component-states + form-ux + empty-states +
data-viz + iconography (style.css + simulator.ts) → micro-motion + a11y +
cognitive passes → deslop-ui de-slop pass → design-critique → tastecheck
v1.7.0 gate (receipt) → CEO one-pass confirmation → video (only on his
word).
