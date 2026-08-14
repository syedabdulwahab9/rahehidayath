import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { NasheedTrack } from "@/lib/nasheed-tracks";

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

/**
 * A sticky, full-length nasheed player.
 *
 * The <audio> element streams the MP3 directly (the Internet Archive answers
 * range requests), so playback runs to the very end of the recording and the
 * bar can be dragged to any moment. When one track finishes the next one in the
 * filtered list starts automatically.
 */
export function NasheedPlayer({
  queue,
  index,
  onIndexChange,
  onClose,
}: {
  queue: NasheedTrack[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [repeatOne, setRepeatOne] = useState(false);

  const track = queue[index];

  /* Load + autoplay whenever the chosen track changes. */
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    setError("");
    setLoading(true);
    setCurrent(0);
    setDuration(0);
    el.src = track.url;
    el.load();
    void el
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [track]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = muted ? 0 : volume;
  }, [volume, muted]);

  if (!track) return null;

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const step = (delta: number) => {
    if (queue.length === 0) return;
    onIndexChange((index + delta + queue.length) % queue.length);
  };

  return (
    <div className="nasheed-player">
      <audio
        ref={audioRef}
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 0);
          setLoading(false);
        }}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => {
          setLoading(false);
          setPlaying(true);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setLoading(false);
          setError("This recording could not be reached. Try the next one.");
        }}
        onEnded={() => {
          if (repeatOne) {
            const el = audioRef.current;
            if (el) {
              el.currentTime = 0;
              void el.play();
            }
            return;
          }
          step(1);
        }}
      />

      <div className="nasheed-player__inner">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm leading-tight">{track.title}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {track.artist} · {track.lang} · {track.theme}
          </p>
          {track.native && (
            <p dir="rtl" className="urdu-text truncate text-xs text-primary">
              {track.native}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous nasheed"
            className="nasheed-player__btn"
          >
            <SkipBack className="size-4" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="nasheed-player__play"
          >
            {loading && !playing ? (
              <Loader2 className="size-5 animate-spin" />
            ) : playing ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next nasheed"
            className="nasheed-player__btn"
          >
            <SkipForward className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setRepeatOne((v) => !v)}
            aria-pressed={repeatOne}
            aria-label={repeatOne ? "Repeat one is on" : "Repeat one is off"}
            className={`nasheed-player__btn ${repeatOne ? "text-primary" : ""}`}
          >
            {repeatOne ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
          </button>
        </div>
      </div>

      <div className="nasheed-player__seek">
        <span className="tabular-nums text-[11px] text-muted-foreground">{fmt(current)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.5}
          value={Math.min(current, duration || 0)}
          onChange={(e) => {
            const el = audioRef.current;
            const to = Number(e.target.value);
            setCurrent(to);
            if (el) el.currentTime = to;
          }}
          aria-label="Seek within the nasheed"
          className="nasheed-range"
        />
        <span className="tabular-nums text-[11px] text-muted-foreground">{fmt(duration)}</span>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="nasheed-player__btn hidden sm:inline-flex"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => {
            setMuted(false);
            setVolume(Number(e.target.value));
          }}
          aria-label="Volume"
          className="nasheed-range hidden w-20 sm:block"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close player"
          className="nasheed-player__btn"
        >
          <X className="size-4" />
        </button>
      </div>

      {error && (
        <p role="status" className="px-1 pb-1 text-[11px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
