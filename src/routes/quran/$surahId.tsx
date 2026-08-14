import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookText, ChevronLeft, ChevronRight, Languages, Pause, Play, ScrollText } from "lucide-react";
import { Card } from "@/components/AppShell";
import { useSettings } from "@/lib/settings";
import { ayahAudioUrl, fetchSurah, fetchSurahList, fetchTafsir, type Ayah } from "@/lib/quran-api";
import { getLanguage, LANGUAGES, RECITERS } from "@/lib/islamic-data";
import { setActiveAudio, stopAllAudio } from "@/lib/audio-bus";

export const Route = createFileRoute("/quran/$surahId")({
  head: ({ params }) => ({
    meta: [
      { title: `Surah ${params.surahId} — Read, Listen & Tafseer | Raah e Hidayath` },
      { name: "description", content: "Arabic text, recitation, translation, tafseer and full explanation of every ayah in your language." },
      { property: "og:title", content: `Surah ${params.surahId} | Raah e Hidayath` },
      { property: "og:description", content: "Read, listen and understand every ayah." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SurahPage,
});

type Mode = "read" | "audio" | "translation" | "tafseer";

const MODES: Array<{ id: Mode; label: string; icon: typeof BookText }> = [
  { id: "read", label: "Read only", icon: BookText },
  { id: "audio", label: "Recitation", icon: Play },
  { id: "translation", label: "Translation", icon: Languages },
  { id: "tafseer", label: "Tafseer", icon: ScrollText },
];

/* Modes that only show text in a chosen language — these carry their own
   page-level language and never any audio. */
const TEXT_MODES: Mode[] = ["translation", "tafseer"];

function SurahPage() {
  const { surahId } = Route.useParams();
  const num = Number(surahId);
  const { settings, update } = useSettings();
  const [mode, setMode] = useState<Mode>("read");
  /* Page-local language: it only affects this surah page. The rest of the app
     (bottom navigation, home, ibadaat …) keeps the global language, and this
     resets to English every time the page is opened again. */
  const [pageLang, setPageLang] = useState("en");
  const [playing, setPlaying] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isTextMode = TEXT_MODES.includes(mode);
  const activeLang = isTextMode ? pageLang : settings.lang;
  const lang = getLanguage(activeLang);

  useEffect(() => {
    setPageLang("en");
  }, [num]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["surah", num, activeLang, settings.translationEdition],
    queryFn: () => fetchSurah(num, activeLang, isTextMode ? "auto" : settings.translationEdition),
    staleTime: 1000 * 60 * 60,
  });
  const { data: surahs } = useQuery({ queryKey: ["surahs"], queryFn: fetchSurahList, staleTime: Infinity });
  const meta = surahs?.find((s) => s.number === num);

  const ayahs = useMemo(() => data?.ayahs ?? [], [data]);

  const stop = useCallback(() => {
    audioRef.current = null;
    stopAllAudio();
    setPlaying(null);
  }, []);

  useEffect(() => stop, [stop]);

  /* Any change of mode, reciter or surah must silence whatever is playing. */
  useEffect(() => {
    stop();
  }, [mode, settings.reciter, num, stop]);

  /* Remember where the reader is, so leaving the site and coming back later
     offers "continue reading" from exactly this surah and ayah. */
  useEffect(() => {
    if (!meta || !ayahs.length) return;
    const save = (ayah: number) =>
      update({
        lastSurah: {
          number: meta.number,
          name: meta.englishName,
          translation: meta.englishNameTranslation,
          ayah,
          total: meta.numberOfAyahs,
        },
      });

    save(1);

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        let current = 1;
        for (const a of ayahs) {
          const el = document.getElementById(`ayah-${a.numberInSurah}`);
          if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) current = a.numberInSurah;
        }
        save(current);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta?.number, ayahs.length]);


  const playFrom = useCallback(
    (index: number) => {
      const ayah = ayahs[index];
      if (!ayah || mode !== "audio") {
        stop();
        return;
      }
      audioRef.current?.pause();
      audioRef.current = null;
      setPlaying(index);
      document.getElementById(`ayah-${ayah.numberInSurah}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

      const audio = new Audio(ayahAudioUrl(ayah.number, settings.reciter, settings.audioQuality));
      audio.playbackRate = settings.playbackSpeed;
      audioRef.current = audio;
      setActiveAudio(audio);
      let played = 0;
      audio.onended = () => {
        played += 1;
        if (played < settings.repeatVerses) {
          audio.currentTime = 0;
          void audio.play();
        } else playFrom(index + 1);
      };
      void audio.play();
    },
    [ayahs, mode, stop, settings.reciter, settings.audioQuality, settings.playbackSpeed, settings.repeatVerses],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Link to="/quran" className="inline-flex min-w-0 items-center gap-1 truncate text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="size-4 shrink-0" /> All Surahs
        </Link>
        <div className="flex shrink-0 gap-2 text-sm">
          {num > 1 && (
            <Link to="/quran/$surahId" params={{ surahId: String(num - 1) }} className="rounded-full border border-border px-3 py-1 hover:text-primary">
              <ChevronLeft className="inline size-3" /> Prev
            </Link>
          )}
          {num < 114 && (
            <Link to="/quran/$surahId" params={{ surahId: String(num + 1) }} className="rounded-full border border-border px-3 py-1 hover:text-primary">
              Next <ChevronRight className="inline size-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl gradient-hero p-5 text-primary-foreground shadow-glow sm:p-6">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-accent/20 blur-2xl animate-float" aria-hidden />
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Surah {num}</p>
        <h1 className="mt-2 break-words font-display text-2xl sm:text-3xl">{meta?.englishName ?? "…"}</h1>
        <p className="text-sm text-primary-foreground/80">
          {meta?.englishNameTranslation} · {meta?.numberOfAyahs} ayahs · {meta?.revelationType}
        </p>
        <p className="arabic-ayah mt-3 break-words text-2xl text-accent sm:text-3xl">{meta?.name}</p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              mode === id
                ? "border-transparent gradient-hero text-primary-foreground shadow-soft"
                : "border-border bg-card text-muted-foreground hover:text-primary"
            }`}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {mode === "read" && (
        <Card className="text-sm text-muted-foreground">
          Read only — just the ayats of this surah. Switch to Recitation, Translation or Tafseer above whenever you
          need them.
        </Card>
      )}

      {mode === "audio" && (
        <Card className="space-y-3 text-sm">
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-muted-foreground">Reciter</span>
            <select
              value={settings.reciter}
              onChange={(e) => update({ reciter: e.target.value })}
              className="w-full min-w-0 rounded-lg border border-border bg-background px-2 py-1.5"
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · {r.style}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Playback speed — {settings.playbackSpeed.toFixed(2)}×</span>
            <input
              type="range" min={0.5} max={2} step={0.05}
              value={settings.playbackSpeed}
              onChange={(e) => update({ playbackSpeed: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </label>
          <button
            onClick={() => (playing === null ? playFrom(0) : stop())}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full gradient-gold px-4 py-2.5 font-semibold text-accent-foreground sm:w-auto"
          >
            {playing === null ? <Play className="size-4" /> : <Pause className="size-4" />}
            {playing === null ? "Play recitation — whole surah" : "Stop"}
          </button>
        </Card>
      )}

      {isTextMode && (
        <Card className="space-y-2 text-sm">
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-muted-foreground">Language for this surah page</span>
            <select
              value={pageLang}
              onChange={(e) => setPageLang(e.target.value)}
              className="w-full min-w-0 rounded-lg border border-border bg-background px-2 py-1.5"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} — {l.native}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-muted-foreground">
            This only changes this surah page. The rest of the app stays in English.
          </p>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-border bg-card shimmer" />
          ))}
        </div>
      )}
      {error && <Card className="text-sm text-destructive">Couldn't load this surah. Please retry.</Card>}

      <div className="space-y-4" dir={lang.rtl && isTextMode ? "rtl" : "ltr"}>
        {ayahs.map((ayah, i) => (
          <AyahCard
            key={ayah.number}
            ayah={ayah}
            surah={num}
            mode={mode}
            langCode={activeLang}
            rtlTranslation={!!lang.rtl}
            urdu={activeLang === "ur"}
            arabicSize={settings.arabicSize}
            transliteration={settings.showTransliteration}
            tafsirSlug={isTextMode ? "auto" : settings.tafsirSlug}
            isPlaying={playing === i}
            onPlay={() => (playing === i ? stop() : playFrom(i))}
          />
        ))}
      </div>
    </div>
  );
}

function AyahCard(props: {
  ayah: Ayah;
  surah: number;
  mode: Mode;
  langCode: string;
  rtlTranslation: boolean;
  urdu: boolean;
  arabicSize: number;
  transliteration: boolean;
  tafsirSlug: string;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  const {
    ayah, mode, surah, langCode, rtlTranslation, urdu, arabicSize, transliteration,
    tafsirSlug, isPlaying, onPlay,
  } = props;
  const [openTafsir, setOpenTafsir] = useState(false);

  /* Collapse content when the page language changes, so nothing is stale. */
  useEffect(() => {
    setOpenTafsir(false);
  }, [langCode]);

  const tafsirQuery = useQuery({
    queryKey: ["tafsir", surah, ayah.numberInSurah, langCode, tafsirSlug],
    queryFn: () => fetchTafsir(surah, ayah.numberInSurah, langCode, tafsirSlug),
    enabled: openTafsir,
    staleTime: Infinity,
  });

  const textDirection = rtlTranslation ? "text-right" : "";

  return (
    <Card id={`ayah-${ayah.numberInSurah}`} className={`overflow-hidden ${isPlaying ? "ring-2 ring-primary/50" : ""}`}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2" dir="ltr">
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {surah}:{ayah.numberInSurah}
        </span>
        <div className="flex min-w-0 items-center justify-end gap-2 text-xs text-muted-foreground">
          <span className="truncate">Juz {ayah.juz} · Page {ayah.page}</span>
          {mode === "audio" && (
            <button
              onClick={onPlay}
              aria-label="Play recitation"
              title="Play recitation"
              className="shrink-0 rounded-full border border-border p-1.5 text-primary transition hover:bg-primary/10"
            >
              {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
          )}
        </div>
      </div>

      <p className="arabic-ayah mt-4 break-words text-right" style={{ fontSize: `${arabicSize}px`, lineHeight: 2 }}>
        {ayah.arabic}
      </p>

      {mode !== "read" && transliteration && ayah.transliteration && (
        <p className={`mt-3 break-words text-sm italic text-muted-foreground ${textDirection}`}>{ayah.transliteration}</p>
      )}

      {mode !== "read" && (
        <p className={`mt-3 break-words text-[15px] leading-relaxed ${urdu ? "urdu-text text-right" : textDirection}`}>
          {ayah.translation}
        </p>
      )}

      {mode === "tafseer" && (
        <div className="mt-4">
          <button onClick={() => setOpenTafsir((v) => !v)} className="text-sm font-semibold text-primary hover:underline">
            {openTafsir ? "Hide tafseer" : "Show tafseer of this ayah"}
          </button>
          {openTafsir && (
            <div className="mt-3 rounded-xl bg-secondary/60 p-4 text-sm leading-relaxed">
              {tafsirQuery.isLoading && <span className="text-muted-foreground">Loading tafseer…</span>}
              {tafsirQuery.error && <span className="text-destructive">Tafseer unavailable for this ayah.</span>}
              {tafsirQuery.data && (
                <div
                  className={`break-words ${urdu ? "urdu-text text-right" : textDirection}`}
                  dangerouslySetInnerHTML={{ __html: tafsirQuery.data }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
