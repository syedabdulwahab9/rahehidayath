import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { stopAllAudio } from "@/lib/audio-bus";
import { SettingsProvider } from "@/lib/settings";
import { AppShell } from "@/components/AppShell";
import { AutoTranslate } from "@/lib/auto-translate";
import { Toaster } from "@/components/ui/sonner";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Raah e Hidayath — The Path of Guidance" },
      {
        name: "description",
        content:
          "Quran with audio, translation and tafseer, hadith books, prayer times, Qibla, duas and Islamic learning in many languages.",
      },
      { name: "author", content: "Raah e Hidayath" },
      { property: "og:title", content: "Raah e Hidayath — The Path of Guidance" },
      {
        property: "og:description",
        content: "Quran with audio, translation and tafseer, hadith books, prayer times, Qibla, duas and Islamic learning in many languages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Raah e Hidayath — The Path of Guidance" },
      { name: "twitter:description", content: "Quran with audio, translation and tafseer, hadith books, prayer times, Qibla, duas and Islamic learning in many languages." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/18f091fe-f8a0-4fae-bace-7470948a7529/id-preview-a4aa9c6f--9dfdcb34-0d4b-4411-9baf-e851db649041.lovable.app-1785742190193.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/18f091fe-f8a0-4fae-bace-7470948a7529/id-preview-a4aa9c6f--9dfdcb34-0d4b-4411-9baf-e851db649041.lovable.app-1785742190193.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:wght@400;700&family=Marcellus&family=Noto+Nastaliq+Urdu:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;600;700&family=Outfit:wght@400;500;600;700&family=Cairo:wght@400;600;700&family=Lora:wght@400;600&family=Playfair+Display:wght@400;600;700&family=Source+Serif+4:wght@400;600&family=Space+Mono:wght@400;700&family=Reem+Kufi:wght@400;600&family=Kufam:wght@400;600&family=Scheherazade+New:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&family=Lateef&family=Gulzar&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/logo.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Raah e Hidayath",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
          description:
            "Quran with audio, translation and tafseer, hadith books, prayer times, Qibla, duas and Islamic learning in many languages.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Whatever is playing must stop when the user navigates away, goes back,
 *  or sends the app to the background — never audio in the background. */
function AudioGuard() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    return () => stopAllAudio();
  }, [pathname]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") stopAllAudio();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", stopAllAudio);
    window.addEventListener("popstate", stopAllAudio);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", stopAllAudio);
      window.removeEventListener("popstate", stopAllAudio);
      stopAllAudio();
    };
  }, []);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AudioGuard />
        <AutoTranslate />
        <AppShell>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </AppShell>
        <Toaster position="top-center" richColors />

      </SettingsProvider>
    </QueryClientProvider>
  );
}

