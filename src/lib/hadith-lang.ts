import { useCallback, useEffect, useState } from "react";
import type { LangCode } from "./islamic-data";

/**
 * The reading language of the Hadith section ONLY.
 *
 * It is deliberately separate from the global site language: changing it
 * re-translates the hadith text and nothing else — the header, the bottom
 * navigation (Home, Quran, Hadith, Ibadaat, More) and every other page keep
 * the language the user chose in Settings.
 */
const KEY = "rah-e-hidayath-hadith-lang";
const EVENT = "hadith-lang-changed";

function read(fallback: LangCode): LangCode {
  try {
    return (window.localStorage.getItem(KEY) as LangCode) || fallback;
  } catch {
    return fallback;
  }
}

export function useHadithLang(fallback: LangCode = "en") {
  const [lang, setLang] = useState<LangCode>(fallback);

  useEffect(() => {
    setLang(read(fallback));
    const sync = () => setLang(read(fallback));
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [fallback]);

  const change = useCallback((next: LangCode) => {
    setLang(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [lang, change] as const;
}
