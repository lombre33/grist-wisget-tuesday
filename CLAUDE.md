# Tuesday : consignes pour Claude

Widget de gestion de projet (inspiré de monday.com) pour Grist, app de la suite Grist Factory Suite (GFS). Lire d'abord `docs/cahier-des-charges.md` (en bref, sections 2, 5, 8, 10), puis `docs/etude-existant.md` si besoin.

## Règles du porteur (Antoine)

- Travail direct sur `main`, push et fusion sans demander ; des PR seulement si elles servent ; fusions gérées seul.
- **Dès que le développement commence : tests unitaires exhaustifs** (cahier, section 10). Chaque correction a son test, qui échoue sur l'ancien code.
- UX/UI : la charte Grist Factory, section 1 (`lombre33/publipostageGrist`, `planning/identite-ui-ux-grist-factory.md`) : gris et un seul bleu, police du système, icônes au trait, grisé jamais masqué, panneau 700 × 400, français et anglais ensemble, « modèle » jamais « template », vouvoiement, Annuler/Rétablir à 100 %.
- Objectifs : UI simple et efficace (pas de kanban hyper sophistiqué) ; périmètre qui grandit par paliers vers Monday et les widgets existants ; parfaitement intégré à GFS ; **avec** la donnée de Grist, jamais à sa place.
- Déploiement : GitHub Pages, surtout sur l'instance Grist de la DINUM.
- Écrire en français, en tutoyant Antoine.

## Règles reprises de GFS (voir son `CLAUDE.md` et son guide des apps)

- Modules ES, HTML et CSS, aucun framework, aucune étape de construction ; ce qu'un outil génère est commité.
- `kit/` en sous-module ; une app n'importe jamais une autre app.
- Pas de calcul dans le widget ; changements de données additifs ; ne jamais écrire une colonne absente ; relire l'identifiant réel après un `AddTable` ; aucune table créée sans l'accord de la personne.
- Réglages de la vue jamais écrits sans un geste de la personne ; clés préfixées.
- `addEventListener('message')`, jamais `window.onmessage =`. Stockage du navigateur dans des `try/catch`.
- Pas de `console.log` publié ; aucun prénom de personne dans le code ; aucune couleur ni `z-index` en dur (jetons du kit).
- Fichiers de moins de 600 lignes de code, fonctions de moins de 81 lignes, complexité 15 au plus.
- GitHub Pages : aucun fichier ou dossier dont le nom commence par « _ » ou « . » ; cache de 10 minutes, donc `?v=` monté à chaque changement de CSS ou JS ; `.nojekyll` à la racine.
- Ce qui dépend de ce que Grist envoie se mesure dans un vrai Grist (labo de GFS), jamais contre un faux Grist écrit ici.
- Une passe de tests ciblée avant chaque push ; la suite complète à la demande.
- Une décision qui sort du cahier : une carte de décision au porteur d'abord, rien n'est codé avant son choix.

## Ce qui est décidé, ce qui est ouvert

Voir `docs/cahier-des-charges.md`, section 13 (décisions à valider, avec le défaut pris pour chacune).
