# 01: Scaffold the app with locale routing and an empty product page

**What to build:** A Bun + Next.js App Router + TypeScript strict + Biome project where `/` redirects to `/en/app`, any path without a locale gets `/en` prefixed with the query kept, `/fr/app` is a 404 (ADR-0004), `/{lang}` redirects to `/{lang}/app`, and `/en/app` and `/es/app` render a placeholder page with the `← All projects` / `← Todos los proyectos` link top-left, an EN/ES switch and one `h1`, all strings from the typed dictionary.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] `bun install`, `bun run build`, `bun run test`, `bun run typecheck`, `bun run lint` all pass
- [x] Scripts `dev`, `build`, `test`, `typecheck` (`tsc --noEmit`), `lint` exist; `strict: true`; no `any` / `@ts-ignore`
- [x] Pure locale resolver has tests for `/`, `/app?ref=x`, `/en`, `/es`, `/fr/app`, `/EN/app`, static assets
- [x] Dictionary is `Record<"en" | "es", Dictionary>`; a missing key is a type error
- [x] Back link points to `https://portafolio-mdea.vercel.app/{lang}/projects`
- [x] Interception file matches the installed Next version (`proxy.ts` on 16+)
