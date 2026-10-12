# MyPortfolio

Portfolio bilingue (FR/EN) de **Kafui Charbel Eklu**, technicien informatique à Lomé : réseaux,
systèmes, cybersécurité et gouvernance des SI.

Site public : `https://kafuicharbeleklu.github.io/MyPortfolio/`

## Le site « Sur mesure »

- Une page d'entrée plein écran (l'affiche), quittée par une porte qui fait tomber un rideau.
- Un accueil en cinq scènes : Profil, Expertise, Réalisations, Parcours, Contact.
- Un tiroir « En bref » (fiche de mesures) accessible depuis le bord droit de chaque page.
- Un catalogue de 15 réalisations avec filtres, et une page par projet (étude de cas et fiche
  technique chargée depuis `public/projects/<slug>/projects_data(.en).json`).
- Thèmes clair et sombre, langue FR/EN persistante, mouvement réduit respecté.
- Un assistant relayé par un Worker Cloudflare vers Gemini, avec repli par email.

## Stack

`React 19`, `TypeScript 5.8`, `Vite 6`, `motion/react`, `lucide-react`, une seule feuille de style
(`src/site/site.css`, tokens `--sm-*`), `node:test` pour les tests, Worker Cloudflare pour l'API.

## Structure

```text
src/site/            # le site rendu : SiteRoot, CoverPage, HomePage, ProjectsPage, ProjectPage,
                     # SiteHeader, SiteMenu, BriefDrawer, ProjectsBadge, Chatbot, content.ts, studies.ts
src/config/assets.ts # chemins des assets publics (withBaseAsset préfixe le base path)
src/hooks/           # useProjectLoader, usePrefersReducedMotion (le reste sert l'ancienne version)
public/projects/     # fiches techniques JSON (FR et EN) et exports PDF de chaque projet
public/documents/cv/ # CV FR et EN
tests/               # routage par hash, périodes et durées
cloudflare-worker/   # worker.ts : POST /api/chat vers Gemini
docs/                # revues et sources HTML des CV
```

L'ancienne version (`src/hooks/usePortfolioModel.tsx`, `src/pages/`, `src/components/`,
`src/index.css`) compile encore mais n'est plus montée.

## Commandes

```bash
npm install          # Node 22+
npm run dev          # http://localhost:3000
npm run lint         # eslint, zéro avertissement
npm run typecheck    # tsc --noEmit
npm test             # node:test
npm run build        # dist/ sous /MyPortfolio/
npm run preview
```

## Configuration

`.env.local` :

```env
VITE_CHATBOT_API_URL=https://ton-worker.ton-compte.workers.dev/api/chat
```

`VITE_BASE_PATH` force le base path (production : `/MyPortfolio/`). La clé Gemini reste un secret
`GEMINI_API_KEY` côté Worker (`cloudflare-worker/README.md`).

## Contenu

Tout le texte du site vit dans `src/site/content.ts` et `src/site/studies.ts`, en français et en
anglais. Les dates d'expérience et de formation sont stockées en ISO (`start`, `end`) ; la période
et la durée affichées sont calculées. Règles : aucun montant financier, aucun tiret cadratin, une
seule photo (le portrait).

## Déploiement

GitHub Pages, source « GitHub Actions » : `.github/workflows/deploy.yml` construit et publie à
chaque push sur `main`, et exige le secret de dépôt `VITE_CHATBOT_API_URL`.
