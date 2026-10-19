# Grilling log: Linejump

Run of `/grill-with-docs` (grilling + domain-modeling) against `REQUIREMENTS.md` and the committed fixtures. No human was available, so every question was answered with the recommended option. Facts were checked against `fixtures/cases/*.expected.json` before answering; where a fixture settles a question, it is cited.

Resulting docs: `GLOSSARY.md`, `docs/adr/0001` to `0004`, then `spec.md` and `issues/`.

## Round 1: rule semantics (graded, highest risk)

**Q1 - Disposable domain match.** Exact match of the normalized domain, or suffix match (subdomains)?
➡️ Exact match only. Settled by `multi_flags`: `m7@sub.mailinator.com` is not flagged `disposable`. Comparison is case-insensitive because the domain is already lowercased; list lines are trimmed and lowercased, blank lines and `#` comments ignored.

**Q2 - Which signups count toward `burst`?** Only valid referrals, or every accepted signup whose `ref` equals the code?
➡️ Every accepted signup whose raw `ref` string equals the code, including ones that are themselves flagged (`disposable`, `same_ip`, `burst`, even `unknown_ref` ones made before the code existed). Settled for flagged ones by `multi_flags` (m1..m6 are `disposable`+`same_ip` and still push m6 to `burst`). Duplicates never count: they are not accepted.

**Q3 - Burst window bounds.** Open lower bound `(ts − 10 min, ts]`?
➡️ Yes, exactly as written, in milliseconds. Settled by `burst`: group u3 has six signups spanning exactly 10:00 and none is flagged; group u4 spans 9:59 and the sixth is flagged.

**Q4 - `same_ip` 24h boundary.** Strict `<`?
➡️ Strict: `this.ts − referrer.ts < 24h`. Settled by `same_ip`: c2 at exactly +24h is clean, c1b at +23:59:59 is flagged. Equal timestamps (diff 0) are flagged. IP comparison is exact string equality.

**Q5 - What is "the referrer"?** If two accepted signups ever had the same 8-hex code (collision), which wins?
➡️ The earliest accepted signup with that code. Later collisions keep their own code in output but cannot be referred to.

**Q6 - Self-referral with your own fresh code.** Can a new signup reference its own code?
➡️ No: the code must belong to an *earlier* accepted signup, so it is `unknown_ref`. Self-referral via an alias is already `duplicate` per the brief.

**Q7 - Empty or missing `ref`.** What counts as "no ref"?
➡️ Missing, `null`, or `""` all mean no ref. A non-empty ref is compared exactly, case-sensitive, no trimming (`UNKNOWN` in `unknown_ref` is unknown).

**Q8 - Normalization details.** Strip which `+tag`? Trim whitespace? Malformed emails?
➡️ Trim surrounding whitespace, lowercase, split at the last `@`; strip from the first `+` to the end of the local part; for `gmail.com`/`googlemail.com` remove all dots from the local part and set the domain to `gmail.com`. Non-gmail dots are kept (`a.lice@example.com` is distinct, per `normalization`). An email without `@` is normalized as lowercase-trimmed whole string with no domain (never disposable). Output `email` is always the raw string from the log.

**Q9 - Timestamps.** How are `ts` compared?
➡️ Parse with `Date.parse` to epoch milliseconds. Log order is authoritative for processing order and `join_index`, even if two `ts` are equal.

**Q10 - `valid_referrals`.** Which referrals move the referrer?
➡️ Only referrals from accepted signups with zero flags. Flagged signups still join the queue themselves.

## Round 2: CLI and grading contract

**Q11 - `eval` aggregation.** Per-case averages or pooled?
➡️ Pooled (micro) across all cases. Flag F1 over the set of `(case, signup index, flag)` triples, `duplicate` included. If both predicted and expected sets are empty, F1 = 1. `position_exact` = matching positions / total expected signups, `null` matches `null`. If the actual output has fewer signups than expected, missing ones count as wrong.

**Q12 - `eval` output shape.** What is `cases`?
➡️ `cases` is the integer count of cases run. `flag_f1` and `position_exact` are ratios in `[0, 1]` rounded to 4 decimals; `score = mean × 100` rounded to 2 decimals. Per-case detail goes to stderr only when `--verbose` is passed; stdout stays pure JSON.

**Q13 - `eval` invocation.** Does `eval` shell out to `process`?
➡️ No. It calls the same engine function in-process (same code path as `process`), which is faster and keeps one source of truth. A test asserts `process` CLI output equals the engine output.

**Q14 - Default disposable list location.** Relative to cwd?
➡️ Resolved relative to the repo root (from the script file location), so the CLI works from any cwd. `--disposable <file>` overrides; relative paths in arguments resolve against cwd.

**Q15 - Bad input lines.** Blank lines, invalid JSON?
➡️ Blank lines are skipped (they are not signups). An unparseable line is a hard error: message on stderr, exit code 1, nothing on stdout. Partial output would silently corrupt grading.

## Round 3: architecture

**Q16 - One engine or two?** UI and CLI share logic?
➡️ One pure, synchronous engine module: `(signups, disposableSet) → result`. CLI, UI, story page numbers and tests all call it. See ADR-0001.

**Q17 - SHA-256 in the browser.** Web Crypto is async; the engine should be sync.
➡️ Use a small, audited sync SHA-256 (`@noble/hashes`) that runs in Bun, Node and the browser. A test cross-checks it against `node:crypto`. See ADR-0002.

**Q18 - Persistence.** Database for the demo?
➡️ No database. Demo state is the committed log plus visitor-added signups, held in client state (and `localStorage` so a refresh keeps it), recomputed by the engine on every change. See ADR-0003.

**Q19 - Where does the admin view live?** Separate route behind auth?
➡️ A tab inside the "Try it" section of `/{lang}/app`. No auth: there is no real data in demo mode. Recorded in ADR-0003.

**Q20 - Live mail.** Which provider and env var?
➡️ A server route sends "you moved up" email via a provider HTTP API only when `RESEND_API_KEY` is set (plain `fetch`, no SDK). Otherwise, and always for tests and CLI, messages go to an on-screen outbox. The UI never names the provider.

**Q21 - LLM?** Does this project need `ai-kit/`?
➡️ No LLM is used. `ai-kit/` is not present in the repo and is not needed.

## Round 4: product behaviour

**Q22 - "Live position".** Position at what moment?
➡️ In the UI, the position after all signups processed so far (replay cursor or latest added). In the CLI, the final position after the whole log, per the brief.

**Q23 - When is a "you moved up" message sent?** 
➡️ When a new signup creates a valid referral for a referrer whose position improved compared to before that signup. One message to that referrer, with old and new position. Flagged referrals never send mail.

**Q24 - Adding signups in demo.** What `ts` and `ip`?
➡️ Form fields: email (required), referral code (optional, prefilled when coming from a "share link"), ip (prefilled with a fresh fake IP, editable so the visitor can try `same_ip`). `ts` = previous signup's `ts` + 1 minute (simulated clock), so results are deterministic. A "Simulate a burst" button adds six referrals to one code inside 10 minutes.

**Q25 - Replay controls.** 
➡️ Play/pause, step forward, step back, reset, and a speed toggle. Every control is a labelled button, keyboard reachable.

**Q26 - Referral link format.** 
➡️ `/{lang}/app?ref=<code>`; opening it prefills the referral field. The locale redirect keeps the query string.

**Q27 - "Compare" numbers.** Compare what against what?
➡️ On the committed log: a naive queue that counts every referral vs Linejump's queue. Show signups, duplicates caught, referrals flagged by type, how many people a cheater jumps in the naive queue, and the `eval` score on the committed cases. All computed by the engine at render time, never hard-coded.

## Round 5: routing, stack, identity

**Q28 - Next.js version and middleware file.** 
➡️ Latest stable Next.js App Router with React 19, using the request interception file that version expects (`proxy.ts` on Next 16+, `middleware.ts` before). Check installed version at scaffold time.

**Q29 - How is an "unknown locale" told apart from "a path without a locale"?**
➡️ A first path segment matching `^[a-z]{2}(-[a-z]{2})?$` (case-insensitive) is treated as a locale attempt: `en`/`es` pass, anything else is 404. Any other path gets `/en` prefixed, query kept. `/` → `/en/app` (via `/en`). See ADR-0004.

**Q30 - Linter.** 
➡️ Biome (lint + format, one fast binary, no plugin config). `lint` = `biome check .`.

**Q31 - Identity.** 
➡️ A "ticket stub / queue" identity: warm off-white paper, deep ink navy, a signal coral for "moved up", a muted amber for flags. Display font Bricolage Grotesque, body Atkinson Hyperlegible, numbers in JetBrains Mono, all via `next/font/google`. Wordmark: "linejump" in the display font with the "j" descender drawn as an arrow hopping a line. Exact tokens and contrast ratios go in `DESIGN.md`; every text/background pair must reach WCAG AA (4.5:1 body, 3:1 large).

**Q32 - Dictionary shape.** 
➡️ One `Record<"en" | "es", Dictionary>` where `Dictionary` is an explicit type, so a missing key in either locale is a type error. Flag reasons ("why") are dictionary entries too.

**Q33 - OG image.** 
➡️ `opengraph-image.tsx` under `[lang]` using `next/og`, name + one-liner per locale, identity colors. No external font fetch at runtime: font file committed.

Frontier empty. Shared understanding reached.
