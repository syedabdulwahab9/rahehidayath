import { Bookmark, BookmarkCheck, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useHadithBookmarks, type HadithBookmark } from "@/lib/hadith-storage";

export function HadithCard({
  id,
  bookId,
  bookName,
  hadithnumber,
  text,
  reference,
  grade,
  rtl,
  fontClass,
  fontSize,
}: {
  id: string;
  bookId: string;
  bookName: string;
  hadithnumber: number;
  text: string;
  reference?: string | undefined;
  grade?: string | undefined;
  rtl: boolean;
  fontClass: string;
  fontSize: number;
  delayMs?: number;
}) {
  const { isBookmarked, toggle } = useHadithBookmarks();
  const bookmarked = isBookmarked(id);

  const shareText = `${text}\n\n— ${bookName}${reference ? ` · ${reference}` : ""}`;

  const onBookmark = () => {
    const b: HadithBookmark = { id, bookId, bookName, hadithnumber, text, reference, grade, savedAt: Date.now() };
    const added = toggle(b);
    toast.success(added ? "Hadith bookmarked" : "Bookmark removed");
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Hadith copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Copied — sharing isn't available on this device");
      }
    } catch {
      /* user cancelled or unsupported — ignore */
    }
  };

  return (
    <div>
      <article className="hadith-surface space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 font-semibold tabular-nums text-primary">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Hadith {hadithnumber}
          </span>
          {reference && (
            <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium">{reference}</span>
          )}
        </div>

        <p
          dir={rtl ? "rtl" : "ltr"}
          className={`leading-loose text-foreground/90 ${rtl ? "text-right" : ""} ${fontClass}`}
          style={{ fontSize: fontClass ? undefined : `${fontSize}px` }}
        >
          {text}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2.5">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold tracking-tight text-foreground">{bookName}</p>
            {grade && <p className="mt-0.5 text-[11px] font-medium text-accent">{grade}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark hadith"}
              onClick={onBookmark}
              className={`grid size-9 place-items-center rounded-2xl border transition active:scale-90 ${bookmarked ? "border-primary/20 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/25 hover:text-primary"}`}
            >
              {bookmarked ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
            </button>
            <button
              type="button"
              aria-label="Copy hadith"
              onClick={onCopy}
              className="grid size-9 place-items-center rounded-2xl border border-border/60 text-muted-foreground transition hover:border-primary/25 hover:text-primary active:scale-90"
            >
              <Copy className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Share hadith"
              onClick={onShare}
              className="grid size-9 place-items-center rounded-2xl border border-border/60 text-muted-foreground transition hover:border-primary/25 hover:text-primary active:scale-90"
            >
              <Share2 className="size-4" />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
