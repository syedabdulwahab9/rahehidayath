import { useState } from "react";
import { BrainCircuit, FileText, Heart, Music4, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/AppShell";
import {
  uid,
  useCustomContent,
  type CustomContent,
  type CustomDua,
  type CustomHadith,
  type CustomIbadaat,
  type CustomNasheed,
  type CustomQuizQ,
} from "@/lib/content-store";
import { NASHEED_LANGUAGES, NASHEED_THEMES } from "@/lib/nasheed-data";

const FIELD =
  "min-h-11 w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary";
const BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary";
const LABEL = "mb-1 block text-xs font-medium text-muted-foreground";

const TABS = [
  { id: "nasheeds", label: "Nasheeds", icon: Music4 },
  { id: "duas", label: "Duas", icon: Heart },
  { id: "quiz", label: "Quiz", icon: BrainCircuit },
  { id: "hadiths", label: "Hadiths", icon: FileText },
  { id: "ibadaat", label: "Ibadaat", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function AdminContentEditor() {
  const [content, save] = useCustomContent();
  const [tab, setTab] = useState<TabId>("nasheeds");
  const [status, setStatus] = useState("");

  const update = <K extends keyof CustomContent>(key: K, items: CustomContent[K], message: string) => {
    save({ ...content, [key]: items });
    setStatus(message);
  };

  const remove = (key: keyof CustomContent, id: string) => {
    const list = content[key] as { id: string }[];
    update(key, list.filter((i) => i.id !== id) as never, "Deleted.");
  };

  return (
    <section aria-labelledby="content-editor-heading" className="space-y-3">
      <h2 id="content-editor-heading" className="font-display text-xl">
        Content editor
      </h2>
      <Card>
        <p className="mb-3 text-sm text-muted-foreground">
          Add new nasheeds, duas, quiz questions, hadiths and ibadaat sections here — they appear on the public pages
          immediately, no code changes needed.
        </p>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Content type">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => {
                setTab(id);
                setStatus("");
              }}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
                tab === id ? "border-transparent gradient-hero text-primary-foreground" : "border-border hover:text-primary"
              }`}
            >
              <Icon className="size-4" aria-hidden /> {label}
              <span className="rounded-full bg-background/25 px-1.5 text-[11px] tabular-nums">{content[id].length}</span>
            </button>
          ))}
        </div>

        {status && (
          <p role="status" className="mt-3 text-sm text-primary">
            {status}
          </p>
        )}

        <div className="mt-4">
          {tab === "nasheeds" && <NasheedForm items={content.nasheeds} onChange={(v, m) => update("nasheeds", v, m)} onRemove={(id) => remove("nasheeds", id)} />}
          {tab === "duas" && <DuaForm items={content.duas} onChange={(v, m) => update("duas", v, m)} onRemove={(id) => remove("duas", id)} />}
          {tab === "quiz" && <QuizForm items={content.quiz} onChange={(v, m) => update("quiz", v, m)} onRemove={(id) => remove("quiz", id)} />}
          {tab === "hadiths" && <HadithForm items={content.hadiths} onChange={(v, m) => update("hadiths", v, m)} onRemove={(id) => remove("hadiths", id)} />}
          {tab === "ibadaat" && <IbadaatForm items={content.ibadaat} onChange={(v, m) => update("ibadaat", v, m)} onRemove={(id) => remove("ibadaat", id)} />}
        </div>
      </Card>
    </section>
  );
}

function ItemList<T extends { id: string }>({
  items,
  onRemove,
  render,
}: {
  items: T[];
  onRemove: (id: string) => void;
  render: (item: T) => React.ReactNode;
}) {
  if (!items.length) return <p className="text-sm text-muted-foreground">Nothing added yet — use the form below.</p>;
  return (
    <ul className="mb-4 divide-y divide-border/60">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
          <span className="min-w-0 flex-1 text-sm">{render(item)}</span>
          <button
            onClick={() => onRemove(item.id)}
            aria-label="Delete this item"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Nasheeds ---------------- */

function NasheedForm({
  items,
  onChange,
  onRemove,
}: {
  items: CustomNasheed[];
  onChange: (items: CustomNasheed[], message: string) => void;
  onRemove: (id: string) => void;
}) {
  const [form, setForm] = useState({ title: "", artist: "", language: "Urdu", theme: "Prophet ﷺ", youtube: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.artist.trim()) return;
    onChange([...items, { id: uid(), ...form, title: form.title.trim(), artist: form.artist.trim(), youtube: form.youtube.trim() }], "Nasheed published — see the Naats page.");
    setForm({ title: "", artist: "", language: form.language, theme: form.theme, youtube: "" });
  };

  return (
    <div>
      <ItemList items={items} onRemove={onRemove} render={(n) => <span className="block truncate font-medium">{n.title} — <span className="text-muted-foreground">{n.artist} · {n.language}</span></span>} />
      <form onSubmit={add} className="space-y-3 rounded-xl border border-dashed border-border p-4">
        <Row>
          <label className="text-sm"><span className={LABEL}>Nasheed title *</span><input required value={form.title} onChange={set("title")} className={FIELD} placeholder="e.g. Tajdar e Haram" /></label>
          <label className="text-sm"><span className={LABEL}>Artist / naat khawan *</span><input required value={form.artist} onChange={set("artist")} className={FIELD} placeholder="e.g. Atif Aslam" /></label>
        </Row>
        <Row>
          <label className="text-sm"><span className={LABEL}>Language</span>
            <select value={form.language} onChange={set("language")} className={FIELD}>
              {NASHEED_LANGUAGES.filter((l) => l !== "All").map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className="text-sm"><span className={LABEL}>Theme</span>
            <select value={form.theme} onChange={set("theme")} className={FIELD}>
              {NASHEED_THEMES.filter((t) => t !== "All").map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </Row>
        <label className="block text-sm">
          <span className={LABEL}>YouTube link (optional — paste a vocals-only video link, or search words)</span>
          <input value={form.youtube} onChange={set("youtube")} className={FIELD} placeholder="https://youtube.com/watch?v=… or leave empty to auto-find vocals-only version" />
        </label>
        <button type="submit" className={`${BTN} gradient-hero text-primary-foreground`}><Plus className="size-4" aria-hidden /> Publish nasheed</button>
      </form>
    </div>
  );
}

/* ---------------- Duas ---------------- */

function DuaForm({
  items,
  onChange,
  onRemove,
}: {
  items: CustomDua[];
  onChange: (items: CustomDua[], message: string) => void;
  onRemove: (id: string) => void;
}) {
  const empty = { cat: "", title: "", ar: "", tr: "", en: "", ur: "" };
  const [form, setForm] = useState(empty);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cat.trim() || !form.title.trim() || !form.ar.trim() || !form.en.trim()) return;
    onChange([...items, { id: uid(), cat: form.cat.trim(), title: form.title.trim(), ar: form.ar.trim(), tr: form.tr.trim(), en: form.en.trim(), ur: form.ur.trim() || undefined }], "Dua published — see the Duas page.");
    setForm(empty);
  };

  return (
    <div>
      <ItemList items={items} onRemove={onRemove} render={(d) => <span className="block truncate font-medium">{d.cat} · {d.title}</span>} />
      <form onSubmit={add} className="space-y-3 rounded-xl border border-dashed border-border p-4">
        <Row>
          <label className="text-sm"><span className={LABEL}>Category *</span><input required value={form.cat} onChange={set("cat")} className={FIELD} placeholder="e.g. Morning, Travel, Illness" /></label>
          <label className="text-sm"><span className={LABEL}>Title *</span><input required value={form.title} onChange={set("title")} className={FIELD} placeholder="e.g. Before leaving home" /></label>
        </Row>
        <label className="block text-sm"><span className={LABEL}>Arabic text *</span><textarea required dir="rtl" rows={2} value={form.ar} onChange={set("ar")} className={`${FIELD} urdu-text text-right`} /></label>
        <label className="block text-sm"><span className={LABEL}>Transliteration</span><input value={form.tr} onChange={set("tr")} className={FIELD} /></label>
        <label className="block text-sm"><span className={LABEL}>English meaning *</span><textarea required rows={2} value={form.en} onChange={set("en")} className={FIELD} /></label>
        <label className="block text-sm"><span className={LABEL}>Urdu meaning (optional)</span><textarea dir="rtl" rows={2} value={form.ur} onChange={set("ur")} className={`${FIELD} urdu-text text-right`} /></label>
        <button type="submit" className={`${BTN} gradient-hero text-primary-foreground`}><Plus className="size-4" aria-hidden /> Publish dua</button>
      </form>
    </div>
  );
}

/* ---------------- Quiz ---------------- */

function QuizForm({
  items,
  onChange,
  onRemove,
}: {
  items: CustomQuizQ[];
  onChange: (items: CustomQuizQ[], message: string) => void;
  onRemove: (id: string) => void;
}) {
  const empty = { en: "", ur: "", o1: "", o2: "", o3: "", o4: "", answer: "1" };
  const [form, setForm] = useState(empty);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const options: [string, string, string, string] = [form.o1.trim(), form.o2.trim(), form.o3.trim(), form.o4.trim()];
    if (!form.en.trim() || options.some((o) => !o)) return;
    onChange(
      [
        ...items,
        {
          id: uid(),
          en: form.en.trim(),
          ur: form.ur.trim() || form.en.trim(),
          options,
          optionsUr: options,
          answer: Math.min(3, Math.max(0, Number(form.answer) - 1)),
        },
      ],
      "Quiz question published — see the Quiz game.",
    );
    setForm(empty);
  };

  return (
    <div>
      <ItemList items={items} onRemove={onRemove} render={(q) => <span className="block truncate font-medium">{q.en}</span>} />
      <form onSubmit={add} className="space-y-3 rounded-xl border border-dashed border-border p-4">
        <label className="block text-sm"><span className={LABEL}>Question (English) *</span><input required value={form.en} onChange={set("en")} className={FIELD} /></label>
        <label className="block text-sm"><span className={LABEL}>Question (Urdu, optional)</span><input dir="rtl" value={form.ur} onChange={set("ur")} className={`${FIELD} urdu-text text-right`} /></label>
        <Row>
          <label className="text-sm"><span className={LABEL}>Option 1 *</span><input required value={form.o1} onChange={set("o1")} className={FIELD} /></label>
          <label className="text-sm"><span className={LABEL}>Option 2 *</span><input required value={form.o2} onChange={set("o2")} className={FIELD} /></label>
          <label className="text-sm"><span className={LABEL}>Option 3 *</span><input required value={form.o3} onChange={set("o3")} className={FIELD} /></label>
          <label className="text-sm"><span className={LABEL}>Option 4 *</span><input required value={form.o4} onChange={set("o4")} className={FIELD} /></label>
        </Row>
        <label className="block max-w-56 text-sm">
          <span className={LABEL}>Correct option</span>
          <select value={form.answer} onChange={set("answer")} className={FIELD}>
            {["1", "2", "3", "4"].map((n) => <option key={n} value={n}>Option {n}</option>)}
          </select>
        </label>
        <button type="submit" className={`${BTN} gradient-hero text-primary-foreground`}><Plus className="size-4" aria-hidden /> Publish question</button>
      </form>
    </div>
  );
}

/* ---------------- Hadiths ---------------- */

function HadithForm({
  items,
  onChange,
  onRemove,
}: {
  items: CustomHadith[];
  onChange: (items: CustomHadith[], message: string) => void;
  onRemove: (id: string) => void;
}) {
  const empty = { text: "", narrator: "", source: "", urdu: "" };
  const [form, setForm] = useState(empty);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim() || !form.source.trim()) return;
    onChange([...items, { id: uid(), text: form.text.trim(), narrator: form.narrator.trim(), source: form.source.trim(), urdu: form.urdu.trim() || undefined }], "Hadith published — see the Hadith page.");
    setForm(empty);
  };

  return (
    <div>
      <ItemList items={items} onRemove={onRemove} render={(h) => <span className="block truncate font-medium">{h.text.slice(0, 80)}{h.text.length > 80 ? "…" : ""} <span className="text-muted-foreground">— {h.source}</span></span>} />
      <form onSubmit={add} className="space-y-3 rounded-xl border border-dashed border-border p-4">
        <label className="block text-sm"><span className={LABEL}>Hadith text (English) *</span><textarea required rows={3} value={form.text} onChange={set("text")} className={FIELD} /></label>
        <label className="block text-sm"><span className={LABEL}>Urdu translation (optional)</span><textarea dir="rtl" rows={2} value={form.urdu} onChange={set("urdu")} className={`${FIELD} urdu-text text-right`} /></label>
        <Row>
          <label className="text-sm"><span className={LABEL}>Narrator</span><input value={form.narrator} onChange={set("narrator")} className={FIELD} placeholder="e.g. Abu Hurairah RA" /></label>
          <label className="text-sm"><span className={LABEL}>Source *</span><input required value={form.source} onChange={set("source")} className={FIELD} placeholder="e.g. Sahih al-Bukhari 1" /></label>
        </Row>
        <button type="submit" className={`${BTN} gradient-hero text-primary-foreground`}><Plus className="size-4" aria-hidden /> Publish hadith</button>
      </form>
    </div>
  );
}

/* ---------------- Ibadaat ---------------- */

function IbadaatForm({
  items,
  onChange,
  onRemove,
}: {
  items: CustomIbadaat[];
  onChange: (items: CustomIbadaat[], message: string) => void;
  onRemove: (id: string) => void;
}) {
  const empty = { title: "", summary: "", body: "", urdu: "" };
  const [form, setForm] = useState(empty);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    onChange([...items, { id: uid(), title: form.title.trim(), summary: form.summary.trim(), body: form.body.trim(), urdu: form.urdu.trim() || undefined }], "Ibadaat section published — see the Ibadaat page.");
    setForm(empty);
  };

  return (
    <div>
      <ItemList items={items} onRemove={onRemove} render={(s) => <span className="block truncate font-medium">{s.title}</span>} />
      <form onSubmit={add} className="space-y-3 rounded-xl border border-dashed border-border p-4">
        <Row>
          <label className="text-sm"><span className={LABEL}>Section title *</span><input required value={form.title} onChange={set("title")} className={FIELD} placeholder="e.g. Taraweeh" /></label>
          <label className="text-sm"><span className={LABEL}>Short summary</span><input value={form.summary} onChange={set("summary")} className={FIELD} /></label>
        </Row>
        <label className="block text-sm"><span className={LABEL}>Content (English) *</span><textarea required rows={4} value={form.body} onChange={set("body")} className={FIELD} /></label>
        <label className="block text-sm"><span className={LABEL}>Content (Urdu, optional)</span><textarea dir="rtl" rows={3} value={form.urdu} onChange={set("urdu")} className={`${FIELD} urdu-text text-right`} /></label>
        <button type="submit" className={`${BTN} gradient-hero text-primary-foreground`}><Plus className="size-4" aria-hidden /> Publish section</button>
      </form>
    </div>
  );
}
