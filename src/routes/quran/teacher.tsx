import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  Ear,
  Loader2,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";

import { Card } from "@/components/AppShell";
import { TeacherMushaf } from "@/components/quran/TeacherMushaf";
import { useSettings } from "@/lib/settings";
import {
  MADANI_PAGES,
  fetchMushafPage,
  fetchSurahs,
  prefetchMushafPages,
  type MushafLine,
} from "@/lib/madani-mushaf";
import { MUSHAF_RECITERS, fetchPageAudio } from "@/lib/mushaf-audio";
import { useQuranTeacherEngine, type EngineWord } from "@/lib/teacher/engine";
import {
  TEACHER_MODES,
  loadMistakes,
  loadSession,
  loadStats,
  pullSessionFromCloud,
  pushMistakeToCloud,
  pushSessionToCloud,
  pushStatsToCloud,
  saveMistakes,
  saveSession,
  saveStats,
  type StoredMistake,
  type TeacherMode,
} from "@/lib/quran-teacher";

export const Route = createFileRoute("/quran/teacher")({
  head: () => ({
    meta: [
      { title: "AI Quran Teacher — Live Recitation Tracking | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Recite from the authentic 15 line Madani Mushaf while the Quran teacher follows every word, verifies each recitation before turning it green, stops you on real mistakes, and resumes exactly where you left off.",
      },
      { property: "og:title", content: "AI Quran Teacher — Live Recitation Tracking" },
      {
        property: "og:description",
        content: "Continuous listening, verified word-by-word progress, honest mistake detection and a Mushaf that follows your voice.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuranTeacher,
});

function flatten(lines: MushafLine[]): EngineWord[] {
  const out: EngineWord[] = [];
  for (const line of lines) {
    if (line.kind !== "words") continue;
    for (const w of line.words) {
      if (w.isAyahMarker || !w.verseKey) continue;
      out.push({ id: w.id, text: w.text, verseKey: w.verseKey, line: line.line });
    }
  }
  return out;
}

const STATUS_TEXT: Record<string, string> = {
  idle: "Ready",
  ready: "Ready",
  listening: "Listening",
  processing: "Checking…",
  mistake: "Mistake — waiting for you",
  paused: "Paused",
  denied: "Microphone blocked",
  unsupported: "Microphone unavailable",
  unavailable: "Checking unavailable",
};

function QuranTeacher() {
  const { settings } = useSettings();

  const [session, setSession] = useState(() => loadSession());
  const [stats, setStats] = useState(() => loadStats());
  const [mistakes, setMistakes] = useState<StoredMistake[]>(() => loadMistakes());
  const [debug, setDebug] = useState(false);
  const [resumed, setResumed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const page = session.page;
  const mode = session.mode;

  /* ------------------------------------------------------------ mushaf data */

  const surahs = useQuery({ queryKey: ["mushaf-surahs"], queryFn: fetchSurahs, staleTime: Infinity });
  const pageQuery = useQuery({
    queryKey: ["madani-page", page],
    queryFn: () => fetchMushafPage(page),
    staleTime: Infinity,
    placeholderData: (prev) => prev,
  });

  const words = useMemo(() => flatten(pageQuery.data?.lines ?? []), [pageQuery.data]);
  const indexById = useMemo(() => {
    const map = new Map<number, number>();
    words.forEach((w, i) => map.set(w.id, i));
    return map;
  }, [words]);
  const surahNames = useMemo(() => {
    const out: Record<number, string> = {};
    for (const s of surahs.data ?? []) out[s.id] = s.nameArabic;
    return out;
  }, [surahs.data]);

  useEffect(() => {
    prefetchMushafPages(page);
  }, [page]);

  /* ------------------------------------------------- position, saved for good */

  const saveProgress = useCallback(
    (index: number) => {
      const word = words[index];
      setSession((prev) => {
        const updated = {
          ...prev,
          surah: Number(word?.verseKey.split(":")[0] ?? prev.surah) || prev.surah,
          ayah: Number(word?.verseKey.split(":")[1] ?? prev.ayah) || prev.ayah,
          line: word?.line ?? prev.line,
          wordIndex: index,
          language: "en",
          updatedAt: new Date().toISOString(),
        };
        saveSession(updated);
        return updated;
      });
    },
    [words],
  );

  const goToPage = useCallback((next: number) => {
    const clamped = Math.min(Math.max(1, next), MADANI_PAGES);
    setSession((prev) => {
      const updated = { ...prev, page: clamped, wordIndex: 0, updatedAt: new Date().toISOString() };
      saveSession(updated);
      return updated;
    });
  }, []);

  const engine = useQuranTeacherEngine({
    words,
    mode,
    startIndex: session.wordIndex,
    onPageComplete: () => {
      goToPage(page + 1);
      setStats((prev) => {
        const next = { ...prev, pages: prev.pages + 1 };
        saveStats(next);
        void pushStatsToCloud(next).catch(() => undefined);
        return next;
      });
    },
    onProgress: saveProgress,
  });

  const { cursor, stateOf, status, level, mistake, hint, notice, diagnostics } = engine;
  const currentWord = words[cursor];
  const currentAyah = currentWord?.verseKey ?? "";

  /* Only a real page change re-seats the reading place — never a re-render,
     a recognition event, or a refetch of the same page. */
  const lastPageRef = useRef<number | null>(null);
  useEffect(() => {
    if (!words.length) return;
    if (lastPageRef.current === page) return;
    const first = lastPageRef.current === null;
    lastPageRef.current = page;
    engine.resetPage(first ? Math.min(session.wordIndex, words.length - 1) : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, words.length]);

  /* The account's saved place wins when it is newer than this device's. */
  useEffect(() => {
    let alive = true;
    void pullSessionFromCloud().then((cloud) => {
      if (!alive || !cloud) return;
      if (cloud.updatedAt > session.updatedAt) setSession(cloud);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Mirror the saved place to the account, gently. */
  useEffect(() => {
    const timer = window.setTimeout(() => void pushSessionToCloud(session).catch(() => undefined), 2000);
    return () => window.clearTimeout(timer);
  }, [session]);

  /* ----------------------------------------------------------- example audio */

  const pageAudio = useQuery({
    queryKey: ["teacher-audio", session.qari, page],
    queryFn: () => fetchPageAudio(session.qari, page),
    staleTime: Infinity,
  });

  const playAyah = useCallback(
    (verseKey: string) => {
      const file = pageAudio.data?.find((a) => a.verseKey === verseKey);
      if (!file) return;
      engine.setPaused(true);
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = file.url;
      audio.onended = () => engine.setPaused(false);
      void audio.play().catch(() => engine.setPaused(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageAudio.data],
  );

  /* ----------------------------------------------- remember every correction */

  const loggedRef = useRef<string>("");
  useEffect(() => {
    if (!mistake) return;
    const key = `${page}-${mistake.index}-${mistake.heard}`;
    if (loggedRef.current === key) return;
    loggedRef.current = key;
    const entry: StoredMistake = {
      id: `${Date.now()}-${mistake.index}`,
      surah: Number(currentAyah.split(":")[0]) || session.surah,
      ayah: Number(currentAyah.split(":")[1]) || session.ayah,
      wordIndex: mistake.index,
      word: mistake.expected,
      rule: mistake.tajweed?.rule ?? (mistake.kind === "skipped" ? "word-skipped" : "word-substituted"),
      severity: mistake.tajweed?.severity ?? "major",
      explanation:
        mistake.tajweed?.explanation ??
        (mistake.kind === "skipped" ? "A word was skipped here." : "A different word was recited here."),
      corrected: false,
      at: new Date().toISOString(),
    };
    setMistakes((prev) => {
      const next = [...prev, entry].slice(-400);
      saveMistakes(next);
      return next;
    });
    void pushMistakeToCloud(entry).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mistake]);

  /* ----------------------------------------------------------------- helpers */

  const setMode = (next: TeacherMode) => {
    setSession((prev) => {
      const updated = { ...prev, mode: next, updatedAt: new Date().toISOString() };
      saveSession(updated);
      return updated;
    });
  };

  const startOver = () => {
    engine.resetPage(0);
    saveProgress(0);
  };

  const progress = words.length ? Math.round(((cursor + 1) / words.length) * 100) : 0;
  const modeInfo = TEACHER_MODES.find((m) => m.id === mode);
  const listening = status === "listening" || status === "processing" || status === "mistake" || status === "paused";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link to="/quran" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="size-4" /> Quran
        </Link>
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3.5" /> AI Quran Teacher
        </span>
      </div>

      <div className="text-center">
        <h1 className="font-display text-2xl">Your Quran teacher, sitting beside you</h1>
        <p className="mx-auto mt-1 max-w-xl text-xs text-muted-foreground">
          Recite from the authentic Madani Mushaf. Every word is verified against your voice before it turns green —
          nothing is marked correct on a guess.
        </p>
      </div>

      {/* --- the lesson bar --- */}
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => (listening ? void engine.stop() : void engine.start())}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              listening ? "bg-destructive text-destructive-foreground" : "gradient-hero text-primary-foreground"
            }`}
          >
            {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            {listening ? "Stop the lesson" : "Start recitation"}
          </button>

          <div className="flex h-2 w-24 items-center overflow-hidden rounded-full bg-muted" aria-hidden>
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-100"
              style={{ width: `${Math.round(level * 100)}%` }}
            />
          </div>

          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {status === "processing" ? <Loader2 className="size-3.5 animate-spin" /> : <Ear className="size-3.5" />}
            {STATUS_TEXT[status] ?? "Ready"}
          </span>

          <div className="ms-auto flex flex-wrap items-center gap-2 text-xs">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as TeacherMode)}
              aria-label="Learning mode"
              className="rounded-lg border border-border bg-background px-2 py-1.5"
            >
              {TEACHER_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} mode
                </option>
              ))}
            </select>
            <select
              value={session.qari}
              onChange={(e) =>
                setSession((prev) => {
                  const updated = { ...prev, qari: Number(e.target.value), updatedAt: new Date().toISOString() };
                  saveSession(updated);
                  return updated;
                })
              }
              aria-label="Reciter for the example recitation"
              className="max-w-[11rem] rounded-lg border border-border bg-background px-2 py-1.5"
            >
              {MUSHAF_RECITERS.map((r) => (
                <option key={`${r.id}-${r.style}`} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">{modeInfo?.blurb}</p>

        {/* --- live recitation status --- */}
        <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-5">
          <Meta label="Surah" value={surahs.data?.find((s) => s.id === Number(currentAyah.split(":")[0]))?.nameSimple ?? "—"} />
          <Meta label="Ayah" value={currentAyah.split(":")[1] ?? "—"} />
          <Meta label="Line" value={String(currentWord?.line ?? "—")} />
          <Meta label="Word" value={`${Math.min(cursor + 1, words.length || 1)} / ${words.length || "…"}`} />
          <Meta label="Progress" value={`${progress}%`} />
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full gradient-hero transition-[width]" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <button
            onClick={() => {
              setResumed(true);
              engine.seek(session.wordIndex);
            }}
            className="rounded-full border border-border px-3 py-1 hover:text-primary"
          >
            Continue recitation
          </button>
          <button onClick={startOver} className="rounded-full border border-border px-3 py-1 hover:text-primary">
            Start over
          </button>
          <button
            onClick={() => setDebug((d) => !d)}
            className="ms-auto rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-primary"
          >
            {debug ? "Hide diagnostics" : "Diagnostics"}
          </button>
        </div>
        {resumed && <p className="text-[11px] text-muted-foreground">Resumed at your saved word.</p>}
      </Card>

      {notice && (
        <Card className="flex items-center justify-between gap-3 border-destructive/40 text-sm text-destructive">
          <span>{notice}</span>
          <button onClick={engine.dismissNotice} className="text-xs underline">
            Dismiss
          </button>
        </Card>
      )}
      {!notice && hint && <Card className="text-sm text-muted-foreground">{hint}</Card>}

      {/* --- the mistake --- */}
      {mistake && (
        <Card className="space-y-2 border-destructive/50">
          <h2 className="font-display text-base text-destructive">Recitation mistake</h2>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Expected</p>
              <p className="quran-page-text text-2xl" dir="rtl">
                {mistake.expected}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Heard</p>
              <p className="quran-page-text text-2xl text-destructive" dir="rtl">
                {mistake.heard || "—"}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {mistake.kind === "skipped"
              ? "This word was skipped. Please recite it before continuing."
              : "A different word was recited here. Please repeat this word."}
          </p>
          {mistake.tajweed && (
            <p className="text-sm text-primary">
              {mistake.tajweed.explanation} {mistake.tajweed.suggestion}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => playAyah(words[mistake.index]?.verseKey ?? currentAyah)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 hover:text-primary"
            >
              <Play className="size-3.5" /> Play correct recitation
            </button>
            <button
              onClick={engine.resolveMistake}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 hover:text-primary"
            >
              <RotateCcw className="size-3.5" /> Try again
            </button>
          </div>
        </Card>
      )}

      {debug && (
        <Card className="space-y-1 border-primary/30 font-mono text-[11px] leading-5">
          <p>Microphone: {diagnostics.micActive ? "ACTIVE" : "INACTIVE"} · level {Math.round(diagnostics.level * 100)}%</p>
          <p>Recognition: {diagnostics.recognition.toUpperCase()} · clips {diagnostics.clips}</p>
          <p dir="rtl">Raw: {diagnostics.rawTranscript || "—"}</p>
          <p dir="rtl">Normalized: {diagnostics.normalizedTranscript || "—"}</p>
          <p dir="rtl">Expected: {diagnostics.expectedWord || "—"} · Detected: {diagnostics.detectedWord || "—"}</p>
          <p>Confidence: {diagnostics.confidence} · Alignment: {diagnostics.alignment}</p>
          <p>
            Surah {currentAyah.split(":")[0] ?? "—"} · Ayah {currentAyah.split(":")[1] ?? "—"} · Word {cursor} · Page{" "}
            {page} · Line {currentWord?.line ?? "—"}
          </p>
          <p>Error state: {mistake ? `${mistake.kind} @ ${mistake.index}` : "none"}</p>
          {diagnostics.lastError && <p className="text-destructive">Last error: {diagnostics.lastError}</p>}
        </Card>
      )}

      {/* --- the page --- */}
      {pageQuery.isLoading && !pageQuery.data && <div className="h-[34rem] rounded-3xl border border-border bg-card shimmer" />}
      {pageQuery.error && <Card className="text-sm text-destructive">Couldn't load this Mushaf page. Please try again.</Card>}
      {pageQuery.data && (
        <div className={`mushaf-frame bg-card p-3 sm:p-6 ${settings.tajweedColors ? "tajweed-on" : ""}`}>
          <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>{surahs.data?.find((s) => s.id === pageQuery.data.surahs[0])?.nameSimple ?? ""}</span>
            <span>Juz {pageQuery.data.juz}</span>
            <span>Page {pageQuery.data.page}</span>
          </div>

          <TeacherMushaf
            lines={pageQuery.data.lines}
            surahNames={surahNames}
            indexOf={(id) => indexById.get(id)}
            stateOf={stateOf}
            cursor={cursor}
            currentLine={currentWord?.line}
            autoScroll={!mistake}
            onWordClick={(index) => engine.seek(index)}
            size={settings.arabicSize}
            fade={mode === "hifz"}
          />

          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <button disabled={page <= 1} onClick={() => goToPage(page - 1)} className="hover:text-primary disabled:opacity-40">
              ‹ Previous page
            </button>
            <span>Tap any word to start the teacher from there</span>
            <button disabled={page >= MADANI_PAGES} onClick={() => goToPage(page + 1)} className="hover:text-primary disabled:opacity-40">
              Next page ›
            </button>
          </div>
        </div>
      )}

      {/* --- today's report --- */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="space-y-2">
          <h2 className="font-display text-base">Today</h2>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <Stat label="Words recited" value={stats.words} />
            <Stat label="Pages finished" value={stats.pages} />
            <Stat label="Day streak" value={stats.streak} />
            <Stat label="Corrections" value={mistakes.filter((m) => m.at.slice(0, 10) === stats.day).length} />
          </dl>
        </Card>

        <Card className="space-y-2">
          <h2 className="font-display text-base">Recent corrections</h2>
          {mistakes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing yet. Start reciting and every correction will be collected here for revision.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {[...mistakes].reverse().slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-3 border-b border-border/50 pb-2 last:border-0">
                  <div>
                    <p className="quran-page-text text-lg" dir="rtl">
                      {m.word}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{m.explanation}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {m.surah}:{m.ayah}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="pt-1">
            <button
              onClick={() => playAyah(currentAyah)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs hover:text-primary"
            >
              <Volume2 className="size-3.5" /> Hear this ayah
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-xs font-semibold">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border/60 px-3 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-base font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
