# GFS-ETAT : Tuesday

Mis à jour le 2026-11-03 (consignes 005 à 007 lues), au commit `d958504` (le dernier commit de code que cette page décrit).

## Consignes
- 001 · faite · `d958504` · guide lu ; aucun écart avec la 1.1 (tables préfixées `Tuesday_`, aucune table sans accord, identifiant relu après `AddTable`, aucun import d'une autre app, aucune lecture de `document.referrer`, `addEventListener` seul côté kit, stockage dans `try/catch` puis par GFS). Réserve : la règle 4 préfère une ligne réservée ; `Tuesday_Liens` sera une table de plus, justifiée en 5.5 du cahier (consigne 002)
- 002 · lue · `gfs.json` inchangé depuis la validation ; barre : gouttière aux quatre bords par `GfsLink.onBar`, testée (`d958504`) ; « Lier un fichier » (fiche) grisé avec sa raison ; reste à mesurer dans GFS
- 003 · lue · rien à coder ; « Mes tâches » = « Je suis… » retenu par le stockage de GFS ; « Automatiser… » grisé avec sa raison
- 004 · lue · rien à coder chez Tuesday
- 005 · lue (03/11) · à faire au prochain lot qui touche les liens : avancer `kit/` à `9d17844` (commit à part), « Lier un fichier » → `GfsLink.choose`, « Ouvrir » → `GfsLink.openFile`, `GFS_INTROUVABLE` grise le lien sans le supprimer, `onOpen` avec `raison: "lien"` ouvre le projet désigné ; essais avec `createGfsLink`
- 006 · lue (03/11) · rien à changer dans Tuesday : le calendrier est un module du kit (voie A) ; l'hôte vise déjà `kit/js/calendrier/index.js` et retombe sur la grille provisoire ; l'entrée du module (`creerCalendrier(rappels)` chez Tuesday, `creerCalendrier(element, options)` chez Calendar+) doit devenir une seule forme avant le premier déplacement dans le kit
- 007 · lue (03/11) · script d'API de Grist gardé (`docs.getgrist.com`, deux modes) ; glisser-déposer mesuré OK dans le cadre de GFS (Chromium) ; à faire : la puce de calendrier est un `<button draggable>`, qui ne glisse pas sous Firefox avant la 147 → `draggable` sur un élément qui n'est pas un bouton (`tabindex`, `role`) ou essai du porteur sous Firefox

## Changements qui touchent GFS
- 2026-11-02 · `d958504` · V1 0.1.0 : app complète en démonstration hors de Grist ; clés de stockage `tuesday.<document>.<projet>` (au plus 64 caractères), `tuesday.<document>.src.<table>`, `tuesday_theme`, `tuesday_lang` ; table `Tuesday_Projets` créée seulement après l'accord de la personne ; `Tuesday_Liens` pas encore créée

## Questions pour GFS
- Réglées par la 007 (03/11) : le script d'API de Grist vient de `docs.getgrist.com` dans les deux modes ; le glisser-déposer marche dans le cadre de GFS (Chromium ; Firefox, tactile et clavier non mesurés)

## Demandes à GFS
- Calendrier : voie A choisie le 03/11 (006) ; la grille de mois de Tuesday est provisoire jusqu'au module du kit
- Liens entre apps : construits (005, kit 0.3.0 à `9d17844`) ; Tuesday les branche au prochain lot
- Entrée de Tuesday au catalogue de GFS : à demander quand l'app sera prête (005, point 5)
- Identité et permissions centralisées par GFS, exposées à chaque app (décision du porteur, 03/11) ; seul, Tuesday lit l'email par l'API Grist ; forme de l'identité à fixer avec GFS
