"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Download, Flame, RotateCcw, Timer, Trash2, Upload } from "lucide-react";
import { ITEMS, TOPICS, TOPIC_BY_ID } from "@/lib/data";
import { PATHS } from "@/lib/paths";
import { useActions, useShelf, useToast } from "@/lib/store";
import { fmtMinutes, streakOf, TYPE_META } from "@/lib/utils";
import { ItemRow, SectionHead, StatBlock } from "@/components/ui";
import { PathProgress } from "@/components/path-progress";

export default function ShelfPage() {
  const shelf = useShelf();
  const actions = useActions();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [goalDraft, setGoalDraft] = useState(String(shelf.goal));

  const readItems = shelf.read.map((id) => ITEMS.find((i) => i.id === id)).filter(Boolean);
  const savedItems = shelf.saved.map((id) => ITEMS.find((i) => i.id === id)).filter(Boolean);
  const notedItems = Object.entries(shelf.notes)
    .map(([id, n]) => ({ item: ITEMS.find((i) => i.id === id), note: n }))
    .filter((x) => x.item);

  const minutes = readItems.reduce((a, i) => a + (i?.minutes ?? 0), 0);
  const streak = streakOf(shelf.days);

  const onImport = async (file: File) => {
    try {
      actions.importJson(await file.text());
      toast("Shelf imported");
    } catch {
      toast("That file is not a valid shelf export");
    }
  };

  const onExport = () => {
    const blob = new Blob([actions.exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lodestar-shelf.json";
    a.click();
    toast("Shelf exported");
  };

  return (
    <div className="px-5 py-8 sm:px-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">My shelf · stored in this browser only</p>
          <h1 className="display text-[2.6rem] text-ink sm:text-[3.2rem]">Your reading room</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button className="btn" onClick={onExport}>
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <button
            className="btn"
            onClick={() => {
              if (confirm("Clear all reading progress, notes and saved items?")) {
                actions.reset();
                toast("Shelf cleared");
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Reset
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
          />
        </div>
      </header>

      {/* stats */}
      <section className="mb-8 grid grid-cols-2 gap-y-6 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-3 lg:grid-cols-5">
        <StatBlock value={String(streak)} label="Day streak" hint={`${shelf.days.length} active days all time`} />
        <StatBlock value={`${readItems.length}`} label="Pieces read" hint={`goal ${shelf.goal} · ${Math.min(100, Math.round((readItems.length / shelf.goal) * 100))}%`} />
        <StatBlock value={fmtMinutes(minutes)} label="Time in the field" hint="by declared length" />
        <StatBlock value={String(savedItems.length)} label="Saved for later" hint={`${notedItems.length} with notes`} />
        <StatBlock value={String(ITEMS.length - readItems.length)} label="Still unread" hint={`${ITEMS.length} total in library`} />
      </section>

      {/* goal + streak ring */}
      <section className="mb-10 grid gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <p className="eyebrow mb-3">Annual goal</p>
          <div className="flex items-end gap-4">
            <div className="display text-[3rem] leading-none text-accent">{readItems.length}</div>
            <div className="pb-1 font-mono text-[0.7rem] text-faint">of {shelf.goal} pieces</div>
          </div>
          <div className="progress-track mt-4">
            <div className="progress-fill" style={{ width: `${Math.min(100, (readItems.length / shelf.goal) * 100)}%` }} />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              className="field w-20 px-2.5 py-1.5 font-mono text-[0.75rem]"
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value.replace(/\D/g, ""))}
              onBlur={() => {
                const n = Number(goalDraft);
                if (n > 0) {
                  actions.setGoal(n);
                  toast(`Goal set to ${n}`);
                }
              }}
            />
            <span className="font-mono text-[0.64rem] text-faint">pieces / year</span>
          </div>
        </div>

        <div className="card p-6">
          <p className="eyebrow mb-3 flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-accent" /> Activity · last 30 days
          </p>
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 30 }).map((_, idx) => {
              const d = new Date();
              d.setDate(d.getDate() - (29 - idx));
              const key = d.toISOString().slice(0, 10);
              const on = shelf.days.includes(key);
              return (
                <span
                  key={key}
                  title={key}
                  className="aspect-square rounded-[3px] border"
                  style={{
                    background: on ? "color-mix(in oklab, var(--c-accent) 80%, transparent)" : "transparent",
                    borderColor: on ? "color-mix(in oklab, var(--c-accent) 60%, transparent)" : "var(--c-border)",
                  }}
                />
              );
            })}
          </div>
          <p className="mt-3 font-mono text-[0.62rem] text-faint">
            Any read, save or progress change marks the day.
          </p>
        </div>

        <div className="card p-6">
          <p className="eyebrow mb-3">Paths in progress</p>
          <div className="space-y-3">
            {PATHS.map((p) => (
              <Link key={p.id} href={`/paths#${p.id}`} className="block">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="serif text-[1rem] text-ink hover:text-accent">{p.title}</span>
                  <span className="font-mono text-[0.6rem] text-faint">{p.weeks}w</span>
                </div>
                <PathProgress ids={p.steps.map((s) => s.itemId)} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* coverage */}
      <section className="mb-10">
        <SectionHead eyebrow="Coverage" title="Where you have read" sub="How much of each room you have actually covered." />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card space-y-3.5 p-6">
            {TOPICS.map((t) => {
              const all = ITEMS.filter((i) => i.topics.includes(t.id));
              const done = all.filter((i) => shelf.read.includes(i.id));
              const pct = all.length ? Math.round((done.length / all.length) * 100) : 0;
              return (
                <div key={t.id}>
                  <div className="mb-1 flex items-baseline justify-between font-mono text-[0.66rem]">
                    <Link href={`/library?topic=${t.id}`} className="text-muted hover:text-accent">
                      {t.name}
                    </Link>
                    <span className="text-faint">
                      {done.length}/{all.length} · {pct}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: t.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card space-y-3.5 p-6">
            <p className="eyebrow mb-1">By format</p>
            {Object.keys(TYPE_META).map((type) => {
              const all = ITEMS.filter((i) => i.type === type);
              if (all.length === 0) return null;
              const done = all.filter((i) => shelf.read.includes(i.id));
              const pct = all.length ? Math.round((done.length / all.length) * 100) : 0;
              return (
                <div key={type}>
                  <div className="mb-1 flex items-baseline justify-between font-mono text-[0.66rem]">
                    <span className="text-muted">
                      {TYPE_META[type].glyph} {TYPE_META[type].label}
                    </span>
                    <span className="text-faint">
                      {done.length}/{all.length}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: TYPE_META[type].hue }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* notes */}
      <section className="mb-10">
        <SectionHead eyebrow="Notes" title="What you wrote" sub="Everything you noted stays in this browser." />
        {notedItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-10 text-center">
            <p className="serif text-[1.3rem] text-ink">No notes yet.</p>
            <p className="mt-1.5 font-mono text-[0.68rem] text-faint">
              Open any piece and jot a thought — it will appear here.
            </p>
          </div>
        ) : (
          <div className="stagger grid gap-4 sm:grid-cols-2">
            {notedItems.map(({ item, note }) =>
              item ? (
                <div key={item.id} className="card p-5">
                  <Link href={`/item/${item.id}`} className="serif text-[1.15rem] text-ink hover:text-accent">
                    {item.title}
                  </Link>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">{note.text}</p>
                  <p className="mt-3 font-mono text-[0.6rem] text-faint">
                    {new Date(note.at).toLocaleString()}
                  </p>
                </div>
              ) : null,
            )}
          </div>
        )}
      </section>

      {/* saved */}
      <section className="mb-10">
        <SectionHead eyebrow="Queue" title="Saved for later" sub={`${savedItems.length} in the queue.`} />
        {savedItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-10 text-center">
            <p className="serif text-[1.3rem] text-ink">Your queue is empty.</p>
            <p className="mt-1.5 font-mono text-[0.68rem] text-faint">
              Press save on any piece to line it up.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            {savedItems.map(
              (item) =>
                item && (
                  <ItemRow key={item.id} item={item} read={shelf.read.includes(item.id)} saved />
                ),
            )}
          </div>
        )}
      </section>

      {/* read */}
      <section>
        <SectionHead eyebrow="History" title="Read" sub={`${readItems.length} finished pieces.`} />
        {readItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-10 text-center">
            <p className="serif text-[1.3rem] text-ink">Nothing marked read yet.</p>
            <p className="mt-1.5 font-mono text-[0.68rem] text-faint">
              Finish something from{" "}
              <Link href="/paths" className="text-accent underline underline-offset-4">
                a path
              </Link>{" "}
              and mark it.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            {readItems.map(
              (item) =>
                item && <ItemRow key={item.id} item={item} read saved={shelf.saved.includes(item.id)} />,
            )}
          </div>
        )}
      </section>

      <footer className="mt-12 flex flex-wrap items-center gap-4 border-t border-line pt-6 font-mono text-[0.62rem] text-faint">
        <Timer className="h-3.5 w-3.5" />
        <span>Nothing syncs anywhere. Export before clearing your browser data.</span>
        <button onClick={() => { actions.reset(); toast("Cleared"); }} className="ml-auto flex items-center gap-1.5 text-faint hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" /> clear all data
        </button>
      </footer>
    </div>
  );
}
