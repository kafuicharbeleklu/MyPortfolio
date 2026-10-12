# Revue complète du portfolio

Date : 11 octobre 2026.

## Périmètre et méthode

Revue de la version « Sur mesure » (`src/site/`), de la configuration du dépôt, du Worker Cloudflare, du
workflow de déploiement et de l'état réel de la production.

Vérifications exécutées :

| Contrôle | Résultat |
|---|---|
| `npm run lint` | Réussi, zéro erreur et avertissement |
| `npx tsc --noEmit` | Réussi |
| `npm run build` | Réussi, 2 093 modules, JS initial 196 kB + 190 kB (62 kB + 62 kB gzip), CSS 34 kB |
| `node --import tsx --test tests/site-navigation.test.mjs` | 3 tests passent |
| Passage navigateur (Chrome), serveur de dev à 1440 px | Accueil section par section, FR/EN, thème sombre, menu au clavier, catalogue, filtre, fiche projet, retour avec restauration, assistant (un message) |
| Largeurs 1024, 768 et 390 px | Via des iframes de même origine (le redimensionnement de fenêtre n'a pas pris) : affiche, réalisations, contact, menu, catalogue |
| Build de production servi par `npm run preview` | Arrivée sur `#contact`, fiche `tracker` avec sa fiche anglaise, liens démo et GitHub |
| Production | HTTP sur les deux URL GitHub Pages, API GitHub (dépôt, exécutions), hôte du Worker |

Non testé : réduction des animations, lecteur d'écran, Lighthouse, clavier mobile avec l'assistant.

## Verdict

Le code compile, les contrôles statiques passent et la version locale fonctionne bien dans les
parcours principaux. En revanche, le portfolio n'est pas visible en ligne aujourd'hui, le travail de
refonte n'existe que sur ce disque, et le dépôt expose un risque de publication de documents
d'identité. Ces trois points passent avant tout le reste.

## 1. Bloquant : le site n'est pas en ligne

Constats vérifiés le 11 octobre :

- Le dépôt GitHub a été renommé : `kafuicharbeleklu/MyPortofolio` redirige (301) vers
  `kafuicharbeleklu/MyPortfolio`. L'ancienne URL Pages `…/MyPortofolio/` répond 404.
- La nouvelle URL `https://kafuicharbeleklu.github.io/MyPortfolio/` répond 200 mais sert le
  `index.html` source du dépôt (référence `/src/main.tsx`, qui renvoie 404). Page blanche.
- Cause : Pages est configuré en « déploiement depuis la branche ». Les dernières exécutions sont
  « pages build and deployment » (6 octobre), pas le workflow `deploy.yml`.
- Dernier push sur `main` : 20 mars 2026. Tout `src/site/`, les fiches `projects_data.en.json`, les
  nouveaux CV, `CLAUDE.md`, les tests et `docs/` sont non versionnés ou non commités (36 fichiers
  modifiés, 27 entrées non suivies). Sept mois de travail sans sauvegarde distante.
- Le code vise toujours `/MyPortofolio/` : `vite.config.ts` (`repoBase`), `index.html` (`og:url`),
  `public/sitemap.xml`, `public/robots.txt`, `README.md`, `CLAUDE.md`, et la télécommande Git
  locale (`origin`).
- L'assistant est hors service : l'hôte `portfolio-chat.charbelkafuieklu.workers.dev` répond
  `403 Forbidden` en texte brut, y compris à la requête OPTIONS. Ce n'est pas le code du Worker
  (il renvoie du JSON) : le Worker est désactivé, supprimé ou bloqué côté Cloudflare. En local,
  l'envoi d'un message affiche « momentanément indisponible » en 2 s.

Remise en ligne, dans l'ordre :

1. Mettre `BIDC/` et les images personnelles hors du dépôt (voir section 2) avant tout `git add`.
2. Remplacer `/MyPortofolio/` par `/MyPortfolio/` dans les six fichiers ci-dessus, puis
   `git remote set-url origin https://github.com/kafuicharbeleklu/MyPortfolio.git`.
3. Dans les réglages du dépôt, Pages → Source : « GitHub Actions », et vérifier que le secret
   `VITE_CHATBOT_API_URL` existe (le workflow échoue sans lui).
4. Redéployer ou réactiver le Worker, puis contrôler `ALLOWED_ORIGINS` (l'origine
   `https://kafuicharbeleklu.github.io` reste valable).
5. Commiter la refonte par lots explicites (`git add src public docs …`), pousser, suivre l'exécution
   de « Deploy to GitHub Pages ».

## 2. Risques de confidentialité et hygiène du dépôt

- `BIDC/` à la racine contient passeport, acte de naissance, diplômes, relevés de notes et lettre de
  motivation (PDF et DOCX). Le dossier n'est ni suivi ni ignoré : un `git add .` le publierait sur un
  dépôt public. Idem pour trois `WhatsApp Image …jpeg`, une capture d'écran et
  `Tailored Portrait in a Quiet Studio.png`. Ajouter `BIDC/`, `*.jpeg` et `*.png` racine à
  `.gitignore`, ou déplacer ces fichiers hors du projet.
- `public/projects/tracker/projects_data.json` et `.en.json` contiennent six chemins absolus
  `C:\Users\eklu\Downloads\111\TRACKER\…` dans `assets.screenshots`. Ils ne sont pas affichés mais
  sont servis publiquement et révèlent le nom d'utilisateur et l'arborescence locale. Vider le
  tableau.
- `public/projects/wisignal/AGENTS.md` est un guide de contribution interne servi publiquement
  (il mentionne un appel navigateur vers Anthropic dans l'outil). Le sortir de `public/`.
- `public/` embarque encore 3,9 Mo de captures d'écran, un portrait de 1,8 Mo et l'ancien CV, que la
  refonte n'utilise pas (règle « pas de photos »). Ils sont déployés et restent accessibles par URL.
- Pas de `.gitattributes` : Git avertit sur chaque fichier d'une conversion LF → CRLF. Ajouter
  `* text=auto eol=lf`.
- `.env.local` est bien ignoré. `docs/cv/` (sources HTML des CV) est non suivi : à commiter si c'est
  la source de vérité des PDF.

## 3. Défauts constatés en navigateur

### Titres sur deux lignes masqués à l'arrivée

Les titres `Settle rise` sur deux lignes (`.sm-contact__title`, `.sm-end__title` de la page
catalogue) restent cachés derrière leur masque après une arrivée directe. Mesures :

| Cas | Moment | Décalage mesuré du bloc animé |
|---|---|---|
| Dev, `scrollIntoView` vers `#contact` depuis une autre section | 1,5 s | Seconde ligne absente à l'écran |
| Dev, chargement de l'URL `#contact` | 4 s | 41 px (animation à peine commencée) |
| Dev, catalogue à 390 px, défilement vers la bande finale | 2,5 s | 68 px, soit 105 % : animation non démarrée |
| Build de production, chargement de l'URL `#contact` | 1,5 s | 233 px, soit 105 % : titre entièrement caché |

Dans tous les cas le titre finit par apparaître (entre 2 et 5 s). Les défilements internes à une page
déjà chargée partent en moins de 200 ms.

Réserve importante, constatée après coup : l'onglet piloté par l'automatisation est signalé
`document.visibilityState === 'hidden'` par Chrome. Dans cet état le navigateur suspend
`requestAnimationFrame`, dont dépendent les animations Motion et le déclencheur `useInView`. Les
retards mesurés peuvent donc être un artefact de l'outil et non un défaut du site. À confirmer dans
une fenêtre normale avant toute correction : ouvrir l'URL `#contact` dans un onglet au premier plan
et vérifier que le second vers du titre apparaît en moins d'une seconde. Si le retard se confirme,
le correctif proposé est de ne pas jouer l'animation `rise` dans `Settle.tsx` quand le masque est
déjà dans la fenêtre au montage.

### Focus clavier invisible

`site.css:112` applique `.sm :focus { outline: none }` et le seul `:focus-visible` du fichier concerne
le bouton de thème (`site.css:1880`). Mesuré : un lien focalisé a `outline: none` sans `box-shadow`,
sur la page comme dans le menu. La synthèse du 11 octobre annonçait un contour clair livré ; il n'est
pas dans le fichier. Toute navigation Tab est aveugle (WCAG 2.4.7). Ajouter une règle
`.sm :focus-visible` avec `outline: 2px solid var(--sm-ink); outline-offset: 3px`, et des variantes
`--sm-off` sur `.sm-section.is-dark`, `.sm-contact`, `.sm-end`, `.sm-menu`, `.sm-card`.

### Titre de l'affiche doublé dans le DOM

`SwapText` rend chaque lettre deux fois (lettre + jumelle). Le `textContent` du `h1` vaut
« IInnffrraassttrruuccttuurree… » et son `innerText` met chaque lettre sur sa propre ligne. L'arbre
d'accessibilité expose ce texte doublé comme nom du titre (`role="text"` n'est pas un rôle ARIA
standard et Chrome l'ignore). Conséquences : lecteur d'écran, copier-coller, et indexation du `h1`
par les moteurs. Correctif : rendre la lettre jumelle en pseudo-élément
(`.sm-swap__letter::after { content: attr(data-char) }`) pour qu'elle n'existe pas dans le texte, et
garder un seul `aria-label` sur le `h1` ou un texte visuellement masqué.

### Assistant

- Le compteur « messages restants » passe à 9 même quand l'envoi échoue. Ne décrémenter qu'à la
  réponse 200.
- Le prompt système du Worker ne contient aucune information sur le profil : l'accueil promet des
  réponses sur « son parcours, ses compétences ou ses projets », mais le modèle ne dispose que d'un
  titre de poste (et pas le bon, voir section 6). Il ne pourra qu'inventer. Injecter un résumé
  factuel construit depuis `content.ts` (poste, missions, projets, formation, coordonnées publiques)
  et une consigne de refus hors périmètre.
- `aria-controls="chatbot-panel"` sur le bouton pointe vers un élément absent quand le panneau est
  fermé.

### Points vérifiés et corrects

- FR/EN : `lang`, `document.title`, affiche, rôle, catalogue et fiche anglaise (`projects_data.en.json`)
  changent ensemble ; la langue persiste.
- Thème sombre : bascule, `meta theme-color`, persistance, lisibilité des sections anthracite et
  tabac, cartes « papier » inchangées.
- Menu : `<dialog>` natif, focus sur le premier lien, Tab confiné au dialogue, Échap ferme et rend le
  focus au bouton Menu, défilement de page bloqué puis restauré, thème et langue présents dans le
  menu sous 861 px.
- Catalogue : filtre, compteur `aria-live`, résumé `inert` fermé, titre cliquable ; retour depuis une
  fiche avec filtre, résumé ouvert, position de défilement et focus restaurés.
- Fiche projet : focus sur le `h1` à l'arrivée, fiche technique chargée, liens démo et GitHub, pager.
- Mise en page à 390, 768 et 1024 px : aucun débordement horizontal, détail des réalisations en
  accordéon sous 861 px, grille contact sur deux colonnes, menu complet et défilable.
- Build de production sous `/MyPortofolio/` : chemins des JSON et PDF corrects.

## 4. Accessibilité, en plus des points ci-dessus

- Le menu animé met jusqu'à 1,8 s à afficher tous ses mots (`sm-rise` 1,5 s plus décalages) alors
  que l'ouverture est annoncée à 380 ms ; à 0,7 s les quatre premiers mots sont encore coupés.
  Réduire `sm-rise` à 0,5 s dans le menu.
- Les liens « Télécharger le CV » ouvrent un nouvel onglet sans l'indiquer (texte ou `aria-label`).
- Pas de lien « Aller au contenu ».
- `index.html` garde `class="scroll-smooth"` (classe Tailwind sans effet ici).

## 5. SEO et métadonnées

- `og:url`, `sitemap.xml` et `robots.txt` pointent vers l'ancienne URL.
- Pas d'image Open Graph ; `twitter:card` vaut `summary`. Un visuel typographique 1200 × 630 avec le
  titre de l'affiche suffirait.
- Trois intitulés de poste coexistent : « Technicien informatique » (site), « administrateur Digital
  Workplace & Infrastructure » (`meta description`), « Administrateur Système & Réseau » (titre du
  `index.html` commité, donc celui que Google a indexé), « Administrateur Systeme, Reseaux et Digital
  Workplace » (prompt du Worker). Choisir un intitulé et l'aligner partout.
- `metadata.json` contient un tiret cadratin dans sa description, contraire à la règle du site.
- Aucun `<noscript>` ; la page reste sable mais vide sans JavaScript.
- Le `h1` doublé (section 3) nuit à l'indexation du titre principal.

## 6. Contenu

- Section « Références » : dix personnes nommées avec fonction et organisation, publiquement.
  S'assurer de leur accord écrit ; sinon afficher « disponibles sur demande » sans les noms.
- La section « Références » est numérotée 06 et « Contact » 07 sur la page, mais le menu numérote
  Contact 06 et « Toutes les réalisations » 07, car `references` n'est pas dans `sectionIds`.
  Soit l'ajouter au menu, soit renuméroter la page.
- `ui.heroTitle` dans `content.ts` n'est plus utilisé (l'affiche utilise `posterTitle`).
- La fiche de mesures « Recherche : administration systèmes · analyse de données · IA appliquée »
  élargit le positionnement sans que le reste du site l'appuie ; la revue UI/UX du même jour le
  signalait déjà.
- Les JSON ne contiennent plus de tiret cadratin : la fonction `clean()` de `ProjectPage.tsx` est
  devenue inutile.
- Aucun montant financier trouvé dans les contenus (règle respectée). « FCFA » n'apparaît que comme
  mot-clé technique de PrintTrack.

## 7. Code et maintenance

- `App.tsx` charge `SiteRoot` en `React.lazy` alors qu'il est toujours nécessaire : deux chargements
  de 190 kB en série avant le premier rendu, sans gain. Importer `SiteRoot` statiquement, ou ajouter
  un `modulepreload`.
- Les trois familles Google Fonts sont chargées par une feuille bloquante tierce. Les héberger dans
  `public/fonts/` avec `font-display: swap` et un `preload` des deux fichiers de l'affiche.
- CSS mort dans `site.css` : `.sm-drape`, `.sm-h2`, `.sm-hero__sub`, `.sm-hero__title`, `.sm-nav`,
  `.sm-work__title` (héritage de l'ancien premier écran).
- Le cache de `useProjectLoader` vit dans l'état du composant : `ProjectPage` est remonté à chaque
  changement de projet (`key={projectId}`), donc chaque fiche est refetchée. Acceptable (3 kB), mais
  un cache module suffirait.
- `package.json` : nom `react-example`, `vite` et `@vitejs/plugin-react` en `dependencies`, pas de
  scripts `test` ni `typecheck` alors que `tsx` et les tests existent. `README.md` et
  `docs/project-structure.md` décrivent l'ancien site (lightbox, biographie, « pas de tests »).
- `worker.ts` : la réponse OPTIONS 204 porte un corps JSON ; les requêtes sans en-tête `Origin`
  passent la liste blanche (seule la limite par IP les freine).
- `CLAUDE.md` : « Everything described below … is the previous site » reste exact, mais il décrit
  aussi le chemin `/MyPortofolio/` et le sitemap mono-page : à mettre à jour avec le nouveau nom.

## 8. Ce qui est solide

- Système de tokens complet, thème sombre cohérent, aucune couleur codée en dur sur le fond de page.
- Routage par hash simple, liens directs vers sections et fiches, transitions de vue avec
  `view-transition-name` partagé, rideau une fois par session.
- Dialogue natif pour le menu, `inert` sur les panneaux fermés, restauration du catalogue, focus
  géré à l'arrivée.
- Contenus FR/EN alignés, fiches techniques doublées en anglais avec repli français.
- Structure `src/site/` lisible : contenu, études, navigation, thème et composants séparés.

## Plan d'action ordonné

| Lot | Contenu | Effort |
|---|---|---|
| 1 | Ignorer `BIDC/` et images ; nettoyer les chemins locaux et `AGENTS.md` ; commiter et pousser la refonte | Faible |
| 2 | Nouveau chemin de base, Pages en « GitHub Actions », secret, Worker réactivé ; vérifier l'URL publique | Faible |
| 3 | `:focus-visible` global ; lettre jumelle en pseudo-élément ; `Settle rise` sans retard à l'arrivée | Faible à moyen |
| 4 | Intitulé de poste unique ; `og:image` ; sitemap/robots ; accord des références ; numérotation | Faible |
| 5 | Prompt système avec profil ; compteur de l'assistant ; `SiteRoot` en import statique ; polices locales | Moyen |
| 6 | README, package.json, CSS mort, `.gitattributes`, scripts `test` et `typecheck` | Faible |
