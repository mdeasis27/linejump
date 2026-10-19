# 02: Identity: tokens, fonts, wordmark and DESIGN.md

**What to build:** The placeholder page wears Linejump's own identity: CSS custom-property tokens (paper, ink, coral "moved up", amber "flag", focus ring), Bricolage Grotesque / Atkinson Hyperlegible / JetBrains Mono via `next/font/google`, and a text wordmark. `DESIGN.md` at the root documents every token and the measured contrast ratio of each text/background pair.

**Blocked by:** 01

**Status:** resolved

- [x] Every text/background pair in `DESIGN.md` meets WCAG AA (4.5:1 body, 3:1 large/UI), ratios listed
- [x] Visible focus style on every interactive element
- [x] Page works at 375 px wide with no horizontal scroll
- [x] Wordmark is decorative text (aria-hidden), the h1 carries the name
