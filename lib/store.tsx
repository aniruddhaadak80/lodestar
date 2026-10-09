"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ShelfState } from "./types";
import { todayISO, streakOf } from "./utils";

const KEY = "lodestar:shelf:v1";

export const EMPTY: ShelfState = {
  read: [],
  saved: [],
  progress: {},
  notes: {},
  theme: "dark",
  goal: 12,
  days: [],
  lastSeen: "",
};

let state: ShelfState = EMPTY;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — ignore */
  }
}

function commit(next: ShelfState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

const serverSnapshot = () => EMPTY;
const clientSnapshot = () => state;

function hydrate(): ShelfState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) } as ShelfState;
  } catch {
    /* corrupt payload — fall back to empty */
  }
  return EMPTY;
}

export function useShelf(): ShelfState {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];
}

export type Toast = { id: number; msg: string };

export function useActions() {
  const [, force] = useState(0);

  const touchDay = useCallback(() => {
    const today = todayISO();
    if (state.lastSeen === today) return;
    commit({ ...state, days: [...state.days, today].slice(-400), lastSeen: today });
    force((n) => n + 1);
  }, []);

  const toggleRead = useCallback((id: string) => {
    const nowRead = !state.read.includes(id);
    commit({
      ...state,
      read: toggle(state.read, id),
      progress: nowRead ? { ...state.progress, [id]: 1 } : { ...state.progress, [id]: 0 },
      days: [...new Set([...state.days, todayISO()])].slice(-400),
    });
    force((n) => n + 1);
  }, []);

  const toggleSave = useCallback((id: string) => {
    commit({ ...state, saved: toggle(state.saved, id) });
    force((n) => n + 1);
  }, []);

  const setProgress = useCallback((id: string, p: number) => {
    const clamped = Math.max(0, Math.min(1, p));
    const done = clamped >= 0.999;
    commit({
      ...state,
      progress: { ...state.progress, [id]: clamped },
      read: done ? [...new Set([id, ...state.read])] : state.read.filter((x) => x !== id),
      days: [...new Set([...state.days, todayISO()])].slice(-400),
    });
    force((n) => n + 1);
  }, []);

  const setNote = useCallback((id: string, text: string) => {
    const notes = { ...state.notes };
    if (text.trim()) notes[id] = { text: text.trim(), at: Date.now() };
    else delete notes[id];
    commit({ ...state, notes });
    force((n) => n + 1);
  }, []);

  const setTheme = useCallback((theme: ShelfState["theme"]) => {
    document.documentElement.dataset.theme = theme;
    commit({ ...state, theme });
    force((n) => n + 1);
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(state.theme === "dark" ? "light" : "dark"),
    [setTheme, state.theme],
  );

  const setGoal = useCallback((goal: number) => {
    commit({ ...state, goal: Math.max(1, Math.min(500, goal)) });
    force((n) => n + 1);
  }, []);

  const reset = useCallback(() => {
    commit({ ...EMPTY, theme: state.theme });
    force((n) => n + 1);
  }, [state.theme]);

  const exportJson = useCallback(() => JSON.stringify(state, null, 2), []);

  const importJson = useCallback((raw: string) => {
    const parsed = JSON.parse(raw) as ShelfState;
    commit({ ...EMPTY, ...parsed });
    force((n) => n + 1);
  }, []);

  return {
    touchDay,
    toggleRead,
    toggleSave,
    setProgress,
    setNote,
    setTheme,
    toggleTheme,
    setGoal,
    reset,
    exportJson,
    importJson,
  };
}

/* ── toasts ─────────────────────────────────────────────────────────── */
type ToastCtx = (msg: string) => void;
const ToastContext = createContext<ToastCtx>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const actions = useActions();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  useEffect(() => {
    actions.touchDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toast = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[120] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-slide-up rounded-full border border-line bg-surface px-4 py-2 font-mono text-[0.7rem] tracking-wide text-ink shadow-lg"
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
