/**
 * "Analyst" workers: local NLP analysis of a fetched document.
 * Deterministic, offline, key-free: word count, reading time, keywords,
 * and extractive top sentences. The mission brief's goal terms weight the
 * ranking, so different briefs over the same document produce different
 * keywords and top sentences.
 */

import { goalTerms, keywords, rankSentences, readingTimeMinutes, splitSentences, tokenize } from "../nlp.js";
import type { DocAnalysis, FetchResult } from "../types.js";

export function analyzeDocument(fetch: FetchResult, goal = ""): DocAnalysis {
  const tokens = tokenize(fetch.text);
  const sentences = splitSentences(fetch.text);
  const goals = goalTerms(goal);
  return {
    source: fetch.source,
    title: fetch.title,
    wordCount: tokens.length,
    readingTimeMin: readingTimeMinutes(tokens.length),
    keywords: keywords(tokens, 8, goals),
    topSentences: rankSentences(sentences, tokens, 3, goals),
  };
}
