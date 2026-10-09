import type { Item } from "./types";

export interface Query {
  q: string;
  type: string; // "" = all
  topic: string; // "" = all
  level: string; // "" = all
  status: string; // "" | "read" | "unread" | "saved"
  sort: "relevance" | "new" | "old" | "short" | "title";
}

export const EMPTY_QUERY: Query = {
  q: "",
  type: "",
  topic: "",
  level: "",
  status: "",
  sort: "relevance",
};

function norm(s: string) {
  return s.toLowerCase();
}

function score(item: Item, terms: string[]) {
  if (terms.length === 0) return 1;
  let total = 0;
  const title = norm(item.title);
  const deck = norm(item.deck);
  const authors = norm(item.authors.join(" "));
  const body = norm(`${item.deck} ${item.why} ${item.takeaways.join(" ")} ${item.tags.join(" ")} ${item.org ?? ""} ${item.topics.join(" ")} ${item.type}`);

  for (const t of terms) {
    let s = 0;
    if (title.includes(t)) s += title.startsWith(t) ? 14 : 10;
    if (title.includes(t.replace(/\s+/g, ""))) s += 4;
    if (authors.includes(t)) s += 7;
    if (deck.includes(t)) s += 5;
    if (body.includes(t)) s += 3;
    if (s === 0) return 0; // every term must match somewhere
    total += s;
  }
  return total;
}

export function runSearch(
  items: Item[],
  q: Query,
  flags: { read: string[]; saved: string[] },
): Item[] {
  const terms = norm(q.q).split(/\s+/).filter(Boolean);

  let out = items
    .map((item) => ({ item, s: score(item, terms) }))
    .filter((r) => r.s > 0)
    .filter(({ item }) => (q.type ? item.type === q.type : true))
    .filter(({ item }) => (q.topic ? item.topics.includes(q.topic) : true))
    .filter(({ item }) => (q.level ? String(item.level) === q.level : true))
    .filter(({ item }) => {
      if (q.status === "read") return flags.read.includes(item.id);
      if (q.status === "unread") return !flags.read.includes(item.id);
      if (q.status === "saved") return flags.saved.includes(item.id);
      return true;
    });

  const cmp: Record<Query["sort"], (a: { item: Item; s: number }, b: { item: Item; s: number }) => number> = {
    relevance: (a, b) => b.s - a.s || b.item.year - a.item.year,
    new: (a, b) => b.item.year - a.item.year || a.item.title.localeCompare(b.item.title),
    old: (a, b) => a.item.year - b.item.year || a.item.title.localeCompare(b.item.title),
    short: (a, b) => a.item.minutes - b.item.minutes,
    title: (a, b) => a.item.title.localeCompare(b.item.title),
  };

  out = out.sort(cmp[q.sort]);
  if (q.sort === "relevance" && terms.length === 0) out = [...out].sort((a, b) => (Number(b.item.featured) - Number(a.item.featured)) || b.item.year - a.item.year);

  return out.map((r) => r.item);
}

/** deterministic pick so the "today" briefing is stable for the whole day */
export function pickOfTheDay(items: Item[], seedStr: string) {
  if (items.length === 0) return undefined;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const featured = items.filter((i) => i.featured);
  const pool = featured.length ? featured : items;
  return pool[seed % pool.length];
}

export function relatedTo(item: Item, items: Item[], limit = 4) {
  return items
    .filter((i) => i.id !== item.id)
    .map((i) => ({
      i,
      s:
        i.topics.filter((t) => item.topics.includes(t)).length * 3 +
        i.authors.filter((a) => item.authors.includes(a)).length * 2 +
        (i.type === item.type ? 1 : 0) +
        (i.year === item.year ? 1 : 0),
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((r) => r.i);
}
