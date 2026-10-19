# 05: `eval` CLI and pooled scoring

**What to build:** `bun run eval` runs the engine in-process on every `<name>.jsonl` + `<name>.expected.json` pair in `fixtures/cases/` and prints `{ "cases", "flag_f1", "position_exact", "score" }` per grilling Q11 and Q12. `--verbose` writes per-case detail to stderr only.

**Blocked by:** 04

**Status:** resolved

- [x] Scoring is a pure function with hand-computed tests: perfect, empty-vs-empty F1 = 1, missing actual signups count as wrong, `null` positions match `null`
- [x] F1 pooled over `(case, signup index, flag)` triples including `duplicate`
- [x] Rounding: ratios to 4 decimals, score to 2 decimals
- [x] On the committed cases `eval` prints `score: 100`
- [x] Subprocess test: stdout parses as JSON with exactly the four keys
