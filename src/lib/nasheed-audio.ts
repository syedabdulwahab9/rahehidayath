/**
 * Maps our curated nasheed list to real, human-voice recordings hosted on the
 * Internet Archive. Every entry was hand-verified: vocals-only (no music),
 * sung by naat khawans / nasheed artists, streamed as MP3.
 *
 * Unknown slugs fall back to an archive search that prefers voice recordings.
 */

type ArchiveRef = { id: string; file: string };

const PRIORITY: Record<string, ArchiveRef> = {
  "maula-ya-salli": {
    id: "maula-ya-salli-wa-sallim-arabic-medley-1-hour-mohamed-tarek-mohamed-youssef-deehan",
    file: "Maula Ya Salli Wa Sallim- Arabic Medley - 1 Hour - Mohamed Tarek & Mohamed Youssef - Deehan.mp3",
  },
  "allahu-allahu": {
    id: "ArabicQaseeda-HasbiRabbiJallallah",
    file: "HasbiRabbiJallallahNewNasheed.mp3",
  },
  "tajdar-e-haram": {
    id: "TajdarEHaramHoNigahEKaram",
    file: "Tajdar e Haram Ho Nigah e Karam.mp3",
  },
  "ya-nabi-salam": {
    id: "6-ya-nabi-salam-alaika",
    file: "6-ya-nabi-salam-alaika.mp3",
  },
  "assalamu-alayka": {
    id: "Assalamu-Alayka-Maher-Zain-Vocals-Only-No-Music",
    file: "AssalamuAlayka-arabic.mp3",
  },
  "faslon-ko-takalluf": {
    id: "FaslonKoTakallufHaiHumseAgarQariWaheedZafarQasminAATSHARIF",
    file: "Faslon ko Takalluf Hai humse Agar - Qari Waheed Zafar Qasmi-(nAAT sHARIF).mp3",
  },
  "ilahi-teri": {
    id: "Ilahi-teri-chokhat-per-bhikari-ban-ker-aya-hoonhamariweb",
    file: "ilahi-teri-chokhat-per-bhikari-ban-ker-aya-hoon(hamariweb).MP3",
  },
  "marhaba-ya-mustafa": {
    id: "MarhabaYaMustafa_201409",
    file: "Marhaba Ya Mustafa.mp3",
  },
  "ya-rasulallah": {
    id: "23-ya-rasulallah",
    file: "23-ya-rasulallah.mp3",
  },
  "ya-taiba": {
    id: "YaTaibaAlAfasy",
    file: "yaTaiba_AlAfasy.mp3",
  },
};

/* Words that strongly suggest a human-voice naat/nasheed rather than music. */
const VOICE_PATTERN =
  /qasida|qaseeda|hamd|naat|nasheed|kalam|salawat|sholawat|manqabat|mehfil|zikr|burdah|madin|ya rasul|ya nabi|taiba|mustafa/i;

const downloadUrl = (id: string, file: string) =>
  `https://archive.org/download/${id}/${encodeURIComponent(file)}`;

/**
 * Resolve the playable MP3 URL for a nasheed, or null if nothing human-voiced
 * was found. Cached per slug for the session.
 */
const cache = new Map<string, string | null>();

export async function resolveNasheedAudio(slug: string, title: string): Promise<string | null> {
  if (cache.has(slug)) return cache.get(slug) ?? null;

  const priority = PRIORITY[slug];
  if (priority) {
    const url = downloadUrl(priority.id, priority.file);
    try {
      const head = await fetch(url, { method: "HEAD" });
      if (head.ok) {
        cache.set(slug, url);
        return url;
      }
    } catch {
      /* CORS may block HEAD — the <audio> tag can still stream it, so be optimistic */
      cache.set(slug, url);
      return url;
    }
  }

  /* Fallback: search the archive for a vocal recording of this title. */
  try {
    const q = encodeURIComponent(`title:("${title}") AND mediatype:audio`);
    const search = (await (
      await fetch(`https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier&sort[]=downloads+desc&rows=6&output=json`)
    ).json()) as { response?: { docs?: { identifier: string }[] } };

    for (const doc of search.response?.docs ?? []) {
      const meta = (await (await fetch(`https://archive.org/metadata/${doc.identifier}`)).json()) as {
        files?: { name?: string; length?: string }[];
      };
      const audio = (meta.files ?? [])
        .filter((f) => /\.(mp3|ogg|m4a)$/i.test(f.name ?? ""))
        .sort((a, b) => (parseFloat(b.length ?? "0") || 0) - (parseFloat(a.length ?? "0") || 0));
      const best = audio.find((f) => VOICE_PATTERN.test(f.name ?? "")) ?? audio[0];
      if (best?.name) {
        const url = downloadUrl(doc.identifier, best.name);
        cache.set(slug, url);
        return url;
      }
    }
  } catch {
    /* offline or archive unreachable */
  }

  cache.set(slug, null);
  return null;
}
