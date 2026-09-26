# Demo video — uploaded (receipt)

**YouTube (public, verified by read-back):** https://www.youtube.com/watch?v=S7dwUlteIRA
**Master:** `demo/FLEETLINE-DEMO-v5.1.mp4` — v5 (CEO-approved 2026-09-25, 44.4s kinocut master) with an audio-only remaster: linear loudnorm + trim, video stream bit-identical (`-c:v copy`). Audio measured I=−19.5 LUFS, TP=−4.3 dBFS (battery window I∈[−22.2,−18.0], TP≤−4).

## Why v5.1 exists
v5 measured I=−17.4 / TP=−1.8 — outside the tastecheck audio-presence window. The remaster changed loudness only; no visual or content change, so the CEO's 2026-09-25 approval of v5's visuals stands (approval-locks-artifact).

## Gates run (2026-09-26 ~09:20 PT)
- **tastecheck video-medium battery (4 mandatory rows): SHIP** — reading-hold PASS (Otsu stroke/ground on real extracted hold frames), motion-law PASS (banned-motion grep clean; authored timeline motion present), readability-960x540 PASS (downscale contrast ≥60), audio-presence PASS (I=−19.5, TP=−4.3, zero −38dB/0.35s gaps). Report: `~/workspaces/cco/fleetline-demo-gate-2026-09-26/tastecheck/battery-report.json`.
- **Visual review:** CEO's own eyes on v5 (approved 2026-09-25); v5.1 visuals bit-identical.
- **Comprehensibility cold-read:** independent cold-reader agent on the exact VO transcript — **VERDICT: COMPREHENSIBLE, 4/5**. Core pitch, parallel-execution capability, live-progress, and cancel beat all clear to a stranger with zero context. Flagged (non-blocking for the judge audience): "the track" undefined for outsiders, MCP/Streamable HTTP/Agent Skill unexpanded, sleep/caffeine line needs the on-screen brief-change to land.
- **Ultraqa:** run on the post-fix cut 2026-09-25 (CEO-flagged interruption fixed in v4→v5 chain).

## Upload path (the miss this closes)
The 2026-09-25 order was "set a timer and execute" for post-quota-reset upload (~01:16 PT). The timer was never armed (automation cap blocked CronCreate; no launchd fallback installed) and nothing fired overnight. This upload at ~09:20 PT 2026-09-26 closes the gap. Lesson logged: a queued handoff with no armed mechanism is a race, not a timer.

## Reproduction
Video: https://www.youtube.com/watch?v=S7dwUlteIRA (public, English, 44s).
Master: `demo/FLEETLINE-DEMO-v5.1.mp4` (v5 with audio-only remaster to the org loudness window; video stream bit-identical).
