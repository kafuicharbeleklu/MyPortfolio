# Revue UI/UX et animations du portfolio

Date : 11 octobre 2026.

## Périmètre et limites

Revue de la version active « Sur mesure » : `src/App.tsx` charge `src/site/SiteRoot.tsx`. Lecture des composants de l’accueil, du menu, du catalogue, des pages projet, du chatbot, des styles, des contenus principaux et des animations. L’ancienne interface dans `src/components/`, `src/pages/` et `src/index.css` n’est pas la référence de cette revue.

La session ne dispose pas d’un navigateur utilisable. La page publique a été ouverte avec l’outil de recherche, mais son contenu React n’y est pas exploitable. Les constats ci-dessous proviennent donc du code local, des calculs de contraste et de recherches en ligne. Ils ne constituent pas une validation visuelle ou fonctionnelle en navigateur. Aucun score Lighthouse, test tactile, test lecteur d’écran ou résultat Core Web Vitals n’a été mesuré. La correspondance exacte entre la version locale et la production n’est pas vérifiée.

Aucun fichier applicatif n’a été modifié. Les durées et dimensions proposées sont des choix de conception à essayer, pas des exigences normatives.

## Diagnostic

Conserver la direction graphique et renforcer la rapidité de compréhension. La palette sable/anthracite/tabac, le contraste Anton/Cormorant/Instrument Sans, les coutures et le fil donnent une identité cohérente. Le principal potentiel d’amélioration est de rendre les preuves professionnelles plus rapidement accessibles et de raccourcir les interactions fréquentes.

Hypothèse de travail : le visiteur prioritaire est un recruteur ou un interlocuteur technique qui veut comprendre le profil, examiner une réalisation et contacter Charbel. Le contenu « Recherche » et le CV justifient cette hypothèse ; elle reste à confirmer avec les objectifs commerciaux du site.

Les consignes du dépôt indiquent une direction sans photos ni montants financiers, et le rejet du texte qui s’éclaircit progressivement au défilement. Les propositions respectent ces choix. Le fondu ponctuel de `Settle` n’est pas équivalent à cet effet piloté continuellement par le défilement.

## Points à conserver

- Palette chaude distinctive et corps de texte de 16 à 17 px.
- Trois rôles typographiques déjà séparés : affiche, éditorial, lecture.
- Fil SVG dont la simulation s’arrête lorsqu’il revient au repos.
- Rubriques projet « besoin / intervention / résultat » et navigation projet précédent/suivant.
- Traductions FR/EN, persistance de la langue et attribut `lang` actualisé.
- Zones tactiles de 44 px ou plus sur plusieurs contrôles.
- Prise en compte de la réduction des animations, avec adaptations CSS et React.
- Liens directs vers les pages projet via le hash.
- Retour email disponible lorsque l’assistant est indisponible.

## Recommandations par parcours

### 1. Premier écran : rapprocher promesse et preuve

**Constat :** l’affiche occupe presque une hauteur d’écran. Le métier figure dans un petit libellé ; la grande accroche est « Infrastructure taillée sur mesure ». Les actions visibles sont le CV et le contact. La description détaillée et les éléments de crédibilité viennent ensuite.

**Proposition :** conserver l’accroche et placer une phrase concrète à proximité : « J’administre les systèmes, sécurise les réseaux et automatise les opérations IT. » Donner à « Voir mes réalisations » une place immédiatement visible, avec le CV comme deuxième action et le contact en accès permanent.

Ajouter une ligne factuelle courte issue du contenu existant, par exemple « Neemba Togo · Active Directory · SIEM/XDR Wazuh · Lomé ». Ne pas inventer de disponibilité, de chiffre d’impact ou de périmètre.

**À vérifier :** à 390 × 844 et 1440 × 900, un visiteur doit identifier métier, domaine et action principale sans attendre la fin de l’animation.

### 2. Texte et positionnement : alléger la métaphore

**Constat :** la couture est présente dans l’accroche, l’introduction, la déclaration de profil et la « Fiche de mesures ». Les titres professionnels varient entre le rôle affiché et les métadonnées.

**Proposition :** garder la métaphore dans l’identité et l’accroche, puis employer un vocabulaire métier direct. Renommer « Fiche de mesures » en « Profil en bref ». Harmoniser les intitulés publics en respectant le poste réel. Clarifier la relation entre administration systèmes, data et IA appliquée : domaine principal puis compétences complémentaires.

**Priorité :** élevée, effort faible. Fichier : `src/site/content.ts`, puis `index.html` pour la cohérence des aperçus.

### 3. Navigation : rendre les destinations principales visibles

**Constat :** le menu plein écran est utilisé aussi sur ordinateur. Le header n’expose pas directement les destinations clés.

**Proposition :** afficher sur ordinateur « Réalisations », « Parcours » et « Contact », puis conserver le menu pour l’ensemble des rubriques. Sur téléphone, garder une commande Menu compacte et un accès simple à la langue.

Les références sont rendues dans l’accueil mais absentes de `sectionIds`. Décider si elles constituent une destination du menu ou une sous-partie du profil, puis aligner la navigation et la numérotation.

**Priorité :** élevée pour l’accès aux projets ; secondaire pour les références. Fichiers : `SiteHeader.tsx`, `SiteMenu.tsx`, `content.ts`.

### 4. Ordre et rythme de l’accueil

**Constat :** l’ordre actuel est affiche, introduction, profil, expertise, réalisations, parcours, formation, références, contact. Les grands titres répètent une même ouverture de section, jusqu’à 136 px, avec des espacements pouvant atteindre 160 px.

**Proposition :** essayer affiche → preuves courtes → trois réalisations → expertise → parcours → profil/formation → références → contact. Garder les titres spectaculaires pour les grands moments, puis réduire la taille des ouvertures secondaires.

Viser des paragraphes de 55 à 70 caractères par ligne et réduire davantage les espaces sur mobile. La disposition actuelle en grille et les tailles fluides constituent une bonne base.

**À vérifier :** ne pas conclure à des blancs excessifs ou à des débordements sans rendu réel. Tester particulièrement les titres anglais, les capitales accentuées et le zoom à 200 %.

### 5. Catalogue : raccourcir l’ouverture d’une étude

**Constat :** une ligne est un bouton d’accordéon ; le lien vers la page du projet est à l’intérieur du panneau. L’état des filtres et du panneau est local au composant, donc perdu après démontage.

**Proposition :** rendre le titre directement navigable et réserver le bouton « + » au résumé. Afficher dès la liste une courte indication du problème traité ou du résultat. Conserver la famille sélectionnée et la position de lecture au retour depuis une fiche.

Les filtres existants et le compteur annoncé par `aria-live` sont utiles. Une recherche ne devient prioritaire que si le volume rend les filtres insuffisants.

**À vérifier :** ouvrir un projet en un clic, utiliser Retour, retrouver le filtre, la ligne et la position précédents. Fichier : `ProjectsPage.tsx`.

### 6. Pages projet : rendre la preuve plus visible

**Constat :** les fiches comportent déjà contexte, rôle, environnement, besoin, intervention, résultat et parfois décision technique. La présentation active est essentiellement textuelle.

**Proposition :** placer un résumé de résultat dans le premier écran de la fiche et ajouter un schéma explicatif adapté au sujet : chaîne de collecte Wazuh, circulation des identités, étapes d’automatisation. Utiliser des diagrammes SVG simples, cohérents avec l’identité sans photos.

Présenter un résultat mesuré uniquement si la mesure existe. À défaut, expliquer un changement vérifiable : centralisation des événements, procédure reproductible, contrôle ajouté, tâche automatisée. Distinguer clairement mission en entreprise, outil interne et laboratoire personnel.

Limiter les répétitions entre résumé, étude et fiche technique. Pour une page longue, proposer un sommaire « Contexte · Intervention · Résultat · Technique ».

**Priorité :** élevée pour le résumé, moyenne pour les schémas. Fichier : `ProjectPage.tsx`.

### 7. Contact et références

**Constat :** email, téléphone, LinkedIn, GitHub et CV existent. Les références sont une liste de noms, fonctions et organisations ; ce ne sont pas des témoignages rédigés.

**Proposition :** ajouter « Copier l’email » avec confirmation discrète et annoncer clairement l’ouverture ou le téléchargement du PDF. Afficher quelques références représentatives puis proposer le reste à la demande. Ajouter de courts témoignages seulement s’ils sont fournis et autorisés par leurs auteurs.

Un formulaire n’est pas nécessaire pour améliorer le parcours actuel. La fiabilité du contact direct est prioritaire.

### 8. Assistant

**Constat :** le chatbot a une sortie email, un état d’attente et une gestion d’erreur. Le compteur client augmente avant la réponse, y compris en cas d’échec. Le menu n’a pas de coordination avec son ouverture ; les couches du chatbot sont au-dessus du menu.

**Proposition :** proposer trois questions de départ liées au portfolio, clarifier le compteur et le comportement en cas d’échec en cohérence avec la limite serveur. Suspendre ou fermer l’assistant pendant le menu plein écran. Garder les détails du parcours et les coordonnées accessibles sans conversation.

Sur téléphone, tester le clavier virtuel et prévoir une hauteur dynamique ainsi que les marges de sécurité du système. Fichiers : `Chatbot.tsx`, `SiteRoot.tsx`, `site.css`.

## Animations et effets

La proposition est de conserver une animation signature au premier écran et de rendre les gestes de navigation plus courts. Emil Kowalski distingue les animations décoratives occasionnelles des interactions répétées, dont la vitesse compte davantage. [Référence et exemples interactifs](https://emilkowal.ski/ui/you-dont-need-animations).

| Élément | Réglage actuel lu dans le code | Proposition à essayer |
|---|---|---|
| Rideau initial | 1 150 ms + 100 ms de délai, une fois par session | 500 à 700 ms ; ne pas retarder l’accès au contenu |
| Titres de l’affiche | 1 500 ms, avec décalages | 600 à 800 ms ; séquence courte |
| Apparitions `Settle` | 1 100 ms ; titres masqués 1 300 ms | 350 à 550 ms ; déplacement de 8 à 16 px pour le corps |
| Menu | 750 ms, puis animation des mots | Ouverture 300 à 400 ms ; fermeture 180 à 250 ms |
| Accordéons | 800 ms | 220 à 300 ms |
| Changement d’étude sélectionnée | Sortie et entrée de 450 ms, mode `wait` | Transition totale proche de 250 à 350 ms |
| Nouvelle page | Entrée de 750 ms + 100 ms de délai | 250 à 400 ms ; conserver la continuité du titre |
| Changement de langue | Transition générale identique à une navigation | Fondu très court ou changement immédiat |
| Lettres de l’affiche | Remplacement identique toutes les 3 à 4,2 secondes | Une séquence courte ou effet volontaire au survol |
| Fil SVG | Tracé de 2 800 ms + 600 ms ; réaction souris | Conserver comme signature, amplitude modérée, statique en mouvement réduit |

Les séquences se chevauchent : ces durées ne doivent pas être additionnées pour prétendre mesurer un temps de chargement.

### Effets à améliorer

- **Boutons stables :** le survol de `.sm-patte` augmente le padding droit et peut déplacer les éléments voisins. Animer un détail intérieur ou une flèche sans modifier les dimensions du bouton.
- **Titres stables :** le passage en italique au survol peut changer leur largeur et leurs retours à la ligne. Garder le texte stable et déplacer légèrement un indicateur.
- **Coutures :** conserver le tracé décoratif mais éviter de le répéter avec la même intensité sur toutes les lignes.
- **Grain :** comparer le rendu et le coût avec/sans couche fixe, particulièrement sur téléphone. Aucun problème de performance n’a été mesuré à ce stade.
- **Pression :** léger retour de pression sur les commandes, sans déplacement de leur cible tactile.
- **Mouvement réduit :** vérifier aussi les opacités animées par JavaScript. La neutralisation CSS ne suffit pas à elle seule à démontrer que toute animation React est supprimée.

Pour les déplacements, privilégier `transform` ; réserver les changements de mise en page aux composants qui en ont besoin, comme les accordéons. Les recommandations de web.dev expliquent pourquoi les animations de propriétés de géométrie peuvent coûter davantage. [Guide officiel](https://web.dev/articles/animations-guide).

## Accessibilité : corrections prioritaires

### Menu modal

`SiteMenu.tsx` gère le focus initial et Échap, mais ne contient ni boucle Tab/Shift+Tab ni neutralisation du contenu derrière. Le bouton de fermeture appartient au header, en dehors du conteneur `role="dialog"`. Le chatbot reste indépendant.

Reconstituer un vrai périmètre modal avec fermeture interne accessible, parcours clavier contenu, arrière-plan inactif et retour du focus approprié. En cas de sélection d’une destination, déplacer le focus vers cette destination plutôt que systématiquement vers le bouton Menu. [Modèle WAI-ARIA officiel](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

### Accordéons et changement de page

Les panneaux de catalogue sont repliés avec `grid-template-rows: 0fr` et `overflow: hidden`, mais leurs liens restent dans le DOM sans mécanisme `hidden` ou `inert`. Le risque est de tabuler vers un lien visuellement masqué. Retirer les panneaux fermés du parcours clavier, en coordonnant cela avec la transition.

Ajouter un lien « Aller au contenu ». Au changement de page, gérer le focus sur le nouveau titre ou le contenu principal ; le défilement vers le haut et le changement de `document.title` ne remplacent pas cette gestion.

### Contrastes calculés

Calculs sRGB sur les couleurs CSS unies. Les textures, transparences et conditions de rendu devront être vérifiées séparément.

| Paire | Rapport approximatif | Lecture |
|---|---:|---|
| Encre `#26272a` / sable `#e9e0d2` | 11,42:1 | Très bon contraste de base |
| Texte secondaire `#5e564c` / sable | 5,52:1 | Au-dessus du seuil AA pour le texte courant |
| Miel `#b98a3e` / anthracite `#2f3033` | 4,25:1 | Trop faible pour les petits libellés à 12 px |
| Email au survol miel / tabac `#74472a` | 2,53:1 | Trop faible, même pour du grand texte |
| Focus tabac / anthracite | 1,68:1 | Indicateur à renforcer |
| Focus tabac / fond contact tabac | 1:1 | Le contour global se confond avec ce fond |

Prévoir des tokens dédiés aux petits textes sur fond sombre et au focus sur fond sombre/tabac. Les boutons ayant déjà une surcharge spécifique doivent être contrôlés séparément. Le seuil du texte courant est 4,5:1, celui du grand texte 3:1 ; les indicateurs d’interface concernés nécessitent aussi un contraste adapté. [Texte, W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [éléments non textuels, W3C](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## Liens, chargement et continuité

- `startAtTop()` supprime volontairement les ancres de section lors d’une ouverture ou d’un rechargement. Le choix actuel est documenté. Arbitrage recommandé : conserver l’arrivée en haut pour une visite ordinaire, mais respecter un lien explicitement partagé vers `#contact` ou `#realisations`.
- Le retour catalogue remet son état local à zéro et le code de routage force le haut des pages hors accueil. Prévoir une restauration par entrée d’historique.
- Les fallbacks initiaux sont vides (`null` ou `<main>` vide). Fournir un état de chargement sobre et perceptible si l’attente se prolonge ; prévoir aussi une reprise après erreur de chargement d’un module.
- Les trois familles de polices sont chargées via Google Fonts avec `display=swap`. Examiner les variations de mise en page sur connexion lente avant de décider d’un sous-ensemble ou d’un hébergement local.
- Les métadonnées sociales sont générales et il n’y a pas d’image Open Graph déclarée. Créer un visuel typographique de partage. Les aperçus distincts par projet demanderaient ensuite des URL et métadonnées servies adaptées ; changer seulement le titre côté client ne garantit pas leur lecture par les plateformes.

## Inspirations recherchées en ligne

Ces références fournissent des principes et exemples à adapter. Elles ne prouvent pas un gain de conversion pour ce portfolio.

| Référence | Intérêt documenté | Application proposée |
|---|---|---|
| [Brittany Chiang](https://brittanychiang.com/) | Présentation explicite du métier, expérience structurée, projets et CV | Rendre les preuves professionnelles plus faciles à parcourir |
| [Linear : A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh) | Hiérarchie de l’attention, cohérence des actions et réduction du bruit visuel | Donner plus de poids aux réalisations et moins aux séparateurs secondaires |
| [Rauno Freiberg : Craft](https://rauno.me/craft) | Collection d’expérimentations d’interaction | Travailler quelques détails précis : bouton, copie email, sélection et continuité |
| [Emil Kowalski : You Don’t Need Animations](https://emilkowal.ski/ui/you-dont-need-animations) | Exemples sur l’utilité, la fréquence et la vitesse des animations | Séparer l’animation signature des commandes qui doivent répondre vite |
| [A1 : Typographic Portfolio Websites](https://www.a1.gallery/websites/typographic-portfolio) | Galerie repérée de portfolios centrés sur la typographie | Piste de moodboard pour comparer échelles de titres et densités ; sites individuels à examiner visuellement |

La direction recommandée reste celle du site : fond chaud, titres affirmés, corps lisible et éléments graphiques fins. Adapter les principes de ces références sans importer leur identité visuelle entière.

## Ordre de mise en œuvre

| Lot | Contenu | Impact attendu | Effort relatif |
|---|---|---|---|
| 1 | Menu au clavier, panneaux fermés, contrastes et focus | Utilisabilité et accessibilité | Moyen |
| 2 | Métier et preuve au premier écran, accès direct aux réalisations | Compréhension et exploration | Faible à moyen |
| 3 | Durées d’animation et survols sans changement de dimensions | Réactivité perçue | Faible à moyen |
| 4 | Liens directs du catalogue, filtres et position conservés | Continuité du parcours | Moyen |
| 5 | Résultats en tête de fiche et schémas techniques | Crédibilité et lecture | Moyen à élevé selon les contenus |
| 6 | Ajustements mobiles, chatbot, partage et chargement | Finition générale | Moyen |

## Validation à réaliser en navigateur

1. Comparer FR/EN à 360, 390, 768, 1024 et 1440 px, puis zoom à 200 %.
2. Refaire le parcours « comprendre le métier → ouvrir une réalisation → revenir → contacter » à la souris, au clavier et au toucher.
3. Vérifier Tab/Shift+Tab/Échap dans le menu ; absence de focus derrière ; fermeture accessible ; assistant coordonné.
4. Vérifier qu’aucun panneau fermé ne contient de lien tabulable.
5. Ouvrir directement une section et une fiche projet, recharger, utiliser Précédent/Suivant et changer de langue.
6. Tester le mode de mouvement réduit, les navigateurs sans animations liées au défilement et les chargements lents.
7. Tester le chatbot avec clavier mobile ouvert, erreur réseau et limite atteinte, sans transmission de données personnelles de test.
8. Mesurer chargement, stabilité de mise en page et réactivité avant/après. Ne pas attribuer un gain aux animations sans comparaison.
9. Faire réaliser à quelques personnes externes trois tâches : identifier le métier, retrouver un exemple concret, trouver le contact. Relever temps, hésitations et succès avant/après.

Critère de réussite proposé : conserver la personnalité graphique tout en permettant d’identifier le profil en quelques secondes, d’ouvrir une preuve en un geste et de contacter sans détour. Ce sont des objectifs à valider, pas des résultats déjà mesurés.
