import { useNavigate } from "@tanstack/react-router";
import { Mic, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchSite } from "@/lib/search-index";

type SpeechResultLike = { isFinal: boolean; 0: { transcript: string } };

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<SpeechResultLike> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

export function SearchBar({
  placeholder = "Search anything — surah, hadith, dua, page…",
  initialQuery = "",
  onSearch,
}: {
  placeholder?: string;
  initialQuery?: string;
  onSearch?: (value: string) => void;
}) {
  const [q, setQ] = useState(initialQuery);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState("");
  const [focused, setFocused] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const navigate = useNavigate();

  /** Live suggestions across every indexed item of the whole site. */
  const suggestions = useMemo(() => (focused ? searchSite(q, 8) : []), [q, focused]);

  useEffect(() => () => recRef.current?.abort(), []);

  const submit = (value: string) => {
    const term = value.trim();
    if (!term) return;
    if (onSearch) {
      onSearch(term);
      return;
    }
    void navigate({ to: "/search", search: { q: term } });
  };

  const startMic = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setMicError("Voice search isn't supported in this browser.");
      return;
    }
    const rec = new Ctor();
    recRef.current = rec;
    /* Interim results + several alternatives makes recognition noticeably more
       accurate: the text updates as you speak and only settles when final. */
    rec.lang = navigator.language || "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    setMicError("");

    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (!r) continue;
        const text = r[0]?.transcript ?? "";
        if (r.isFinal) finalText += text;
        else interim += text;
      }
      setQ((finalText + interim).trim());
    };
    rec.onerror = (e) => {
      setListening(false);
      setMicError(
        e.error === "not-allowed"
          ? "Microphone permission is blocked. Allow it in your browser settings."
          : e.error === "no-speech"
            ? "I didn't catch that — please try again."
            : "Voice search didn't work. Please try again.",
      );
    };
    rec.onend = () => {
      setListening(false);
      const said = finalText.trim();
      if (said) submit(said);
    };
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };


  return (
    <div className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-soft focus-within:shadow-glow"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          aria-label={listening ? "Stop voice search" : "Search by voice"}
          aria-pressed={listening}
          onClick={startMic}
          className={`relative rounded-full p-2 transition ${listening ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
        >
          {listening && <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" aria-hidden />}
          <Mic className="relative size-4" />
        </button>
      </form>

      {(listening || micError) && (
        <p role="status" className={`mt-1.5 px-2 text-xs ${listening ? "text-primary" : "text-destructive"}`}>
          {listening ? "Listening… speak now" : micError}
        </p>
      )}

      {suggestions.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-glow">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFocused(false);
                  void navigate({ to: s.to, ...(s.params ? { params: s.params } : {}) } as never);
                }}
                className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-secondary/70"
              >
                <span className="block text-sm font-medium">{s.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {s.section} · {s.subtitle.slice(0, 90)}
                </span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setFocused(false);
                submit(q);
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-primary hover:bg-secondary/70"
            >
              See all results for “{q.trim()}”
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
