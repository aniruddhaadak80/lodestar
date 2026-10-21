import { describe, expect, it } from "vitest";
import { PATHS } from "../paths";
import { ITEM_BY_ID } from "../data";

describe("reading paths", () => {
  it("never lists the same reading twice in one path", () => {
    for (const path of PATHS) {
      const ids = path.steps.map((s) => s.itemId);
      expect(new Set(ids).size, `${path.id} repeats an item`).toBe(ids.length);
    }
  });

  it("only references items that exist", () => {
    for (const path of PATHS) {
      for (const step of path.steps) {
        expect(ITEM_BY_ID[step.itemId], `${path.id} week ${step.week}`).toBeDefined();
      }
    }
  });

  it("numbers the weeks 1..n without gaps", () => {
    for (const path of PATHS) {
      expect(path.steps.map((s) => s.week)).toEqual(
        path.steps.map((_, i) => i + 1),
      );
      expect(path.steps.length).toBe(path.weeks);
    }
  });

  it("gives every step a note", () => {
    for (const path of PATHS) {
      for (const step of path.steps) {
        expect(step.note.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
