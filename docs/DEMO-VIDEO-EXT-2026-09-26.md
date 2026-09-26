# Extended demo video — v4 (receipt)

**Public:** https://www.youtube.com/watch?v=XOnOJ9aU4Os (70s, verified by read-back)
**Audio v5 (CEO feedback "music is bad and distracting sound distorted"):** the extension had been mixed over `bed-loop.wav` (a hot, unapproved bed, ~7dB above the approved one). Rebuilt over the CEO-approved `bed5.wav` warm pads: 4.5kHz low-pass so it sits under the voice, crossfaded loop seam (the 44.1s hard cut was an audible artifact), static levels, I=−19.7 / TP=−4.1 / zero gaps. Video stream unchanged.
**Master:** `demo-ext/FLEETLINE-DEMO-EXT-v4.mp4`

Ordered by the CEO ("extend vid but nicely", "drive it to completion ONCE all gates are complete and green"). The approved 44s cut (S7dwUlteIRA, still public) plays untouched, then adds evidence-class beats: real terminal run (`proof/demo-run.txt` shapes), a LIVE source audit actually executed during the build (2 PASS + 1 dead-URL FAIL, mission completes — transcript in `demo-ext/audit-evidence.txt`), and the Agent Skill card. Same Ops visual language (near-black/amber/mono), canonical voice narration re-rendered for continuity, end card updated to 19/19 tests to match the repo after the local-model intent lane landed (67a319d).

## Gates — ALL GREEN
- tastecheck video battery: SHIP 4/4 (`~/workspaces/cco/fleetline-demo-ext-gate-2026-09-26/tastecheck/battery-report.json`)
- Independent vision review (in-harness vision agent): PASS — all 5 first-pass defects verified fixed (centering measured to 0.5px; contrast floor 4.6:1)
- Cold-read comprehensibility: COMPREHENSIBLE 5/5
- Audio: I=−19.8 LUFS, TP=−4.1 dBFS, zero silence gaps; motion-law grep clean; end-card count truth-checked vs repo
- Orchestrator own-eyes: 4 final-render frames inspected (arch/terminal/audit/end)
- Product truth fixes shipped with this cut: stat label fits, SIMULATOR tag never slices, browser-safe env read (a bundle crash that silently killed simulator utterances — found by frame-checking the re-capture), optional local-model intent lane live-fired vs Qwen3.8-27B (19/19 tests)

## Entry state
Devpost video URL swapped to XOnOJ9aU4Os and verified on fresh load. README/SUBMISSION updated (afb7b23). The CEO's only remaining act: review → terms → Submit.
