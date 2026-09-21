/**
 * "Analyst" workers: local NLP analysis of a fetched document.
 * Deterministic, offline, key-free: word count, reading time, keywords,
 * and extractive top sentences.
 */

import { keywords, rankSentences, readingTimeMinutes, splitSentences, tokenize } from "../nlp.js";
import type { DocAnalysis, FetchResult } from "../types.js";

export function analyzeDocument(fetch: FetchResult): DocAnalysis {
  const tokens = tokenize(fetch.text);
  const sentences = splitSentences(fetch.text);
  return {
    source: fetch.source,
    title: fetch.title,
    wordCount: tokens.length,
    readingTimeMin: readingTimeMinutes(tokens.length),
    keywords: keywords(tokens, 8),
    topSentences: rankSentences(sentences, tokens, 3),
  };
}
