# Contributing

Thanks for helping make Lodestar better.

## Content contributions

The library lives in `lib/data.ts`, people in `lib/people.ts`, paths in `lib/paths.ts`.
When you propose an addition:

1. **First-party links only.** Link the author's own site, the lab's blog, the arXiv page,
   the official channel. No aggregator blogs, no third-party bios.
2. **Add a `why`.** Every resource carries a one-to-two sentence *why it matters* and three
   key takeaways. These are what make the library useful — don't skip them.
3. **Tag correctly.** Pick the research areas from `lib/data.ts` and a level
   (1 intro · 2 intermediate · 3 advanced).
4. **Check the link.** Open it. If it 404s, fix it or leave a note.

## Code contributions

```bash
bun install
bun run dev
```

- TypeScript strict mode, ESM, Bun where the project already uses it.
- Keep changes small and focused — one logical change per commit.
- Run `bun run typecheck` and `bun run build` before opening a PR.
- Match the existing design tokens in `app/globals.css`; don't hardcode colors.

## Reporting broken links

Open an issue with the resource name and the URL you expected. Links rot; help keep them fresh.
