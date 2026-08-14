import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Headphones, Loader2, Pause, Play, SkipBack, SkipForward, Square } from "lucide-react";
import { Card } from "@/components/AppShell";
import { MUSHAF_RECITERS, fetchPageAudio } from "@/lib/mushaf-audio";
import { setActiveAudio } from "@/lib/audio-bus";

/** Recitation for the printed page currently on screen. */
export function MushafAudioBar({
  page,
  onPageEnd,
}: {
  page: number;
  onPageEnd?: (() => void) | undefined;
}) {
  const [reciter, setReciter] = useState(MUSHAF_RECITERS[0]!.id);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["mushaf-audio", reciter, page],
    queryFn: () => fetchPageAudio(reciter, page),
    staleTime: Infinity,
  });

  /* A new page always starts from its first ayah. */
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [page, reciter]);

  const track = data?.[index];

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = speed;
    if (playing && track) {
      setActiveAudio(el);
      void el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, [playing, track?.url, speed]);

  useEffect(() => () => setActiveAudio(null), []);

  const total = data?.length ?? 0;

  const onEnded = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      return;
    }
    setPlaying(false);
    if (autoNext) onPageEnd?.();
  };

  const step = (delta: number) => {
    if (!total) return;
    setIndex((i) => Math.min(Math.max(0, i + delta), total - 1));
  };

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <Headphones className="size-4 shrink-0 text-primary" />
          <span>Recite this page</span>
          {track && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium tabular-nums text-primary">
              {track.verseKey} · {index + 1}/{total}
            </span>
          )}
        </p>
        <select
          value={reciter}
          onChange={(e) => setReciter(Number(e.target.value))}
          aria-label="Reciter"
          className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs sm:w-auto sm:max-w-[13rem] sm:shrink-0 sm:py-1"
        >
          {MUSHAF_RECITERS.map((r) => (
            <option key={`${r.id}`} value={r.id}>
              {r.name} · {r.style}
            </option>
          ))}
        </select>
      </div>


      {error && <p className="text-xs text-destructive">Recitation for this page couldn't load. Try another reciter.</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => step(-1)}
          disabled={!total || index === 0}
          aria-label="Previous ayah"
          className="rounded-full border border-border p-2 transition hover:text-primary disabled:opacity-40"
        >
          <SkipBack className="size-4" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={!total}
          className="gradient-hero inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : playing ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
          {playing ? "Pause" : "Play page"}
        </button>
        <button
          onClick={() => step(1)}
          disabled={!total || index + 1 >= total}
          aria-label="Next ayah"
          className="rounded-full border border-border p-2 transition hover:text-primary disabled:opacity-40"
        >
          <SkipForward className="size-4" />
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setIndex(0);
          }}
          aria-label="Stop"
          className="rounded-full border border-border p-2 transition hover:text-primary"
        >
          <Square className="size-4" />
        </button>

        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Recitation speed"
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
        >
          {[0.75, 0.9, 1, 1.25, 1.5].map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>

        <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={autoNext}
            onChange={(e) => setAutoNext(e.target.checked)}
            className="size-3.5 accent-current"
          />
          Turn page automatically
        </label>
      </div>

      <audio ref={audioRef} src={track?.url ?? undefined} onEnded={onEnded} preload="auto" className="hidden" />
    </Card>
  );
}
