import { useEffect } from "react";
import { useSettings } from "./settings";

/**
 * Whole-site language engine.
 *
 * Instead of relying on a hand written dictionary (which only ever covered a
 * handful of labels), this walks every rendered text node and translatable
 * attribute in the page and swaps it into the selected language. Results are
 * cached in localStorage, so a page that has been seen once switches instantly
 * afterwards. Arabic scripture, numbers and anything marked
 * `data-no-translate` is always left untouched.
 */

const CACHE_KEY = "reh-page-translations";
const RTL = new Set(["ar", "ur", "fa"]);
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "CODE", "PRE", "SVG", "TEXTAREA"]);
const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;

type Cache = Record<string, Record<string, string>>;

let cache: Cache | null = null;
const pending = new Set<string>();
let activeRequests = 0;

function load(): Cache {
  if (cache) return cache;
  cache = {};
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (raw) cache = JSON.parse(raw) as Cache;
  } catch {
    cache = {};
  }
  return cache;
}

function persist() {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache ?? {}));
  } catch {
    /* quota — keep the in-memory cache */
  }
}

const ARABIC_GLOBAL = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g;

function translatable(text: string) {
  const value = text.trim();
  if (value.length < 2 || value.length > 900) return false;
  const latin = (value.match(/[A-Za-z]/g) ?? []).length;
  if (!latin) return false; // numbers, symbols, emoji, pure scripture
  const arabic = (value.match(ARABIC_GLOBAL) ?? []).length;
  if (arabic > latin) return false; // Quran, duas, salawat stay as revealed
  return true;
}


const attempts = new Map<string, number>();

async function fetchMissing(lang: string, texts: string[]) {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: lang, texts }),
  });
  const json = (await res.json()) as { translations?: string[] };
  const out = json.translations ?? [];
  const store = load();
  store[lang] = store[lang] ?? {};
  const retry: string[] = [];
  texts.forEach((t, i) => {
    const value = out[i];
    const done = typeof value === "string" && value.trim().length > 0 && value.trim() !== t.trim();
    const tries = (attempts.get(t) ?? 0) + 1;
    attempts.set(t, tries);
    if (done || tries >= 3) {
      // After three honest tries keep the original rather than looping forever.
      store[lang]![t] = done ? value.trim() : t;
    } else {
      retry.push(t);
    }
  });
  persist();
  // A long sentence occasionally comes back unchanged in a big batch — ask again
  // on its own so no paragraph is ever left in English.
  if (retry.length) {
    await Promise.all(
      retry.map(async (t) => {
        await fetchMissing(lang, [t]).catch(() => undefined);
      }),
    );
  }
}


/** Collects every visible English string and rewrites it in `lang`. */
function translatePage(lang: string, onNeedsFetch: (missing: string[]) => void) {
  const store = load();
  const dict = store[lang] ?? {};
  const missing = new Set<string>();

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      if (!translatable(node.nodeValue ?? "")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  for (const node of nodes) {
    const el = node.parentElement as (HTMLElement & { dataset: DOMStringMap }) | null;
    if (!el) continue;
    const raw = node.nodeValue ?? "";
    const key = raw.trim();
    const original = el.dataset["trSource"] === key ? key : key;
    if (lang === "en") continue;
    const hit = dict[original];
    if (hit) {
      if (raw.trim() !== hit) {
        el.dataset["trSource"] = original;
        node.nodeValue = raw.replace(key, hit);
      }
    } else {
      missing.add(original);
    }
  }

  // Attributes (buttons with aria-labels, inputs, images)
  document.querySelectorAll<HTMLElement>("[placeholder],[aria-label],[title],[alt]").forEach((el) => {
    if (el.closest("[data-no-translate]")) return;
    for (const attr of ATTRS) {
      const value = el.getAttribute(attr);
      if (!value || !translatable(value)) continue;
      const stored = el.dataset[`tr${attr.replace(/-/g, "")}`];
      const source = stored ?? value.trim();
      if (lang === "en") {
        if (stored) el.setAttribute(attr, stored);
        continue;
      }
      const hit = dict[source];
      if (hit) {
        if (value !== hit) {
          el.dataset[`tr${attr.replace(/-/g, "")}`] = source;
          el.setAttribute(attr, hit);
        }
      } else {
        missing.add(source);
      }
    }
  });

  if (missing.size) onNeedsFetch([...missing]);
}

export function AutoTranslate() {
  const { settings } = useSettings();
  const lang = settings.lang;

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = RTL.has(lang) ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (lang === "en") {
      // Restore the original English copy without a reload.
      document.querySelectorAll<HTMLElement>("[data-tr-source]").forEach((el) => {
        const source = el.dataset["trSource"];
        if (source && el.childNodes.length === 1 && el.firstChild?.nodeType === Node.TEXT_NODE) {
          el.firstChild.nodeValue = source;
        }
        delete el.dataset["trSource"];
      });
      translatePage("en", () => {});
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const queue = (missing: string[]) => {
      missing.forEach((m) => pending.add(m));
      // Up to 3 batches translate at the same time so a whole page flips
      // language in one wave instead of one slow request after another.
      while (activeRequests < 3 && pending.size) {
        const batch = [...pending].slice(0, 40);
        batch.forEach((b) => pending.delete(b));
        activeRequests += 1;
        void fetchMissing(lang, batch)
          .catch(() => undefined)
          .finally(() => {
            activeRequests -= 1;
            if (!cancelled) run();
          });
      }
    };


    const run = () => {
      if (cancelled) return;
      translatePage(lang, queue);
    };

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, 120);
    };

    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [lang]);

  return null;
}
