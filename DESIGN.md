# Design

The one-line contract layer. **Token + spec authority: `docs/DESIGN-SYSTEM.md`
(2026-09-25 design-system program).** Read that before any visual/UI decision;
this file indexes it and never diverges from it.

## Source of truth
- Status: Active (approval-ready; assumptions A2–A8 await CEO one-pass)
- Last refreshed: 2026-09-25
- Primary product surfaces: `public/index.html` (Alexa+ web simulator — the
  judges' surface), README screenshots, demo video (on CEO word only)
- Evidence reviewed: docs/INTERVIEW-2026-09-25.md (full decision record),
  docs/DESIGN-2026-09-25.md (prior design-PM pass), live DOM/a11y reads,
  org canon (kyanite-system.css), CEO rulings R1–R3 (verbatim, 2026-09-25)

## Brand
- Personality: calm mission-control authority; precision surfaces, warmth in
  language/voice only
- Trust signals: live fleet data made visible (the fleet pulse), honest
  simulator disclosure, WCAG AA in both planes
- Avoid: slop catalog in DESIGN-SYSTEM.md §Refusals (no webfonts, no imagery,
  no pills, no decorative gradients, no layout animation, no raw JSON, no
  emoji icons, no third style)

## Product goals
- Goals: win Design-axis judgment in a ≤3-min video; solo-operator console
  legible at 1440x900; read as org machinery (dogfooding law)
- Non-goals: mobile-first product (responsive floor is a11y, not a target);
  theme customization UI; localization (EN-only, assumption A5)
- Success signals: tastecheck 1.7.0 verdicts (receipt), CEO approval pass

## Personas and jobs
- Solo operator (Simon-class): dispatch by voice, glance at fleet state,
  collect report — hands-free
- Hackathon judge: 3-minute video; must read "serious tool" in seconds

## Information architecture
- Core screen: conversation transcript (left, 58fr) + instrument stack
  (right, 42fr: stats → roster → missions → feed); header band; footer
  disclosure
- Content hierarchy: voice first, engine visible

## Design principles
- One instrument, two planes (Ops dark default / Press light) — same
  anatomy, token remaps only
- Instrument-stack structure; sections differ by data type (no card grid)
- State-legibility only motion; the fleet pulse is the signature
- Every state is shape+text redundant (never color alone)

## Visual language
- Color: amber phosphor brand accent of record; semantic tokens per plane
  (see DESIGN-SYSTEM.md §Color + contrast tables)
- Typography: mono-first system stacks; Press serif confined to masthead +
  folio stat numerals; tabular numerals for all metrics
- Spacing: 4/8 ladder, compact instrument density both planes
- Shape/elevation: flat instruments; radius 0–3px; zero drop shadow; rule
  weight = depth
- Motion: 120/180/240ms, house ease-out curve, 1.2s pulse; reduced-motion
  floor
- Imagery/iconography: none/inline-SVG monoline 16px set from the chevron
  mark

## Components
- Anatomy layer `public/style.css`: chat message, tool chip, report view,
  worker row, stat cell (LED), mission block, buttons (send/chips/voice/
  mic), input, event line, connection indicator — full specs + states
  matrix in DESIGN-SYSTEM.md §Components

## Accessibility
- Target: WCAG 2.2 AA (4.5:1 text / 3:1 UI), both planes, measured
- Keyboard/focus: DOM-order tab, visible focus ring, no traps
- Screen readers: landmarks, role=status conn, chat polite / feed off
- Reduced motion honored (pulse/entry disabled; state survives via text)

## Responsive behavior
- Breakpoints: 960px column stack; 560px stats 2×2 + roster 1-col; 320px
  floor; no device-name breakpoints

## Interaction states
- See DESIGN-SYSTEM.md §States matrix (empty/loading/error/success per
  component; skeletons geometry-stable)

## Content voice
- Plain, literal, operator-grade English; status words spelled out
  ("completed", "idle · 5 done"); empty states name the next move

## Implementation constraints
- Vanilla TS + esbuild bundle; zero webfonts/images; `public/simulator.js`
  is built (`npm run build`) — rebuild after any public-src change
- Tokens: `public/tokens.css` is the single token file; components consume
  semantic tokens only; modes remap tokens only
- `npm test` 14/14 must stay green

## Open questions
- [ ] A2 system stacks suffice for Design score — CEO pass
- [ ] A3 fleet-pulse signature — CEO pass
- [ ] A5 English-only — CEO pass
- [ ] A6 compact density, no toggle — CEO pass
- [ ] A7 amber pairing strategy (fills shared, text plane-variant; serif
      scope) — CEO pass
- [ ] A8 component parity list — CEO pass
