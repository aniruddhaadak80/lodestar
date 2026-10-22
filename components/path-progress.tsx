"use client";

import { useShelf } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PathProgress({ ids, compact }: { ids: string[]; compact?: boolean }) {
  const shelf = useShelf();
  // Count distinct readings: a path must never report 100% because the same
  // item appears in two of its steps.
  const unique = [...new Set(ids)];
  const done = unique.filter((id) => shelf.read.includes(id)).length;
  const pct = unique.length ? Math.round((done / unique.length) * 100) : 0;

  if (compact) {
    if (done === 0) return <span className="font-mono text-[0.6rem] text-faint">todo</span>;
    return (
      <span className={cn("font-mono text-[0.6rem]", done === unique.length ? "text-ok" : "text-accent")}>
        {done === unique.length ? "✓ done" : `${done} step${done === 1 ? "" : "s"}`}
      </span>
    );
  }

  return (
    <div className="min-w-[180px]">
      <div className="mb-1.5 flex items-baseline justify-between font-mono text-[0.64rem]">
        <span className="text-faint">progress</span>
        <span className="text-ink">
          {done}/{unique.length} · {pct}%
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
