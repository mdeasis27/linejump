# Spec: Linejump

**Status:** implemented

Source: `REQUIREMENTS.md`. Decisions: `.scratch/linejump/grilling.md` (Q1 to Q33), `docs/adr/0001` to `0004`. Vocabulary: `GLOSSARY.md`.

## Problem Statement

I run a product launch and want a waitlist where people who bring friends get in sooner. The moment referrals are worth something, people cheat: they sign up again with `+tag` or dotted Gmail aliases of their own address, use throwaway domains, create referrals from the same machine as the referrer, or fire a script that dumps dozens of referrals on one code in minutes. If those count, honest people get pushed down and the queue stops meaning anything. I also need to see, as an operator, who was flagged and why, and I need to tell people when they move up.

## Solution

Linejump reads a time-ordered signup log, decides for every signup whether it is a duplicate, gives every accepted signup a referral code, checks every referral against four fraud flags (`unknown_ref`, `disposable`, `same_ip`, `burst`) and orders the queue by `rank = join_index − 5 × valid_referrals`. The same engine powers:

- two CLI scripts (`process`, `eval`) that print JSON and are graded on hidden logs;
- a bilingual story page at `/{lang}/app` where a visitor can replay the committed log, add their own signups, see their code, link and live position, open an admin view with every flag explained, and see the "you moved up" outbox.

Everything works with no environment variables. Real email is sent only when `RESEND_API_KEY` is set.

## User Stories

### Joining and referring
1. As a person joining the waitlist, I want to get a referral code right after I sign up, so that I can share it.
2. As a person joining, I want a shareable link that carries my code, so that friends don't have to type it.
3. As a person joining, I want to see my current position, so that I know where I stand.
4. As a person joining, I want my position to update as others sign up with my code, so that I see the effect of sharing.
5. As a person joining via a friend's link, I want the referral field prefilled, so that my friend gets credit without effort.
6. As a person joining, I want to sign up without a code, so that referrals are optional.
7. As a referrer, I want each valid referral to move me up 5 places of rank, so that sharing is worth it.
8. As a referrer, I want to be told when I move up, so that I keep sharing.
9. As a person who signed up earlier than someone with the same rank, I want to stay ahead of them, so that ties are fair.

### Catching cheaters
10. As an honest person, I want repeat signups with the same email in different case to be rejected, so that nobody gets two places.
11. As an honest person, I want `+tag` aliases to be treated as the same email, so that people can't farm codes with aliases.
12. As an honest person, I want dotted and `googlemail.com` variants of a Gmail address to be the same person, so that Gmail aliases don't count.
13. As an honest person, I want someone who refers themselves through an alias to get nothing, so that self-referral fails.
14. As an operator, I want a referral naming a code nobody has to be flagged `unknown_ref` and nothing else, so that typos and guesses are clearly labelled.
15. As an operator, I want a referral naming a code that only appears later in the log to be `unknown_ref`, so that time order is respected.
16. As an operator, I want referral codes matched exactly and case-sensitively, so that near-misses don't count.
17. As an operator, I want referrals from throwaway email domains flagged `disposable`, so that burner accounts don't count.
18. As an operator, I want subdomains of a throwaway domain not to be flagged automatically, so that the list means exactly what it says.
19. As an operator, I want a referral from the referrer's own IP within 24 hours of the referrer joining flagged `same_ip`, so that one person on one machine can't fake friends.
20. As an operator, I want same-IP referrals 24 hours or more after the referrer joined to count, so that housemates who join later aren't punished.
21. As an operator, I want the sixth referral to one code inside any 10-minute window flagged `burst`, so that scripted floods are caught.
22. As an operator, I want flagged referrals to still count toward the burst window, so that a flood of junk can't hide under the threshold.
23. As an operator, I want every applicable flag listed in a fixed order, so that reports are consistent.
24. As an operator, I want flagged people to still join the queue, so that only the referral is discounted, not the person.
25. As an operator, I want to supply my own disposable-domain list, so that I can keep it up to date.

### Operating
26. As an operator, I want an admin view of the whole queue with each person's flags, so that I can audit it.
27. As an operator, I want each flag explained in plain words ("same IP as the person who referred them, 3 hours after they joined"), so that I don't need to know the algorithm.
28. As an operator, I want duplicates shown with which earlier signup they matched, so that I can verify the rejection.
29. As an operator, I want to see each person's valid referral count and rank, so that I understand their position.
30. As an operator, I want real emails sent only when I configure a mail key, so that demos never email anyone.
31. As an operator, I want an on-screen outbox in demo mode, so that I can see what would have been sent.

### CLI and grading
32. As a grader, I want `process <log.jsonl>` to print one JSON object with every signup in log order, so that I can score it.
33. As a grader, I want `--disposable <file>` to override the list, so that hidden cases can use their own list.
34. As a grader, I want `eval` to run every case in `fixtures/cases/` and print `cases`, `flag_f1`, `position_exact` and `score`, so that quality is one number.
35. As a grader, I want stdout to contain only JSON, so that I can pipe it.
36. As a grader, I want a malformed log to fail loudly with a non-zero exit, so that partial results are never scored.

### Demo and story
37. As a visitor, I want to replay the committed log step by step, so that I can watch the queue move.
38. As a visitor, I want play, pause, step back, step forward, reset and speed controls, so that I control the pace.
39. As a visitor, I want to add my own signups, including an editable IP, so that I can try to cheat and see it caught.
40. As a visitor, I want a one-click "simulate a burst", so that I can see the burst flag without typing six emails.
41. As a visitor, I want my demo signups kept after a refresh, so that I don't lose my experiment.
42. As a visitor, I want a reset, so that I can start clean.
43. As a visitor, I want the page in English or Spanish with a switch, so that I can read it in my language.
44. As a visitor, I want a link back to all projects at the top-left, so that I can keep browsing the portfolio.
45. As a visitor, I want a hero, an analogy with a small glossary, the working product, real comparison numbers, where it fits, and what it proves, so that I understand the project without reading code.
46. As an engineer, I want a collapsed "For engineers" section with the algorithm, thresholds, tests, stack and repo link, so that I can judge the work.
47. As a visitor on a phone, I want the page to work at 375 px wide, so that I can try it anywhere.
48. As a keyboard user, I want every control reachable with visible focus and labels, so that I can use it without a mouse.
49. As someone sharing the link, I want a proper preview image per language, so that the share looks right.
50. As a visitor arriving at `/` or a path without a locale, I want to land on the English page with my query kept, so that referral links still work.
51. As a visitor at an unknown locale, I want a 404, so that broken links are obvious.

## Implementation Decisions

### Modules

- **Engine (deep module, the one main seam).** One pure, synchronous function: input is the parsed signup list and a set of disposable domains; output is, per signup in log order, `{ email, code, flags, position }` plus the extra detail the UI needs (normalized email, join index, referrer index, valid referral count, rank, matched-duplicate index, and per-flag evidence such as hours since referrer joined or burst count). The CLI output is a projection of this. See ADR-0001.
- **Normalization and code.** Pure helpers: normalized email and referral code (first 8 hex of SHA-256 via `@noble/hashes`, ADR-0002). Exposed for tests and the UI, but internal to the engine's contract.
- **Log I/O.** Parse JSONL text to signups (skip blank lines; any bad line throws with its line number). Parse disposable list text (trim, lowercase, skip blanks and `#` comments). Shared by CLI and by bundling fixtures into the app.
- **Scoring.** Pure function: (expected outputs, actual outputs) per case → pooled flag F1, position exactness, score (rounding per Q12).
- **CLI scripts.** Thin wrappers: `process` reads files, calls engine, prints JSON; `eval` discovers `<name>.jsonl` + `<name>.expected.json` pairs in `fixtures/cases/`, runs the engine in-process and scoring. Default disposable list resolved from repo root. Errors go to stderr with exit 1; stdout only JSON.
- **Demo store (client).** Holds the committed log, the visitor's added signups, and the replay cursor; persists added signups to `localStorage`; derives the queue by calling the engine on `log[0..cursor]`; computes "moved up" messages by diffing engine results before and after each signup (Q23).
- **Notifier.** Interface `notify(message)`. Demo implementation appends to the outbox. Live implementation is a server route that sends via the provider HTTP API with plain `fetch` when `RESEND_API_KEY` is set; the client asks the server whether live mode is on. Never called by CLI or tests.
- **i18n.** One typed dictionary `Record<"en" | "es", Dictionary>`; flag explanations are dictionary functions taking the flag evidence.
- **Routing.** Request interception (`proxy.ts` on Next 16+, else `middleware.ts`) implementing ADR-0004 with a pure, testable `resolveLocaleRedirect(pathname, search)` returning redirect / pass / not-found. `/{lang}` redirects to `/{lang}/app`.
- **Story page.** `/{lang}/app`, server component shell with a client "Try it" island. Sections in order: hero, analogy + 3–5 term mini glossary, Try it (signup card, replay controls, queue, admin tab, outbox), Compare (engine-computed: naive queue that counts every referral vs Linejump, duplicates caught, flags by type, eval score), Where it fits, What it proves (first person), then `<details>` "For engineers".
- **Identity.** CSS custom-property tokens, Bricolage Grotesque / Atkinson Hyperlegible / JetBrains Mono via `next/font/google`, SVG wordmark. Documented in `DESIGN.md` with contrast ratios (Q31).
- **OG image.** `opengraph-image.tsx` under `[lang]` with `next/og`, committed font file.

### Exact rules (graded)

Processing is in log order. For signup *i*:

1. Normalize the email (Q8). If seen among accepted signups → flags `["duplicate"]`, code `null`, position `null`, ref ignored.
2. Else accept: `join_index` = count of accepted so far; code = sha256(normalized)[0..8].
3. If `ref` is non-empty: referrer = earliest earlier accepted signup whose code equals `ref` exactly (Q5, Q6). If none → flags `["unknown_ref"]` only. Else, in order:
   - `disposable`: normalized domain ∈ list, exact match (Q1);
   - `same_ip`: `ip === referrer.ip` and `ts − referrer.ts < 24h` (Q4);
   - `burst`: count of accepted signups *j ≤ i* with `ref_j === ref_i` and `ts_j ∈ (ts_i − 10 min, ts_i]` is ≥ 6, counting flagged ones too (Q2, Q3).
4. Valid referral = has a ref, has a referrer, no flags → referrer's `valid_referrals += 1`.
5. After the whole log: sort accepted by `(join_index − 5 × valid_referrals, join_index)` ascending; position = 1-based index.

Constants are named in one place: referral bonus 5, same-IP window 24 h, burst window 10 min, burst threshold 6, code length 8.

### CLI contracts

- `bun run process <log.jsonl> [--disposable <file>]` → `{ "signups": [{ "email", "code", "flags", "position" }] }`.
- `bun run eval [--verbose]` → `{ "cases": number, "flag_f1": number, "position_exact": number, "score": number }`.

### Stack and scripts

Bun, Next.js App Router (latest stable), React 19, TypeScript strict (no `any`, no `@ts-ignore`), `bun test`, Biome. Scripts: `dev`, `build`, `test`, `typecheck` (`tsc --noEmit`), `lint` (`biome check .`), `process`, `eval`. No LLM, no `ai-kit/` (Q21). No money handling in this project.

## Testing Decisions

- Good tests assert external behaviour through the highest seam: given a log, what does the engine (or CLI) report. No tests of private helpers beyond normalization and code, which are part of the graded contract.
- **Engine:** every fixture case in `fixtures/cases/` is a test (output equals `.expected.json`). Plus targeted tests for each grilling answer not covered by fixtures: unknown_ref signups counting toward burst, code collisions, empty-string ref, equal timestamps, email without `@`, `same_ip` at exactly 0 and 24h, burst at exactly 10 min.
- **Hash:** `@noble/hashes` output equals `node:crypto` for a sample of emails.
- **Scoring:** hand-computed small cases (perfect, empty-vs-empty, missing signups, null positions).
- **CLI:** spawn `bun run process` and `bun run eval` as subprocesses; assert stdout parses as JSON and matches the engine; `--disposable` override changes flags; a malformed log exits 1 with empty stdout. `eval` on committed cases must report `score` 100.
- **Routing:** the pure locale resolver tested for `/`, `/app?ref=x`, `/en`, `/es`, `/fr/app`, `/EN/app`, `/favicon.ico`-style assets excluded.
- **i18n:** type-level completeness by construction; one test that both locales have identical key sets at runtime as a guard.
- **Demo store:** "moved up" diffing and replay cursor logic tested as pure functions.
- Prior art: none (greenfield); the fixture-driven pattern is the template.

## Out of Scope

- Real persistence, accounts, auth for the admin view.
- Sending email in tests, CLI or demo mode.
- Fuzzy disposable detection (subdomains, MX lookups), IP subnet matching, device fingerprinting.
- Normalization rules beyond the brief (no dot removal for non-Gmail providers).
- Incremental or streaming engine for very large logs.
- Any LLM feature.

## Further Notes

- The hidden grader runs the CLI on unseen logs; logic must follow the rules, never the visible fixtures.
- UI copy: first person, plain words, no em dashes, no brand or company names.
- Definition of done is the brief's five points; the last ticket verifies them all.

## Tickets

Broken into tracer-bullet tickets by `/to-tickets` in `.scratch/linejump/issues/`. Breakdown auto-approved (no human available): granularity, blocking edges and merges accepted as proposed.

| # | Ticket | Blocked by |
|---|---|---|
| 01 | Scaffold, locale routing, empty product page | None |
| 02 | Identity tokens, fonts, wordmark, DESIGN.md | 01 |
| 03 | Engine core and `process` CLI | 01 |
| 04 | Fraud flags and `--disposable` | 03 |
| 05 | `eval` CLI and scoring | 04 |
| 06 | Try it: replay and signup card | 02, 04 |
| 07 | Add signups and admin view | 06 |
| 08 | Moved-up outbox and live mail | 07 |
| 09 | Story sections, Compare, For engineers, OG | 05, 06 |
| 10 | READMEs and definition of done | 08, 09 |

Frontier at start: 01. After 01: 02 and 03 in parallel.
