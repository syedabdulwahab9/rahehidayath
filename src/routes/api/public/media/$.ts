import { createFileRoute } from "@tanstack/react-router";

/**
 * Public, permanent link for every file uploaded from the admin media manager.
 * The file lives in production cloud storage; this route only streams it, so
 * the same URL works on every device and in every country.
 */
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            /* Uploaded files are immutable (unique name per upload). */
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
