/**
 * Sequential Quran word aligner.
 *
 * Given what the learner was heard saying and the exact words the Mushaf
 * expects from the current position onwards, this decides one of three things
 * — and nothing else:
 *
 *   advance   : these words were verified correct, move the green forward
 *   mistake   : this word is confidently wrong / skipped, stop here in red
 *   uncertain : not enough evidence — say nothing, never award a green word
 *
 * "Uncertain" is never treated as correct.
 */

import { sameWord, similarity } from "./arabic";

export type AlignKind = "substituted" | "skipped";

export type AlignResult = {
  /** Number of expected words verified correct, starting at index 0. */
  advance: number;
  mistake: { offset: number; heard: string; kind: AlignKind; similarity: number } | null;
  /** 0..1 evidence strength for this clip. */
  confidence: number;
  /** True when the clip carried too little usable Quran speech to judge. */
  uncertain: boolean;
  matchedPairs: Array<{ expected: string; heard: string }>;
};

/** A near-miss this strong is a real, reportable word mistake. */
const MISTAKE_SIMILARITY = 0.55;
/** How far ahead a skipped-word jump is still recognised as the same reading. */
const SKIP_LOOKAHEAD = 3;
/** A skip is only believed when the words after it also line up. */
function confirmsSkip(heardTokens: string[], from: number, expected: string[], at: number): boolean {
  const next = heardTokens[from + 1];
  if (!next) return true;
  return sameWord(next, expected[at + 1] ?? "") || sameWord(next, expected[at] ?? "");
}

export function align(heardTokens: string[], expected: string[]): AlignResult {
  const matchedPairs: AlignResult["matchedPairs"] = [];
  if (!heardTokens.length || !expected.length) {
    return { advance: 0, mistake: null, confidence: 0, uncertain: true, matchedPairs };
  }

  let e = 0;
  let verified = 0;
  let unknown = 0;
  let lastAccepted = "";

  for (let h = 0; h < heardTokens.length; h++) {
    const heard = heardTokens[h] ?? "";
    if (e >= expected.length) break;

    /* 1. The next expected word, recited correctly. */
    if (sameWord(heard, expected[e] ?? "")) {
      matchedPairs.push({ expected: expected[e] ?? "", heard });
      lastAccepted = expected[e] ?? "";
      e += 1;
      verified += 1;
      unknown = 0;
      continue;
    }

    /* 2. A repetition of the word just recited — normal, not a mistake. */
    if (lastAccepted && sameWord(heard, lastAccepted)) continue;

    /* 2b. The recognizer glued two Mushaf words into one token. */
    const merged = `${expected[e] ?? ""}${expected[e + 1] ?? ""}`;
    if (expected[e + 1] && sameWord(heard, merged)) {
      matchedPairs.push({ expected: merged, heard });
      lastAccepted = expected[e + 1] ?? "";
      e += 2;
      verified += 2;
      unknown = 0;
      continue;
    }

    /* 2c. The recognizer split one Mushaf word across two tokens. */
    const joined = `${heard}${heardTokens[h + 1] ?? ""}`;
    if (heardTokens[h + 1] && sameWord(joined, expected[e] ?? "")) {
      matchedPairs.push({ expected: expected[e] ?? "", heard: joined });
      lastAccepted = expected[e] ?? "";
      e += 1;
      verified += 1;
      unknown = 0;
      h += 1;
      continue;
    }

    /* 3. A word further ahead: the learner skipped one. */
    let jumped = -1;
    for (let k = 1; k <= SKIP_LOOKAHEAD && e + k < expected.length; k++) {
      if (sameWord(heard, expected[e + k] ?? "")) {
        jumped = k;
        break;
      }
    }
    if (jumped > 0 && confirmsSkip(heardTokens, h, expected, e + jumped)) {
      return {
        advance: e,
        mistake: { offset: e, heard, kind: "skipped", similarity: 0 },
        confidence: clamp(verified / Math.max(1, heardTokens.length)),
        uncertain: false,
        matchedPairs,
      };
    }

    /* 4. Close to the expected word but not it — a genuine wrong word. */
    const sim = similarity(heard, expected[e] ?? "");
    /* Very short expected words are the ones recognizers get wrong most often,
       so a mistake there needs stronger evidence before it is shown in red. */
    const threshold = (expected[e] ?? "").length <= 3 ? 0.75 : MISTAKE_SIMILARITY;
    if (sim >= threshold) {
      return {
        advance: e,
        mistake: { offset: e, heard, kind: "substituted", similarity: sim },
        confidence: clamp(0.5 + sim / 2),
        uncertain: false,
        matchedPairs,
      };
    }

    /* 5. Anything else is noise, a half-word, or a failed recognition.
          No green, no red — the engine simply waits for better evidence. */
    unknown += 1;
    if (unknown >= 2) {
      return {
        advance: e,
        mistake: null,
        confidence: clamp(verified / Math.max(1, heardTokens.length)),
        uncertain: verified === 0,
        matchedPairs,
      };
    }
  }

  return {
    advance: e,
    mistake: null,
    confidence: clamp(verified / Math.max(1, heardTokens.length)),
    uncertain: verified === 0,
    matchedPairs,
  };
}

function clamp(n: number) {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}
