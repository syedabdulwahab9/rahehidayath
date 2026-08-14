import { useEffect, useRef } from "react";
import type { MushafLine } from "@/lib/madani-mushaf";
import type { WordState } from "@/lib/teacher/engine";

export type { WordState };

/**
 * One printed page of the Madani Mushaf, rendered as the teacher sees it:
 * every word carries a live state, so the learner watches the page turn green
 * behind them, glow at the word being recited, and light up red the moment a
 * mistake is heard.
 *
 * The page follows the reading position, but only moves when the recitation
 * genuinely reaches a new line — so the text never shakes word by word.
 */
export function TeacherMushaf({
  lines,
  surahNames,
  indexOf,
  stateOf,
  onWordClick,
  size,
  fade,
  cursor,
  currentLine,
  autoScroll = true,
  className = "",
}: {
  lines: MushafLine[];
  surahNames: Record<number, string>;
  /** flat reading index of a word id, or undefined for ayah markers */
  indexOf: (wordId: number) => number | undefined;
  stateOf: (index: number) => WordState;
  onWordClick: (index: number) => void;
  size: number;
  /** Hifz mode — words already recited fade away. */
  fade: boolean;
  /** Reading position; the page follows it. */
  cursor?: number | undefined;
  /** Printed line the reading position sits on. */
  currentLine?: number | undefined;
  /** Paused while the learner is stuck on a mistake. */
  autoScroll?: boolean;
  className?: string;
}) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const lastLineRef = useRef<number | null>(null);
  const lastScrollRef = useRef(0);

  /* Follow the recitation line by line: keep the glowing word resting near the
     middle of the screen, gliding the page instead of jumping. */
  useEffect(() => {
    if (!autoScroll || currentLine === undefined) return;
    if (lastLineRef.current === currentLine) return;
    lastLineRef.current = currentLine;

    const now = Date.now();
    if (now - lastScrollRef.current < 350) return;

    const el = sheetRef.current?.querySelector<HTMLElement>(".teacher-word.is-current");
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const restLine = window.innerHeight * 0.42;
    const drift = rect.top + rect.height / 2 - restLine;
    if (Math.abs(drift) < 48) return;
    lastScrollRef.current = now;
    window.scrollBy({ top: drift, behavior: "smooth" });
  }, [cursor, currentLine, autoScroll]);

  return (
    <div
      ref={sheetRef}
      dir="rtl"
      className={`mushaf-sheet quran-page-text ${className}`}
      style={{ "--mushaf-size": `${size}px` } as React.CSSProperties}
    >
      {lines.map((line) => {
        if (line.kind === "surah") {
          return (
            <div key={`s-${line.line}`} className="mushaf-line mushaf-surah-band">
              <span className="mushaf-surah-name">
                {surahNames[line.surah] ? `سُورَةُ ${surahNames[line.surah]}` : ""}
              </span>
            </div>
          );
        }
        if (line.kind === "basmalah") {
          return (
            <div key={`b-${line.line}`} className="mushaf-line mushaf-basmalah">
              <span>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</span>
            </div>
          );
        }
        return (
          <div key={`w-${line.line}`} className={`mushaf-line mushaf-words ${line.centered ? "is-centered" : ""}`}>
            {line.words.map((w) => {
              if (w.isAyahMarker) {
                return (
                  <span key={w.id} className="ayah-mark">
                    {w.text}
                  </span>
                );
              }
              const index = indexOf(w.id);
              const state: WordState = index === undefined ? "pending" : stateOf(index);
              return (
                <span
                  key={w.id}
                  role="button"
                  tabIndex={-1}
                  title={w.verseKey ?? ""}
                  onClick={() => index !== undefined && onWordClick(index)}
                  className={`teacher-word is-${state} ${fade && state === "done" ? "is-faded" : ""}`}
                >
                  {w.text}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
