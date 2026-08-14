import { useEffect, useState } from "react";

/* ---- Bookmarks (localStorage) ---- */
export type HadithBookmark = {
  id: string; // `${bookId}-${hadithnumber}`
  bookId: string;
  bookName: string;
  hadithnumber: number;
  text: string;
  reference?: string | undefined;
  grade?: string | undefined;
  savedAt: number;
};

const BOOKMARK_KEY = "rah-e-hidayath-hadith-bookmarks";

function readBookmarks(): HadithBookmark[] {
  try {
    const raw = window.localStorage.getItem(BOOKMARK_KEY);
    return raw ? (JSON.parse(raw) as HadithBookmark[]) : [];
  } catch {
    return [];
  }
}

function writeBookmarks(list: HadithBookmark[]) {
  try {
    window.localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("hadith-bookmarks-changed"));
}

export function useHadithBookmarks() {
  const [bookmarks, setBookmarks] = useState<HadithBookmark[]>([]);

  useEffect(() => {
    setBookmarks(readBookmarks());
    const onChange = () => setBookmarks(readBookmarks());
    window.addEventListener("hadith-bookmarks-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("hadith-bookmarks-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  const toggle = (b: HadithBookmark) => {
    const list = readBookmarks();
    const exists = list.some((x) => x.id === b.id);
    const next = exists ? list.filter((x) => x.id !== b.id) : [b, ...list];
    writeBookmarks(next);
    setBookmarks(next);
    return !exists;
  };

  const remove = (id: string) => {
    const next = readBookmarks().filter((x) => x.id !== id);
    writeBookmarks(next);
    setBookmarks(next);
  };

  return { bookmarks, isBookmarked, toggle, remove };
}

/* ---- Reading font size (localStorage, independent of global settings) ---- */
const FONT_KEY = "rah-e-hidayath-hadith-font-size";
const FONT_MIN = 13;
const FONT_MAX = 24;
const FONT_DEFAULT = 16;

export function useHadithFontSize() {
  const [size, setSize] = useState(FONT_DEFAULT);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FONT_KEY);
      if (raw) setSize(Math.min(FONT_MAX, Math.max(FONT_MIN, Number(raw) || FONT_DEFAULT)));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (v: number) => {
    const clamped = Math.min(FONT_MAX, Math.max(FONT_MIN, v));
    setSize(clamped);
    try {
      window.localStorage.setItem(FONT_KEY, String(clamped));
    } catch {
      /* ignore */
    }
  };

  return {
    size,
    increase: () => persist(size + 1),
    decrease: () => persist(size - 1),
    canIncrease: size < FONT_MAX,
    canDecrease: size > FONT_MIN,
  };
}
