import { useEffect } from "react";
import { usePublishedSection } from "@/lib/cloud-state";
import {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_SEO,
  liveAnnouncements,
  type AnnouncementBoard,
  type SeoConfig,
} from "@/lib/site-content";

/**
 * Public-facing banner. Reads the published announcements straight from the
 * production database and updates live over the realtime channel, so a notice
 * published by the admin appears on every device worldwide without a reload.
 */
export function LiveAnnouncements() {
  const board = usePublishedSection<AnnouncementBoard>("announcements", DEFAULT_ANNOUNCEMENTS);
  const items = liveAnnouncements(board);
  if (!items.length) return null;

  return (
    <div className="app-container px-4 pt-4">
      <ul className="space-y-2">
        {items.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm"
          >
            <span className="min-w-0 flex-1">{a.text}</span>
            {a.link && (
              <a
                href={a.link}
                className="shrink-0 font-semibold text-primary underline underline-offset-4"
              >
                {a.buttonText || "Open"}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const setMeta = (selector: string, attr: string, name: string, content: string) => {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

/** Applies the admin-published SEO record to the live document head. */
export function LiveSeo() {
  const seo = usePublishedSection<SeoConfig>("seo", DEFAULT_SEO);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (seo.title) document.title = seo.title;
    setMeta('meta[name="description"]', "name", "description", seo.description);
    setMeta('meta[name="keywords"]', "name", "keywords", seo.keywords);
    setMeta('meta[name="robots"]', "name", "robots", seo.robots);
    setMeta('meta[property="og:title"]', "property", "og:title", seo.ogTitle || seo.title);
    setMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      seo.ogDescription || seo.description,
    );
    setMeta('meta[property="og:image"]', "property", "og:image", seo.ogImage);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", seo.ogImage);
    if (seo.canonical) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = seo.canonical;
    }
  }, [seo]);

  return null;
}
