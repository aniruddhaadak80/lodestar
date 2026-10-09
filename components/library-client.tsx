"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { ITEMS, TOPICS } from "@/lib/data";
import { EMPTY_QUERY, runSearch, type Query } from "@/lib/search";
import { useShelf } from "@/lib/store";
import { cn, TYPE_META } from "@/lib/utils";
import { ItemCard, ItemRow } from "@/components/ui";

const TYPES = ["paper", "essay", "blog", "video", "podcast", "course", "report", "feed"];

export function LibraryClient() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shelf = useShelf();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);

  const query: Query = {
    ...EMPTY_QUERY,
    q: params.get("q") ?? "",
    type: params.get("type") ?? "",
    topic: params.get("topic") ?? "",
    level: params.get("level") ?? "",
    status: params.get("status") ?? "",
    sort: (params.get("sort") as Query["sort"]) ?? "relevance",
  };

  function patch(p: Partial<Query>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(p)) {
      if (!v || v === "relevance" || v === "") next.delete(k);
      else next.set(k, String(v));
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const results = useMemo(
    () => runSearch(ITEMS, query, { read: shelf.read, saved: shelf.saved }),
    [query.q, query.type, query.topic, query.level, query.status, query.sort, shelf.read, shelf.saved],
  );

  const activeCount = [query.type, query.topic, query.level, query.status].filter(Boolean).length;

  return (
    <div className="px-5 py-8 sm:px-10">
      <header className="mb-6">
        <p className="eyebrow mb-2">Library · {ITEMS.length} resources</p>
        <h1 className="display text-[2.6rem] text-ink sm:text-[3.2rem]">Everything, searchable</h1>
      </header>

      {/* search + sort */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="field flex min-w-[240px] flex-1 items-center gap-2.5 px-3.5 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-faint" />
          <input
            defaultValue={query.q}
            onChange={(e) => patch({ q: e.target.value })}
            placeholder="Search titles, authors, topics, takeaways…"
            className="w-full bg-transparent text-[0.9rem] text-ink outline-none placeholder:text-faint"
            autoFocus
          />
          {query.q && (
            <button onClick={() => patch({ q: "" })} aria-label="Clear search">
              <X className="h-3.5 w-3.5 text-faint hover:text-ink" />
            </button>
          )}
        </div>

        <select
          value={query.sort}
          onChange={(e) => patch({ sort: e.target.value as Query["sort"] })}
          className="field px-3 py-2.5 font-mono text-[0.7rem] text-muted"
        >
          <option value="relevance">sort · relevance</option>
          <option value="new">sort · newest</option>
          <option value="old">sort · oldest</option>
          <option value="short">sort · shortest</option>
          <option value="title">sort · a–z</option>
        </select>

        <div className="flex overflow-hidden rounded-lg border border-line">
          <button
            onClick={() => setView("grid")}
            className={cn("px-3 py-2.5", view === "grid" ? "bg-surface-2 text-accent" : "text-faint")}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn("px-3 py-2.5", view === "list" ? "bg-surface-2 text-accent" : "text-faint")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn("btn", activeCount > 0 && "border-accent/50")}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          filters {activeCount > 0 && <span className="text-accent">{activeCount}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="animate-fade-in mb-5 space-y-3 rounded-xl border border-line bg-surface p-4">
          <FilterRow label="Format">
            {TYPES.map((t) => (
              <button key={t} className="chip" data-on={query.type === t} onClick={() => patch({ type: query.type === t ? "" : t })}>
                {TYPE_META[t].glyph} {TYPE_META[t].label}
              </button>
            ))}
          </FilterRow>

          <FilterRow label="Area">
            {TOPICS.map((t) => (
              <button key={t.id} className="chip" data-on={query.topic === t.id} onClick={() => patch({ topic: query.topic === t.id ? "" : t.id })}>
                {t.name}
              </button>
            ))}
          </FilterRow>

          <FilterRow label="Level">
            {["1", "2", "3"].map((l) => (
              <button key={l} className="chip" data-on={query.level === l} onClick={() => patch({ level: query.level === l ? "" : l })}>
                {l === "1" ? "Intro" : l === "2" ? "Intermediate" : "Advanced"}
              </button>
            ))}
          </FilterRow>

          <FilterRow label="Status">
            {[
              ["unread", "Unread"],
              ["read", "Read"],
              ["saved", "Saved"],
            ].map(([v, label]) => (
              <button key={v} className="chip" data-on={query.status === v} onClick={() => patch({ status: query.status === v ? "" : v })}>
                {label}
              </button>
            ))}
            {activeCount > 0 && (
              <button
                className="chip ml-auto"
                onClick={() => router.replace(pathname, { scroll: false })}
              >
                clear all
              </button>
            )}
          </FilterRow>
        </div>
      )}

      <div className="mb-4 flex items-baseline justify-between border-b border-line pb-2">
        <span className="font-mono text-[0.68rem] text-faint">
          {results.length} result{results.length === 1 ? "" : "s"}
          {query.q && <> for “{query.q}”</>}
        </span>
        <span className="hidden font-mono text-[0.62rem] text-faint sm:block">
          {shelf.read.length} read · {shelf.saved.length} saved
        </span>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-12 text-center">
          <p className="serif text-[1.4rem] text-ink">Nothing matches that yet.</p>
          <p className="mt-2 font-mono text-[0.7rem] text-faint">
            Try “interpretability”, “RLHF”, or clear the filters.
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((item, i) => (
            <ItemCard
              key={item.id}
              item={item}
              index={i}
              read={shelf.read.includes(item.id)}
              saved={shelf.saved.includes(item.id)}
              progress={shelf.progress[item.id]}
            />
          ))}
        </div>
      ) : (
        <div className="animate-fade-in overflow-hidden rounded-xl border border-line bg-surface">
          {results.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              read={shelf.read.includes(item.id)}
              saved={shelf.saved.includes(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow w-16 shrink-0 !text-[0.58rem]">{label}</span>
      {children}
    </div>
  );
}
