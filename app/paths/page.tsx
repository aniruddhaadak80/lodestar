import type { Metadata } from "next";
import Link from "next/link";
import { PATHS } from "@/lib/paths";
import { ITEM_BY_ID, TOPIC_BY_ID } from "@/lib/data";
import { fmtMinutes, LEVEL_LABEL, TYPE_META as TM } from "@/lib/utils";
import { PathProgress } from "@/components/path-progress";

export const metadata: Metadata = {
  title: "Paths",
  description: "Curated reading paths through AI safety — 4 to 12 weeks, ordered, with the reasoning for each step.",
};

export default function PathsPage() {
  return (
    <div className="px-5 py-8 sm:px-10">
      <header className="mb-10 max-w-3xl">
        <p className="eyebrow mb-2">Paths · {PATHS.length} curricula</p>
        <h1 className="display text-[2.6rem] text-ink sm:text-[3.4rem]">Read it in order</h1>
        <p className="mt-4 text-[1rem] leading-relaxed text-muted">
          A feed gives you the newest thing. A path gives you the right next thing. Each step says
          why it is there and what to do with it — and the last step is always writing your own
          summary and publishing it.
        </p>
      </header>

      <div className="space-y-16">
        {PATHS.map((path) => (
          <section key={path.id} id={path.id} className="scroll-mt-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
              <div className="max-w-2xl">
                <p className="eyebrow mb-2">
                  {path.weeks} weeks · {fmtMinutes(path.totalMinutes)} total
                </p>
                <h2 className="display text-[2.2rem] text-ink">{path.title}</h2>
                <p className="mt-2 text-[0.98rem] text-muted">{path.tagline}</p>
                <p className="mt-2 font-mono text-[0.66rem] text-faint">for: {path.audience}</p>
              </div>
              <PathProgress ids={path.steps.map((s) => s.itemId)} />
            </div>

            <ol className="relative space-y-4 border-l border-line pl-6 sm:pl-8">
              {path.steps.map((step) => {
                const item = ITEM_BY_ID[step.itemId];
                if (!item) return null;
                return (
                  <li key={`${path.id}-${step.week}`} className="relative">
                    <span className="timeline-dot absolute -left-[calc(1.5rem+4.5px)] sm:-left-[calc(2rem+4.5px)] top-5" />
                    <PathStepCard itemId={step.itemId} note={step.note} week={step.week} />
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <section className="mt-16 rounded-2xl border border-accent/40 bg-surface p-6 sm:p-8">
        <p className="eyebrow mb-3">How to use a path</p>
        <p className="max-w-3xl text-[1rem] leading-relaxed text-muted">
          Read in order, mark each piece finished on its page, and write the two-page summary at the
          end. Explaining a field badly is the fastest way to find out whether you actually
          understand it — that last week is the one that matters.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/library" className="btn btn-primary">
            Browse the full library
          </Link>
          <Link href="/shelf" className="btn">
            Track on my shelf
          </Link>
        </div>
      </section>
    </div>
  );
}

function PathStepCard({ itemId, note, week }: { itemId: string; note: string; week?: number }) {
  const item = ITEM_BY_ID[itemId];
  if (!item) return null;
  const meta = TM[item.type];
  return (
    <div className="card card-hover p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className="grid h-7 w-7 place-items-center rounded-md text-[0.8rem]"
          style={{
            color: meta.hue,
            background: `color-mix(in oklab, ${meta.hue} 14%, transparent)`,
            border: `1px solid color-mix(in oklab, ${meta.hue} 30%, transparent)`,
          }}
        >
          {meta.glyph}
        </span>
        <span className="eyebrow">Week {week}</span>
        <span className="font-mono text-[0.62rem] text-faint">
          {meta.label} · {fmtMinutes(item.minutes)} · {LEVEL_LABEL[item.level]}
        </span>
        <span className="ml-auto">
          <PathDoneBadge id={item.id} />
        </span>
      </div>

      <Link href={`/item/${item.id}`} className="serif mt-2.5 block text-[1.35rem] text-ink hover:text-accent">
        {item.title}
      </Link>
      <p className="mt-1.5 text-[0.86rem] text-muted line-clamp-2">{item.deck}</p>
      <p className="mt-3 border-l-2 border-accent/40 pl-3 text-[0.85rem] italic leading-relaxed text-ink/80">
        {note}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.topics.slice(0, 3).map((t) => {
          const topic = TOPIC_BY_ID[t];
          if (!topic) return null;
          return (
            <span
              key={t}
              className="rounded-full border px-2 py-0.5 font-mono text-[0.6rem]"
              style={{
                borderColor: `color-mix(in oklab, ${topic.color} 35%, var(--c-border))`,
                color: `color-mix(in oklab, ${topic.color} 78%, var(--c-text))`,
              }}
            >
              {topic.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function PathDoneBadge({ id }: { id: string }) {
  return <PathProgress ids={[id]} compact />;
}
