# 08: "You moved up" outbox in demo mode, real mail in live mode

**What to build:** When a new signup (replayed or added) creates a valid referral and the referrer's position improves, a "you moved up from X to Y" message is produced for the referrer (grilling Q23). With no env vars the message appears in an on-screen outbox. When `RESEND_API_KEY` is set, a server route sends it through the provider's HTTP API with plain `fetch`, and the outbox marks it as sent.

**Blocked by:** 07

**Status:** resolved

- [x] Moved-up detection is a pure diff of two engine results, with tests (flagged referral sends nothing; valid referral that does not change position sends nothing)
- [x] Demo path (on-screen outbox) and live path (server route) are separate (deviation: no formal Notifier interface); live is never used by tests or the CLI
- [x] The page, tests and CLI work with no env vars; the UI never names the mail provider
- [x] Live route rejects requests when the key is unset and never exposes the key to the client
