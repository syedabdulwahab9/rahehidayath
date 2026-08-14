/** Central appearance + reading-preference engine. Every option the user can
 *  change in Settings is turned into a CSS variable / data-attribute on <html>,
 *  so the whole website reacts instantly and consistently. */

export type ThemeMode =
  | "light"
  | "dark"
  | "amoled"
  | "sepia"
  | "emerald-night"
  | "ocean"
  | "desert"
  | "rose-dusk"
  | "mocha"
  | "cloud"
  | "sage-cream"
  | "sky-peach"
  | "blush"
  | "linen"
  | "mint-paper"
  | "aurora"
  | "sunset"
  | "noir-gold"
  | "midnight-indigo"
  | "cherry-blossom"
  | "emerald-gold"
  | "auto";
export type AnimationLevel = "none" | "subtle" | "full";

export const THEME_MODES: Array<{ id: ThemeMode; label: string; hint: string }> = [
  { id: "light", label: "Light", hint: "Bright parchment look" },
  { id: "cloud", label: "Cloud White", hint: "Crisp airy white with a blue tint" },
  { id: "linen", label: "Linen", hint: "Soft warm off-white paper" },
  { id: "sage-cream", label: "Sage Cream", hint: "Calm sage green on cream" },
  { id: "sky-peach", label: "Sky Peach", hint: "Light blue with a soft peach glow" },
  { id: "blush", label: "Blush Lilac", hint: "Gentle pink and lavender light" },
  { id: "mint-paper", label: "Mint Paper", hint: "Fresh pale mint daylight" },
  { id: "sepia", label: "Sepia Paper", hint: "Warm old-manuscript paper" },
  { id: "desert", label: "Desert Sand", hint: "Soft sand and dune tones" },
  { id: "rose-dusk", label: "Rose Dusk", hint: "Gentle rose evening light" },
  { id: "dark", label: "Dark", hint: "Soft night reading" },
  { id: "amoled", label: "AMOLED", hint: "True black, saves battery" },
  { id: "emerald-night", label: "Emerald Night", hint: "Deep green masjid night" },
  { id: "ocean", label: "Ocean Blue", hint: "Calm deep-blue night" },
  { id: "mocha", label: "Mocha", hint: "Warm cocoa comfort" },
  { id: "cherry-blossom", label: "Cherry Blossom", hint: "Pink petals with soft mint light" },
  { id: "aurora", label: "Aurora", hint: "Teal night brushed with violet light" },
  { id: "sunset", label: "Sunset", hint: "Plum dusk with amber and rose" },
  { id: "noir-gold", label: "Noir Gold", hint: "Black ink with warm gold" },
  { id: "midnight-indigo", label: "Midnight Indigo", hint: "Deep indigo with sky highlights" },
  { id: "emerald-gold", label: "Emerald Gold", hint: "Masjid green with gilded detail" },
  { id: "auto", label: "Auto", hint: "Follows your device" },
];

export const THEME_COLORS = [
  { id: "snow", label: "Snow White", primary: "0.72 0.008 250", ring: "0.80 0.006 250" },
  { id: "pearl-grey", label: "Pearl Grey", primary: "0.68 0.012 235", ring: "0.78 0.010 235" },
  { id: "ivory", label: "Ivory", primary: "0.74 0.020 90", ring: "0.82 0.016 90" },
  { id: "soft-sky", label: "Soft Sky", primary: "0.70 0.045 230", ring: "0.79 0.038 230" },
  { id: "soft-mint", label: "Soft Mint", primary: "0.72 0.040 165", ring: "0.81 0.034 165" },
  { id: "soft-rose", label: "Soft Rose", primary: "0.72 0.048 15", ring: "0.81 0.040 15" },
  { id: "emerald", label: "Emerald", primary: "0.46 0.09 167", ring: "0.55 0.08 167" },
  { id: "teal", label: "Teal", primary: "0.48 0.08 195", ring: "0.57 0.07 195" },
  { id: "royal", label: "Royal Blue", primary: "0.45 0.12 258", ring: "0.55 0.11 258" },
  { id: "maroon", label: "Maroon", primary: "0.42 0.13 20", ring: "0.52 0.12 20" },
  { id: "midnight", label: "Midnight", primary: "0.33 0.06 265", ring: "0.45 0.06 265" },
  { id: "olive", label: "Olive", primary: "0.48 0.08 130", ring: "0.57 0.07 130" },
  { id: "sapphire", label: "Sapphire", primary: "0.42 0.14 245", ring: "0.53 0.13 245" },
  { id: "plum", label: "Plum", primary: "0.42 0.12 320", ring: "0.53 0.11 320" },
  { id: "copper", label: "Copper", primary: "0.52 0.12 55", ring: "0.60 0.11 55" },
  { id: "forest", label: "Forest", primary: "0.40 0.09 150", ring: "0.50 0.08 150" },
  { id: "indigo", label: "Indigo", primary: "0.40 0.13 275", ring: "0.51 0.12 275" },
  { id: "slate", label: "Graphite", primary: "0.38 0.02 250", ring: "0.50 0.02 250" },
  { id: "jade", label: "Jade", primary: "0.52 0.10 158", ring: "0.60 0.09 158" },
  { id: "pine", label: "Pine", primary: "0.36 0.07 160", ring: "0.47 0.06 160" },
  { id: "turquoise-deep", label: "Deep Turquoise", primary: "0.50 0.10 205", ring: "0.59 0.09 205" },
  { id: "denim", label: "Denim", primary: "0.47 0.09 235", ring: "0.57 0.08 235" },
  { id: "lavender-deep", label: "Deep Lavender", primary: "0.45 0.11 295", ring: "0.55 0.10 295" },
  { id: "berry", label: "Berry", primary: "0.44 0.14 350", ring: "0.54 0.13 350" },
  { id: "terracotta", label: "Terracotta", primary: "0.50 0.13 40", ring: "0.59 0.12 40" },
  { id: "bronze", label: "Bronze", primary: "0.48 0.09 70", ring: "0.58 0.08 70" },
  { id: "cocoa", label: "Cocoa", primary: "0.40 0.05 50", ring: "0.51 0.05 50" },
  { id: "steel", label: "Steel Blue", primary: "0.46 0.05 230", ring: "0.56 0.05 230" },
] as const;

export const ACCENT_COLORS = [
  { id: "white", label: "White", accent: "0.99 0 0" },
  { id: "snow-accent", label: "Snow", accent: "0.96 0.004 250" },
  { id: "cream", label: "Cream", accent: "0.96 0.022 95" },
  { id: "ice", label: "Ice Blue", accent: "0.94 0.020 225" },
  { id: "gold", label: "Gold", accent: "0.82 0.13 85" },
  { id: "amber", label: "Amber", accent: "0.80 0.15 70" },
  { id: "rose", label: "Rose", accent: "0.75 0.13 15" },
  { id: "sky", label: "Sky", accent: "0.78 0.10 220" },
  { id: "mint", label: "Mint", accent: "0.83 0.10 160" },
  { id: "violet", label: "Violet", accent: "0.72 0.13 300" },
  { id: "turquoise", label: "Turquoise", accent: "0.80 0.11 190" },
  { id: "sand", label: "Sand", accent: "0.86 0.07 90" },
  { id: "coral", label: "Coral", accent: "0.76 0.14 35" },
  { id: "lime", label: "Lime", accent: "0.85 0.14 130" },
  { id: "pearl", label: "Pearl", accent: "0.92 0.02 250" },
  { id: "peach", label: "Peach", accent: "0.84 0.09 45" },
  { id: "lilac", label: "Lilac", accent: "0.82 0.08 305" },
  { id: "aqua", label: "Aqua", accent: "0.86 0.09 200" },
  { id: "honey", label: "Honey", accent: "0.84 0.12 95" },
  { id: "blossom", label: "Blossom", accent: "0.86 0.07 350" },
] as const;

/** Colour of the big rotating ornament circle behind every page. */
export const BACKDROP_CIRCLES = [
  { id: "auto", label: "Match theme", color: "var(--primary)" },
  { id: "gold", label: "Gold", color: "oklch(0.82 0.13 85)" },
  { id: "emerald", label: "Emerald", color: "oklch(0.55 0.11 165)" },
  { id: "teal", label: "Teal", color: "oklch(0.58 0.09 195)" },
  { id: "sky", label: "Sky", color: "oklch(0.62 0.11 235)" },
  { id: "indigo", label: "Indigo", color: "oklch(0.50 0.13 275)" },
  { id: "violet", label: "Violet", color: "oklch(0.55 0.13 300)" },
  { id: "rose", label: "Rose", color: "oklch(0.60 0.14 15)" },
  { id: "copper", label: "Copper", color: "oklch(0.60 0.12 55)" },
  { id: "sand", label: "Sand", color: "oklch(0.75 0.07 90)" },
  { id: "graphite", label: "Graphite", color: "oklch(0.45 0.02 250)" },
] as const;

export const UI_FONTS = [
  { id: "jakarta", label: "Plus Jakarta Sans", stack: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif' },
  { id: "inter", label: "Inter", stack: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  { id: "serif", label: "Classic Serif", stack: '"Marcellus", ui-serif, Georgia, serif' },
  { id: "system", label: "System", stack: 'system-ui, -apple-system, Segoe UI, sans-serif' },
  { id: "cairo", label: "Cairo", stack: 'Cairo, ui-sans-serif, system-ui, sans-serif' },
  { id: "manrope", label: "Manrope", stack: 'Manrope, ui-sans-serif, system-ui, sans-serif' },
  { id: "outfit", label: "Outfit", stack: 'Outfit, ui-sans-serif, system-ui, sans-serif' },
  { id: "lora", label: "Lora (Reading Serif)", stack: 'Lora, ui-serif, Georgia, serif' },
  { id: "playfair", label: "Playfair Display", stack: '"Playfair Display", ui-serif, Georgia, serif' },
  { id: "sourceserif", label: "Source Serif 4", stack: '"Source Serif 4", ui-serif, Georgia, serif' },
  { id: "mono", label: "Space Mono", stack: '"Space Mono", ui-monospace, SFMono-Regular, monospace' },
] as const;

/** Quran / Arabic mushaf typefaces. */
export const ARABIC_FONTS = [
  { id: "amiri-quran", label: "Amiri Quran (Uthmani)", stack: '"Amiri Quran", "Amiri", serif' },
  { id: "scheherazade", label: "Scheherazade New (Indo-Pak)", stack: '"Scheherazade New", "Amiri", serif' },
  { id: "noto-naskh", label: "Noto Naskh Arabic", stack: '"Noto Naskh Arabic", serif' },
  { id: "lateef", label: "Lateef", stack: 'Lateef, "Noto Naskh Arabic", serif' },
  { id: "reem", label: "Reem Kufi", stack: '"Reem Kufi", "Amiri", serif' },
  { id: "cairo-ar", label: "Cairo Arabic", stack: 'Cairo, "Noto Naskh Arabic", sans-serif' },
  { id: "kufam", label: "Kufam", stack: 'Kufam, "Amiri", serif' },
] as const;

export const URDU_FONTS = [
  { id: "nastaliq", label: "Noto Nastaliq Urdu", stack: '"Noto Nastaliq Urdu", serif' },
  { id: "naskh", label: "Noto Naskh Arabic", stack: '"Noto Naskh Arabic", serif' },
  { id: "lateef", label: "Lateef", stack: 'Lateef, serif' },
  { id: "gulzar", label: "Gulzar", stack: 'Gulzar, "Noto Nastaliq Urdu", serif' },
  { id: "amiri-ur", label: "Amiri", stack: 'Amiri, "Noto Naskh Arabic", serif' },
] as const;

export const READING_WIDTHS = [
  { id: "narrow", label: "Narrow", value: "44rem" },
  { id: "medium", label: "Medium", value: "58rem" },
  { id: "wide", label: "Wide", value: "72rem" },
  { id: "full", label: "Full", value: "100%" },
] as const;

export type ThemeColorId = (typeof THEME_COLORS)[number]["id"];
export type AccentColorId = (typeof ACCENT_COLORS)[number]["id"];
export type BackdropCircleId = (typeof BACKDROP_CIRCLES)[number]["id"];
export type UiFontId = (typeof UI_FONTS)[number]["id"];
export type ArabicFontId = (typeof ARABIC_FONTS)[number]["id"];
export type UrduFontId = (typeof URDU_FONTS)[number]["id"];
export type ReadingWidthId = (typeof READING_WIDTHS)[number]["id"];

export type Appearance = {
  theme: ThemeMode;
  themeColor: ThemeColorId;
  accentColor: AccentColorId;
  backdropCircle: BackdropCircleId;
  backdropCircleVisible: boolean;
  backdropCircleStrength: number;
  uiFont: UiFontId;
  fontSize: number;
  quranFont: ArabicFontId;
  arabicFont: ArabicFontId;
  urduFont: UrduFontId;
  lineSpacing: number;
  readingWidth: ReadingWidthId;
  rounded: number;
  animation: AnimationLevel;
  glass: boolean;
  compact: boolean;
};

const find = <T extends { id: string }>(list: readonly T[], id: string, fallback: T): T =>
  list.find((x) => x.id === id) ?? fallback;

/** Themes that use a light foreground/background pairing. */
export const LIGHT_THEMES: ThemeMode[] = [
  "light",
  "sepia",
  "desert",
  "rose-dusk",
  "cloud",
  "linen",
  "sage-cream",
  "sky-peach",
  "blush",
  "mint-paper",
  "cherry-blossom",
];

export type ResolvedTheme = Exclude<ThemeMode, "auto">;

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode !== "auto") return mode;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Writes every appearance choice onto <html> as variables + data attributes. */
export function applyAppearance(a: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved = resolveTheme(a.theme);

  root.classList.toggle("dark", !LIGHT_THEMES.includes(resolved));
  root.dataset["theme"] = resolved;
  root.dataset["animation"] = a.animation;
  root.dataset["glass"] = a.glass ? "on" : "off";
  root.dataset["density"] = a.compact ? "compact" : "cozy";

  const color = find(THEME_COLORS, a.themeColor, THEME_COLORS[0]);
  const accent = find(ACCENT_COLORS, a.accentColor, ACCENT_COLORS[0]);
  const ui = find(UI_FONTS, a.uiFont, UI_FONTS[0]);
  const quran = find(ARABIC_FONTS, a.quranFont, ARABIC_FONTS[0]);
  const arabic = find(ARABIC_FONTS, a.arabicFont, ARABIC_FONTS[0]);
  const urdu = find(URDU_FONTS, a.urduFont, URDU_FONTS[0]);
  const width = find(READING_WIDTHS, a.readingWidth, READING_WIDTHS[1]);

  root.style.setProperty("--brand-primary", color.primary);
  root.style.setProperty("--brand-ring", color.ring);
  root.style.setProperty("--brand-accent", accent.accent);
  const circle = find(BACKDROP_CIRCLES, a.backdropCircle, BACKDROP_CIRCLES[0]);
  root.style.setProperty("--backdrop-circle", circle.color);
  root.style.setProperty("--backdrop-circle-opacity", a.backdropCircleVisible ? String(a.backdropCircleStrength) : "0");
  root.style.setProperty("--font-ui", ui.stack);
  root.style.setProperty("--font-quran", quran.stack);
  root.style.setProperty("--font-arabic-user", arabic.stack);
  root.style.setProperty("--font-urdu-user", urdu.stack);
  root.style.setProperty("--app-font-size", `${a.fontSize}px`);
  root.style.setProperty("--reading-line", String(a.lineSpacing));
  root.style.setProperty("--reading-width", width.value);
  root.style.setProperty("--radius", `${a.rounded}rem`);
}
