import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { Card } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | Raah e Hidayath" },
      {
        name: "description",
        content:
          "Sign in or create your Raah e Hidayath account to use Family Connect, the admin panel and your personal worship tools.",
      },
      { property: "og:title", content: "Sign in | Raah e Hidayath" },
      { property: "og:description", content: "Sign in to your Raah e Hidayath account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search["next"] === "string" ? (search["next"] as string) : "/",
  }),
  component: AuthPage,
});

function safePath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

const NEXT_KEY = "reh-auth-next";

function AuthPage() {
  const { next } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { user, loading } = useAuthUser();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  // Destination survives a full-page OAuth round trip. An explicit ?next=
  // always wins so /admin never falls back to Family Connect.
  const destination = (() => {
    if (next && next !== "/") return safePath(next);
    if (typeof window === "undefined") return "/";
    const stored = window.sessionStorage.getItem(NEXT_KEY);
    return safePath(stored ?? "/");
  })();

  const forAdmin = destination.startsWith("/admin");

  useEffect(() => {
    if (loading || !user) return;
    if (typeof window !== "undefined") window.sessionStorage.removeItem(NEXT_KEY);
    void navigate({ to: destination, replace: true });
  }, [user, loading, destination, navigate]);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    setNeedsConfirm(false);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(destination)}`,
            data: { display_name: name.trim() || email.split("@")[0] },
          },
        });
        if (err) throw err;
        if (data.session) {
          // signed in immediately — the effect above handles the redirect
        } else {
          setNeedsConfirm(true);
          setMessage("Account created. Check your inbox and click the confirmation link to finish.");
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        // Session is now stored; onAuthStateChange drives the redirect.
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      if (/email not confirmed|not confirmed/i.test(msg)) {
        setNeedsConfirm(true);
        setError(
          "This email hasn't been confirmed yet. Open the confirmation link we emailed you, or resend it below.",
        );
      } else if (/invalid login credentials/i.test(msg)) {
        setError("Email or password is incorrect.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const resendConfirmation = async () => {
    if (!email) {
      setError("Enter your email first, then resend.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(destination)}`,
        },
      });
      if (err) throw err;
      setMessage("Confirmation email sent. Open the link on this device to finish signing in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the email.");
    } finally {
      setBusy(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-label="Restoring your session" />
      </div>
    );
  }


  return (
    <div className="mx-auto w-full max-w-lg space-y-7 py-4 sm:py-8">
      <div className="text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-3xl gradient-hero text-primary-foreground shadow-glow">
          <ShieldCheck className="size-7" />
        </span>
        <h1 className="mt-5 font-display text-3xl sm:text-4xl">
          {forAdmin
            ? "Administrator sign in"
            : mode === "signin"
              ? "Welcome back"
              : "Create your account"}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {forAdmin
            ? "Only accounts with administrator access can open the admin panel."
            : "Your account keeps your worship data private. Nothing is shared until you allow it."}
        </p>
      </div>

      <Card className="space-y-6 p-6 sm:p-8">
        <form onSubmit={submit} className="space-y-5">
          {mode === "signup" && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Ahmed"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-base outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
              />
            </label>
          )}
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-base outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-base outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
              <Mail className="mr-1 inline size-3" /> {message}
            </p>
          )}
          {needsConfirm && (
            <button
              type="button"
              onClick={() => void resendConfirmation()}
              disabled={busy}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-xs font-semibold transition hover:bg-accent/10 disabled:opacity-60"
            >
              Resend confirmation email
            </button>
          )}


          <button
            type="submit"
            disabled={busy || loading}
            className="flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl gradient-hero px-4 py-4 text-base font-semibold text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        <Link to="/" className="underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
