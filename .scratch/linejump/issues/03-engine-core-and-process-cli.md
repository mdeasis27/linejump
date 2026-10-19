# 03: Engine core (normalization, codes, duplicates, unknown_ref, queue) and the `process` CLI

**What to build:** `bun run process <log.jsonl>` prints `{ "signups": [...] }` with correct `email`, `code`, `flags` and `position` for logs that only exercise normalization, duplicates, `unknown_ref` and ranking. Built as the single pure engine of ADR-0001, with SHA-256 from `@noble/hashes` (ADR-0002). The `disposable`, `same_ip` and `burst` flags are not yet produced.

**Blocked by:** 01

**Status:** resolved

- [x] Fixture cases `normalization`, `alias_duplicates`, `unknown_ref`, `rank_ties` pass as engine tests
- [x] Normalization follows grilling Q8 (trim, lowercase, `+tag`, Gmail dots and `googlemail.com`, email without `@`)
- [x] Referrer is the earliest earlier accepted signup with that code; empty/missing ref means no ref; exact case-sensitive match
- [x] Hash cross-check test against `node:crypto`
- [x] Rule constants (bonus 5, code length 8, windows, threshold) defined in one place
- [x] CLI: stdout is only JSON; blank lines skipped; a bad line exits 1 with a stderr message and empty stdout
- [x] Subprocess test: CLI output equals engine output for `fixtures/signups.jsonl`
