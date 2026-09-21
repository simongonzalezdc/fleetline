/**
 * "Composer" workers: assemble mission outputs into a single briefing or
 * audit report. Composition is data-driven from analyst outputs, so the
 * report reflects real work done by the fleet, not canned text.
 */

import type { DocAnalysis, FetchResult, MissionKind } from "../types.js";

export function composeReport(
  kind: MissionKind,
  goal: string,
  fetches: FetchResult[],
  analyses: DocAnalysis[]
): string {
  if (kind === "audit") return composeAudit(goal, fetches);
  return composeBriefing(goal, fetches, analyses);
}

function composeBriefing(goal: string, fetches: FetchResult[], analyses: DocAnalysis[]): string {
  const ok = analyses.length;
  const failed = fetches.length - ok;
  const totalWords = analyses.reduce((s, a) => s + a.wordCount, 0);
  const lines: string[] = [];

  lines.push(`Fleet briefing: ${goal}`);
  lines.push("");
  lines.push(
    `${ok} of ${fetches.length} sources analyzed by the fleet (${totalWords} words total${failed ? `, ${failed} failed` : ""}).`
  );
  lines.push("");

  const globalKeywords = new Map<string, number>();
  for (const a of analyses) {
    for (const k of a.keywords) globalKeywords.set(k, (globalKeywords.get(k) ?? 0) + 1);
  }
  const shared = [...globalKeywords.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([w]) => w);
  if (shared.length > 0) {
    lines.push(`Terms repeated across sources: ${shared.join(", ")}.`);
    lines.push("");
  }

  for (const a of analyses) {
    lines.push(`- ${a.title} (${a.source.label}) — ${a.wordCount} words, ${a.readingTimeMin} min read. Keywords: ${a.keywords.slice(0, 5).join(", ")}.`);
    for (const s of a.topSentences) {
      lines.push(`  * ${s}`);
    }
  }
  if (failed > 0) {
    lines.push("");
    for (const f of fetches.filter((x) => !x.ok)) {
      lines.push(`- Unavailable: ${f.source.label} (${f.error ?? `status ${f.status}`})`);
    }
  }
  lines.push("");
  lines.push(
    `Composited by ${analyses.length + failed > 0 ? "a" : "a"} composer worker from analyst outputs above.`
  );
  return lines.join("\n");
}

function composeAudit(goal: string, fetches: FetchResult[]): string {
  const lines: string[] = [];
  const pass = fetches.filter((f) => f.ok).length;
  lines.push(`Fleet audit: ${goal}`);
  lines.push("");
  lines.push(`${pass} of ${fetches.length} sources healthy.`);
  lines.push("");
  for (const f of fetches) {
    const verdict = f.ok ? "PASS" : "FAIL";
    const detail = f.ok
      ? `${f.status} in ${f.latencyMs}ms, ${(f.chars / 1024).toFixed(1)}KB`
      : f.error ?? `status ${f.status}`;
    lines.push(`- [${verdict}] ${f.source.label} (${f.source.ref}) — ${detail}`);
  }
  return lines.join("\n");
}
