/**
 * "Fetcher" workers: retrieve source content over HTTP or from the bundled
 * corpus. Real network calls (no keys, no paid services), size- and
 * time-capped, with graceful failure that missions survive.
 */

import { htmlToText } from "../nlp.js";
import { corpusByKey, type CorpusEntry } from "../corpus.js";
import type { FetchResult, SourceRef } from "../types.js";

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 512 * 1024;
const USER_AGENT = "fleetline/1.0 (Amazon Build-Ship-Shape hackathon entry; self-hosted demo)";

export function isCorpusRef(ref: string): boolean {
  return ref.startsWith("corpus:");
}

export function corpusEntryToFetchResult(entry: CorpusEntry): FetchResult {
  return {
    source: { ref: `corpus:${entry.key}`, label: entry.label },
    ok: true,
    latencyMs: 2,
    chars: entry.text.length,
    title: entry.title,
    text: entry.text,
  };
}

export async function fetchSource(source: SourceRef): Promise<FetchResult> {
  const started = Date.now();
  if (isCorpusRef(source.ref)) {
    const entry = corpusByKey(source.ref.slice("corpus:".length));
    if (!entry) {
      return {
        source,
        ok: false,
        latencyMs: 1,
        chars: 0,
        title: source.label,
        text: "",
        error: `unknown corpus ref: ${source.ref}`,
      };
    }
    return corpusEntryToFetchResult(entry);
  }

  let url: URL;
  try {
    url = new URL(source.ref);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("only http(s) sources are supported");
    }
  } catch (err) {
    return {
      source,
      ok: false,
      latencyMs: 0,
      chars: 0,
      title: source.label,
      text: "",
      error: `invalid source ref: ${(err as Error).message}`,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": USER_AGENT, accept: "text/html,text/plain,*/*" },
    });
    const raw = Buffer.from(await res.arrayBuffer()).subarray(0, MAX_BYTES).toString("utf-8");
    const looksHtml = /<html[\s>]/i.test(raw) || /<p[\s>]/i.test(raw);
    const text = looksHtml ? htmlToText(raw) : raw.replace(/\s+/g, " ").trim();
    const title = looksHtml
      ? raw.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim().slice(0, 120) ?? source.label
      : source.label;
    return {
      source,
      ok: res.ok,
      status: res.status,
      latencyMs: Date.now() - started,
      chars: text.length,
      title,
      text,
    };
  } catch (err) {
    return {
      source,
      ok: false,
      latencyMs: Date.now() - started,
      chars: 0,
      title: source.label,
      text: "",
      error: (err as Error).name === "AbortError" ? `timed out after ${FETCH_TIMEOUT_MS}ms` : (err as Error).message,
    };
  } finally {
    clearTimeout(timer);
  }
}
