"use client";

import Link from "next/link";
import { ITEMS, TOPICS } from "@/lib/data";
import { PEOPLE } from "@/lib/people";
import { useShelf } from "@/lib/store";
import { ItemCard } from "./ui";

export function AtlasView() {
  const shelf = useShelf();

  return (
    <div className="px-5 py-8 sm:px-10">
      <header className="mb-10 max-w-3xl">
        <p className="eyebrow mb-2">Atlas · {TOPICS.length} areas</p>
        <h1 className="display text-[2.6rem] text-ink sm:text-[3.4rem]">The rooms of the field</h1>
        <p className="mt-4 text-[1rem] leading-relaxed text-muted">
          AI safety is not one discipline. It is a set of rooms that ask different questions with
          different methods — and the rooms argue with each other. Knowing which room you are in
          tells you what a piece will say before you open it.
        </p>
      </header>

      <div className="space-y-14">
        {TOPICS.map((topic) => {
          const items = ITEMS.filter((i) => i.topics.includes(topic.id));
          const people = PEOPLE.filter((p) => p.topics.includes(topic.id));
          return (
            <section key={topic.id} id={topic.id} className="scroll-mt-6">
              <div
                className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b pb-4"
                style={{ borderColor: `color-mix(in oklab, ${topic.color} 35%, var(--c-border))` }}
              >
                <div>
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: topic.color }} />
                    <span className="eyebrow" style={{ color: topic.color }}>
                      {items.length} resources · {people.length} people
                    </span>
                  </div>
                  <h2 className="display text-[2.1rem] text-ink sm:text-[2.5rem]">{topic.name}</h2>
                  <p className="mt-1.5 max-w-2xl text-[0.98rem] text-muted">{topic.question}</p>
                </div>
                <Link href={`/library?topic=${topic.id}`} className="btn">
                  Open in library →
                </Link>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {topic.methods.map((m) => (
                  <span
                    key={m}
                    className="rounded-full border px-3 py-1 font-mono text-[0.64rem]"
                    style={{
                      borderColor: `color-mix(in oklab, ${topic.color} 35%, var(--c-border))`,
                      color: `color-mix(in oklab, ${topic.color} 75%, var(--c-text))`,
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>

              {people.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.68rem]">
                  <span className="text-faint">people →</span>
                  {people.map((p) => (
                    <Link
                      key={p.id}
                      href={`/people#${p.id}`}
                      className="text-muted underline-offset-4 hover:text-accent hover:underline"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.slice(0, 6).map((item, idx) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    index={idx}
                    read={shelf.read.includes(item.id)}
                    saved={shelf.saved.includes(item.id)}
                    progress={shelf.progress[item.id]}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
