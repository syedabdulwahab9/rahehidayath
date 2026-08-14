/** Small curated helper data for Asma ul Husna — dhikr phrasing & reflections.
 *  Keyed by the 1-based name number returned from fetchAsmaUlHusna(). */

export const REFLECTIONS: Record<number, string> = {
  1: "Rest in the boundless mercy that reaches every creature, believer and sinner alike.",
  2: "Return to the One whose mercy is reserved specially for those who turn to Him.",
  3: "Remember that true sovereignty over every affair belongs to Him alone.",
  4: "Seek purity of heart, for He is free from every flaw and imperfection.",
  5: "Trust the One who grants safety and peace to whoever seeks refuge in Him.",
  6: "Feel secure knowing He affirms the truth of every promise He makes.",
  7: "Submit your affairs to the One who watches over and safeguards all things.",
  8: "Stand humbly before the Almighty whose might nothing can overcome.",
  9: "Let His majesty mend what is broken in your heart and affairs.",
  10: "Bow before the One whose greatness silences every arrogance.",
};

/** Formats the classic dhikr invocation, e.g. "يَا رَحْمَٰنُ / Yā Raḥmān". */
export function dhikrPhrase(name: string, transliteration: string) {
  const arabicVocative = `يَا ${name.replace(/^ال/, "")}`;
  const clean = transliteration.replace(/^Al-/i, "").replace(/^The\s+/i, "");
  return `${arabicVocative} / Yā ${clean}`;
}

export function reflectionFor(number: number, meaning: string) {
  return REFLECTIONS[number] ?? `Reflect on being ${meaning.toLowerCase()}, and call upon Allah by this beautiful name.`;
}
