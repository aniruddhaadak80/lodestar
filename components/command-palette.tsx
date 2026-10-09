"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CornerDownLeft, FileText, Moon, Search, Sun, User2 } from "lucide-react";
import { ITEMS } from "@/lib/data";
import { PEOPLE } from "@/lib/people";
import { PATHS } from "@/lib/paths";
import { TOPICS } from "@/lib/data";
import { fmtMinutes, TYPE_META } from "@/lib/utils";
import { useActions, useShelf } from "@/lib/store";

type Entry =
  | { kind: "page"; id: string; label: string; sub: string; href: string }
  | { kind: "item"; id: string; label: string; sub: string; href: string; hue: string }
  | { kind: "person"; id: string; label: string; sub: string; href: string }
  | { kind: "action"; id: string; label: string; sub: string; run: () => void };

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const shelf = useShelf();
  const actions = useActions();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
      return () => clearTimeout(t);
    }
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const entries = useMemo<Entry[]>(() => {
    const needle = q.trim().toLowerCase();
    const match = (s: string) => !needle || s.toLowerCase().includes(needle);

    const pages: Entry[] = ([
      { kind: "page", id: "p-home", label: "Reading room", sub: "Home · daily briefing", href: "/" },
      { kind: "page", id: "p-lib", label: "Library", sub: "Every paper, essay, video", href: "/library" },
      { kind: "page", id: "p-atlas", label: "Atlas", sub: "Research areas & questions", href: "/atlas" },
      { kind: "page", id: "p-people", label: "People", sub: "Who's who, with working links", href: "/people" },
      { kind: "page", id: "p-paths", label: "Paths", sub: "Curated reading curricula", href: "/paths" },
      { kind: "page", id: "p-shelf", label: "My shelf", sub: "Progress, notes, stats", href: "/shelf" },
    ] as Entry[]).filter((p) => match(p.label + p.sub));

    const items: Entry[] = ITEMS.filter((i) => match(`${i.title} ${i.deck} ${i.authors.join(" ")} ${i.tags.join(" ")} ${i.topics.join(" ")}`))
      .slice(0, needle ? 9 : 5)
      .map((i): Entry => ({
        kind: "item",
        id: i.id,
        label: i.title,
        sub: `${TYPE_META[i.type].label} · ${i.authors[0]} · ${fmtMinutes(i.minutes)}`,
        href: `/item/${i.id}`,
        hue: TYPE_META[i.type].hue,
      }));

    const people: Entry[] = PEOPLE.filter((p) => match(`${p.name} ${p.org} ${p.known}`))
      .slice(0, needle ? 5 : 3)
      .map((p): Entry => ({
        kind: "person",
        id: p.id,
        label: p.name,
        sub: `${p.role} · ${p.org}`,
        href: `/people#${p.id}`,
      }));

    const topics: Entry[] = TOPICS.filter((t) => match(t.name))
      .slice(0, 3)
      .map((t): Entry => ({
        kind: "page",
        id: `t-${t.id}`,
        label: `${t.name}`,
        sub: `Topic · ${t.question}`,
        href: `/library?topic=${t.id}`,
      }));

    const paths: Entry[] = PATHS.filter((p) => match(p.title))
      .slice(0, 2)
      .map((p): Entry => ({
        kind: "page",
        id: `path-${p.id}`,
        label: p.title,
        sub: `Path · ${p.weeks} weeks`,
        href: `/paths#${p.id}`,
      }));

    const actionsList: Entry[] = ([
      {
        kind: "action",
        id: "a-theme",
        label: `Switch to ${shelf.theme === "dark" ? "light" : "dark"} theme`,
        sub: "Action · or press T",
        run: actions.toggleTheme,
      },
      {
        kind: "action",
        id: "a-export",
        label: "Export my shelf as JSON",
        sub: "Action · save your reading data",
        run: () => {
          const blob = new Blob([actions.exportJson()], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "lodestar-shelf.json";
          a.click();
        },
      },
      {
        kind: "action",
        id: "a-random",
        label: "Open a random piece",
        sub: "Action · surprise me",
        run: () => router.push(`/item/${ITEMS[Math.floor(Math.random() * ITEMS.length)].id}`),
      },
    ] as Entry[]).filter((a) => match(a.label + a.sub));

    return [...pages, ...items, ...people, ...topics, ...paths, ...actionsList];
  }, [q, shelf.theme, actions, router]);

  useEffect(() => setCursor(0), [q]);

  if (!open) return null;

  const run = (e: Entry) => {
    onClose();
    if (e.kind === "action") e.run();
    else router.push(e.href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, entries.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = entries[cursor];
      if (entry) run(entry);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const groups: [string, Entry[]][] = [
    ["Navigate", entries.filter((e) => e.kind === "page")],
    ["Read", entries.filter((e) => e.kind === "item")],
    ["People", entries.filter((e) => e.kind === "person")],
    ["Actions", entries.filter((e) => e.kind === "action")],
  ];

  let idx = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <div className="animate-fade-in absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={onClose} />
      <div className="animate-pop relative w-full max-w-2xl overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-faint" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search papers, essays, videos, people, topics…"
            className="w-full bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-faint"
          />
          <span className="kbd">esc</span>
        </div>

        <div className="max-h-[54vh] overflow-y-auto p-2">
          {entries.length === 0 && (
            <div className="px-4 py-8 text-center font-mono text-[0.75rem] text-faint">
              Nothing matches “{q}”. Try a topic like interpretability.
            </div>
          )}

          {groups.map(([name, list]) =>
            list.length === 0 ? null : (
              <div key={name} className="mb-1.5">
                <div className="eyebrow px-3 py-2">{name}</div>
                {list.map((e) => {
                  idx += 1;
                  const active = idx === cursor;
                  const myIdx = idx;
                  return (
                    <button
                      key={e.id}
                      onMouseMove={() => setCursor(myIdx)}
                      onClick={() => run(e)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        active ? "bg-surface-2" : "",
                      )}
                    >
                      <span
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-[0.8rem]"
                        style={{
                          color: e.kind === "item" ? e.hue : "var(--c-faint)",
                          background:
                            e.kind === "item"
                              ? `color-mix(in oklab, ${e.hue} 13%, transparent)`
                              : "color-mix(in oklab, var(--c-border) 35%, transparent)",
                        }}
                      >
                        {e.kind === "item" ? "§" : e.kind === "person" ? <User2 className="h-3.5 w-3.5" /> : e.kind === "action" ? "⚡" : <FileText className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.88rem] text-ink">{e.label}</span>
                        <span className="block truncate font-mono text-[0.62rem] text-faint">{e.sub}</span>
                      </span>
                      {active && <CornerDownLeft className="h-3.5 w-3.5 text-accent" />}
                    </button>
                  );
                })}
              </div>
            ),
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[0.6rem] text-faint">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span className="flex items-center gap-2">
            {shelf.theme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
            lodestar
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

function cn(...cls: (string | false | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}
