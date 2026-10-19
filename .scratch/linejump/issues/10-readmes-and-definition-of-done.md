# 10: READMEs and definition-of-done verification

**What to build:** `README.md` (EN) and `README.es.md` (ES), result first: the `eval` score at the top, how to run (including both CLI scripts), architecture in under 10 lines, 2–3 tradeoffs (full recomputation, sync hash library, browser-only demo state), and what didn't work. Then verify the whole definition of done from `REQUIREMENTS.md` on a clean install.

**Blocked by:** 08, 09

**Status:** resolved

- [x] The score in both READMEs matches a fresh `bun run eval`
- [x] `bun install`, `build`, `test`, `typecheck`, `lint` pass from a clean checkout
- [x] `bun run process fixtures/signups.jsonl` and `bun run eval` print valid JSON and nothing else on stdout
- [x] `bun run dev` serves `/en/app` and `/es/app` with no env vars
- [x] `README.md`, `README.es.md`, `DESIGN.md` exist as described
- [x] Everything committed
