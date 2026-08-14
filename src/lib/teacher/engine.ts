/**
 * QuranTeacherEngine — the brain of the recitation teacher.
 *
 *   AudioCapture → SpeechRecognitionProvider → ArabicNormalizer → QuranAligner
 *   → ConfidenceEngine → ProgressTracker / ErrorDetector
 *
 * The engine owns exactly one microphone, one reading position and one error
 * state. It never advances the green position without transcript evidence, and
 * it never resets the position because of a recognition event.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RecitationListener, blobToBase64, type ListenerFailure } from "@/lib/recitation-listener";
import { transcribeRecitation, analyzeTajweed, type TajweedNote } from "@/lib/quran-teacher.functions";
import { align, type AlignResult } from "./aligner";
import { normalizeArabic, tokenize } from "./arabic";

export type WordState = "pending" | "done" | "current" | "error";

export type MicStatus =
  | "idle"
  | "ready"
  | "listening"
  | "processing"
  | "mistake"
  | "paused"
  | "denied"
  | "unsupported"
  | "unavailable";

export type EngineWord = { id: number; text: string; verseKey: string; line: number };

export type EngineMistake = {
  index: number;
  expected: string;
  heard: string;
  kind: "substituted" | "skipped";
  tajweed?: TajweedNote;
};

export type Diagnostics = {
  micActive: boolean;
  level: number;
  recognition: "idle" | "active" | "failed";
  rawTranscript: string;
  normalizedTranscript: string;
  expectedWord: string;
  detectedWord: string;
  confidence: number;
  alignment: string;
  clips: number;
  lastError: string;
};

/** Words of the Mushaf handed to the aligner in one comparison. */
const LOOKAHEAD = 14;
/** Speed the green "finger" travels between confirmed words. */
const WALK_MS = 55;

export function useQuranTeacherEngine(options: {
  words: EngineWord[];
  mode: string;
  startIndex: number;
  /** Called when the final word of the page has been verified. */
  onPageComplete: () => void;
  onProgress?: (index: number) => void;
}) {
  const { words, mode, startIndex, onPageComplete, onProgress } = options;

  const [cursor, setCursor] = useState(startIndex);
  const [states, setStates] = useState<Record<number, WordState>>({});
  const [status, setStatus] = useState<MicStatus>("idle");
  const [level, setLevel] = useState(0);
  const [mistake, setMistake] = useState<EngineMistake | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostics>({
    micActive: false,
    level: 0,
    recognition: "idle",
    rawTranscript: "",
    normalizedTranscript: "",
    expectedWord: "",
    detectedWord: "",
    confidence: 0,
    alignment: "idle",
    clips: 0,
    lastError: "",
  });

  const cursorRef = useRef(startIndex);
  const mistakeRef = useRef<EngineMistake | null>(null);
  const wordsRef = useRef(words);
  const modeRef = useRef(mode);
  const listenerRef = useRef<RecitationListener | null>(null);
  const busyRef = useRef(false);
  const walkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clipsRef = useRef(0);
  const listeningRef = useRef(false);

  wordsRef.current = words;
  modeRef.current = mode;

  const expectedTokens = useMemo(() => words.map((w) => normalizeArabic(w.text)), [words]);
  const expectedRef = useRef(expectedTokens);
  expectedRef.current = expectedTokens;

  /* ------------------------------------------------------------- position */

  const seek = useCallback(
    (index: number, opts: { clearBehind?: boolean } = {}) => {
      stopWalk();
      const clamped = Math.max(0, Math.min(index, Math.max(0, wordsRef.current.length - 1)));
      cursorRef.current = clamped;
      setCursor(clamped);
      mistakeRef.current = null;
      setMistake(null);
      setHint(null);
      if (opts.clearBehind) setStates({});
      setStatus(listeningRef.current ? "listening" : "ready");
      onProgress?.(clamped);
    },
    [onProgress],
  );

  function stopWalk() {
    if (walkRef.current) {
      clearInterval(walkRef.current);
      walkRef.current = null;
    }
  }

  /** Moves the green highlight one word at a time, like a teacher's finger. */
  const walkTo = useCallback(
    (target: number, done?: () => void) => {
      stopWalk();
      if (cursorRef.current >= target) {
        done?.();
        return;
      }
      walkRef.current = setInterval(() => {
        const at = cursorRef.current;
        if (at >= target) {
          stopWalk();
          done?.();
          return;
        }
        setStates((prev) => ({ ...prev, [at]: "done" }));
        cursorRef.current = at + 1;
        setCursor(at + 1);
        onProgress?.(at + 1);
      }, WALK_MS);
    },
    [onProgress],
  );

  useEffect(() => stopWalk, []);

  /* --------------------------------------------------------- one audio clip */

  const handleClip = useCallback(
    async (wav: Blob) => {
      if (busyRef.current) return;
      busyRef.current = true;
      const start = cursorRef.current;
      const all = wordsRef.current;
      const expected = expectedRef.current.slice(start, start + LOOKAHEAD);
      if (!expected.length) {
        busyRef.current = false;
        return;
      }

      setStatus((s) => (s === "mistake" ? s : "processing"));
      clipsRef.current += 1;

      try {
        const audio = await blobToBase64(wav);
        const result = await transcribeRecitation({ data: { audio } });

        if (result.unavailable) {
          setStatus("unavailable");
          setNotice("Advanced recitation checking is temporarily unavailable. You can keep reading the Mushaf normally.");
          return;
        }

        const heard = tokenize(result.text);
        const verdict = align(heard, expected);
        publishDiagnostics(result.text, heard, expected, verdict, start);

        if (!heard.length || (verdict.uncertain && verdict.advance === 0)) {
          setHint(heard.length ? "Please repeat that a little more clearly." : "Listening…");
          setStatus(mistakeRef.current ? "mistake" : "listening");
          return;
        }

        setHint(null);
        setNotice(null);

        /* Standing on a red word? The learner must say that exact word first. */
        if (mistakeRef.current) {
          if (verdict.advance > 0) {
            const fixed = mistakeRef.current.index;
            setStates((prev) => ({ ...prev, [fixed]: "done" }));
            mistakeRef.current = null;
            setMistake(null);
            advance(start, verdict.advance);
          } else {
            setStatus("mistake");
          }
          return;
        }

        if (verdict.mistake) {
          const at = start + verdict.mistake.offset;
          const heardWord = verdict.mistake.heard;
          const kind = verdict.mistake.kind;
          walkTo(at, () => {
            setStates((prev) => ({ ...prev, [at]: "error" }));
            const entry: EngineMistake = {
              index: at,
              expected: all[at]?.text ?? "",
              heard: heardWord,
              kind,
            };
            mistakeRef.current = entry;
            setMistake(entry);
            setStatus("mistake");
          });
          if (modeRef.current === "tajweed") void addTajweedNote(audio, expected, at);
          return;
        }

        advance(start, verdict.advance);
      } catch (err) {
        const message = err instanceof Error ? err.message : "The recognition service did not respond.";
        setNotice(message);
        setDiagnostics((d) => ({ ...d, recognition: "failed", lastError: message }));
        setStatus(listeningRef.current ? "listening" : "ready");
      } finally {
        busyRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walkTo],
  );

  function advance(start: number, count: number) {
    const target = Math.min(wordsRef.current.length, start + count);
    walkTo(target, () => {
      setStatus(listeningRef.current ? "listening" : "ready");
      if (target >= wordsRef.current.length && wordsRef.current.length) onPageComplete();
    });
    setStatus(listeningRef.current ? "listening" : "ready");
  }

  async function addTajweedNote(audio: string, expected: string[], at: number) {
    try {
      const { note } = await analyzeTajweed({ data: { audio, expected } });
      if (!note) return;
      setMistake((prev) => (prev && prev.index === at ? { ...prev, tajweed: note } : prev));
    } catch {
      /* Tajweed opinion is optional — never block the lesson on it. */
    }
  }

  function publishDiagnostics(raw: string, heard: string[], expected: string[], verdict: AlignResult, start: number) {
    setDiagnostics({
      micActive: listeningRef.current,
      level,
      recognition: "active",
      rawTranscript: raw,
      normalizedTranscript: heard.join(" "),
      expectedWord: expected[0] ?? "",
      detectedWord: heard[0] ?? "",
      confidence: Number(verdict.confidence.toFixed(2)),
      alignment: verdict.mistake
        ? `${verdict.mistake.kind} @ ${start + verdict.mistake.offset}`
        : verdict.uncertain
          ? "uncertain"
          : `advance ${verdict.advance}`,
      clips: clipsRef.current,
      lastError: "",
    });
  }

  const handleClipRef = useRef(handleClip);
  handleClipRef.current = handleClip;

  /* --------------------------------------------------------------- session */

  const start = useCallback(async () => {
    if (listenerRef.current) return;
    setNotice(null);
    const listener = new RecitationListener({
      onClip: (wav) => void handleClipRef.current(wav),
      onLevel: (l) => setLevel(l),
      onLowVolume: () => setHint("Your microphone volume is very low. Please move closer to the microphone."),
      onFailure: (kind: ListenerFailure, message) => {
        setNotice(message);
        if (kind === "denied") setStatus("denied");
        else if (kind === "unsupported") setStatus("unsupported");
      },
    });
    try {
      await listener.start();
      listenerRef.current = listener;
      listeningRef.current = true;
      setStatus("listening");
      setDiagnostics((d) => ({ ...d, micActive: true, recognition: "active" }));
    } catch {
      listeningRef.current = false;
    }
  }, []);

  const stop = useCallback(async () => {
    listeningRef.current = false;
    await listenerRef.current?.stop();
    listenerRef.current = null;
    setLevel(0);
    setStatus("ready");
    setDiagnostics((d) => ({ ...d, micActive: false, recognition: "idle" }));
  }, []);

  /** Silence the mic while the correct recitation plays. */
  const setPaused = useCallback((paused: boolean) => {
    listenerRef.current?.setPaused(paused);
    if (listenerRef.current) setStatus(paused ? "paused" : mistakeRef.current ? "mistake" : "listening");
  }, []);

  /** The learner says the red word was fixed. */
  const resolveMistake = useCallback(() => {
    const current = mistakeRef.current;
    if (!current) return;
    setStates((prev) => ({ ...prev, [current.index]: "done" }));
    mistakeRef.current = null;
    setMistake(null);
    const next = Math.min(wordsRef.current.length - 1, current.index + 1);
    cursorRef.current = next;
    setCursor(next);
    onProgress?.(next);
    setStatus(listeningRef.current ? "listening" : "ready");
  }, [onProgress]);

  useEffect(() => {
    return () => {
      stopWalk();
      void listenerRef.current?.stop();
    };
  }, []);

  const stateOf = useCallback(
    (index: number): WordState => {
      if (mistake && index === mistake.index) return "error";
      if (index === cursor) return "current";
      return states[index] ?? "pending";
    },
    [cursor, mistake, states],
  );

  return {
    cursor,
    stateOf,
    status,
    level,
    mistake,
    hint,
    notice,
    diagnostics: { ...diagnostics, level, micActive: listeningRef.current },
    listening: listeningRef.current,
    start,
    stop,
    setPaused,
    seek,
    resolveMistake,
    resetPage: (index: number) => seek(index, { clearBehind: true }),
    dismissNotice: () => setNotice(null),
  };
}
