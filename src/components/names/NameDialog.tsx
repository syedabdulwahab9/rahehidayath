import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { AsmaName } from "@/lib/quran-api";
import { dhikrPhrase, reflectionFor } from "@/lib/asma-data";

export function NameDialog({ name, onOpenChange }: { name: AsmaName | null; onOpenChange: (open: boolean) => void }) {
  const open = !!name;
  const dhikr = name ? dhikrPhrase(name.name, name.transliteration) : "";

  const handleCopy = async () => {
    if (!name) return;
    const text = `${name.name} — ${name.transliteration}\n${name.en.meaning}\n${dhikr}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — please try again");
    }
  };

  const handleShare = async () => {
    if (!name) return;
    const text = `${name.name} — ${name.transliteration}\n${name.en.meaning}\n\n${dhikr}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Asma ul Husna", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      }
    } catch {
      /* user cancelled share — no error toast */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border/70 text-center sm:max-w-md">
        {name && (
          <>
            <DialogHeader className="items-center text-center">
              <span className="mx-auto flex size-9 items-center justify-center rounded-full border-2 border-accent/50 bg-accent/10 text-xs font-semibold text-accent">
                {name.number}
              </span>
              <DialogTitle className="arabic-ayah mt-2 text-6xl font-normal text-primary">{name.name}</DialogTitle>
              <DialogDescription className="text-base font-semibold text-foreground">
                {name.transliteration}
              </DialogDescription>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">{name.en.meaning}</p>

            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Dhikr</p>
              <p className="arabic-ayah mt-1 text-2xl text-primary">{dhikr.split(" / ")[0]}</p>
              <p className="text-xs text-muted-foreground">{dhikr.split(" / ")[1]}</p>
            </div>

            <p className="text-xs italic text-muted-foreground">{reflectionFor(name.number, name.en.meaning)}</p>

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-soft transition hover:shadow-glow"
              >
                <Copy className="size-4" /> Copy
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-2xl gradient-gold px-4 py-2 text-sm font-medium text-accent-foreground shadow-soft transition hover:shadow-glow"
              >
                <Share2 className="size-4" /> Share
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
