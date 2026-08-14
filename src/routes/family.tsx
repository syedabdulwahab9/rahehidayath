import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Heart,
  Loader2,
  LogOut,
  Plus,
  QrCode,
  RefreshCw,
  ScanLine,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/use-auth";
import { QrCodeScanner } from "@/components/QrCodeScanner";
import {
  DEED_FLAGS,
  ENCOURAGEMENTS,
  PRAYERS,
  PRIVACY_OPTIONS,
  badgesFor,
  bumpLocal,
  lastNDays,
  readLocalToday,
  relativeTime,
  syncMyProgress,
  todayIso,
  toggleLocalFlag,
  type DeedFlag,
  type FamilyMember,
  type LocalToday,
  type MemberProgress,
  type PrivacyKey,
} from "@/lib/family";

export const Route = createFileRoute("/family")({
  head: () => ({
    meta: [
      { title: "Family Connect — Grow in Worship Together" },
      {
        name: "description",
        content:
          "Create a private family circle to encourage each other in Salah, Quran and Dhikr — with full control over what you share.",
      },
      { property: "og:title", content: "Family Connect — Grow in Worship Together" },
      {
        property: "og:description",
        content: "A gentle, private way for families to support each other in daily worship.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FamilyPage,
});

type Profile = { id: string; display_name: string | null; last_active: string | null };
type Family = { id: string; name: string; invite_code: string; created_by: string };
type Encouragement = {
  id: string;
  family_id: string;
  from_user: string;
  to_user: string;
  message: string;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/*  Illustration                                                       */
/* ------------------------------------------------------------------ */

function FamilyIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 180" className={className} role="img" aria-label="A family praying together under a starry arch">
      <defs>
        <linearGradient id="fc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d="M40 170V70a120 120 0 0 1 240 0v100Z" fill="url(#fc-sky)" />
      <path
        d="M40 170V70a120 120 0 0 1 240 0v100"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      {[
        [92, 52],
        [160, 36],
        [228, 52],
        [126, 70],
        [196, 70],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 1.6 : 2.4} fill="currentColor" opacity="0.5" />
      ))}
      <path
        d="M150 44a13 13 0 1 0 0 22 16 16 0 0 1 0-22Z"
        fill="currentColor"
        opacity="0.55"
      />
      {/* three figures in sujood-friendly silhouettes */}
      {[
        { x: 104, s: 1 },
        { x: 160, s: 1.22 },
        { x: 216, s: 0.86 },
      ].map(({ x, s }, i) => (
        <g key={i} transform={`translate(${x} 170) scale(${s})`} opacity={0.85}>
          <circle cx="0" cy="-46" r="10" fill="currentColor" opacity="0.75" />
          <path d="M-18 0c0-20 8-32 18-32s18 12 18 32Z" fill="currentColor" opacity="0.6" />
        </g>
      ))}
      <path d="M28 170h264" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function Ring({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total ? Math.min(1, value / total) : 0;
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-[68px]">
        <svg viewBox="0 0 64 64" className="size-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-primary transition-[stroke-dashoffset] duration-700"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-semibold tabular-nums">
          {value}
          <span className="sr-only"> of {total}</span>
        </span>
      </div>
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  note,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  note: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border/70 bg-background/50 px-3 py-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{note}</span>
      </span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden
        className="mt-0.5 h-6 w-11 shrink-0 rounded-full bg-muted p-0.5 transition peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50"
      >
        <span className="block size-5 rounded-full bg-background shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Friendly errors — raw database messages never reach the screen     */
/* ------------------------------------------------------------------ */

function friendlyError(err: unknown, fallback: string) {
  const raw = (err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "")
    .toLowerCase();
  if (!raw) return fallback;
  if (raw.includes("not signed in") || raw.includes("jwt") || raw.includes("401"))
    return "Your session expired. Please sign in again.";
  if (raw.includes("no family found") || raw.includes("not found"))
    return "That invite code doesn't match any family circle. Double-check it and try again.";
  if (raw.includes("duplicate") || raw.includes("already"))
    return "You're already part of this family circle.";
  if (raw.includes("permission") || raw.includes("denied") || raw.includes("policy"))
    return "You don't have access to that family circle.";
  if (raw.includes("fetch") || raw.includes("network"))
    return "You appear to be offline. We'll sync as soon as you're back online.";
  if (raw.includes("required")) return "Please enter a family name first.";
  return fallback;
}

/** Invite code used by the client-side fallback when the database helper is unreachable. */
function buildInviteCode(name: string) {
  const base = name.replace(/[^a-zA-Z]/g, "").slice(0, 8).toUpperCase() || "FAMILY";
  return `${base}-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */


function FamilyPage() {
  const { user, loading: authLoading } = useAuthUser();

  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [progress, setProgress] = useState<MemberProgress[]>([]);
  const [notes, setNotes] = useState<Encouragement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [local, setLocal] = useState<LocalToday>(() => ({
    day: todayIso(),
    quran_pages: 0,
    dhikr: 0,
    prayers: [],
    streak: 0,
    good_deeds: 0,
    fasting: false,
    tahajjud: false,
    sadaqah: false,
  }));

  const [familyName, setFamilyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [scanOpen, setScanOpen] = useState(false);

  const mounted = useRef(true);
  useEffect(() => () => void (mounted.current = false), []);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    const { data: mine, error: e1 } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", user.id)
      .limit(1);
    if (e1) {
      setError(friendlyError(e1, "We couldn't load your family circle. Please refresh and try again."));
      setLoading(false);
      return;
    }

    const membership = mine?.[0] as FamilyMember | undefined;
    if (!membership) {
      setFamily(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    const [{ data: fam }, { data: mem }] = await Promise.all([
      supabase.from("families").select("*").eq("id", membership.family_id).maybeSingle(),
      supabase.from("family_members").select("*").eq("family_id", membership.family_id),
    ]);

    const memberRows = (mem ?? []) as FamilyMember[];
    const ids = memberRows.map((m) => m.user_id);

    const [{ data: profs }, { data: prog }, { data: enc }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, last_active").in("id", ids),
      supabase.rpc("get_family_progress", { _since: lastNDays(7)[0]! }),
      supabase
        .from("encouragements")
        .select("*")
        .eq("family_id", membership.family_id)
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

    if (!mounted.current) return;
    setFamily((fam as Family | null) ?? null);
    setMembers(memberRows);
    setProfiles(Object.fromEntries(((profs ?? []) as Profile[]).map((p) => [p.id, p])));
    setProgress((prog ?? []) as MemberProgress[]);
    setNotes((enc ?? []) as Encouragement[]);
    setLoading(false);
  }, [user]);

  // initial load + push this device's worship log into the shared view
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    setLocal(readLocalToday());
    void syncMyProgress(user.id).finally(() => void load());
  }, [user, authLoading, load]);

  // realtime: keep every family member's view in sync
  useEffect(() => {
    if (!family) return;
    const channel = supabase
      .channel(`family-${family.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_progress" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "encouragements" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "family_members" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [family, load]);

  const myMembership = members.find((m) => m.user_id === user?.id) ?? null;
  const today = todayIso();
  const days = useMemo(() => lastNDays(7), []);
  const byUserToday = useMemo(() => {
    const map: Record<string, MemberProgress> = {};
    for (const p of progress) if (p.day === today) map[p.user_id] = p;
    return map;
  }, [progress, today]);

  const familyToday = useMemo(() => {
    const prayers = members.reduce((sum, m) => sum + (byUserToday[m.user_id]?.prayers?.length ?? 0), 0);
    const quran = members.reduce((sum, m) => sum + (byUserToday[m.user_id]?.quran_pages ?? 0), 0);
    const dhikr = members.reduce((sum, m) => sum + (byUserToday[m.user_id]?.dhikr ?? 0), 0);
    return { prayers, quran, dhikr, target: members.length * 5 };
  }, [members, byUserToday]);

  const weekTotals = useMemo(
    () =>
      days.map((d) => ({
        day: d,
        prayers: progress.filter((p) => p.day === d).reduce((s, p) => s + (p.prayers?.length ?? 0), 0),
      })),
    [days, progress],
  );

  const myWeek = useMemo(() => {
    const mine = progress.filter((p) => p.user_id === user?.id);
    return {
      prayers: mine.reduce((s, p) => s + (p.prayers?.length ?? 0), 0),
      quran: mine.reduce((s, p) => s + (p.quran_pages ?? 0), 0),
      dhikr: mine.reduce((s, p) => s + (p.dhikr ?? 0), 0),
      streak: byUserToday[user?.id ?? ""]?.streak ?? local.streak,
    };
  }, [progress, user, byUserToday, local.streak]);

  const badges = badgesFor(myWeek.streak, myWeek.prayers, myWeek.quran, familyToday.dhikr);

  /* --------------------------- actions --------------------------- */

  const createFamily = async () => {
    const name = familyName.trim();
    if (!user || busy) return;
    if (name.length < 2) {
      setError("Please give your circle a name with at least 2 letters.");
      return;
    }
    setBusy(true);
    setError(null);

    // Make sure the request carries a fresh token — an expired one is the most
    // common reason a circle "can't be created".
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("Your session expired. Please sign in again.");
      setBusy(false);
      return;
    }

    const rpc = await supabase.rpc("create_family", { _name: name });
    let created = (rpc.data as Family[] | null)?.[0] ?? null;

    if (!created) {
      // Fallback: create the circle directly so the user is never blocked.
      const insert = await supabase
        .from("families")
        .insert({ name, invite_code: buildInviteCode(name), created_by: user.id })
        .select("*")
        .maybeSingle();
      if (insert.data) {
        await supabase
          .from("family_members")
          .insert({ family_id: (insert.data as Family).id, user_id: user.id, role: "owner" });
        created = insert.data as Family;
      } else {
        setError(
          friendlyError(
            rpc.error ?? insert.error,
            "We couldn't create your family circle just now. Please try again.",
          ),
        );
        setBusy(false);
        return;
      }
    }

    // Show the new circle instantly, then refresh details in the background.
    setFamilyName("");
    setFamily(created);
    setLoading(false);
    setBusy(false);
    void load();
  };

  const joinFamily = async (codeArg?: string) => {
    const code = (codeArg ?? joinCode).trim();
    if (!code || busy) return;
    setBusy(true);
    setError(null);
    const { error: e1 } = await supabase.rpc("join_family_by_code", { _code: code.toUpperCase() });
    if (e1) {
      setError(friendlyError(e1, "We couldn't join that family circle. Please check the code and try again."));
      setBusy(false);
      return;
    }
    setJoinCode("");
    await load();
    setBusy(false);
  };

  const leaveFamily = async () => {
    if (!myMembership) return;
    setBusy(true);
    setError(null);
    const { error: e1 } = await supabase.from("family_members").delete().eq("id", myMembership.id);
    if (e1) {
      setError(friendlyError(e1, "We couldn't leave the circle right now. Please try again."));
      setBusy(false);
      return;
    }
    setFamily(null);
    setMembers([]);
    await load();
    setBusy(false);
  };


  const setPrivacy = async (key: PrivacyKey, value: boolean) => {
    if (!myMembership) return;
    setMembers((prev) => prev.map((m) => (m.id === myMembership.id ? { ...m, [key]: value } : m)));
    await supabase
      .from("family_members")
      .update({ [key]: value } as Record<PrivacyKey, boolean>)
      .eq("id", myMembership.id);
  };

  const encourage = async (toUser: string, message: string) => {
    if (!user || !family) return;
    await supabase
      .from("encouragements")
      .insert({ family_id: family.id, from_user: user.id, to_user: toUser, message });
    await load();
  };

  const toggleFlag = async (flag: DeedFlag) => {
    toggleLocalFlag(flag);
    setLocal(readLocalToday());
    if (user) {
      await syncMyProgress(user.id);
      await load();
    }
  };

  const logLocal = async (kind: "quran" | "dhikr" | "deeds", amount: number) => {
    bumpLocal(kind, amount);
    setLocal(readLocalToday());
    if (user) {
      await syncMyProgress(user.id);
      await load();
    }
  };

  const inviteLink = family
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/family?code=${family.invite_code}`
    : "";

  useEffect(() => {
    if (!showQr || !inviteLink) return;
    let cancelled = false;
    void import("qrcode").then(async (m) => {
      const url = await m.toDataURL(inviteLink, { margin: 1, width: 320 });
      if (!cancelled) setQr(url);
    });
    return () => {
      cancelled = true;
    };
  }, [showQr, inviteLink]);

  // pre-fill the join code when arriving from an invite link
  useEffect(() => {
    if (typeof window === "undefined") return;
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) setJoinCode(code.toUpperCase());
  }, []);

  /* A scanned QR holds either the invite link or the bare code — both join instantly. */
  const handleScanned = (text: string) => {
    let code = text.trim();
    try {
      const url = new URL(text);
      code = url.searchParams.get("code") ?? code;
    } catch {
      /* not a URL — treat as a raw code */
    }
    code = code.replace(/\s+/g, "").toUpperCase();
    setJoinCode(code);
    void joinFamily(code);
  };

  const copyCode = async () => {
    if (!family) return;
    await navigator.clipboard.writeText(family.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/");
  };



  /* --------------------------- render --------------------------- */

  if (authLoading || (user && loading)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-label="Loading Family Connect" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden text-center">
          <FamilyIllustration className="mx-auto w-full max-w-sm text-primary" />
          <h1 className="mt-4 font-display text-2xl">Family Connect</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Grow in worship together. A private circle where your family can gently encourage each other in
            Salah, Quran and Dhikr — you decide what is shared.
          </p>
          <p className="arabic-ayah mt-4 text-lg">وَأْمُرْ أَهْلَكَ بِالصَّلَاةِ وَاصْطَبِرْ عَلَيْهَا</p>
          <p className="text-xs text-muted-foreground">
            “And enjoin prayer upon your family and be steadfast therein.” — Ṭā Hā 20:132
          </p>
          <Link
            to="/auth"
            search={{ next: "/family" }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl gradient-hero px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Users className="size-4" /> Sign in to begin
          </Link>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "🤍", t: "Private by default", d: "Nothing is shared until you turn it on." },
            { icon: "🌙", t: "Encourage, never shame", d: "Warm nudges — no rankings, no pressure." },
            { icon: "🏆", t: "Grow together", d: "Family challenges, streaks and gentle badges." },
          ].map((f) => (
            <Card key={f.t}>
              <div className="text-2xl">{f.icon}</div>
              <h2 className="mt-2 text-sm font-semibold">{f.t}</h2>
              <p className="text-xs text-muted-foreground">{f.d}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => void handleSignOut()}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold transition hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-3.5" /> Log out
          </button>
        </div>

        <Card className="text-center">
          <FamilyIllustration className="mx-auto w-full max-w-xs text-primary" />
          <h1 className="mt-3 font-display text-2xl">Start your family circle</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new circle and invite your family, or join with a code someone shared with you.
          </p>
        </Card>

        {error && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="flex items-center gap-2 font-display text-lg">
              <Plus className="size-4 text-primary" /> Create a family
            </h2>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Family name</span>
              <input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="The Hidayath Family"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <button
              onClick={createFamily}
              disabled={busy || !familyName.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl gradient-hero px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />} Create circle
            </button>
          </Card>

          <Card className="space-y-3">
            <h2 className="flex items-center gap-2 font-display text-lg">
              <QrCode className="size-4 text-primary" /> Join a family
            </h2>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Invite code</span>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="FAMILY-1234"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-sm tracking-widest outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <button
              onClick={() => void joinFamily()}
              disabled={busy || !joinCode.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />} Join circle
            </button>
            <button
              onClick={() => setScanOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-accent/10"
            >
              <ScanLine className="size-4 text-primary" /> Scan QR code
            </button>
            <p className="text-xs text-muted-foreground">
              Scan a family member's invite QR and you'll join the circle straight away — full access, nothing else to fill in.
            </p>
          </Card>
        </div>

        <QrCodeScanner open={scanOpen} onClose={() => setScanOpen(false)} onResult={handleScanned} />
      </div>
    );
  }

  const maxWeek = Math.max(1, ...weekTotals.map((w) => w.prayers));

  return (
    <div className="space-y-6">
      {/* header */}
      <Card className="relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Family Connect</p>
            <h1 className="font-display text-2xl">{family.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {members.length} member{members.length === 1 ? "" : "s"} growing together
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 font-mono text-xs tracking-widest transition hover:bg-accent/10"
            >
              <Copy className="size-3.5" /> {copied ? "Copied!" : family.invite_code}
            </button>
            <button
              onClick={() => setShowQr(true)}
              className="inline-flex items-center gap-2 rounded-xl gradient-hero px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
              <QrCode className="size-3.5" /> Invite
            </button>
            <button
              onClick={() => void load()}
              aria-label="Refresh"
              className="rounded-xl border border-border p-2 transition hover:bg-accent/10"
            >
              <RefreshCw className="size-3.5" />
            </button>
            <button
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold transition hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-3.5" /> Log out
            </button>

          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-around gap-4 rounded-2xl border border-border/60 bg-background/40 p-4">
          <Ring value={familyToday.prayers} total={familyToday.target} label="Prayers today" />
          <Ring value={familyToday.quran} total={Math.max(10, members.length * 5)} label="Quran pages" />
          <Ring value={familyToday.dhikr} total={Math.max(100, members.length * 100)} label="Dhikr" />
        </div>
      </Card>

      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* members */}
      <section>
        <SectionTitle title="Your family" subtitle="Only what each person chose to share is shown" />
        <div className="grid gap-4 sm:grid-cols-2">
          {members.map((m) => {
            const isMe = m.user_id === user.id;
            const p = byUserToday[m.user_id];
            const prof = profiles[m.user_id];
            const name = isMe ? "You" : (prof?.display_name ?? "Family member");
            const done = p?.prayers?.length ?? 0;
            return (
              <Card key={m.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full gradient-hero text-sm font-semibold text-primary-foreground">
                    {(name[0] ?? "?").toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {name}
                      {m.role === "admin" && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                          admin
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isMe || m.share_last_active ? `Active ${relativeTime(prof?.last_active)}` : "Activity hidden"}
                    </p>
                  </div>
                  {(isMe || m.share_streak) && (
                    <span className="ml-auto rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      🔥 {p?.streak ?? 0}
                    </span>
                  )}
                </div>

                {isMe || m.share_salah ? (
                  <div className="flex flex-wrap gap-1.5" aria-label={`${name}: ${done} of 5 prayers today`}>
                    {PRAYERS.map((pr) => {
                      const ok = p?.prayers?.includes(pr);
                      const hidden = !isMe && m.hide_prayer_times;
                      return (
                        <span
                          key={pr}
                          className={`rounded-lg px-2 py-1 text-[11px] font-medium ${
                            ok
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {hidden ? (ok ? "✓" : "·") : pr}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    Salah kept private 🤍
                  </p>
                )}

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {(isMe || m.share_quran) && <span>📖 {p?.quran_pages ?? 0} pages</span>}
                  {(isMe || m.share_dhikr) && <span>📿 {p?.dhikr ?? 0} dhikr</span>}
                  {(isMe || m.share_deeds) && <span>🌸 {p?.good_deeds ?? 0} good deeds</span>}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {DEED_FLAGS.map((f) => {
                    const shared =
                      isMe ||
                      (f.key === "fasting" ? m.share_fasting : f.key === "tahajjud" ? m.share_tahajjud : m.share_sadaqah);
                    if (!shared) return null;
                    const on = Boolean(p?.[f.key]);
                    return (
                      <span
                        key={f.key}
                        title={f.note}
                        className={`rounded-lg px-2 py-1 text-[11px] font-medium ${
                          on ? "bg-accent/20 text-accent-foreground" : "bg-muted text-muted-foreground line-through"
                        }`}
                      >
                        {f.emoji} {f.label}
                      </span>
                    );
                  })}
                </div>

                {!isMe && (
                  <div className="flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
                    {ENCOURAGEMENTS.slice(0, 4).map((msg) => (
                      <button
                        key={msg}
                        onClick={() => void encourage(m.user_id, msg)}
                        className="rounded-full border border-border px-2.5 py-1 text-[11px] transition hover:bg-primary/10 hover:text-primary"
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* quick log */}
      <section>
        <SectionTitle title="Log today" subtitle="Saved on your device, then synced to your circle instantly" />
        <Card className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { emoji: "📖", label: "Quran", value: `${local.quran_pages} pages`, add: () => void logLocal("quran", 1), cta: "+1 page" },
              { emoji: "📿", label: "Dhikr", value: `${local.dhikr}`, add: () => void logLocal("dhikr", 33), cta: "+33" },
              { emoji: "🌸", label: "Good deeds", value: `${local.good_deeds}`, add: () => void logLocal("deeds", 1), cta: "+1 deed" },
            ].map((row) => (
              <div key={row.label} className="rounded-xl border border-border/70 bg-background/50 p-3">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {row.emoji} {row.label}
                </p>
                <p className="mt-1 font-display text-lg tabular-nums">{row.value}</p>
                <button
                  onClick={row.add}
                  className="mt-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-primary/10 hover:text-primary"
                >
                  {row.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {DEED_FLAGS.map((f) => {
              const on = local[f.key];
              return (
                <button
                  key={f.key}
                  onClick={() => void toggleFlag(f.key)}
                  aria-pressed={on}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    on
                      ? "border-transparent gradient-hero text-primary-foreground shadow-soft"
                      : "border-border text-muted-foreground hover:text-primary"
                  }`}
                >
                  {f.emoji} {f.label}
                </button>
              );
            })}
            <Link to="/tracker" className="ml-auto self-center text-xs font-semibold text-primary underline-offset-4 hover:underline">
              Mark prayers in the tracker →
            </Link>
          </div>
        </Card>
      </section>



      {/* weekly */}
      <section>
        <SectionTitle title="This week together" subtitle="Total prayers completed by the family each day" />
        <Card>
          <div className="flex items-end justify-between gap-2" role="img" aria-label="Weekly family prayer chart">
            {weekTotals.map((w) => (
              <div key={w.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] tabular-nums text-muted-foreground">{w.prayers}</span>
                <div
                  className="w-full rounded-t-lg gradient-hero transition-all"
                  style={{ height: `${Math.max(6, (w.prayers / maxWeek) * 96)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {new Date(`${w.day}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* encouragements */}
      <section>
        <SectionTitle title="Encouragement wall" subtitle="Kind words from your family" />
        <Card className="space-y-2">
          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No messages yet — send the first kind word from a member card above.
            </p>
          )}
          {notes.map((n) => (
            <div key={n.id} className="flex items-start gap-3 rounded-xl bg-background/50 px-3 py-2 text-sm">
              <Heart className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p>{n.message}</p>
                <p className="text-[11px] text-muted-foreground">
                  {profiles[n.from_user]?.display_name ?? "Someone"} →{" "}
                  {n.to_user === user.id ? "you" : (profiles[n.to_user]?.display_name ?? "family")} ·{" "}
                  {relativeTime(n.created_at)}
                </p>
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* challenges + badges */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 font-display text-lg">
            <Sparkles className="size-4 text-primary" /> Family challenges
          </h2>
          <ul className="mt-3 space-y-3">
            {[
              { t: "Everyone prays Fajr for 7 days", now: weekTotals.filter((w) => w.prayers > 0).length, goal: 7 },
              { t: "Read 100 Quran pages together", now: familyToday.quran, goal: 100 },
              { t: "10,000 dhikr as a family", now: familyToday.dhikr, goal: 10000 },
            ].map((c) => (
              <li key={c.t}>
                <div className="flex justify-between text-sm">
                  <span>{c.t}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {Math.min(c.now, c.goal)}/{c.goal}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full gradient-hero transition-all"
                    style={{ width: `${Math.min(100, (c.now / c.goal) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-display text-lg">
            <Trophy className="size-4 text-primary" /> Badges
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {badges.map((b) => (
              <li
                key={b.id}
                className={`rounded-xl border px-3 py-2 text-xs ${
                  b.earned ? "border-primary/40 bg-primary/10" : "border-border/60 opacity-60"
                }`}
              >
                <span className="text-base">{b.icon}</span>
                <p className="font-medium">{b.label}</p>
                <p className="text-[11px] text-muted-foreground">{b.note}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* privacy */}
      <section>
        <SectionTitle title="Your privacy" subtitle="You are always in control — change this any time" />
        <Card className="space-y-2">
          {myMembership &&
            PRIVACY_OPTIONS.map((o) => (
              <Toggle
                key={o.key}
                label={o.label}
                note={o.note}
                checked={Boolean(myMembership[o.key])}
                onChange={(v) => void setPrivacy(o.key, v)}
              />
            ))}
          <button
            onClick={leaveFamily}
            className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-destructive underline-offset-4 hover:underline"
          >
            <LogOut className="size-3.5" /> Leave this family
          </button>
        </Card>
      </section>

      {/* QR modal */}
      {showQr && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Family invite"
          className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur"
          onClick={() => setShowQr(false)}
        >
          <div
            className="glass-card w-full max-w-sm space-y-4 rounded-2xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Invite your family</h2>
              <button onClick={() => setShowQr(false)} aria-label="Close" className="rounded-lg p-1 hover:bg-accent/10">
                <X className="size-4" />
              </button>
            </div>
            {qr ? (
              <img src={qr} alt="QR code containing your family invite link" className="mx-auto rounded-xl bg-white p-2" />
            ) : (
              <div className="grid h-64 place-items-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
            <p className="font-mono text-sm tracking-widest">{family.invite_code}</p>
            <button
              onClick={copyCode}
              className="w-full rounded-xl gradient-hero px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {copied ? "Copied!" : "Copy invite code"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
