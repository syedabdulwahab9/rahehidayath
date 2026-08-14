import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Download, FileText, Upload } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { TodayPanel } from "@/components/tracker/TodayPanel";
import { PrayerGuide } from "@/components/tracker/PrayerGuide";
import { HistoryPanel } from "@/components/tracker/HistoryPanel";
import { usePrayerDay } from "@/lib/prayer-times";
import { useSettings } from "@/lib/settings";
import { buildWindows } from "@/lib/prayer-windows";
import { downloadSalahReport } from "@/lib/salah-pdf";
import {
  PRAYERS,
  replaceLog,
  todayIso,
  useSalahLog,
  type PrayerName,
  type SalahState,
} from "@/lib/salah-log";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Salah Tracker — Prayer Guide, Live Status & Reminders | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Track every Fard, Sunnah and Nafl rak'ah with the Prayer Guide, follow live prayer status and countdowns, get reminders, and keep a full year of prayer history.",
      },
      { property: "og:title", content: "Salah Tracker with Prayer Guide | Raah e Hidayath" },
      {
        property: "og:description",
        content: "Live prayer status, rak'ah-by-rak'ah guide, reminders and a full year of prayer history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Tracker,
});

type Tab = "today" | "guide" | "history";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "today", label: "Today" },
  { id: "guide", label: "Prayer Guide" },
  { id: "history", label: "History" },
];

function Tracker() {
  const { settings } = useSettings();
  const state = useSalahLog();
  const [tab, setTab] = useState<Tab>("today");
  const [focus, setFocus] = useState<PrayerName | null>(null);

  /* Same coordinate-accurate source as the home page, so timings never differ. */
  const { data, isLoading, isError } = usePrayerDay();

  const windows = useMemo(() => buildWindows(data?.timings), [data]);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Salah Tracker"
        subtitle={`Live prayer status, rak'ah guide and reminders — ${settings.city}, ${settings.country}`}
      />

      <div
        role="tablist"
        aria-label="Salah tracker sections"
        className="flex gap-1 rounded-full border border-border/70 bg-card p-1 shadow-soft"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-10 flex-1 rounded-full px-3 text-xs font-semibold transition-all duration-300 sm:text-sm ${
              tab === t.id
                ? "gradient-hero text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "today" && (
        <TodayPanel
          state={state}
          windows={windows}
          loading={isLoading}
          error={isError}
          onOpenGuide={(p) => {
            setFocus(p);
            setTab("guide");
          }}
        />
      )}

      {tab === "guide" && (
        <div className="space-y-4">
          <Card className="animate-rise">
            <h2 className="font-display text-lg">Prayer Guide</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every daily prayer, rak'ah by rak'ah, in the order it is performed. Tick each rak'ah as you pray — only
              the Fard (and Witr for Isha) are needed to complete the prayer.
            </p>
          </Card>
          <PrayerGuide state={state} day={todayIso()} focus={focus} onFocusChange={setFocus} />
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-4">
          <HistoryPanel state={state} />
          <ReportCard state={state} place={`${settings.city}, ${settings.country}`} />
          <BackupCard log={state.log} />
        </div>
      )}
    </div>
  );
}

function ReportCard({ state, place }: { state: SalahState; place: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const download = async () => {
    setBusy(true);
    setStatus("");
    try {
      await downloadSalahReport(state, place);
      setStatus("PDF report downloaded — summary, per-prayer stats, monthly totals and every logged day.");
    } catch {
      setStatus("The report could not be generated. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-3 animate-rise">
      <h2 className="font-display text-lg">Prayer report (PDF)</h2>
      <p className="text-sm text-muted-foreground">
        A print-ready report built from your own log: completion rate, streaks, prayer-by-prayer and month-by-month
        totals, plus every logged day with the time each prayer was marked and rak'ah completed.
      </p>
      <button
        onClick={() => void download()}
        disabled={busy}
        className="inline-flex min-h-11 items-center gap-2 rounded-full gradient-hero px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        <FileText className="size-4" aria-hidden /> {busy ? "Preparing PDF…" : "Download PDF report"}
      </button>
      <p aria-live="polite" className={`text-sm text-primary ${status ? "" : "sr-only"}`}>
        {status}
      </p>
    </Card>
  );
}

function BackupCard({ log }: { log: Record<string, string[]> }) {
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ app: "raah-e-hidayath", kind: "salah-tracker", log }, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `salah-tracker-backup-${todayIso()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus("Backup downloaded. Keep it safe — you can restore it on any device.");
  };


  const importBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as { log?: Record<string, string[]> } | Record<string, string[]>;
      const incoming = "log" in parsed && parsed.log ? parsed.log : (parsed as Record<string, string[]>);
      const clean: Record<string, string[]> = {};
      for (const [day, prayers] of Object.entries(incoming)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(day) && Array.isArray(prayers)) {
          clean[day] = prayers.filter(
            (p): p is string => typeof p === "string" && (PRAYERS as readonly string[]).includes(p),
          );
        }
      }
      if (!Object.keys(clean).length) throw new Error("empty");
      replaceLog({ ...log, ...clean });
      setStatus(`Backup restored — ${Object.keys(clean).length} days of prayers imported.`);
    } catch {
      setStatus("That file does not look like a salah tracker backup.");
    }
  };

  return (
    <Card className="space-y-3 animate-rise">
      <h2 className="font-display text-lg">Backup &amp; restore</h2>
      <p className="text-sm text-muted-foreground">
        Your log is stored privately on this device and never expires. Download a backup to keep it forever, and restore
        it here or on any other phone or browser.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={exportBackup}
          className="inline-flex min-h-11 items-center gap-2 rounded-full gradient-hero px-5 text-sm font-semibold text-primary-foreground"
        >
          <Download className="size-4" aria-hidden /> Download backup
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold hover:text-primary"
        >
          <Upload className="size-4" aria-hidden /> Restore backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => {
            void importBackup(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <p aria-live="polite" className={`text-sm text-primary ${status ? "" : "sr-only"}`}>
        {status}
      </p>
    </Card>
  );
}
