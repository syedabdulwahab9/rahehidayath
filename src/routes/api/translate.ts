import { createFileRoute } from "@tanstack/react-router";

type Body = { language?: string; texts?: string[] };

const LANG_NAMES: Record<string, string> = {
  en: "English", ur: "Urdu", ar: "Arabic", bn: "Bengali", id: "Indonesian", tr: "Turkish",
  fr: "French", ru: "Russian", es: "Spanish", hi: "Hindi", ta: "Tamil", ml: "Malayalam", fa: "Persian",
};

const MODEL = "google/gemini-3-flash-preview";

export const Route = createFileRoute("/api/translate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const texts = (body.texts ?? []).filter((t) => typeof t === "string").slice(0, 200);
        const code = body.language ?? "en";
        const language = LANG_NAMES[code] ?? "English";

        if (texts.length === 0 || code === "en") {
          return Response.json({ translations: texts });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return Response.json({ translations: texts });

        const system = `You are a precise Islamic-content translator. Translate each item of the given JSON array of English strings into ${language}, using the native script of ${language}. Keep Arabic quotations, proper nouns of people and places, surah names, hadith references and numbers exactly as they are. Keep Islamic terms (salah, wudu, zakat, halal, haram, mushbooh) in the form a ${language} speaking Muslim normally uses. Do not add, merge, reorder or drop items. Reply with ONLY a JSON array of the same length, no markdown, no commentary.`;

        try {
          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: MODEL,
              messages: [
                { role: "system", content: system },
                { role: "user", content: JSON.stringify(texts) },
              ],
              max_tokens: 8192,
            }),
          });

          if (!upstream.ok) {
            const detail = await upstream.text().catch(() => "");
            console.error(`Translate gateway failed [${upstream.status}]: ${detail.slice(0, 300)}`);
            return Response.json({ translations: texts, error: `upstream_${upstream.status}` });
          }

          const json = (await upstream.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const raw = json.choices?.[0]?.message?.content ?? "";
          const start = raw.indexOf("[");
          const end = raw.lastIndexOf("]");
          if (start === -1 || end === -1) return Response.json({ translations: texts });
          const parsed = JSON.parse(raw.slice(start, end + 1)) as unknown;
          if (!Array.isArray(parsed) || parsed.length !== texts.length) {
            return Response.json({ translations: texts });
          }
          const translations = parsed.map((v, i) => (typeof v === "string" && v.trim() ? v : texts[i]!));
          return Response.json({ translations });
        } catch (err) {
          console.error("Translate failed", err);
          return Response.json({ translations: texts, error: "failed" });
        }
      },
    },
  },
});
