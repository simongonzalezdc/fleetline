# NLP goal weighting — 2026-09-25

Branch `nlp/goal-weighted-20260925` (off `main`). Closes the audit's one
substantive gap: different spoken briefs now VISIBLY produce different fleet
output, so the pipeline can no longer be read as "a wrapper around
fetch-and-summarize". All local, deterministic, no ML, no embeddings, no
network, zero spend.

## What changed (file:line)

- `src/fleet/nlp.ts`
  - :19 `COMMAND_GRAMMAR` — fixed set of command verbs/filler from the
    assistant's phrasings ("brief", "mission", "fleet", "audit", ...) that are
    never goal terms.
  - :35 `stem()` — folds singular/plural and basic verb endings ("naps"↔"nap",
    "riding"↔"ride"); matching-only, display forms stay raw.
  - :51 `goalTerms()` — extracts the brief's subject terms: tokenize, drop
    stopwords/short words/command grammar/URLs, dedupe in first-appearance
    order. "brief me on sleep and recovery" → `["sleep", "recovery"]`.
  - :91 `keywords(tokens, limit, goal?)` — keywords matching the goal terms
    (stem-aware) lead the list, then usual TF order. No goal → old behavior.
  - :118 `rankSentences(..., goal?)` — two-tier: sentences containing goal
    terms rank as a class above sentences without them (a sleep brief
    surfaces sleep-bearing sentences even against higher-TF rivals); within
    each class TF overlap decides, ties by earliest position, output in
    document order. No goal → old comparator, byte-identical behavior.
- `src/fleet/workers/analyze.ts` :10–:21 — `analyzeDocument(fetch, goal = "")`
  extracts goal terms once and feeds them to both rankers.
- `src/fleet/manager.ts` :236 — analysts now receive `mission.goal`.
- `src/fleet/workers/compose.ts` :7, :33–:35, :40–:48 — briefing reports name
  their `Brief focus terms:` line; "Terms repeated across sources" hoists
  goal-matched terms.
- `test/nlp.test.ts` :50–:91 — two new tests (divergence, determinism).
- `README.md` — one sentence folded into the existing engine bullet: ranking
  is "weighted toward the brief's subject terms so different briefs yield
  different reports".

## Two-brief evidence (same 4-doc corpus)

Before (main, `073d1bb`): reports for the two briefs are byte-identical
except the header line — verified by building main in a throwaway worktree
and diffing (`a.replace(goal,"X") === b.replace(goal,"X")` → `true`).

After — `brief me on sleep and recovery` vs `brief me on caffeine and naps`:

```
A: Brief focus terms: sleep, recovery.
B: Brief focus terms: caffeine, naps.

A ai-news  Keywords: recovery, fleets, workers, agent, cost.
B ai-news  Keywords: fleets, workers, agent, cost, mission.
A ai-news  top-3 gains: "The remaining hard problems are failure recovery, cost
           accounting per mission, ..." (absent from B's top-3)

A sleep-doc Keywords: sleep, bedtime, hour, jet, lag.
B sleep-doc Keywords: caffeine, nap, naps, sleep, bedtime.

A sleep-doc top-3: [Sleep researchers…, circadian…jet lag, Deep sleep concentrates…]
B sleep-doc top-3: [circadian…jet lag, …caffeine before noon…, Naps under
                    twenty-five minutes…]
→ 1 of 3 sentences shared; the classes swap on the brief.
```

End-to-end through the real `FleetManager` (submit → fetch → analyze →
compose): same brief twice → identical report string (`true`); different
briefs → different report string (`true`).

## Test output (verbatim, `npm test`)

```
✔ full MCP lifecycle over Streamable HTTP (479.074167ms)
✔ roster has role-specialized workers (2.482709ms)
✔ briefing mission completes with a report and full event trail (103.723958ms)
✔ audit mission checks source health (135.551416ms)
✔ cancel stops a queued/running mission (1.326917ms)
✔ unknown corpus ref fails that source but mission survives (101.947542ms)
✔ status lists recent missions and summarizes progress (3.357416ms)
✔ tokenize lowercases and strips punctuation (2.745417ms)
✔ splitSentences keeps substantial sentences only (0.578458ms)
✔ keywords excludes stopwords and is deterministic (15.575417ms)
✔ rankSentences returns deterministic top sentences in document order (0.833875ms)
✔ readingTimeMinutes floors at one minute (0.1705ms)
✔ extractTitle finds html title and markdown h1 (0.4945ms)
✔ htmlToText strips scripts, styles and tags (0.683875ms)
✔ different briefs over the same corpus weight the fleet output differently (6.998625ms)
✔ same brief twice produces identical fleet output (determinism) (3.689084ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 791.041334
```

14 pre-existing tests stay green; 2 added (divergence + determinism).
`npm audit` → `found 0 vulnerabilities` (exit 0).

## GATED (honest list)

- `public/` simulator demo copy (e.g. DEMO-SCRIPT.md walkthrough of two
  briefs side by side) — design branch owns those files; not touched here.
- Term families with no morphological link (e.g. brief "cycling" vs a body
  that only says "bike"/"lanes") do not match — no embeddings by mandate;
  the fix surface would be synonyms, deliberately out of scope.
- Docs beyond this receipt + the one README sentence — none, per mandate.

**Status: DONE** — goal-weighted selection landed, demo-visible, deterministic, 16/16 green, audit 0.
