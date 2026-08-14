/**
 * Quran-specific Arabic normalization.
 *
 * The job here is narrow and deliberate: remove differences that are only about
 * how the text is *written* (diacritics, Quranic annotation marks, tatweel,
 * unicode variants of the same letter, punctuation, spacing) while keeping
 * every difference that is about which *word* was actually recited.
 *
 * Nothing in this file ever makes a wrong word look right: two words that
 * differ by a real letter still normalize to different strings.
 */

/* Harakat, sukun, shaddah, superscript alef and the Quranic annotation marks
   (sajdah signs, small waqf letters, rub-el-hizb, madd sign …). */
const MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/g;
const TATWEEL = /\u0640/g;
const NON_ARABIC = /[^\u0621-\u064A]/g;
/** Presentation forms and Persian/Urdu letter shapes of the same Arabic letter. */
const VARIANTS: Array<[RegExp, string]> = [
  [/[\u06A9\u06AA]/g, "\u0643"], // keheh -> kaf
  [/[\u06CC\u06D0\u064A\u06D2]/g, "\u064A"], // farsi/urdu ya -> ya
  [/[\u06BE\u06C1\u06C2\u06D5]/g, "\u0647"], // heh variants -> heh
  [/[\u06C0\u06C3]/g, "\u0647"],
  [/[\u0679\u067A\u067B\u067C]/g, "\u062A"], // retroflex/urdu te -> te
  [/[\u0688\u0689\u068A]/g, "\u062F"], // urdu dal -> dal
  [/[\u0691\u0692\u0693]/g, "\u0631"], // urdu re -> re
  [/[\u06AF\u0762\u0763]/g, "\u0643"], // gaf read as kaf
  [/[\u067E]/g, "\u0628"], // peh -> beh
  [/[\u0686]/g, "\u062C"], // cheh -> jeem
  [/[\u0698]/g, "\u0632"], // jeh -> zain
  [/[\u0660-\u0669\u06F0-\u06F9]/g, ""], // ayah numbers are never recited words
];

/** Normalizes Unicode presentation forms (FExx) back to plain letters. */
function toPlainForms(input: string): string {
  return typeof input.normalize === "function" ? input.normalize("NFKC") : input;
}

/** Written-form differences that are never a recitation mistake. */
export function normalizeArabic(input: string): string {
  let out = toPlainForms(input);
  for (const [re, to] of VARIANTS) out = out.replace(re, to);
  return out
    .replace(MARKS, "")
    .replace(TATWEEL, "")
    .replace(/[\u0622\u0623\u0625\u0627\u0671\u0672\u0673]/g, "\u0627") // alef family
    .replace(/\u0649/g, "\u064A") // alef maqsura -> ya
    .replace(/\u0629/g, "\u0647") // ta marbuta -> ha
    .replace(/\u0624/g, "\u0648") // hamza on waw -> waw
    .replace(/\u0626/g, "\u064A") // hamza on ya -> ya
    .replace(/\u0621/g, "") // standalone hamza carries no letter of its own
    .replace(NON_ARABIC, "")
    .replace(/(.)\1+/g, "$1") // a doubled letter is shaddah, never a new word
    .trim();
}

/** Splits a transcript into comparable Quran words. */
export function tokenize(input: string): string[] {
  return input
    .split(/[\s\u060C\u061B\u061F.,!?؟_-]+/)
    .map(normalizeArabic)
    .filter((w) => w.length > 0);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min((row[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    prev = row;
  }
  return prev[b.length] ?? 0;
}

/** 0..1 — 1 means the two normalized words are letter-for-letter identical. */
export function similarity(a: string, b: string): number {
  if (!a.length && !b.length) return 1;
  const max = Math.max(a.length, b.length);
  if (!max) return 0;
  return 1 - levenshtein(a, b) / max;
}

/**
 * Two written forms of the same recited word.
 *
 * Only exact normalized equality counts, plus the single harmless case of a
 * recognizer writing a joined article/particle as one token (وَٱلضُّحَىٰ vs الضحى),
 * which is the same recitation.
 */
export function sameWord(heard: string, expected: string): boolean {
  if (!heard || !expected) return false;
  if (heard === expected) return true;

  /* A leading conjunction/preposition or the article is a writing choice of the
     recognizer, not a different recitation. */
  const strip = (w: string) => w.replace(/^(?:و|ف|ب|ل|ك)?(?:ال)?/, "");
  if (strip(heard) === strip(expected) && Math.abs(heard.length - expected.length) <= 3) return true;

  /* Recognizers routinely drop or add the final long vowel of a pausal ending
     (ٱلضُّحَىٰ → الضح). That is the same word, not a mistake. */
  const trimTail = (w: string) => w.replace(/[اويه]+$/, "");
  if (trimTail(heard) === trimTail(expected) && trimTail(expected).length >= 3) return true;

  /* For long words a single-letter transcription slip is still the same word. */
  const longest = Math.max(heard.length, expected.length);
  if (longest >= 6 && similarity(heard, expected) >= 1 - 1 / longest) return true;

  return false;
}
