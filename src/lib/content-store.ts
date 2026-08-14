import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAppState, pushAppState, subscribeAppState } from "./app-state";

/** Admin-managed content. Saved on this device under CONTENT_KEY — the admin
 *  panel can add nasheeds, duas, quiz questions, hadiths and ibadaat sections
 *  without any code edit, and every page merges them with the built-in data. */

export type CustomNasheed = {
  id: string;
  title: string;
  artist: string;
  language: string;
  theme: string;
  /** A YouTube link, a YouTube video id, or search words (e.g. "tajdar e haram vocals only"). */
  youtube: string;
};

export type CustomDua = {
  id: string;
  cat: string;
  title: string;
  ar: string;
  tr: string;
  en: string;
  ur?: string | undefined;
};

export type CustomQuizQ = {
  id: string;
  en: string;
  ur: string;
  options: [string, string, string, string];
  optionsUr: [string, string, string, string];
  answer: number;
};

export type CustomHadith = {
  id: string;
  text: string;
  narrator: string;
  source: string;
  urdu?: string | undefined;
};

export type CustomIbadaat = {
  id: string;
  title: string;
  summary: string;
  body: string;
  urdu?: string | undefined;
};

export type CustomContent = {
  nasheeds: CustomNasheed[];
  duas: CustomDua[];
  quiz: CustomQuizQ[];
  hadiths: CustomHadith[];
  ibadaat: CustomIbadaat[];
};

export const emptyContent = (): CustomContent => ({
  nasheeds: [],
  duas: [],
  quiz: [],
  hadiths: [],
  ibadaat: [],
});

export async function saveCustomContent(content: CustomContent) {
  await pushAppState("content", content);
}

export const uid = () => `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Pulls the shared cloud copy so every device shows the same content. */
function useSharedContent(): [CustomContent, (next: CustomContent) => void, React.MutableRefObject<number>] {
  const [content, setContent] = useState<CustomContent>(emptyContent);
  const editedAt = useRef(0);

  useEffect(() => {
    const accept = (remote: Partial<CustomContent>) => {
      if (Date.now() - editedAt.current < 5000) return;
      setContent({ ...emptyContent(), ...remote });
    };
    void fetchAppState<Partial<CustomContent>>("content").then((remote) => {
      if (remote) accept(remote);
    });
    return subscribeAppState<Partial<CustomContent>>("content", accept);
  }, []);

  return [content, setContent, editedAt];
}

/** Read + write access for the admin editor. */
export function useCustomContent(): [CustomContent, (next: CustomContent) => void] {
  const [content, setContent, editedAt] = useSharedContent();
  const pending = useRef<CustomContent | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (next: CustomContent) => {
      editedAt.current = Date.now();
      pending.current = next;
      setContent(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const value = pending.current;
        if (!value) return;
        pending.current = null;
        void saveCustomContent(value).catch(() => undefined);
      }, 500);
    },
    [setContent, editedAt],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (pending.current) void saveCustomContent(pending.current).catch(() => undefined);
    },
    [],
  );

  return [content, save];
}

/** Read-only snapshot for public pages. */
export function useCustomContentSnapshot(): CustomContent {
  const [content] = useSharedContent();
  return content;
}

/** Build an embeddable YouTube URL from a link, video id, or search words. */
export function youtubeEmbedUrl(youtube: string, fallbackQuery: string): { embed: string; watch: string } {
  const raw = youtube.trim();
  const match = raw.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);
  const bareId = /^[\w-]{11}$/.test(raw) ? raw : null;
  const id = match?.[1] ?? bareId;
  if (id) {
    return {
      embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      watch: `https://www.youtube.com/watch?v=${id}`,
    };
  }
  const q = raw || fallbackQuery;
  return {
    embed: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(q)}&autoplay=1`,
    watch: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  };
}
