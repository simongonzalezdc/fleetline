/**
 * Local, dependency-free NLP utilities used by the "analyst" workers.
 * Deterministic and offline: tokenization, stopwords, TF sentence scoring
 * (TextRank-lite), keyword extraction, goal-term extraction for
 * goal-weighted ranking, and reading-time estimation.
 */

const STOPWORDS = new Set(
  `a about above after again against all am an and any are aren't as at be because been before being below between both but by can cannot could couldn't did didn't do does doesn't doing don't down during each few for from further had hadn't has hasn't have haven't having he her here hers herself him himself his how i if in into is isn't it its itself just let's me more most mustn't my myself no nor not of off on once only or other ought our ours ourselves out over own same shan't she should shouldn't so some such than that the their theirs them themselves then there these they this those through to too under until up very was wasn't we were weren't what when where which while who whom why with won't would wouldn't you your yours yourself yourselves also may might will one two new using used use make makes made get gets got`.split(
    /\s+/
  )
);

/**
 * Fixed command grammar: verbs and filler the assistant's command phrasings
 * add to every mission goal ("brief me on ...", "audit the health of ...").
 * These are never goal terms — only the subject matter of the ask is.
 */
const COMMAND_GRAMMAR = new Set(
  `brief briefs briefing briefings report reports reporting mission missions fleet fleets fleetline alexa audit audits dispatch dispatches send sends sent assign assigns analyze analyse analysis analyses research researches dig digs look looks find finds found give gives show shows tell tells read reads summarize summarise summary summaries collect collects pull pulls fetch fetches check checks checked health status sources source corpus topic please everything stuff things today tonight yesterday want wants needs need know knows`.split(
    /\s+/
  )
);

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z'-]{1,}/g) ?? []).map((t) =>
    t.replace(/^['-]+|['-]+$/g, "")
  );
}

/**
 * Fold singular/plural and basic verb endings so "naps" matches "nap" and
 * "riding" matches "ride". Display forms stay raw; this is matching-only.
 */
function stem(token: string): string {
  const t = token;
  if (t.endsWith("ies") && t.length > 4) return t.slice(0, -3) + "y";
  if (t.endsWith("es") && t.length > 4) return t.slice(0, -2);
  if (t.endsWith("s") && !t.endsWith("ss") && t.length > 3) return t.slice(0, -1);
  if (t.endsWith("ing") && t.length > 5) return t.slice(0, -3);
  if (t.endsWith("ed") && t.length > 4) return t.slice(0, -2);
  return t;
}

/**
 * Extract the goal terms of a mission brief: the content words of the user's
 * ask beyond the fixed command grammar. "brief me on sleep and recovery"
 * yields ["sleep", "recovery"]. Deterministic, stopword-aware, offline;
 * order is first appearance in the brief.
 */
export function goalTerms(goal: string): string[] {
  const stripped = goal.replace(/https?:\/\/\S+/g, " ");
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const t of tokenize(stripped)) {
    if (STOPWORDS.has(t) || t.length < 3 || COMMAND_GRAMMAR.has(t) || seen.has(t)) continue;
    seen.add(t);
    terms.push(t);
  }
  return terms;
}

function goalStems(terms: string[] | undefined): Set<string> | undefined {
  if (!terms || terms.length === 0) return undefined;
  return new Set(terms.map(stem));
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

/**
 * Top keywords by term frequency. When goal terms are given (from the
 * mission brief), keywords matching them lead the list, so two different
 * briefs over the same corpus surface visibly different keyword orders.
 */
export function keywords(tokens: string[], limit = 8, goal?: string[]): string[] {
  const freq = wordFrequencies(tokens);
  const goals = goalStems(goal);
  if (!goals) {
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit)
      .map(([w]) => w);
  }
  return [...freq.entries()]
    .map(([w, n]) => ({ w, n, onGoal: goals.has(stem(w)) }))
    .sort(
      (a, b) =>
        Number(b.onGoal) - Number(a.onGoal) || b.n - a.n || a.w.localeCompare(b.w)
    )
    .slice(0, limit)
    .map((e) => e.w);
}

/**
 * Score sentences by normalized TF overlap with the document's top terms.
 * When goal terms are given (from the mission brief), sentences containing
 * them rank as a class above sentences without them (a brief on "sleep"
 * surfaces the sleep-bearing sentences even against higher-TF rivals);
 * within each class, TF overlap decides and ties break by earliest position.
 * Deterministic; output preserves document order.
 */
export function rankSentences(
  sentences: string[],
  tokens: string[],
  limit = 3,
  goal?: string[]
): string[] {
  if (sentences.length === 0) return [];
  const freq = wordFrequencies(tokens);
  const topTerms = new Set(
    [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(([w]) => w)
  );
  const goals = goalStems(goal);
  const scored = sentences.map((sentence, index) => {
    const st = tokenize(sentence);
    const hits = st.filter((t) => topTerms.has(t)).length;
    const goalHits = goals ? st.filter((t) => goals.has(stem(t))).length : 0;
    const score = st.length > 0 ? hits / Math.sqrt(st.length) : 0;
    return { sentence, index, score, goalHits };
  });
  return scored
    .sort(
      (a, b) =>
        b.goalHits - a.goalHits || b.score - a.score || a.index - b.index
    )
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
