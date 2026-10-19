# 06: "Try it": replay the committed log with a live queue and signup card

**What to build:** On `/{lang}/app` the visitor can replay `fixtures/signups.jsonl` with play, pause, step forward, step back, reset and speed controls, watching the queue reorder. Selecting a person shows their signup card: referral code, share link `/{lang}/app?ref=<code>` with a copy button, and live position after the signups processed so far. Everything is computed by the engine on the log up to the replay cursor.

**Blocked by:** 02, 04

**Status:** resolved

- [x] The committed log is bundled at build time; no runtime file reads, no env vars needed
- [x] Replay cursor logic is a pure function with tests
- [x] Duplicates appear in the log feed but not the queue
- [x] All controls are labelled buttons, keyboard operable, with visible focus; position changes announced via a polite live region
- [x] Works at 375 px wide
- [x] Every string comes from the dictionary in both locales
