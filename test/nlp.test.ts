import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenize, splitSentences, keywords, rankSentences, readingTimeMinutes, extractTitle, htmlToText } from "../src/fleet/nlp.js";

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
