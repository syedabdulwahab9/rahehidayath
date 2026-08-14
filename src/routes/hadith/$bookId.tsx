import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { HadithLanguagePills } from "@/components/hadith/LanguagePills";
import { useHadithLang } from "@/lib/hadith-lang";
import { HadithCard } from "@/components/hadith/HadithCard";
import { useHadithFontSize } from "@/lib/hadith-storage";
import { fetchHadithEditions, fetchHadithInfo, fetchHadithSection } from "@/lib/quran-api";
import { HADITH_BOOKS, LANGUAGES, getLanguage } from "@/lib/islamic-data";
import { HADITH_META } from "@/lib/hadith-meta";
import { useSettings } from "@/lib/settings";
import { useTranslate } from "@/lib/translate";

export const Route = createFileRoute("/hadith/$bookId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.bookId} hadith collection | Raah e Hidayath` },
      { name: "description", content: "Read this hadith collection chapter by chapter with translation in your language." },
      { property: "og:title", content: `Hadith — ${params.bookId} | Raah e Hidayath` },
      { property: "og:description", content: "Authentic hadith, chapter by chapter." },
    ],
  }),
  component: HadithBook,
});

function HadithBook() {
  const { bookId } = Route.useParams();
  const { settings } = useSettings();
  /* Language here is local to the hadith section only — changing it never
     touches the rest of the site (home, Quran, Ibadaat, nav stay as they are). */
  const [langCode, setLangCode] = useHadithLang(settings.lang);
  const lang = getLanguage(langCode);
  const [section, setSection] = useState("1");
  const [chapterQuery, setChapterQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const font = useHadithFontSize();
  const book = HADITH_BOOKS.find((b) => b.id === bookId);
  const meta = HADITH_META[bookId];

  const info = useQuery({ queryKey: ["hadith-info", bookId], queryFn: () => fetchHadithInfo(bookId), staleTime: Infinity });
  const editions = useQuery({
    queryKey: ["hadith-editions", bookId],
    queryFn: () => fetchHadithEditions(bookId),
    staleTime: Infinity,
  });
  const data = useQuery({
    queryKey: ["hadith", bookId, langCode, section, editions.data?.length ?? 0],
    queryFn: () => fetchHadithSection(bookId, langCode, section, editions.data),
    staleTime: 1000 * 60 * 30,
    enabled: !editions.isLoading,
  });

  const sections = useMemo(
    () => Object.entries(info.data?.sections ?? {}).filter(([, name]) => name),
    [info.data],
  );
  const filteredSections = useMemo(() => {
    const q = chapterQuery.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(([k, name]) => name.toLowerCase().includes(q) || k.includes(q));
  }, [sections, chapterQuery]);

  /* Only offer languages this collection is actually translated into — Urdu is
   * always offered because we fall back to a sister Urdu edition when needed. */
  const availableLangs = editions.data
    ? LANGUAGES.filter(
        (l) => l.code === "ur" || editions.data.some((e) => e.language.toLowerCase() === l.label.toLowerCase()),
      )
    : LANGUAGES;
  const usedEdition = data.data?.edition ?? "";
  const usedLanguage = editions.data?.find((e) => e.name === usedEdition)?.language ?? "";
  const fellBack = Boolean(usedLanguage) && usedLanguage.toLowerCase() !== lang.label.toLowerCase();
  const rtlText = /^(ara|urd|fas|per)/.test(usedEdition) || (usedEdition.startsWith("ara") ?? false);
  const isUrdu = usedEdition.startsWith("urd");
  const fontClass = isUrdu ? "urdu-text text-right" : rtlText ? "arabic-ayah text-right" : "";

  /* If this collection has no edition in the chosen language, the English text
     is machine-translated so every hadith really is shown in that language. */
  const needsLiveTranslation = fellBack && usedEdition.startsWith("eng") && langCode !== "en";
  const hadiths = data.data?.hadiths ?? [];
  const { tr, ready: trReady } = useTranslate(
    needsLiveTranslation ? hadiths.map((h) => h.text) : [],
    langCode,
  );
  const showText = (t: string) => (needsLiveTranslation ? tr(t) : t);
  const displayUrdu = needsLiveTranslation ? langCode === "ur" : isUrdu;
  const displayRtl = needsLiveTranslation ? langCode === "ur" || langCode === "ar" : rtlText;
  const displayFontClass = displayUrdu ? "urdu-text text-right" : needsLiveTranslation ? (displayRtl ? "arabic-ayah text-right" : "") : fontClass;

  const sectionKeys = sections.map(([k]) => k);
  const currentIndex = sectionKeys.indexOf(section);
  const goPrev = () => currentIndex > 0 && setSection(sectionKeys[currentIndex - 1] as string);
  const goNext = () => currentIndex >= 0 && currentIndex < sectionKeys.length - 1 && setSection(sectionKeys[currentIndex + 1] as string);
  const currentChapterName = sections.find(([k]) => k === section)?.[1] ?? "";

  return (
    <div className="space-y-6">
      <Link to="/hadith" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" /> All collections
      </Link>
      <SectionTitle title={book?.name ?? bookId} subtitle={book?.arabic} />

      {meta && (
        <Card className="space-y-1.5 text-xs">
          <p className="text-sm font-semibold text-foreground">{meta.compiler}</p>
          <p className="text-muted-foreground">{meta.era} · {meta.narrations}</p>
          <p className="leading-relaxed text-accent">{meta.authenticity}</p>
        </Card>
      )}

      <HadithLanguagePills
        value={langCode}
        onChange={(c) => setLangCode(c)}
        availableCodes={availableLangs.map((l) => l.code)}
      />

      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex <= 0}
            aria-label="Previous chapter"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-primary disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="min-w-0 flex-1 truncate rounded-xl border border-border bg-background px-3 py-2 text-left text-sm"
          >
            <span className="text-muted-foreground">Ch. {section} · </span>
            <span className="font-medium">{currentChapterName || "Select chapter"}</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex < 0 || currentIndex >= sectionKeys.length - 1}
            aria-label="Next chapter"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-primary disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {pickerOpen && (
          <div className="animate-rise space-y-2 rounded-xl border border-border bg-background p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={chapterQuery}
                onChange={(e) => setChapterQuery(e.target.value)}
                placeholder="Search chapters…"
                className="w-full rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filteredSections.map(([k, name]) => (
                <button
                  key={k}
                  onClick={() => {
                    setSection(k);
                    setPickerOpen(false);
                    setChapterQuery("");
                  }}
                  className={`block w-full truncate rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                    k === section ? "bg-primary/10 font-semibold text-primary" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {k}. {name}
                </button>
              ))}
              {filteredSections.length === 0 && (
                <p className="px-2.5 py-1.5 text-xs text-muted-foreground">No chapters match.</p>
              )}
            </div>
          </div>
        )}
      </Card>

      {fellBack && (
        <p role="status" className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {needsLiveTranslation
            ? `${book?.name ?? bookId} has no printed ${lang.label} edition, so every hadith is translated into ${lang.label} for you${trReady ? "" : " — translating…"}.`
            : `${book?.name ?? bookId} is not translated into ${lang.label} in our source, so it is being shown in ${usedLanguage}.`}
        </p>
      )}

      {data.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-border bg-card shimmer" />
          ))}
        </div>
      )}
      {data.error && <Card className="text-sm text-destructive">{(data.error as Error).message}</Card>}

      <div className="space-y-3">
        {hadiths.map((h, i) => (
          <HadithCard
            key={h.hadithnumber}
            id={`${bookId}-${h.hadithnumber}`}
            bookId={bookId}
            bookName={book?.name ?? bookId}
            hadithnumber={h.hadithnumber}
            text={showText(h.text)}
            reference={h.reference ? `Book ${h.reference.book} · No. ${h.reference.hadith}` : undefined}
            grade={meta?.authenticity ? "Grade: Sahih (per compiler / verification chain)" : undefined}
            rtl={displayRtl}
            fontClass={displayFontClass}
            fontSize={font.size}
            delayMs={i * 40}
          />
        ))}
      </div>
    </div>
  );
}
