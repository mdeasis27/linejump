# 09: Story page sections, computed "Compare", "For engineers" and OG images

**What to build:** `/{lang}/app` reads as a story, in order: hero (name, one-liner, chips); an analogy paragraph with a 3–5 term mini glossary; "Try it"; "Compare" with numbers computed by the engine at render time (naive queue that counts every referral vs Linejump on the committed log: duplicates caught, flags by type, how far the top cheater jumps in the naive queue, and the `eval` score on the committed cases); "Where it fits" (worth it when / not needed when); "What it proves" (first person); then a native collapsed `<details>` "For engineers" / "Para ingenieros" with the algorithm and thresholds, how it is tested, a `Stack: …` line and a link to `https://github.com/mdeasis27/linejump`. A per-locale `opengraph-image` shows the name and one-liner.

**Blocked by:** 05, 06

**Status:** resolved

- [x] No hard-coded numbers in "Compare"; all computed from the engine (the test covers `compareQueues` only)
- [x] Thresholds in "For engineers" are rendered from the rule constants
- [x] Copy is first person, plain words, no em dashes, no brand or company names (a test scans both dictionaries for the em dash character)
- [x] Exactly one `h1`; sections use headings in order
- [x] OG image builds for `en` and `es` (deviation: uses the default renderer font, no committed font file)
