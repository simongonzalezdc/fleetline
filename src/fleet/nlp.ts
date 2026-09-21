/**
 * Local, dependency-free NLP utilities used by the "analyst" workers.
 * Deterministic and offline: tokenization, stopwords, TF sentence scoring
 * (TextRank-lite), keyword extraction, and reading-time estimation.
 */

const STOPWORDS = new Set(
  `a about above after again against all am an and any are aren't as at be because been before being below between both but by can cannot could couldn't did didn't do does doesn't doing don't down during each few for from further had hadn't has hasn't have haven't having he her here hers herself him himself his how i if in into is isn't it its itself just let's me more most mustn't my myself no nor not of off on once only or other ought our ours ourselves out over own same shan't she should shouldn't so some such than that the their theirs them themselves then there these they this those through to too under until up very was wasn't we were weren't what when where which while who whom why with won't would wouldn't you your yours yourself yourselves also may might will one two new using used use make makes made get gets got`.split(
    /\s+/
  )
);

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z'-]{1,}/g) ?? []).map((t) =>
    t.replace(/^['-]+|['-]+$/g, "")
  );
}

export function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const raw = cleaned.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/);
  return raw
    .map((s) => s.trim())
    .filter((s) => s.length >= 30 && s.length <= 600);
}

export function wordFrequencies(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) {
    if (STOPWORDS.has(t) || t.length < 3) continue;
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return freq;
}

export function keywords(tokens: string[], limit = 8): string[] {
  const freq = wordFrequencies(tokens);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([w]) => w);
}

/**
 * Score sentences by normalized TF overlap with the document's top terms.
 * Deterministic; ties broken by earliest position.
 */
export function rankSentences(
  sentences: string[],
  tokens: string[],
  limit = 3
): string[] {
  if (sentences.length === 0) return [];
  const freq = wordFrequencies(tokens);
  const topTerms = new Set(
    [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(([w]) => w)
  );
  const scored = sentences.map((sentence, index) => {
    const st = tokenize(sentence);
    const hits = st.filter((t) => topTerms.has(t)).length;
    const score = st.length > 0 ? hits / Math.sqrt(st.length) : 0;
    return { sentence, index, score };
  });
  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence);
}

export function readingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 220));
}

/** Extract a human title from HTML or a markdown heading. */
export function extractTitle(raw: string, fallback: string): string {
  const htmlMatch = raw.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (htmlMatch) return htmlMatch[1].trim().slice(0, 120);
  const h1 = raw.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim().slice(0, 120);
  return fallback;
}

/** Very small HTML-to-text extraction (tags stripped, entities decoded). */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
