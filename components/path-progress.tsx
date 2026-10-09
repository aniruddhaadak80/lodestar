"use client";

import { useShelf } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PathProgress({ ids, compact }: { ids: string[]; compact?: boolean }) {
  const shelf = useShelf();
  const done = ids.filter((id) => shelf.read.includes(id)).length;
  const pct = ids.length ? Math.round((done / ids.length) * 100) : 0;

  if (compact) {
    if (done === 0) return <span className="font-mono text-[0.6rem] text-faint">todo</span>;
    return (
      <span className={cn("font-mono text-[0.6rem]", done === ids.length ? "text-ok" : "text-accent")}>
        {done === ids.length ? "✓ done" : `${done} step${done === 1 ? "" : "s"}`}
      </span>
    );
  }

  return (
    <div className="min-w-[180px]">
      <div className="mb-1.5 flex items-baseline justify-between font-mono text-[0.64rem]">
        <span className="text-faint">progress</span>
        <span className="text-ink">
          {done}/{ids.length} · {pct}%
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
