# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Bilingual (FR/EN) personal portfolio: React 19 + TypeScript + Vite 6, deployed as a static site to
GitHub Pages, with a Cloudflare Worker relaying chatbot messages to Gemini.

## Commands

```bash
npm install          # Node 22+
npm run dev          # Vite dev server on http://localhost:3000 (bound to 0.0.0.0)
npm run lint         # eslint src, --max-warnings 0
npm run typecheck    # tsc --noEmit
npm test             # node:test on tests/*.test.mjs (routing, periods)
npm run format       # prettier --write src
npm run build        # production bundle in dist/ (base path /MyPortfolio/)
npm run preview      # serve dist/ locally
```

- Verification is `npm run lint`, `npm run typecheck`, `npm test` (a few node:test files under
  `tests/`: hash routing, period formatting) and `npm run build`, then a manual pass in the browser
  (cover page and door, section navigation, FR/EN toggle, En bref drawer, chatbot, CV download,
  layouts at 390 / 768 / 1024 / 1440px).
- Experience and education dates are ISO strings in `content.ts` (`start`, `end`); `formatSpan` turns
  them into "mai 2023 à aujourd’hui · 3 ans 6 mois" so the reader always sees the duration.
- ESLint does not catch type errors, and the config turns off `@typescript-eslint/no-unused-vars`,
  `react-hooks/refs` and `react-hooks/set-state-in-effect` — always run `tsc` as well.
- `npm run clean` uses `rm -rf`; on PowerShell use `Remove-Item dist -Recurse -Force`.
- On Windows the dev server polls for file changes (300 ms). `VITE_DISABLE_POLLING=true` turns that
  off, `DISABLE_HMR=true` disables HMR.

## Architecture

### Redesign in progress: `src/site/` is what renders

`App.tsx` now lazy-loads `src/site/SiteRoot.tsx`, the "Sur mesure" redesign. It is self-contained:

- `content.ts` holds all copy as `Record<Language, string>` values, plus the project list.
- `site.css` is the only stylesheet loaded (`main.tsx` no longer imports `index.css`); classes are
  prefixed `sm-`, tokens are `--sm-*`.
- `SiteRoot` owns language (same `portfolio_lang` key) and a hash route (`navigation.ts`): the
  bare URL, `#` or `#top` shows `CoverPage` (the poster as a page of its own), `#/realisations`
  shows `ProjectsPage`, `#/realisations/<id>` shows `ProjectPage`, anything else (`#accueil`,
  plain `#section` anchors) shows `HomePage`. The poster is left through the door (`EnterDoor`
  in `CoverPage.tsx`: stacked inverted labels, the Lomé clock, an arched door): on click an
  iris opens from the click point and reveals the destination while the poster steps back
  (`leaveCover` sets `data-transition="iris"` and the `--sm-iris-*` origin on `<html>` for that one
  view transition; rules in site.css), landing on `#accueil` or the clicked section. No automatic redirection. Under reduced motion there is no iris and the clock
  shows no seconds.
- Every entry of `projects` in `content.ts` has a `year`; the catalogue sorts newest first. Most
  entries have a detail page. `ProjectPage` combines two optional sources: a bilingual study from
  `studies.ts` (need, steps, result, plus for the missions: ISO `start`/`end`, role, status, a dated
  `timeline`, `metrics`, `technologies`, `related` ids; the featured cases of `content.ts` are merged
  in) and, when the id is in
  `projectDataPaths`, a technical sheet fetched through the existing `hooks/useProjectLoader`:
  `public/projects/<id>/projects_data.json` in French and `projects_data.en.json` in English (keep
  the two in step; a missing English file falls back to French).
- `Chatbot.tsx` is the assistant, restyled; same Worker contract as described under Chatbot below.
- The site opens on a full-screen "poster" (`CoverPage.tsx`, `.sm-poster`: giant Anton title, one
  serif italic word, an SVG thread drawn on load). The letters of the title tick (`SwapText`):
  each letter exists once in the DOM, its twin is the `::after` pseudo-element, and the `h1`
  carries the accessible name. The home page is five scenes (`sectionIds`): Profil (portrait and
  statement; the "En bref" card is `BriefDrawer.tsx`: a small paper companion sewn to the right
  edge of every page, drawn on canvas by `companion.ts` in the manner of the notch companions (soft
  superellipse body, a face that slides to follow the pointer, eyes that change shape for each mood,
  a lean toward the panel when he opens the side `<dialog>` (the user rejected the jump), a wink on
  close while the panel slides out (AnimatePresence exit, backdrop fading); inside the open drawer a
  poke tilts his head (the user disliked the wink there), two make him stretch, three quick ones
  give spiral eyes; asleep after 15 s without a pointer). He is the site's own character, not a
  copy of Coucou's Mochi, whose name and design are reserved: paper, stitched seam, honey blush, no
  state colours. His label "En bref" turns around him as a ring of text. He has no name yet), Expertise (six domains on three columns), Réalisations
  (three featured cases, the only poster-sized opener, `.sm-scene__word.is-big`, plus the
  rotating `ProjectsBadge`), Parcours (experience on the left, education and languages on the
  right) and Contact (the ten references folded in a `<details>`, names on request). Each scene
  starts with the same opener, built from `.sm-split__aside`: a number, the scene name as a word
  (`.sm-scene__word`) and one italic line. From 1101px the header lists the five scenes
  (`.sm-nav`, active one underlined); `SiteMenu.tsx`, the full-screen overlay, covers the rest. On the cover,
  every link into the site (header, menu, poster, drawer) goes through the iris too
  (`interceptCoverLinks` in `SiteRoot`) and lands on its destination; the header has no seam on the
  cover and the home page (`.sm-header.is-seamless`).
- Project cards carry no status labels (the user removed "en cours", "MVP", "Livré"); names are
  exactly "Tracker" and "SmartProcure"; the lab works carry the years the user gave (api-python 2022, nextcloud,
  mail-server, pfsense and irc 2023, openvpn-mfa 2024). The Power BI dashboards (it-filiales,
  azure-infra, rh-groupe, finance-guinee, academy), neemba-reports and biasa-immo have written
  studies in `studies.ts` drawn from the user's work folder `C:UsersekluDownloadsI` (readable
  only after `/add-dir`; never open its `BIDC` folders).
- Phones (the `@media (max-width: 860px)` and `520px` blocks at the end of site.css, before the
  motion layer): `SceneBar.tsx` is a bottom bar with the five scenes (the active one shows its
  name, the others their number; hidden on the cover and under the open menu), and the companion
  sits on its right end at two thirds of his size, without his ring; `.sm[data-page]` on the root
  drives these rules. On phones the chat bubble floats above the companion in the right corner, with a clear gap
  (the user refused it in the header, in the left corner, and too close to him); on the cover it is
  hidden and the companion stands at the right above the door bar. His paper follows the theme
  gently (`PALETTES` in companion.ts, set through `engine.theme` by the drawer). "En bref" rises as a bottom sheet (`BriefDrawer` switches the motion axis with
  `useMediaQuery`); the poster title is cut on four lines (`ui.posterTitleSplit`: INFRA- /
  STRUCTURE / fiable / ET SÉCURISÉE) and the door becomes a full-width bar at the bottom of the
  poster; the scene words fill the width; the portrait sits right with the statement on a paper
  card over its corner; project rows stack. The menu button is a bare three-line icon flush with
  the right edge and "close" a bare cross (`.sm-menu-btn__label` hidden). Under 521px the inner
  pages show "K. C. Eklu" and an arrow as back link. The menu carries the language row (`.sm-menu__lang`) and the
  theme switch is a bare sun or moon icon in the header tools (`ThemeToggle compact`,
  `.sm-theme-icon`), since the floating pill is hidden on small screens.
  Hover-only transforms are gated by `@media (hover: hover)`; the audio element is
  `preload="none"`.
- Typography: the Anton titles are approved as they are. The open point is the other family,
  the Cormorant Garamond sentences and sub-titles (`.sm-serif`, weight 600, the profile
  statement up to 68px), which the user finds too bold and oversized and wants replaced by a
  more elegant variant. A full rework (every title in Cormorant, sizes roughly halved) was
  undone at their request: show a proposal and get their agreement before changing fonts or
  the type scale.
- Light and dark themes: `theme.ts` is the store (`data-theme` on `<html>`, `localStorage` key
  `portfolio_theme`, light by default; an inline script in `index.html` applies the saved theme
  before first paint). `ThemeToggle.tsx` is the switch: a floating pill in the bottom-left corner
  from 861px (upright under 1400px so that it stays in the page margin), and a row of the menu
  below that. The dark palette is the `[data-theme='dark']` block at the top of `site.css`. Never
  hard-code a colour in a rule: use a token, and give it a dark value if it is drawn on the page
  ground. `--sm-tab`, `--sm-char` and `--sm-off` are surfaces that keep their colour in both
  themes; text accents use `--sm-accent`, solid buttons `--sm-btn-*`, text on pale cards
  `--sm-on-paper`.
- `Settle.tsx` is the scroll-in wrapper for this design (`rise` makes a title come up from behind
  a mask). Text must never fade or sharpen progressively with scroll: the user rejected that
  effect.
- Motion is split in two. React side: `SiteRoot` wraps page changes in
  `document.startViewTransition` (the old page is cut away along a diagonal, `sm-cut-away`) (project titles share a `view-transition-name` between the list
  and the project page). There is no opening curtain: the user rejected the veil that lifted on load. CSS side: the "Motion
  layer" block at the end of `site.css` holds the scroll-driven effects (`animation-timeline:
view()`, inside `@supports`, so unsupported browsers get the static result). Anything added
  there must also be neutralised in the reduced-motion block that follows it.

Content rules for this design: no financial amounts, no em dashes in copy. The tailoring mood lives
in the visual motifs only (seams, thread, button, the "Sur mesure" name of the design): every
sentence of the copy, poster included ("Infrastructure fiable et sécurisée"), is plain
professional language, at the user's request (October 2026). They like physical, 3D-feeling motion (the thread, the tilting badge) and reject
screen-covering transitions with words. The only photo is the
studio portrait of the Profil section (`public/media/profile/portrait-studio.*`, `.sm-portrait`);
no project screenshots or other images.

Everything described below (`usePortfolioModel`, `src/pages/`, `src/components/`, `index.css`, the
lightbox, biography page and references section) is the previous site. It still compiles but is no
longer mounted; it is kept until the redesign is validated, so do not extend it.

### One hook builds the whole page tree (previous site)

`main.tsx` → `App.tsx` → lazy `components/PortfolioRoot.tsx` → `hooks/usePortfolioModel.tsx`.

`usePortfolioModel` (~2000 lines) is the real entry point for feature work. It owns all application
state (language, routing, project search/filter/pagination, carousels, lightbox), derives the view
data, and **returns the rendered JSX tree** as `content`, alongside `lang`, `setLang` and
`isLightboxOpen`. `PortfolioRoot` only wraps that in `MotionConfig` and adds the reading-progress bar,
the language toggle and the lazy chatbot button.

Components in `src/pages/` and `src/components/sections/` are presentational: they take props from the
hook and hold no shared state. New cross-page state belongs in the hook, not in a page.

Module-level data in the same file: `projectCatalog` (project cards), `structuredProjectConfigs`
(per-project detail metadata) and `curatedStudyIds`.

### Routing is React state, not URLs

`hooks/useLocalRouting.ts` holds `activePage` (`'main' | 'biography' | 'all-projects' | <project id>`)
and `activeSection`. There is no router and no history integration: the URL never changes, and deep
links / the browser back button do not navigate. Each page is rendered conditionally on `activePage`
inside the hook.

- `navigateToSection(id)` switches back to `'main'` if needed, then scrolls to the section after a
  100 ms delay. Section ids are the fixed list `navigableSections` (`hero`, `about`, `skills`,
  `parcours`, `formation`, `projets`, `refs`, `contact`) and must match the `<section id>` in the DOM;
  an `IntersectionObserver` over `main section` keeps `activeSection` in sync while scrolling.
- `showDetail(id)` remembers whether the user came from `'main'` or `'all-projects'` so that
  `backFromDetail` returns to the right place.

### Three kinds of project detail page

A project id resolves to one of:

1. **Curated case study** — id is in `curatedStudyIds` (`tracker`, `siem`, `automate`, `moov`,
   `orabank`, `biasa`). Rendered by `pages/CaseStudyPage.tsx` from the card in `projectCatalog` plus the
   hand-written FR/EN `studies` record inside that file. No JSON is fetched.
2. **Structured page** — id is a key of `structuredProjectConfigs` and not curated. Rendered by
   `renderStructuredProjectPage` inside the hook. `useProjectLoader` fetches
   `public/projects/<slug>/projects_data.json` on first click (a JSON array; only element `[0]` is
   used, typed as `StructuredProjectData`), caches it, and de-duplicates in-flight requests.
3. **No detail page** — card only.

`siem`, `moov`, `orabank` and `biasa` are also listed in `staticDetailPages` (`useLocalRouting.ts`),
which is what makes them valid detail ids even though they have no `structuredProjectConfigs` entry.

Adding a project: create `public/projects/<slug>/` (`projects_data.json`, `cover.*`, `screens/`,
`diagrams/`, `exports/`), register the folder in `src/config/assets.ts`, add the card to
`projectCatalog`, then either add a `structuredProjectConfigs` entry or add the id to
`curatedStudyIds` with a matching `studies` entry in `CaseStudyPage.tsx`.

### Assets and the base path

Production is served under `/MyPortfolio/` (`vite.config.ts`; override with `VITE_BASE_PATH`). Every
public asset must go through `assetPaths` and `withBaseAsset()` in `src/config/assets.ts`, which
prefixes `import.meta.env.BASE_URL`. A hard-coded `/media/...` or `/projects/...` path works in dev and
404s in production.

### Content and translations

French-first, and every user-facing string needs both variants. Three patterns coexist:

- `src/translations.ts` — `t[lang]` for UI and section copy.
- `src/data.tsx` — `getSkillsData(lang)`, `getTimelineData(lang)`, `getFormationData(lang)`.
- Inline `Record<Language, string>` fields (`{ FR, EN }`) on project cards and configs.

The language is stored in `localStorage` under `portfolio_lang`, falling back to the browser language.

### Styling

All CSS lives in `src/index.css` (~8300 lines, no CSS framework or modules). It is layered
chronologically and **later blocks deliberately override earlier ones**, so source order is part of the
design:

- The top of the file is the original design, with per-section blocks and breakpoint blocks.
- `DESIGN SYSTEM AUDIT OVERRIDES`, `DESKTOP RESPONSIVENESS AUDIT` and the project-card variants
  override that.
- `STUDIO DESIGN SYSTEM` (from ~line 5515 to the end) is the current look: it redeclares the `:root`
  tokens (`--studio-ink`, `--studio-paper`, `--studio-accent`, and remaps `--bg-main`, `--text-main`,
  `--font-body`, … onto them), switches typography to Inter, and defines the `studio-*` classes scoped
  under `.portfolio-studio`.

Put new rules in or after the studio block and use the `studio-*` tokens and classes; a rule added
higher up is likely to be overridden. Check for an existing later override before concluding that a
style edit "does nothing".

Animations use `motion/react`. `components/Reveal.tsx` is the standard scroll-in wrapper; anything
custom should check `usePrefersReducedMotion`.

### Chatbot

`components/ChatbotButton.tsx` POSTs the message and history to `VITE_CHATBOT_API_URL` and shows a
fallback message when that variable is empty. `cloudflare-worker/worker.ts` is a separate deployable
(not part of the Vite build) exposing `POST /api/chat`: it holds the `GEMINI_API_KEY` secret, enforces
the `ALLOWED_ORIGINS` allowlist (update it if the public domain changes) and a limit of 10 requests per
hour per IP, backed by the optional `RATE_LIMIT_KV` binding or in-memory otherwise.

For local development copy `.env.example` to `.env.local` and set `VITE_CHATBOT_API_URL`.

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`, and fails
if the `VITE_CHATBOT_API_URL` repository secret is missing. `dist/` is not versioned. SEO files
(`robots.txt`, `sitemap.xml`, the Google Search Console verification file) live in `public/`; since
routing has no URLs, the sitemap only describes the single page.

## Conventions

- Conventional Commits with optional scope, short imperative summary: `feat(seo): add sitemap.xml and
robots.txt`, `fix(lightbox): hide chatbot, remove prev/next`.
- Prettier: 2 spaces, single quotes, semicolons, 100-character width.
- Components and their files are PascalCase; state, refs, helpers and DOM ids are camelCase.
