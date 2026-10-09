import Link from "next/link";
import type { Item } from "@/lib/types";
import { cn, fmtMinutes, LEVEL_LABEL, TYPE_META } from "@/lib/utils";
import { TOPIC_BY_ID } from "@/lib/data";
import { Bookmark, Check, Clock } from "lucide-react";

export function TypeGlyph({ type, className }: { type: string; className?: string }) {
  const meta = TYPE_META[type];
  return (
    <span
      className={cn("grid h-7 w-7 place-items-center rounded-md text-[0.85rem]", className)}
      style={{
        color: meta.hue,
        background: `color-mix(in oklab, ${meta.hue} 14%, transparent)`,
        border: `1px solid color-mix(in oklab, ${meta.hue} 30%, transparent)`,
      }}
      aria-hidden
    >
      {meta.glyph}
    </span>
  );
}

export function TopicChip({ id, small }: { id: string; small?: boolean }) {
  const t = TOPIC_BY_ID[id];
  if (!t) return null;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5", small ? "text-[0.62rem]" : "text-[0.66rem]")}
      style={{
        borderColor: `color-mix(in oklab, ${t.color} 38%, var(--c-border))`,
        color: `color-mix(in oklab, ${t.color} 78%, var(--c-text))`,
        background: `color-mix(in oklab, ${t.color} 9%, transparent)`,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.05em",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
      {t.name}
    </span>
  );
}

export function StatusMarks({ item, read, saved }: { item: Item; read: boolean; saved: boolean }) {
  return (
    <span className="ml-auto flex items-center gap-1.5">
      {saved && <Bookmark className="h-3.5 w-3.5 text-accent" fill="currentColor" />}
      {read && <Check className="h-3.5 w-3.5 text-ok" strokeWidth={3} />}
    </span>
  );
}

export function ItemCard({
  item,
  read,
  saved,
  progress,
  index = 0,
}: {
  item: Item;
  read: boolean;
  saved: boolean;
  progress?: number;
  index?: number;
}) {
  const meta = TYPE_META[item.type];
  return (
    <Link
      href={`/item/${item.id}`}
      className={cn(
        "card card-hover group relative flex flex-col gap-3 overflow-hidden p-4 sm:p-5",
        read && "opacity-75",
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <span
        className="absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, ${meta.hue}, transparent 65%)` }}
      />
      <div className="flex items-start gap-3">
        <TypeGlyph type={item.type} />
        <div className="min-w-0 flex-1">
          <h3 className="serif text-[1.18rem] leading-snug text-ink group-hover:text-accent">
            {item.title}
          </h3>
          <p className="mt-0.5 font-mono text-[0.66rem] tracking-wide text-faint">
            {item.authors.slice(0, 2).join(", ")}
            {item.authors.length > 2 ? " et al." : ""} · {item.year} · {meta.label}
          </p>
        </div>
        <StatusMarks item={item} read={read} saved={saved} />
      </div>

      <p className="text-[0.85rem] leading-relaxed text-muted">{item.deck}</p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        {item.topics.slice(0, 2).map((t) => (
          <TopicChip key={t} id={t} small />
        ))}
        <span className="ml-auto flex items-center gap-2 font-mono text-[0.64rem] text-faint">
          <Clock className="h-3 w-3" />
          {fmtMinutes(item.minutes)}
          <span className="rounded border border-line px-1.5 py-px">{LEVEL_LABEL[item.level]}</span>
        </span>
      </div>

      {typeof progress === "number" && progress > 0 && progress < 1 && (
        <div className="progress-track absolute inset-x-0 bottom-0 rounded-none">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </Link>
  );
}

export function ItemRow({
  item,
  read,
  saved,
}: {
  item: Item;
  read: boolean;
  saved: boolean;
}) {
  const meta = TYPE_META[item.type];
  return (
    <Link
      href={`/item/${item.id}`}
      className={cn(
        "group flex items-center gap-4 border-b border-line px-3 py-3 transition-colors hover:bg-surface-2",
        read && "opacity-70",
      )}
    >
      <TypeGlyph type={item.type} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="serif truncate text-[1.05rem] text-ink group-hover:text-accent">{item.title}</span>
          <span className="hidden font-mono text-[0.62rem] text-faint sm:inline">
            {item.authors[0]} · {item.year}
          </span>
        </div>
        <p className="truncate text-[0.78rem] text-muted">{item.deck}</p>
      </div>
      <div className="hidden items-center gap-1.5 md:flex">
        {item.topics.slice(0, 1).map((t) => (
          <TopicChip key={t} id={t} small />
        ))}
      </div>
      <span className="w-20 text-right font-mono text-[0.64rem] text-faint">{fmtMinutes(item.minutes)}</span>
      <StatusMarks item={item} read={read} saved={saved} />
    </Link>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2 className="display text-[1.9rem] sm:text-[2.3rem] text-ink">{title}</h2>
        {sub && <p className="mt-1.5 max-w-xl text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatBlock({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <div className="border-l border-line pl-4">
      <div className="display text-[2.1rem] leading-none text-ink">{value}</div>
      <div className="eyebrow mt-2">{label}</div>
      {hint && <div className="mt-1 font-mono text-[0.62rem] text-faint">{hint}</div>}
    </div>
  );
}
