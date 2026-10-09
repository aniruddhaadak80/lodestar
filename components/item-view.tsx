"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  ListChecks,
  NotebookPen,
  Pause,
  Play,
} from "lucide-react";
import type { Item } from "@/lib/types";
import { relatedTo } from "@/lib/search";
import { useActions, useShelf, useToast } from "@/lib/store";
import { cn, fmtMinutes, LEVEL_LABEL, TYPE_META } from "@/lib/utils";
import { TOPIC_BY_ID } from "@/lib/data";
import { ItemCard, TopicChip, TypeGlyph } from "./ui";

export function ItemView({ item, all }: { item: Item; all: Item[] }) {
  const shelf = useShelf();
  const actions = useActions();
  const toast = useToast();
  const savedNote = shelf.notes[item.id]?.text ?? "";
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const noteText = noteDraft ?? savedNote; // reflect hydrated localStorage value
  const [playing, setPlaying] = useState(false);

  const read = shelf.read.includes(item.id);
  const saved = shelf.saved.includes(item.id);
  const progress = shelf.progress[item.id] ?? 0;
  const meta = TYPE_META[item.type];
  const related = relatedTo(item, all, 4);
  const note = shelf.notes[item.id];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard");
    } catch {
      toast("Could not copy — copy from the address bar");
    }
  };

  return (
    <div className="px-5 py-8 sm:px-10">
      {/* breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[0.64rem] text-faint">
        <Link href="/library" className="hover:text-accent">
          library
        </Link>
        <span>/</span>
        <span>{item.type}</span>
        <span>/</span>
        <span className="text-muted">{item.id}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0">
          {/* header */}
          <header className="animate-fade-up">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <TypeGlyph type={item.type} />
              <span className="eyebrow" style={{ color: meta.hue }}>
                {meta.label}
              </span>
              <span className="font-mono text-[0.64rem] text-faint">
                {item.year} · {fmtMinutes(item.minutes)} · {LEVEL_LABEL[item.level]}
              </span>
            </div>

            <h1 className="display text-[2.4rem] leading-[1.04] text-ink sm:text-[3rem]">
              {item.title}
            </h1>
            <p className="mt-3 max-w-3xl text-[1.05rem] leading-relaxed text-muted">{item.deck}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] text-faint">
              <span className="text-ink">{item.authors.join(", ")}</span>
              {item.org && <span className="rounded border border-line px-1.5 py-0.5">{item.org}</span>}
              <span>{item.topics.map((t) => TOPIC_BY_ID[t]?.name).join(" · ")}</span>
            </div>

            {/* actions */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {item.type === "video" ? "Open on YouTube" : item.type === "podcast" ? "Listen at source" : "Open original"}
              </a>
              <button
                className="btn"
                data-on={saved}
                onClick={() => {
                  actions.toggleSave(item.id);
                  toast(saved ? "Removed from saved" : "Saved to your shelf");
                }}
                style={saved ? { borderColor: "color-mix(in oklab, var(--c-accent) 60%, var(--c-border))" } : undefined}
              >
                {saved ? <Check className="h-3.5 w-3.5 text-accent" /> : <NotebookPen className="h-3.5 w-3.5" />}
                {saved ? "Saved" : "Save"}
              </button>
              <button
                className="btn"
                onClick={() => {
                  actions.toggleRead(item.id);
                  toast(read ? "Marked unread" : "Marked as read");
                }}
              >
                <Check className={cn("h-3.5 w-3.5", read && "text-ok")} />
                {read ? "Read" : "Mark read"}
              </button>
              <button className="btn" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" /> Copy link
              </button>
            </div>
          </header>

          {/* video player */}
          {item.ytId && (
            <div className="mt-8">
              {playing ? (
                <div className="animate-fade-in relative aspect-video w-full overflow-hidden rounded-xl border border-line">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${item.ytId}?autoplay=1&rel=0`}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <button
                  onClick={() => setPlaying(true)}
                  className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-line"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${item.ytId}/hqdefault.jpg`}
                    alt=""
                    className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-60"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
                      {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" fill="currentColor" />}
                    </span>
                  </span>
                  <span className="absolute bottom-3 left-3 rounded bg-black/70 px-2 py-1 font-mono text-[0.62rem] text-white">
                    watch in place · {fmtMinutes(item.minutes)}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* why it matters */}
          <section className="mt-8 rounded-xl border border-line bg-surface p-6">
            <p className="eyebrow mb-3">Why it matters</p>
            <p className="text-[1rem] leading-relaxed text-ink/90">{item.why}</p>
          </section>

          {/* takeaways */}
          <section className="mt-8">
            <div className="mb-4 flex items-center gap-2.5">
              <ListChecks className="h-4 w-4 text-accent" />
              <p className="eyebrow">Key takeaways</p>
            </div>
            <ol className="space-y-3">
              {item.takeaways.map((t, i) => (
                <li key={i} className="flex gap-4 rounded-xl border border-line bg-surface p-4">
                  <span className="font-mono text-[0.7rem] text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[0.94rem] leading-relaxed text-muted">{t}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* progress + note */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <div className="mb-3 flex items-baseline justify-between">
                <p className="eyebrow">Reading progress</p>
                <span className="font-mono text-[0.7rem] text-accent">{Math.round(progress * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(progress * 100)}
                onChange={(e) => actions.setProgress(item.id, Number(e.target.value) / 100)}
                className="w-full accent-[var(--c-accent)]"
              />
              <p className="mt-2 font-mono text-[0.6rem] text-faint">
                Drag to track how far you got · reaching 100% marks it read
              </p>
            </div>

            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="eyebrow">My note</p>
                {note && <span className="font-mono text-[0.6rem] text-faint">saved locally</span>}
              </div>
              <textarea
                value={noteText}
                onChange={(e) => {
                  setNoteDraft(e.target.value);
                  actions.setNote(item.id, e.target.value);
                }}
                placeholder="Your take, a quote, a question…"
                rows={3}
                className="field w-full resize-none px-3 py-2 text-[0.85rem] outline-none"
              />
            </div>
          </section>

          {/* related */}
          <section className="mt-10">
            <p className="eyebrow mb-4">Related in the library</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <ItemCard
                  key={r.id}
                  item={r}
                  read={shelf.read.includes(r.id)}
                  saved={shelf.saved.includes(r.id)}
                  progress={shelf.progress[r.id]}
                />
              ))}
            </div>
          </section>
        </article>

        {/* sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-5">
            <p className="eyebrow mb-3">At a glance</p>
            <dl className="space-y-2.5 font-mono text-[0.68rem]">
              {[
                ["Format", meta.label],
                ["Year", String(item.year)],
                ["Length", fmtMinutes(item.minutes)],
                ["Level", LEVEL_LABEL[item.level]],
                ["Organisation", item.org ?? "—"],
                ["Status", read ? "read" : progress > 0 ? `${Math.round(progress * 100)}% done` : "unread"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-line pb-2 last:border-0">
                  <dt className="text-faint">{k}</dt>
                  <dd className="text-right text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <p className="eyebrow mb-3">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <span key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.62rem] text-muted">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="eyebrow mb-3">Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {item.topics.map((t) => (
                <TopicChip key={t} id={t} />
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="eyebrow mb-3">Shortcuts</p>
            <ul className="space-y-2 font-mono text-[0.62rem] text-faint">
              <li className="flex justify-between"><span>search</span><span className="kbd">⌘K</span></li>
              <li className="flex justify-between"><span>theme</span><span className="kbd">T</span></li>
              <li className="flex justify-between"><span>library</span><span className="kbd">2</span></li>
              <li className="flex justify-between"><span>shelf</span><span className="kbd">6</span></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
