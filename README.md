# Linejump

A launch waitlist where referrals move you up, and cheaters don't. [Español](README.es.md)

**Result: `score` 100** on the 7 committed cases (`flag_f1` 1, `position_exact` 1). Run `bun run eval` to reproduce it. The hidden logs are unseen, so the rules are implemented from the brief, not fitted to the fixtures.

## Run it

```sh
bun install
bun run dev                      # http://localhost:3000/en/app and /es/app, no env vars needed
bun run process fixtures/signups.jsonl [--disposable <file>]
bun run eval [--verbose]         # --verbose prints per-case scores to stderr
bun test && bun run typecheck && bun run lint && bun run build
```

Optional: set `RESEND_API_KEY` (and `MAIL_FROM`) to send the "you moved up" email for real. Without it, messages show in the on-screen outbox.

## Architecture

- `src/engine`: one pure function turns the whole signup log into the queue (flags, codes, positions, evidence). Everything else calls it.
- `src/cli`: `process` and `eval`, thin wrappers. stdout is only JSON, errors go to stderr with exit code 1.
- `src/demo`: replay cursor, "moved up" diffing and burst helpers for the page.
- `src/components/TryIt.tsx`: the working product (replay, add signups, admin view, outbox).
- `src/app/[lang]`: story page, per-locale OG image. `src/proxy.ts` does locale redirects and 404s. `src/app/api/notify`: live mail, off without a key.
- `src/i18n`: one typed `Record<"en" | "es", Dictionary>`.
- Docs: `GLOSSARY.md`, `docs/adr/`, plan in `.scratch/linejump/`, identity in `DESIGN.md`.

## Tradeoffs

- **Recompute everything on each change.** Simple and cannot drift from the graded CLI. It is fine for thousands of lines, not millions.
- **Sync SHA-256 library** instead of Web Crypto, so one engine runs in Bun and the browser (ADR-0002).
- **Demo state in the browser** (`localStorage`), no database, because the app must work with no setup (ADR-0003).

## What didn't work

- Passing the dictionary from the server page to the client component failed: it holds functions. The client now looks the dictionary up by language.
- Port 3103 was already taken by an unrelated process on my machine, so I verified the dev server on another port.
- My first test for "a valid referral moves you up" put the referrer first in the queue, so nothing could change. The test now starts them in the middle.
