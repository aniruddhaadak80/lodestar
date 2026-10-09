"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BookOpen, Clock, Play, Radio } from "lucide-react";
import { ITEMS, TOPICS, TOPIC_BY_ID } from "@/lib/data";
import { PATHS } from "@/lib/paths";
import { pickOfTheDay } from "@/lib/search";
import { useShelf } from "@/lib/store";
import { fmtMinutes, LEVEL_LABEL, sampleOf, todayISO, TYPE_META } from "@/lib/utils";
import { ItemCard, SectionHead, StatBlock, TypeGlyph } from "@/components/ui";

const ROTATING = ["papers", "essays", "videos", "podcasts", "courses"];

const START_HERE = ["aisafety-info", "what-failure-looks-like", "concrete-problems", "neel-whirlwind"];

export default function Home() {
  const shelf = useShelf();
  const today = todayISO();
  const pick = useMemo(() => pickOfTheDay(ITEMS, today), [today]);
  const start = START_HERE.map((id) => ITEMS.find((i) => i.id === id)).filter(Boolean);

  const minutesRead = shelf.read.reduce((acc, id) => acc + (ITEMS.find((i) => i.id === id)?.minutes ?? 0), 0);
  const unread = ITEMS.filter((i) => !shelf.read.includes(i.id));
  const randomNext = sampleOf(unread, new Date().getDate());
  const streakDays = new Set(shelf.days).size;

  const counts = useMemo(() => {
    const byType = new Map<string, number>();
    const byYear = new Map<number, number>();
    for (const i of ITEMS) {
      byType.set(i.type, (byType.get(i.type) ?? 0) + 1);
      byYear.set(i.year, (byYear.get(i.year) ?? 0) + 1);
    }
    return { byType, byYear };
  }, []);

  return (
    <div className="relative">
      {/* ── hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line px-5 pb-14 pt-12 sm:px-10 lg:pt-20">
        <div className="grid-lines absolute inset-0" aria-hidden />
        <div
          className="aurora -left-24 -top-28 h-[420px] w-[420px]"
          style={{ background: "color-mix(in oklab, var(--c-accent) 45%, transparent)" }}
          aria-hidden
        />
        <div
          className="aurora -right-32 top-10 h-[380px] w-[380px]"
          style={{ background: "color-mix(in oklab, var(--c-accent-2) 40%, transparent)", animationDelay: "-6s" }}
          aria-hidden
        />

        <div className="relative max-w-4xl">
          <p className="eyebrow animate-fade-up">Local-first · {ITEMS.length} resources · no login · no feed</p>

          <h1 className="display mt-5 animate-fade-up text-[3rem] leading-[0.98] text-ink sm:text-[4.4rem]">
            The reading room for
            <br />
            AI safety
            <span className="word-roll ml-3 inline-block text-accent">
              <span>
                {[...ROTATING, ROTATING[0]].map((w, i) => (
                  <span key={`${w}-${i}`} className="block italic">
                    {w}
                  </span>
                ))}
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-2xl animate-fade-up text-[1.02rem] leading-relaxed text-muted" style={{ animationDelay: "0.1s" }}>
            Every paper, essay, talk, podcast and course that matters in AI safety — structured by
            research area, annotated with why it matters, and backed by reading paths you can
            actually finish. Read, watch, and take notes without leaving the page.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: "0.18s" }}>
            <Link href="/library" className="btn btn-primary">
              Enter the library <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href={`/item/${pick?.id ?? ITEMS[0].id}`} className="btn">
              <Radio className="h-3.5 w-3.5" /> Today&apos;s briefing
            </Link>
            <span className="hidden font-mono text-[0.64rem] text-faint sm:inline">
              press <span className="kbd">⌘K</span> anytime
            </span>
          </div>
        </div>
      </section>

      {/* ── stats strip ──────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-y-6 border-b border-line px-5 py-7 sm:grid-cols-3 sm:px-10 lg:grid-cols-5">
        <StatBlock value={String(ITEMS.length)} label="Resources" hint={`${counts.byType.get("paper") ?? 0} papers · ${counts.byType.get("video") ?? 0} videos`} />
        <StatBlock value={String(TOPICS.length)} label="Research areas" hint="the six rooms and more" />
        <StatBlock value={String(shelf.read.length)} label="Read by you" hint={minutesRead ? `${fmtMinutes(minutesRead)} total` : "start anywhere"} />
        <StatBlock value={String(streakDays)} label="Active days" hint="streak lives locally" />
        <StatBlock value={String(PATHS.length)} label="Reading paths" hint="4 to 12 weeks each" />
      </section>

      {/* ── today's pick ─────────────────────────────────────── */}
      {pick && (
        <section className="px-5 py-12 sm:px-10">
          <SectionHead
            eyebrow={`Briefing · ${today}`}
            title="One piece, chosen for today"
            sub="A deterministic daily pick from the featured set — stable all day so you can share it."
            action={
              <Link href="/library" className="btn hidden sm:inline-flex">
                Browse all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <Link
            href={`/item/${pick.id}`}
            className="card card-hover group relative flex flex-col gap-5 overflow-hidden p-6 sm:p-8"
          >
            <span
              className="absolute inset-y-0 left-0 w-1"
              style={{ background: TYPE_META[pick.type].hue }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <TypeGlyph type={pick.type} />
              <span className="eyebrow">{TYPE_META[pick.type].label} of the day</span>
              <span className="ml-auto font-mono text-[0.66rem] text-faint">
                {pick.authors.join(", ")} · {pick.year} · {fmtMinutes(pick.minutes)} ·{" "}
                {LEVEL_LABEL[pick.level]}
              </span>
            </div>
            <div>
              <h3 className="display text-[2rem] text-ink group-hover:text-accent sm:text-[2.6rem]">
                {pick.title}
              </h3>
              <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-muted">{pick.deck}</p>
              <p className="mt-4 max-w-3xl border-l-2 border-accent/50 pl-4 text-[0.92rem] leading-relaxed text-ink/90">
                {pick.why}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {pick.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full border px-2.5 py-1 font-mono text-[0.64rem]"
                  style={{
                    borderColor: `color-mix(in oklab, ${TOPIC_BY_ID[t].color} 40%, var(--c-border))`,
                    color: `color-mix(in oklab, ${TOPIC_BY_ID[t].color} 80%, var(--c-text))`,
                  }}
                >
                  {TOPIC_BY_ID[t].name}
                </span>
              ))}
            </div>
          </Link>
        </section>
      )}

      {/* ── start here ───────────────────────────────────────── */}
      <section className="border-t border-line bg-surface/40 px-5 py-12 sm:px-10">
        <SectionHead
          eyebrow="Onboarding"
          title="Start here"
          sub="Four entries chosen for newcomers: a primer, a map of failure, the founding paper, and a live talk. Two hours total."
        />
        <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {start.map((item, idx) =>
            item ? (
              <div key={item.id} className="relative">
                <span className="absolute -left-1 -top-3 z-10 font-mono text-[0.62rem] text-accent">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <ItemCard item={item} read={shelf.read.includes(item.id)} saved={shelf.saved.includes(item.id)} progress={shelf.progress[item.id]} index={idx} />
              </div>
            ) : null,
          )}
        </div>
      </section>

      {/* ── topics ───────────────────────────────────────────── */}
      <section className="px-5 py-12 sm:px-10">
        <SectionHead eyebrow="Atlas" title="Pick a room" sub="The field splits into rooms that argue with each other. Knowing the room tells you what a piece will say." />
        <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t, idx) => {
            const count = ITEMS.filter((i) => i.topics.includes(t.id)).length;
            const coverage = ITEMS.filter((i) => i.topics.includes(t.id) && shelf.read.includes(i.id)).length;
            return (
              <Link
                key={t.id}
                href={`/library?topic=${t.id}`}
                className="card card-hover group relative overflow-hidden p-5"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <span className="absolute right-4 top-4 font-mono text-[0.7rem]" style={{ color: t.color }}>
                  {count}
                </span>
                <div className="mb-2 h-1 w-9 rounded-full" style={{ background: t.color }} />
                <h3 className="serif text-[1.3rem] text-ink group-hover:text-accent">{t.name}</h3>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted">{t.question}</p>
                <div className="mt-4 flex items-center gap-2 font-mono text-[0.6rem] text-faint">
                  {coverage > 0 ? (
                    <>
                      <BookOpen className="h-3 w-3 text-ok" /> {coverage}/{count} read
                    </>
                  ) : (
                    <>{t.methods[0]} · {t.methods[1]}</>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── watch + paths band ───────────────────────────────── */}
      <section className="grid gap-6 border-t border-line px-5 py-12 sm:px-10 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow="Watch" title="Videos you can play here" sub="Verified talk IDs — click through, watch in place, mark it done." />
          <div className="stagger space-y-3">
            {ITEMS.filter((i) => i.type === "video").map((i) => (
              <Link key={i.id} href={`/item/${i.id}`} className="card card-hover flex items-center gap-4 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line" style={{ color: TYPE_META.video.hue }}>
                  <Play className="h-4 w-4" fill="currentColor" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="serif block truncate text-[1.08rem] text-ink">{i.title}</span>
                  <span className="block truncate font-mono text-[0.63rem] text-faint">
                    {i.authors[0]} · {i.org} · {fmtMinutes(i.minutes)}
                  </span>
                </span>
                <Clock className="h-3.5 w-3.5 text-faint" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <SectionHead eyebrow="Paths" title="Read it in order" sub="Twelve week plans that end with you explaining the field back to someone else." />
          <div className="stagger space-y-3">
            {PATHS.map((p) => (
              <Link key={p.id} href={`/paths#${p.id}`} className="card card-hover flex items-center gap-4 p-4">
                <span className="display grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line text-[1.15rem] text-accent">
                  {p.weeks}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="serif block truncate text-[1.08rem] text-ink">{p.title}</span>
                  <span className="block truncate font-mono text-[0.63rem] text-faint">{p.tagline}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-faint group-hover:text-accent" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── next up ──────────────────────────────────────────── */}
      {randomNext && (
        <section className="border-t border-line bg-surface/40 px-5 py-12 sm:px-10">
          <SectionHead eyebrow="Unread queue" title="What to read next" sub={`${unread.length} pieces still waiting. Here is one picked at random.`} />
          <div className="grid gap-4 lg:grid-cols-3">
            <ItemCard item={randomNext} read={false} saved={shelf.saved.includes(randomNext.id)} progress={shelf.progress[randomNext.id]} />
            <div className="lg:col-span-2">
              <div className="card p-6">
                <p className="eyebrow mb-3">Coverage by area</p>
                <div className="space-y-3">
                  {TOPICS.map((t) => {
                    const all = ITEMS.filter((i) => i.topics.includes(t.id)).length;
                    const done = ITEMS.filter((i) => i.topics.includes(t.id) && shelf.read.includes(i.id)).length;
                    const pct = all ? Math.round((done / all) * 100) : 0;
                    return (
                      <div key={t.id}>
                        <div className="mb-1 flex items-baseline justify-between font-mono text-[0.66rem]">
                          <span className="text-muted">{t.name}</span>
                          <span className="text-faint">
                            {done}/{all} · {pct}%
                          </span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: t.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-line px-5 py-8 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[0.64rem] text-faint">
          <span>Lodestar · everything stored in your browser · nothing leaves this device</span>
          <span>
            Seeded from a checked link guide · {ITEMS.length} resources · {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}
