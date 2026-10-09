"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookMarked,
  Command,
  Compass,
  GraduationCap,
  Library,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  User2,
  X,
} from "lucide-react";
import { cn, streakOf } from "@/lib/utils";
import { ITEMS } from "@/lib/data";
import { PEOPLE } from "@/lib/people";
import { useActions, useShelf } from "@/lib/store";
import { CommandPalette } from "./command-palette";

const NAV = [
  { href: "/", label: "Reading room", icon: Sparkles, key: "1" },
  { href: "/library", label: "Library", icon: Library, key: "2" },
  { href: "/atlas", label: "Atlas", icon: Compass, key: "3" },
  { href: "/people", label: "People", icon: User2, key: "4" },
  { href: "/paths", label: "Paths", icon: GraduationCap, key: "5" },
  { href: "/shelf", label: "My shelf", icon: BookMarked, key: "6" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const shelf = useShelf();
  const actions = useActions();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => setDrawer(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (typing) return;
      if (e.key === "/" || e.key.toLowerCase() === "j" && e.shiftKey) {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (e.key.toLowerCase() === "t") {
        actions.toggleTheme();
        return;
      }
      const nav = NAV.find((n) => n.key === e.key);
      if (nav && !e.metaKey && !e.ctrlKey && !e.altKey) {
        router.push(nav.href);
      }
      if (e.key === "?") setPaletteOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actions, router]);

  const goSearch = useCallback(() => setPaletteOpen(true), []);
  const streak = useMemo(() => streakOf(shelf.days), [shelf.days]);

  const nav = (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.86rem] transition-colors",
              active
                ? "bg-surface-2 text-ink"
                : "text-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icon
              className={cn("h-4 w-4 transition-colors", active ? "text-accent" : "text-faint group-hover:text-muted")}
              strokeWidth={1.75}
            />
            {label}
            {active && <span className="timeline-dot ml-auto !h-1.5 !w-1.5" />}
          </Link>
        );
      })}
    </nav>
  );

  const aside = (
    <aside className="flex h-full w-[236px] shrink-0 flex-col overflow-y-auto border-r border-line bg-surface/60">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface-2 text-accent">
          ✦
        </span>
        <div className="leading-tight">
          <div className="serif text-[1.12rem] text-ink">Lodestar</div>
          <div className="eyebrow !text-[0.55rem]">AI safety reading room</div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <button onClick={goSearch} className="btn w-full justify-between !py-2 !text-[0.66rem]">
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" /> Search
          </span>
          <span className="kbd">⌘K</span>
        </button>
      </div>

      {nav}

      <div className="mt-auto space-y-3 p-4">
        <div className="rounded-xl border border-line bg-surface-2 p-3">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow !text-[0.56rem]">Streak</span>
            <span className="font-mono text-[0.7rem] text-accent">{streak}d</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="eyebrow !text-[0.56rem]">Read</span>
            <span className="font-mono text-[0.7rem] text-ink">
              {shelf.read.length}/{shelf.goal}
            </span>
          </div>
          <div className="progress-track mt-2.5">
            <div className="progress-fill" style={{ width: `${Math.min(100, (shelf.read.length / shelf.goal) * 100)}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <button
            onClick={actions.toggleTheme}
            className="flex items-center gap-2 font-mono text-[0.64rem] text-faint transition-colors hover:text-ink"
            aria-label="Toggle theme"
          >
            {shelf.theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {shelf.theme === "dark" ? "light" : "dark"}
          </button>
          <span className="font-mono text-[0.6rem] text-faint">press ?</span>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-dvh">
      <div className="sticky top-0 hidden h-dvh md:block">{aside}</div>

      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex w-full items-center gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-md md:hidden">
        <button onClick={() => setDrawer(true)} aria-label="Menu">
          <Menu className="h-5 w-5 text-ink" />
        </button>
        <span className="serif text-[1.05rem]">Lodestar</span>
        <button onClick={goSearch} className="ml-auto" aria-label="Search">
          <Search className="h-5 w-5 text-muted" />
        </button>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div className="animate-fade-in absolute inset-y-0 left-0 w-[260px] bg-bg">
            <button
              onClick={() => setDrawer(false)}
              className="absolute right-3 top-4 z-10 text-muted"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {aside}
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">{children}</main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export function SearchHint() {
  return (
    <span className="hidden items-center gap-1.5 font-mono text-[0.62rem] text-faint lg:flex">
      <Command className="h-3 w-3" /> K
    </span>
  );
}

export { ITEMS, PEOPLE };
