# Synchronous SHA-256 library instead of Web Crypto

Referral codes are the first 8 hex chars of SHA-256 of the normalized email, and the engine (ADR-0001) must run identically in Bun (CLI, tests) and the browser (replay). Web Crypto's `digest` is async, which would make the whole engine async for one hash; `node:crypto` does not exist in the browser. We use `@noble/hashes` (small, audited, sync, isomorphic), and a test cross-checks it against `node:crypto` so a dependency change cannot silently alter codes.
