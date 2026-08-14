/**
 * The teacher's ear — server side.
 *
 * Two clearly separated jobs, so the app never confuses "the model produced
 * Arabic text" with "the recitation was correct":
 *
 *   transcribeRecitation — pure Arabic speech-to-text. It is told nothing about
 *                          the expected words, so it can never be biased into
 *                          confirming a word the learner did not say.
 *   analyzeTajweed       — an optional, explicitly-labelled pronunciation
 *                          opinion used only in Tajweed mode.
 *
 * All word-correctness decisions are made deterministically on the client by
 * the aligner, from the transcript alone.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

const TranscribeInput = z.object({
  /** base64 WAV (16 kHz mono). */
  audio: z.string().min(100).max(12_000_000),
});

export type Transcript = {
  text: string;
  /** true when the provider is unavailable — the UI must say so, not guess. */
  unavailable?: boolean;
};

function bytesFromBase64(base64: string) {
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export const transcribeRecitation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranscribeInput.parse(input))
  .handler(async ({ data }): Promise<Transcript> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { text: "", unavailable: true };

    const bytes = bytesFromBase64(data.audio);
    if (bytes.byteLength < 4000) return { text: "" };

    const form = new FormData();
    form.append("model", "openai/gpt-4o-transcribe");
    form.append("file", new Blob([bytes], { type: "audio/wav" }), "recitation.wav");
    form.append("language", "ar");

    const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("The teacher is listening to many students right now — pause a moment.");
      if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
      throw new Error(`Recognition failed [${res.status}]: ${body.slice(0, 300)}`);
    }

    const json = (await res.json()) as { text?: string };
    return { text: String(json.text ?? "") };
  });

/* ------------------------------------------------------------------ tajweed */

const TajweedInput = z.object({
  audio: z.string().min(100).max(12_000_000),
  expected: z.array(z.string()).min(1).max(24),
});

export type TajweedNote = {
  rule: string;
  severity: "minor" | "major";
  word: string;
  explanation: string;
  suggestion: string;
} | null;

const SYSTEM = `You are a qualified qari listening to one short clip of a student's Quran recitation.
The words the Mushaf expects are given to you. Word-order correctness is judged elsewhere — you ONLY comment on pronunciation and tajweed of the words that were actually recited.
If you cannot clearly hear a pronunciation problem, return null. Never invent a rule you did not hear. Never comment on words the student did not reach.
Choose "rule" from: makharij, heavy-light, wrong-vowel, shaddah, sukoon, madd, ghunnah, ikhfa, idgham, iqlab, izhar, qalqalah, lam-rule, ra-rule, waqf, sifat.
Write explanation and suggestion in warm, encouraging English.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["note"],
  properties: {
    note: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["rule", "severity", "word", "explanation", "suggestion"],
      properties: {
        rule: { type: "string" },
        severity: { type: "string", enum: ["minor", "major"] },
        word: { type: "string" },
        explanation: { type: "string" },
        suggestion: { type: "string" },
      },
    },
  },
} as const;

export const analyzeTajweed = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TajweedInput.parse(input))
  .handler(async ({ data }): Promise<{ note: TajweedNote; unavailable?: boolean }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { note: null, unavailable: true };

    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: `Expected words:\n${data.expected.join(" ")}` },
              { type: "input_audio", input_audio: { data: data.audio, format: "wav" } },
            ],
          },
        ],
        response_format: { type: "json_schema", json_schema: { name: "tajweed", strict: true, schema: SCHEMA } },
      }),
    });

    if (!res.ok) return { note: null, unavailable: true };
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    try {
      const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as { note?: TajweedNote };
      return { note: parsed.note ?? null };
    } catch {
      return { note: null };
    }
  });
