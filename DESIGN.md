# Linejump design

Identity: a paper queue ticket. Warm paper, deep ink, and one hot coral for "you moved up". Amber marks a flag. Tokens live in `src/app/globals.css`.

## Typography

| Role | Font | Loaded with |
|---|---|---|
| Display, wordmark | Bricolage Grotesque | `next/font/google` |
| Body | Atkinson Hyperlegible | `next/font/google` |
| Numbers, codes | JetBrains Mono | `next/font/google` |

Wordmark: "line" in ink, "jump" in coral, display font, tight tracking. It is decorative text (`aria-hidden`), the page `h1` carries the name.

## Color tokens

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f7f2e8` | page background |
| `--card` | `#ffffff` | cards, inputs |
| `--ink` | `#14213d` | text, borders, primary buttons |
| `--muted` | `#4a5568` | secondary text |
| `--coral` | `#b83a1b` | wordmark accent, selected tab |
| `--coral-bg` / `--coral-ink` | `#fde6dc` / `#8a2a12` | "moved up" notes, duplicate tags, errors |
| `--amber-bg` / `--amber-ink` | `#fcefc7` / `#6b4100` | flag tags |
| `--on-ink` | `#f7f2e8` | text on ink |
| `--focus` | `#1d4ed8` | focus ring (3px, 2px offset) |
| `--line` | `#b9ad96` | decorative dividers only |

## Contrast (WCAG 2.x, measured)

All text pairs meet AA (4.5:1 for text, 3:1 for UI).

| Text on background | Ratio |
|---|---|
| ink on paper | 14.32 |
| ink on card | 15.97 |
| ink on coral-bg | 13.33 |
| paper on ink (buttons, chips) | 14.32 |
| muted on paper | 6.74 |
| muted on card | 7.53 |
| coral on paper (wordmark) | 5.14 |
| coral on card | 5.74 |
| white on coral (selected tab) | 5.74 |
| coral-ink on coral-bg | 7.24 |
| amber-ink on amber-bg | 7.69 |
| focus ring on paper | 6.01 |
| focus ring on card | 6.70 |

`--line` on paper is 1.99:1. It is used only for decorative dividers and table row rules, never to convey meaning or to outline a control. Controls use `--ink` borders.

## Layout and interaction

- Works from 375 px: single column, tables scroll horizontally inside their card, tap targets at least 44 px tall.
- One `h1`. Sections are landmarks labelled by their `h2`.
- Every control is a labelled native element. Tabs use `role="tab"` with `aria-selected`. Position changes and "moved up" messages are announced in a polite live region.
- Focus is always visible (`:focus-visible` ring).
