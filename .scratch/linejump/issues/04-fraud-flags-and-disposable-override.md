# 04: Fraud flags `disposable`, `same_ip`, `burst` and `--disposable`

**What to build:** The engine reports all referral flags in the order `disposable`, `same_ip`, `burst`, and only valid (unflagged) referrals move the referrer up. `process --disposable <file>` replaces the default list, which is resolved from the repo root regardless of cwd.

**Blocked by:** 03

**Status:** resolved

- [x] All seven fixture cases in `fixtures/cases/` pass as engine tests
- [x] Disposable is an exact domain match on the normalized domain; list parsing trims, lowercases, skips blanks and `#` lines
- [x] `same_ip`: exact IP and `ts − referrer.ts < 24h` (tests at 0 and exactly 24h)
- [x] `burst`: window `(ts − 10 min, ts]`, counts every accepted signup with the same ref string including flagged and `unknown_ref` ones (tests at exactly 10 min, and with earlier unknown_ref signups)
- [x] Code collision test: second owner of a code cannot be referred to
- [x] Engine also exposes per-flag evidence (referrer index, hours since referrer, burst count, matched duplicate index) for the UI
- [x] Subprocess test: `--disposable` with a custom file changes the flags
