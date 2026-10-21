import { afterAll, describe, expect, it } from "vitest";

// Pin the timezone so the test exercises the UTC-vs-local difference
// wherever it runs. Node re-reads TZ when it changes.
const ORIGINAL_TZ = process.env.TZ;
process.env.TZ = "Asia/Kolkata";

const { streakOf, todayISO } = await import("../utils");

describe("todayISO", () => {
  it("is the local calendar date, not the UTC date", () => {
    // 2026-10-21T19:30:00Z is 2026-10-22 01:00 in Asia/Kolkata (UTC+05:30).
    const morning = new Date("2026-10-21T19:30:00Z");
    const later = new Date("2026-10-22T02:30:00Z");

    // The UTC date is a day earlier for the first of the two.
    expect(morning.toISOString().slice(0, 10)).toBe("2026-10-21");
    expect(later.toISOString().slice(0, 10)).toBe("2026-10-22");

    // Both are the same calendar day in UTC+05:30, so they must share a key.
    expect(todayISO(morning)).toBe("2026-10-22");
    expect(todayISO(later)).toBe(todayISO(morning));
  });

  it("formats as YYYY-MM-DD", () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(todayISO(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("streakOf", () => {
  it("counts consecutive days from today backwards", () => {
    const today = todayISO();
    const yesterday = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return todayISO(d);
    })();

    expect(streakOf([yesterday, today])).toBe(2);
    expect(streakOf([yesterday])).toBe(1);
    expect(streakOf([today])).toBe(1);
  });

  it("is zero for a streak that ended more than a day ago", () => {
    const old = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 3);
      return todayISO(d);
    })();

    expect(streakOf([old])).toBe(0);
    expect(streakOf([])).toBe(0);
  });

  it("keeps counting yesterday's streak when today has not been visited", () => {
    const yesterday = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return todayISO(d);
    })();

    expect(streakOf([yesterday])).toBe(1);
  });
});

afterAll(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});
