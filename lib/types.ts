export type ItemType =
  | "paper"
  | "essay"
  | "blog"
  | "video"
  | "podcast"
  | "course"
  | "report"
  | "feed";

export type Level = 1 | 2 | 3; // 1 intro · 2 intermediate · 3 advanced

export interface Item {
  id: string;
  title: string;
  deck: string; // one-line description
  type: ItemType;
  topics: string[];
  authors: string[];
  org?: string;
  year: number;
  url: string;
  ytId?: string;
  minutes: number;
  level: Level;
  why: string; // why it matters
  takeaways: string[];
  tags: string[];
  featured?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  question: string;
  methods: string[];
  color: string; // hex token
}

export interface Person {
  id: string;
  name: string;
  role: string;
  org: string;
  known: string;
  site?: string;
  blog?: string;
  video?: string;
  topics: string[];
}

export interface PathStep {
  week?: number;
  itemId: string;
  note: string;
}

export interface Path {
  id: string;
  title: string;
  tagline: string;
  weeks: number;
  totalMinutes: number;
  audience: string;
  steps: PathStep[];
}

export interface Note {
  text: string;
  at: number;
}

export interface ShelfState {
  read: string[];
  saved: string[];
  progress: Record<string, number>; // 0..1
  notes: Record<string, Note>;
  theme: "dark" | "light";
  goal: number;
  days: string[]; // ISO dates with activity
  lastSeen: string;
}
