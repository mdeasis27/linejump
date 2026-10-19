# Linejump: a launch waitlist where referrals move you up, and cheaters don't

Slug: `linejump`. A waitlist for a product launch. Each signup gets a referral code; every
valid referral moves the referrer up the queue. Fake referrals are caught and don't count.

## 1. Input

A signup log, `fixtures/signups.jsonl`: one JSON object per line, in time order:
`{ "ts": ISO-8601 UTC, "email": string, "ref"?: string, "ip": string }`.

`fixtures/disposable-domains.txt`: one domain per line.

## 2. Rules (exact, graded)

**Normalized email:** lowercase; strip a `+tag` from the local part; for `gmail.com` and
`googlemail.com`, remove dots from the local part and use `gmail.com`.

**Referral code:** first 8 hex chars of SHA-256 of the normalized email.

**Per signup, in order:**
1. `duplicate`: the normalized email already signed up (this is also how signing up again
   with an alias of your own email to refer yourself is caught). The signup is rejected: no code, no
   position, its `ref` is ignored.
2. Otherwise it joins the queue. If it has a `ref`, the referral is checked:
   - `unknown_ref`: no earlier accepted signup has that code (exact, case-sensitive match;
     an empty `ref` means no ref). If so, this is the only flag.
   - `disposable`: this signup's email domain (after normalization) is in the list.
   - `same_ip`: same `ip` as the referrer's signup, and this `ts` is less than 24 hours
     after the referrer's `ts`.
   - `burst`: counting the accepted signups whose `ref` is this same code and whose `ts` is
     in `(this.ts − 10 min, this.ts]`, including this one, the count is 6 or more.
   A referral with any flag is invalid. List every flag that applies, in the order above.

**Queue:** accepted signups sorted by `rank = join_index − 5 × valid_referrals` ascending,
ties by `join_index` (0-based order among accepted signups). Positions are 1-based.

## 3. Product

- Signup page with the user's code, link and live position; an admin view of the queue
  with flags and why. Email ("you moved up") goes through a mail provider only when its
  key is set; in demo mode the outbox is shown on screen.
- Demo mode: the visitor can replay the committed log or add signups and watch positions.

## 4. CLI scripts

| Script | Must do |
|---|---|
| `process <log.jsonl>` | Prints `{ "signups": [{ "email", "code": string|null, "flags": string[], "position": number|null }] }` in log order (`position` = final position after the whole log). `--disposable <file>` overrides the list. |
| `eval` | Runs `process` on each case in `fixtures/cases/` (`<name>.jsonl` + `<name>.expected.json`) and prints `{ "cases", "flag_f1", "position_exact", "score" }`. |

## 5. Graded number

On hidden logs: **flag F1** over `(signup index, flag)` pairs, and **position exactness**
(share of signups with the exact expected `position`, including `null`).
`score` = mean of the two × 100.

## Constants (identical in every tanda 1 brief)

### Stack (fixed)
- Bun as package manager and runtime. Next.js App Router. TypeScript strict, no `any`, no
  `@ts-ignore`. Tests with `bun test`. Linter of your choice.
- Money is integer cents, never floats.
- Required scripts: `dev`, `build`, `test`, `typecheck` (`tsc --noEmit`), `lint`, plus the
  project-specific CLI scripts in its brief. CLI scripts print JSON on stdout and nothing else.

### Demo mode (portfolio rule)
- The app must work fully with **no environment variables**: every external service (LLM,
  email, payments, analytics) has a demo path that uses committed fixtures.
- Optional live mode only when its env var is set. Never required for the page, the tests
  or the CLI scripts.
- If this project uses an LLM, `ai-kit/` (already in the repo, treat it as vendored) is
  the client: its `chat()` router (`ai-kit/router.ts`) falls back across free providers and
  is live when any of `GEMINI_API_KEY`, `GROQ_API_KEY` or `OPENROUTER_API_KEY` is set;
  `demo-mode.ts` has the demo helpers. Read the code, not only its README.

### Routes and portfolio integration
- Locales `en` (default) and `es`. Every visible string exists in both, from one typed
  dictionary (`Record<"en" | "es", …>`) so a missing translation is a type error.
- `/` and any path without a locale redirect to `/en…`, keeping the query string. An
  unknown locale returns 404. `/{lang}` redirects to `/{lang}/app`.
- `/{lang}/app` is the product page. At its top-left, a link
  `https://portafolio-mdea.vercel.app/{lang}/projects` reading `← All projects` /
  `← Todos los proyectos`. A language switch EN/ES.
- `/{lang}/app` is a story page, sections in this order: hero (name, one-liner, chips);
  an analogy paragraph with a 3–5 term mini-glossary; "Try it" (the working product);
  "Compare" (real numbers computed by the product, never hard-coded); "Where it fits"
  (worth it when / not needed when); "What it proves" (first person).
- Last, a native collapsed `<details>` titled "For engineers" / "Para
  ingenieros": the mechanism (algorithm, thresholds), how it is tested, a `Stack: …` line,
  and a link to `https://github.com/mdeasis27/<slug>`.
- `opengraph-image` (Next file convention) per locale with the product name and one-liner.
- Copy rules: first person, plain words, no em dashes, no brand or company names in UI copy.

### Identity (its own, not a shared design system)
- Its own palette, typography (Google Fonts via `next/font` or self-hosted) and a wordmark.
  Defined as CSS tokens in this repo and documented in `DESIGN.md` at the root, with the
  contrast ratio of each text/background pair (WCAG AA minimum).
- Works at 375 px wide. Keyboard accessible, visible focus, labelled controls, one `h1`.

### Docs
- `README.md` (EN) and `README.es.md` (ES), result first: the graded number at the top,
  how to run, architecture in under 10 lines, 2–3 tradeoffs, what didn't work.

### Definition of done
1. `bun install`, `build`, `test`, `typecheck` and `lint` all pass.
2. Every CLI script in the brief runs on the committed fixtures and prints valid JSON.
3. `bun run dev` serves `/en/app` and `/es/app`, working with no environment variables.
4. `README.md`, `README.es.md` and `DESIGN.md` exist as described.
5. Everything is committed to git in this repository.

The grader also runs the CLI scripts against **hidden cases** in the same format. Make the
logic general; don't fit it to the visible fixtures.
