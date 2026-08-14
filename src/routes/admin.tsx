import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, LogOut, ShieldCheck, Sparkles, User } from "lucide-react";
import { Card, SectionTitle } from "@/components/AppShell";
import { AdminContentEditor } from "@/components/AdminContentEditor";
import { AdminSiteEditor } from "@/components/AdminSiteEditor";
import { AdminTeamEditor } from "@/components/AdminTeamEditor";

import { FEATURE_META, defaultFeatureFlags, useFeatureFlags, writeFlags } from "@/lib/feature-flags";
import {
  adminSignIn,
  adminSignOut,
  createAdminAccount,
  hasAdminAccount,
  isAdminUnlocked,
} from "@/lib/admin-local";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel | Raah e Hidayath" },
      {
        name: "description",
        content: "Private administrator panel for editing the Raah e Hidayath website content, team and visible sections.",
      },
      { property: "og:title", content: "Admin Panel | Raah e Hidayath" },
      { property: "og:description", content: "Edit your website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState("");
  const liveFlags = useFeatureFlags();
  const [flags, setFlags] = useState<Record<string, boolean>>(defaultFeatureFlags);

  useEffect(() => {
    setFlags({ ...liveFlags });
  }, [liveFlags]);

  useEffect(() => {
    /* The gate lives in this browser only — no server, no database. */
    setUnlocked(isAdminUnlocked());
    setChecking(false);
  }, []);

  const saveFlags = (next: Record<string, boolean>, message: string) => {
    setFlags(next);
    void writeFlags(next)
      .then(() => setStatus(message))
      .catch(() => setStatus("Could not save visibility. Please try again."));
  };

  const logout = () => {
    adminSignOut();
    setUnlocked(false);
  };

  if (checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" aria-label="Checking admin access" />
      </div>
    );
  }

  if (!unlocked) return <AdminLogin onSuccess={() => setUnlocked(true)} />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title="Website Admin" subtitle="Private to this browser — every change is saved here and survives a refresh" />
        <button onClick={logout} className={`${BTN} border border-border hover:text-primary`}>
          <LogOut className="size-4" aria-hidden /> Sign out
        </button>
      </div>

      <p aria-live="polite" className={`text-sm text-primary ${status ? "" : "sr-only"}`}>
        {status}
      </p>

      <AdminSiteEditor />

      <AdminContentEditor />

      <AdminTeamEditor />

      <section aria-labelledby="features-heading" className="space-y-3">
        <h2 id="features-heading" className="font-display text-xl">
          Show or hide any part of the website
        </h2>
        <Card className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Every page, tool, navigation tab and home-page block is listed here. Turning something off removes it from
            the whole website instantly, and it stays that way after refreshing or closing the site.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                saveFlags(
                  Object.fromEntries(FEATURE_META.map((f) => [f.to, true])),
                  "Everything is now visible across the website.",
                )
              }
              className={`${BTN} gradient-hero text-primary-foreground`}
            >
              Show everything
            </button>
            <button
              onClick={() =>
                saveFlags(
                  Object.fromEntries(FEATURE_META.map((f) => [f.to, false])),
                  "Everything is now hidden across the website.",
                )
              }
              className={`${BTN} border border-border hover:text-primary`}
            >
              Hide everything
            </button>
            <button
              onClick={() => saveFlags(defaultFeatureFlags(), "Visibility reset to the defaults.")}
              className={`${BTN} border border-border hover:text-primary`}
            >
              Reset to default
            </button>
          </div>

          {["Main", "Tools", "Home page"].map((group) => (
            <div key={group}>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{group}</p>
              <ul className="divide-y divide-border/60">
                {FEATURE_META.filter((f) => f.group === group).map(({ to, label }) => {
                  const on = flags[to] !== false;
                  return (
                    <li key={to} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="text-sm font-medium">{label}</span>
                      <button
                        role="switch"
                        aria-checked={on}
                        aria-label={`Toggle ${label}`}
                        onClick={() =>
                          saveFlags(
                            { ...flags, [to]: flags[to] === false },
                            "Saved — the website updated everywhere.",
                          )
                        }
                        className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "gradient-hero" : "bg-secondary"}`}
                      >
                        <span
                          className={`absolute top-0.5 size-6 rounded-full bg-card shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ login */

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const userFieldId = useId();
  const passFieldId = useId();
  /* No account on this browser yet → first run creates the owner account. */
  const [setup, setSetup] = useState(false);
  useEffect(() => {
    setSetup(!hasAdminAccount());
  }, []);

  const signIn = async () => {
    setSigningIn(true);
    setError("");
    try {
      const result = setup
        ? await createAdminAccount(username, password)
        : await adminSignIn(username, password);
      if (result.ok) {
        onSuccess();
        return;
      }
      setError(result.message);
      setShake(true);
      window.setTimeout(() => setShake(false), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-2 py-8">
      {/* living background */}
      <span aria-hidden className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-primary/25 blur-3xl animate-float" />
      <span aria-hidden className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-accent/25 blur-3xl animate-float [animation-delay:1.4s]" />
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl animate-pulse" />

      <div className={`relative w-full max-w-2xl ${shake ? "animate-[shake_0.5s_ease-in-out]" : "animate-rise"}`}>
        <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 p-1 shadow-glow backdrop-blur-xl">
          {/* rotating gilded frame */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[conic-gradient(from_0deg,transparent,var(--color-primary),transparent,var(--color-accent),transparent)] opacity-40 animate-[spin_9s_linear_infinite]"
          />
          <div className="relative rounded-[1.85rem] bg-card/95 px-6 py-10 sm:px-12 sm:py-14">
            <div className="text-center">
              <span className="relative mx-auto grid size-20 place-items-center rounded-full gradient-hero text-primary-foreground shadow-glow">
                <span aria-hidden className="absolute inset-0 rounded-full bg-primary/40 animate-pulse-ring" />
                <ShieldCheck className="relative size-9" aria-hidden />
              </span>
              <h1 className="mt-6 font-display text-3xl leading-tight sm:text-4xl">
                {setup ? "Create your admin access" : "Administrator Access"}
              </h1>
              <p className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-accent" aria-hidden />
                {setup
                  ? "Choose a username and password — kept on this browser only"
                  : "Only the owner of Raah e Hidayath may enter"}
              </p>
            </div>

            <form
              className="mt-10 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                void signIn();
              }}
            >
              <FloatingField
                id={userFieldId}
                label="Username"
                icon={<User className="size-4" aria-hidden />}
                value={username}
                onChange={setUsername}
                autoComplete="username"
              />

              <FloatingField
                id={passFieldId}
                label="Password"
                icon={<Lock className="size-4" aria-hidden />}
                value={password}
                onChange={setPassword}
                autoComplete={setup ? "new-password" : "current-password"}
                type={showPass ? "text" : "password"}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    className="rounded-full p-2 text-muted-foreground transition hover:text-primary"
                  >
                    {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={signingIn || !username || !password}
                className="group relative min-h-14 w-full overflow-hidden rounded-full gradient-hero text-base font-semibold text-primary-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-60"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-primary-foreground/25 blur-md transition-transform duration-700 group-hover:translate-x-[350%]"
                />
                <span className="relative inline-flex items-center justify-center gap-2">
                  {signingIn ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ShieldCheck className="size-5" aria-hidden />}
                  {signingIn ? "Verifying…" : setup ? "Create & enter" : "Enter the panel"}
                </span>
              </button>
            </form>

            <p aria-live="polite" className={`mt-5 text-center text-sm text-destructive ${error ? "" : "sr-only"}`}>
              {error}
            </p>

            <p className="mt-8 text-center text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
              This browser only · Nothing leaves your device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingField({
  id,
  label,
  icon,
  value,
  onChange,
  type = "text",
  autoComplete,
  trailing,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-2xl border bg-background/70 px-4 pb-2.5 pt-6 transition-all duration-300 ${
        focused ? "border-primary shadow-glow" : "border-border"
      }`}
    >
      <span className={`transition-colors ${focused ? "text-primary" : "text-muted-foreground"}`}>{icon}</span>
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-11 origin-left transition-all duration-300 ${
          lifted ? "top-2 text-[0.62rem] uppercase tracking-[0.22em] text-primary" : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={200}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-8 w-full flex-1 bg-transparent text-base outline-none"
      />
      {trailing}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-4 bottom-0 h-px origin-left bg-gradient-to-r from-primary to-accent transition-transform duration-500 ${
          focused ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </div>
  );
}
