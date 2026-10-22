import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TYPE_META: Record<
  string,
  { label: string; glyph: string; hue: string }
> = {
  paper: { label: "Paper", glyph: "§", hue: "#7cc4ff" },
  essay: { label: "Essay", glyph: "¶", hue: "#f0b46a" },
  blog: { label: "Blog", glyph: "✦", hue: "#c9a7ff" },
  video: { label: "Video", glyph: "▶", hue: "#ff8b8b" },
  podcast: { label: "Podcast", glyph: "◉", hue: "#7fe3c0" },
  course: { label: "Course", glyph: "△", hue: "#ffd76a" },
  report: { label: "Report", glyph: "▤", hue: "#9fb4ff" },
  feed: { label: "Feed", glyph: "≈", hue: "#8fe0f5" },
};

export const LEVEL_LABEL: Record<number, string> = {
  1: "Intro",
  2: "Intermediate",
  3: "Advanced",
};

export function fmtMinutes(m: number) {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
}

/**
 * The reader's own calendar date, as YYYY-MM-DD.
 *
 * Deliberately local rather than UTC: `toISOString()` would file the
 * early hours of a day in Asia/Kolkata (or anywhere east of UTC) under
 * the previous date, so one calendar day could be recorded as two and
 * the streak would over-count. streakOf() walks the calendar with local
 * date arithmetic, so the key has to be local too.
 */
export function todayISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function streakOf(days: string[]) {
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date();
  if (!set.has(todayISO(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(todayISO(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function sampleOf<T>(arr: T[], seed: number): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.abs(Math.trunc(seed)) % arr.length];
}
