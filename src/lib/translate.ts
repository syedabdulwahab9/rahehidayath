import { useEffect, useMemo, useState } from "react";
import { useSettings } from "./settings";

/**
 * Live translation layer.
 *
 * Every English string in the app can be shown in any of the supported
 * languages: cached translations are served instantly from localStorage, and
 * anything new is translated once through /api/translate and then cached, so
 * the whole site — Ibadaat, halal rulings, names and meanings — is available
 * in all languages without shipping a dictionary for every sentence.
 */

const CACHE_KEY = "rah-e-hidayath-translations";

type Cache = Record<string, Record<string, string>>; // lang -> english -> translated

let memory: Cache | null = null;
const inflight = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();

function load(): Cache {
  if (memory) return memory;
  memory = {};
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(CACHE_KEY) : null;
    if (raw) memory = JSON.parse(raw) as Cache;
  } catch {
    memory = {};
  }
  return memory;
}

function save() {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(memory ?? {}));
  } catch {
    /* quota — ignore */
  }
}

function notify() {
  listeners.forEach((l) => l());
}

async function translateBatch(lang: string, texts: string[]) {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: lang, texts }),
  });
  const json = (await res.json()) as { translations?: string[] };
  const out = json.translations ?? texts;
  const cache = load();
  cache[lang] = cache[lang] ?? {};
  texts.forEach((t, i) => {
    cache[lang]![t] = out[i] ?? t;
  });
  save();
  notify();
}

/**
 * Returns a `tr(englishText)` function for the currently selected language.
 * Missing strings are fetched in the background and fall back to English
 * until they arrive.
 */
export function useTranslate(texts: string[], langOverride?: string) {
  const { settings } = useSettings();
  const lang = langOverride ?? settings.lang;
  const [, setTick] = useState(0);

  const list = useMemo(
    () => Array.from(new Set(texts.filter((t) => typeof t === "string" && t.trim().length > 0))),
    [texts],
  );

  useEffect(() => {
    const listener = () => setTick((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };

  }, []);

  useEffect(() => {
    if (lang === "en" || list.length === 0) return;
    const cache = load();
    const missing = list.filter((t) => !cache[lang]?.[t]);
    if (missing.length === 0) return;

    let cancelled = false;
    const chunks: string[][] = [];
    for (let i = 0; i < missing.length; i += 25) chunks.push(missing.slice(i, i + 25));

    void (async () => {
      // all chunks in parallel — the whole section arrives in one round trip
      await Promise.all(
        chunks.map((chunk) => {
          if (cancelled) return Promise.resolve();
          const key = `${lang}::${chunk[0]}::${chunk.length}`;
          let job = inflight.get(key);
          if (!job) {
            job = translateBatch(lang, chunk).finally(() => inflight.delete(key));
            inflight.set(key, job);
          }
          return job.catch(() => {
            /* keep English for this chunk */
          });
        }),
      );
    })();


    return () => {
      cancelled = true;
    };
  }, [lang, list]);

  const cache = load();
  const dict = cache[lang] ?? {};
  const ready = lang === "en" || list.every((t) => dict[t]);

  return {
    tr: (text: string) => (lang === "en" ? text : (dict[text] ?? text)),
    ready,
    lang,
  };
}
