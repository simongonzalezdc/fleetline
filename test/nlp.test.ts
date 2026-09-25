import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenize, splitSentences, keywords, rankSentences, readingTimeMinutes, extractTitle, htmlToText, goalTerms } from "../src/fleet/nlp.js";
import { CORPUS } from "../src/fleet/corpus.js";
import { corpusEntryToFetchResult } from "../src/fleet/workers/fetch.js";
import { analyzeDocument } from "../src/fleet/workers/analyze.js";
import { composeReport } from "../src/fleet/workers/compose.js";

test("tokenize lowercases and strips punctuation", () => {
  assert.deepEqual(tokenize("Hello, World! It's fine."), ["hello", "world", "it's", "fine"]);
});

test("splitSentences keeps substantial sentences only", () => {
  const text = "Short. This sentence is long enough to survive the filter, and it mentions coffee. Also this one is long enough as well, with a second clause.";
  const s = splitSentences(text);
  assert.equal(s.length, 2);
});

test("keywords excludes stopwords and is deterministic", () => {
  const tokens = tokenize("coffee coffee coffee extraction extraction grinder grind size size the and of");
  const k1 = keywords(tokens, 5);
  const k2 = keywords(tokens, 5);
  assert.deepEqual(k1, k2);
  assert.ok(k1.includes("coffee"));
  assert.ok(!k1.includes("the"));
});

test("rankSentences returns deterministic top sentences in document order", () => {
  const text = Array.from({ length: 12 }, (_, i) => `Sentence ${i} about robot fleets robot fleets dispatch missions robot fleets.`).join(" ");
  const a = rankSentences(splitSentences(text), tokenize(text), 3);
  const b = rankSentences(splitSentences(text), tokenize(text), 3);
  assert.equal(a.length, 3);
  assert.deepEqual(a, b);
});

test("readingTimeMinutes floors at one minute", () => {
  assert.equal(readingTimeMinutes(10), 1);
  assert.equal(readingTimeMinutes(660), 3);
});

test("extractTitle finds html title and markdown h1", () => {
  assert.equal(extractTitle("<html><title>My Page</title></html>", "fb"), "My Page");
  assert.equal(extractTitle("# Heading\nbody", "fb"), "Heading");
  assert.equal(extractTitle("no markup here", "fallback"), "fallback");
});

test("htmlToText strips scripts, styles and tags", () => {
  const html = `<html><head><style>.a{}</style><script>bad()</script></head><body><p>Hello &amp;   world</p></body></html>`;
  assert.equal(htmlToText(html), "Hello & world");
});

test("different briefs over the same corpus weight the fleet output differently", () => {
  const fetches = CORPUS.map(corpusEntryToFetchResult);
  const goalA = "brief me on sleep and recovery";
  const goalB = "brief me on caffeine and naps";
  assert.deepEqual(goalTerms(goalA), ["sleep", "recovery"]);
  assert.deepEqual(goalTerms(goalB), ["caffeine", "naps"]);

  const analysesA = fetches.map((f) => analyzeDocument(f, goalA));
  const analysesB = fetches.map((f) => analyzeDocument(f, goalB));

  // Measurable divergence: docs whose top sentences or keyword order differ.
  const differing = analysesA.filter(
    (a, i) =>
      JSON.stringify(a.topSentences) !== JSON.stringify(analysesB[i].topSentences) ||
      JSON.stringify(a.keywords) !== JSON.stringify(analysesB[i].keywords)
  ).length;
  assert.ok(differing >= 2, `only ${differing} of ${analysesA.length} docs diverged`);

  const sleepA = analysesA[3]; // corpus order: ai-news, coffee, cycling, sleep
  const sleepB = analysesB[3];
  assert.notDeepEqual(sleepA.topSentences, sleepB.topSentences);
  assert.ok(sleepA.topSentences.some((s) => /\bsleep\b/i.test(s)));
  assert.ok(sleepB.topSentences.some((s) => /caffeine|[Nn]aps\b/.test(s)));

  // Keyword lists lead with their brief's matched goal terms.
  assert.equal(sleepA.keywords[0], "sleep");
  assert.equal(sleepB.keywords[0], "caffeine");
  assert.equal(analysesA[0].keywords[0], "recovery"); // hoisted in ai-news
  assert.equal(analysesB[0].keywords[0], "fleets"); // unhoisted baseline

  // Composed reports differ end to end and name their focus terms.
  const reportA = composeReport("briefing", goalA, fetches, analysesA);
  const reportB = composeReport("briefing", goalB, fetches, analysesB);
  assert.notEqual(reportA, reportB);
  assert.ok(reportA.includes("Brief focus terms: sleep, recovery."));
  assert.ok(reportB.includes("Brief focus terms: caffeine, naps."));
});

test("same brief twice produces identical fleet output (determinism)", () => {
  const fetches = CORPUS.map(corpusEntryToFetchResult);
  const goal = "brief me on sleep and recovery";
  const run1 = fetches.map((f) => analyzeDocument(f, goal));
  const run2 = fetches.map((f) => analyzeDocument(f, goal));
  assert.deepEqual(run1, run2);
  const report1 = composeReport("briefing", goal, fetches, run1);
  const report2 = composeReport("briefing", goal, fetches, run2);
  assert.equal(report1, report2);
});
