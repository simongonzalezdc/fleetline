# Submission fixes — 2026-09-25 audit

Branch: `docs/submission-fixes-20260925` (local only; not pushed). Base:
`1cbeb9b`. Text-side fixes required by the adversarial audit of the Amazon
Build-Ship-Shape submission, executed 2026-09-25. Audit findings these fixes
answer: judging axes are equally weighted (Tech/Design/Impact/Idea); judges
"may choose to judge based solely on the text description, images, and
video"; Devpost requires a Product Feedback field with five specific
questions; the friction-log bonus (up to 10%, Stage-1 assessed, discretionary)
prescribes the entry shape task/steps/expected-vs-actual/severity/workaround/
suggestion; the narrative must not read as either an unbacked category list or
a "basic MCP wrapper".

## What changed, per file

### `README.md`
- **Impact row of the judging map rewritten.** The category list
  (accessibility / kitchens / warehouses / incident response) is replaced by
  ONE specific credible case — solo operators/developers running local agent
  fleets needing hands-free dispatch-and-collect, keyboard-free accessibility
  angle included — one workflow ("brief me… come back to a finished report"),
  one sentence on the audience beyond the hackathon (every developer already
  running local agents; MCP as the portability layer), and the strongest true
  differentiator sentence: the track's sanctioned simulation path is exempt
  from runtime-technology-hook requirements, and Fleetline ships real runtime
  SDK hooks anyway. *(Audit: judges may judge on text alone; category lists
  score as unbacked breadth on an equally weighted axis.)*
- Repo-layout row for `demo/DEMO-SCRIPT.md` updated to the new runtime
  (~2:20, cap 2:30, cancel beat included) — consistency with fix 5.

### `SUBMISSION.md`
- **Long-form description**: added an impact paragraph (same one-case rewrite
  as README — solo operator, one workflow, audience-beyond sentence, phrased
  "modeled on a real solo-operator workflow") and the differentiator
  paragraph (simulation-path exemption + real runtime SDK hooks). *(Audit:
  same equal-weighting and text-only-judging findings as above.)*
- **New section "Product Feedback (Devpost) — paste-ready answers"**: answers
  to the five Devpost Product Feedback questions (which tools/for what,
  worked well, needs work, onboarding experience, would-build-again), drawn
  honestly from `docs/FRICTION-LOG.md` and the build experience — including
  the logging-capability silent failure as the worst onboarding moment and
  the browser-client first-try bundle as the best. *(Audit: Devpost requires
  this field; answers must be honest and traceable to the friction log.)*
- **Pre-submission checklist extended** with the two audit-required items:
  GitHub About section shows MIT license (repo Settings → license
  visibility); verify Open Source mini-challenge eligibility wording at
  submission time ("new, additional open-source project … alongside a
  primary track submission" — ambiguous for the primary repo).
- Video section: script target updated from 2:00 to ~2:20 (cap 2:30) to match
  the new demo script.

### `docs/FRICTION-LOG.md`
- **Restructured into the prescribed per-entry schema** (markdown table per
  entry: task attempted / steps taken / expected vs actual / severity /
  workaround / actionable suggestion) with a stated severity scale
  (blocker/major/minor). Every real finding is preserved, zero fabrication —
  eight entries: F1 MCP-SDK logging-capability silent failure (the big one,
  full story kept), F2 `onclose`/`onClose`, F3 one-`McpServer`-per-session,
  F4 Inspector `--version`, F5 Inspector sanitized env/EADDRINUSE, F6 Skills
  validator not zero-install, F7 required spec version only in a URL
  fragment, F8 `node --test` bare-directory. All "worked well" notes kept per
  tool. *(Audit: the friction-log bonus has a prescribed entry shape.)*

### `demo/DEMO-SCRIPT.md`
- **Cancel beat added (1:20–1:45)**: mid-demo, paste an 8-source audit line
  (seven live URLs + `https://192.0.2.1` — RFC 5737 non-routable, so its
  fetch hangs until the 8s timeout and keeps the mission running), then
  "Cancel it." → `fleet_cancel` (previously unused in any demo path) →
  reply "Mission cancelled. The workers will stand down after their current
  task", dashboard shows the stand-down. Total runtime 2:20, under the 2:30
  cap (other beats retimed). Script only; no code changes — the beat is
  shootable with existing code: the simulator composer routes free text
  through `src/intents/router.ts`, which extracts up to 8 URLs into
  `fleet_mission_submit` (audit kind) and routes "cancel" to `fleet_cancel`
  on the last mission. *(Audit: exercising `fleet_cancel` is the one moment
  that shows commanding rather than requesting.)*

### Fix 2 verification ("org runs this daily" claim)
- Audited all text surfaces (`README.md`, `SUBMISSION.md`, `docs/`,
  `demo/`, `skills/`) for daily/org-use claims (grep: daily, every day, org,
  Kyanite, we run, runs this, in production we): **none found** — nothing to
  reword. The new impact copy proactively uses "modeled on a real
  solo-operator workflow" so no org claim enters the Devpost text.

## Execution notes
- The shared worktree (`~/workspaces/amazon-bss`) stayed on
  `design/redesign-20260925` with the design PM's uncommitted changes
  untouched; this branch lives in an isolated linked worktree
  (`~/workspaces/amazon-bss-text`) so the two concurrent lanes cannot race
  each other's commits. Files `public-src/`, `public/`, `src/` untouched.
- No push, no server run, zero spend.

## GATED
- **MCP-SDK docs PR** (upstream the logging-capability documentation
  suggestion from entry F1): GATED on CEO word — external contribution under
  org identity.
- **Devpost paste + GitHub About/license-visibility toggle + Open Source
  mini-challenge selection**: CEO-gated steps already listed in
  `SUBMISSION.md`; the new checklist items gate them at submission time.
- **Demo video recording** of the new 2:20 script: CEO hands (per
  SUBMISSION.md CEO-gated step 3).
