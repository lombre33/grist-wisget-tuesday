# GFS-ETAT : Tuesday

Mis à jour le 2026-11-04 (consignes 008, 009 et 010), au commit `0b8bca7` (le dernier commit de code que cette page décrit).

## Consignes
- 001 · faite · `d958504` · guide lu ; aucun écart avec la 1.1 (tables préfixées `Tuesday_`, aucune table sans accord, identifiant relu après `AddTable`, aucun import d'une autre app, aucune lecture de `document.referrer`, `addEventListener` seul côté kit, stockage dans `try/catch` puis par GFS). Réserve : la règle 4 préfère une ligne réservée ; `Tuesday_Liens` sera une table de plus, justifiée en 5.5 du cahier (consigne 002)
- 002 · lue · `gfs.json` inchangé depuis la validation ; barre : gouttière aux quatre bords par `GfsLink.onBar`, testée (`d958504`) ; « Lier un fichier » (fiche) grisé avec sa raison ; reste à mesurer dans GFS
- 003 · lue · rien à coder ; « Mes tâches » = « Je suis… » retenu par le stockage de GFS ; « Automatiser… » grisé avec sa raison
- 004 · lue · rien à coder chez Tuesday
- 005 · faite · `1bc3a17` · `kit/` à `9d17844` (commit à part) ; « Lier un fichier » → `GfsLink.choose` (types document, grille, présentation), « Ouvrir » → `GfsLink.openFile` après avoir fini les écritures en cours ; `GFS_INTROUVABLE` grise le lien sans le supprimer, `GFS_ANNULE` ne dit rien, `GFS_REFUSE` avertit en console, `GFS_ACCES` dit où régler ; `onOpen` et l'ouverture au démarrage ouvrent le projet désigné ; seule, tout est grisé avec sa raison ; `Tuesday_Liens` créée avec accord ; essais avec `createGfsLink` (`test/liens.test.mjs`) ; à mesurer dans GFS à l'entrée au catalogue
- 006 · lue (03/11) · rien à changer dans Tuesday : le calendrier est un module du kit (voie A) ; l'hôte vise déjà `kit/js/calendrier/index.js` et retombe sur la grille provisoire ; l'entrée du module (`creerCalendrier(rappels)` chez Tuesday, `creerCalendrier(element, options)` chez Calendar+) doit devenir une seule forme avant le premier déplacement dans le kit
- 007 · faite · `1bc3a17` · script d'API de Grist gardé (`docs.getgrist.com`) ; glisser-déposer mesuré OK dans le cadre de GFS (Chromium) ; la puce de calendrier n'est plus un `<button draggable>` (élément `role="button"` `tabindex="0"`, Entrée l'ouvre) ; reste à faire essayer la puce au porteur sous Firefox
- 008 · faite · `0b8bca7` · `kit/` à `8afa569` (commit à part, `7c6cc33`, le même pour la 010) ; `gfs.json` déclare `permissions.identite` avec sa raison en français et en anglais ; « Mes tâches » prend `GfsLink.identity()` puis `onIdentity` (`App.suivreIdentite`), compare l'adresse en minuscules à la colonne de courriels de la table des personnes (une colonne de texte dont le nom parle de courriel ; pour un responsable en texte libre, l'adresse écrite telle quelle) ; `null` ou adresse inconnue : « Je suis… » sert, et il est grisé avec sa raison quand l'adresse reconnaît déjà la personne ; rien n'est écrit dans les réglages de la vue ; essais avec `createGfsLink` (`test/identite.test.mjs`) ; la lecture de l'e-mail par l'API de Grist seule reste à mesurer dans le labo avant d'être codée
- 009 · lue (04/11) · adressée au fil Calendar+, qui l'a reçue ; chez Tuesday, `test/grist/lancer-grist.sh` fixe `gristlabs/grist:1.7.19` (`0b8bca7`), 11 essais sur 11 dans cette version
- 010 · faite · `0b8bca7` · `Ambiance.start()` une fois dans `js/main.js`, avant d'afficher ; les feuilles lisent les jetons : arrondis (`--radius-xs|md|lg|pill|btn|panel`), bouton plein (`--fill`, `--fill-hover`, `--fill-line`), titre de l'app (`--font-head` et ses voisins), ombre du panneau, fond `--bg` avec `--wash` et `--wash-size` sur `.tu-app` (jamais `--main-bg`), chacun avec sa valeur d'origine en repli ; couleurs en dur : aucune, sauf le noir mêlé au texte d'une pastille, d'une barre ou d'une puce dont le fond est un choix coloré de Grist (une donnée, liste justifiée dans `test/hygiene.test.mjs`) ; essais : message d'exemple du kit posé dans Chromium (clair, sombre, contraste 4,5 du texte, retour à `null`), grille de calendrier provisoire comprise, et des essais de feuilles ; une feuille oubliée par `index.html` (`miseenplace.css`) a été retrouvée et liée

## Changements qui touchent GFS
- 2026-11-04 · `0b8bca7` · `permissions.identite` déclarée ; `kit/` à `8afa569` ; version 0.1.2 ; `Ambiance.start()`
- 2026-11-03 · `1bc3a17` · `Tuesday_Liens` créée avec l'accord de la personne au premier lien : colonnes `Table`, `Ligne`, `App`, `Fichier`, `Type`, `Nom`, `Cree` ; `kit/` à `9d17844`
- 2026-11-02 · `d958504` · V1 0.1.0 : app complète en démonstration hors de Grist ; clés de stockage `tuesday.<document>.<projet>` (au plus 64 caractères), `tuesday.<document>.src.<table>`, `tuesday_theme`, `tuesday_lang` ; table `Tuesday_Projets` créée seulement après l'accord de la personne ; `Tuesday_Liens` pas encore créée

## Questions pour GFS
- Réglées par la 007 (03/11) : le script d'API de Grist vient de `docs.getgrist.com` dans les deux modes ; le glisser-déposer marche dans le cadre de GFS (Chromium ; Firefox, tactile et clavier non mesurés)

## Demandes à GFS
- Calendrier : voie A choisie le 03/11 (006) ; la grille de mois de Tuesday est provisoire jusqu'au module du kit
- Liens entre apps : branchés (005) ; à mesurer dans GFS dès l'entrée de Tuesday au catalogue
- Entrée de Tuesday au catalogue de GFS : à demander quand l'app sera prête (005, point 5)
- Identité : réglée par la 008 (04/11), l'adresse vient de GFS à qui la déclare ; seul, la lecture par l'API de Grist reste à mesurer puis à coder
