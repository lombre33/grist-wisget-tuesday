# GFS-ETAT : Tuesday

Mis à jour le 2026-11-02, au commit `d958504` (le dernier commit de code que cette page décrit).

## Consignes
- 001 · faite · `d958504` · guide lu ; aucun écart avec la 1.1 (tables préfixées `Tuesday_`, aucune table sans accord, identifiant relu après `AddTable`, aucun import d'une autre app, aucune lecture de `document.referrer`, `addEventListener` seul côté kit, stockage dans `try/catch` puis par GFS). Réserve : la règle 4 préfère une ligne réservée ; `Tuesday_Liens` sera une table de plus, justifiée en 5.5 du cahier (consigne 002)
- 002 · lue · `gfs.json` inchangé depuis la validation ; barre : gouttière aux quatre bords par `GfsLink.onBar`, testée (`d958504`) ; « Lier un fichier » (fiche) grisé avec sa raison ; reste à mesurer dans GFS
- 003 · lue · rien à coder ; « Mes tâches » = « Je suis… » retenu par le stockage de GFS ; « Automatiser… » grisé avec sa raison
- 004 · lue · rien à coder chez Tuesday

## Changements qui touchent GFS
- 2026-11-02 · `d958504` · V1 0.1.0 : app complète en démonstration hors de Grist ; clés de stockage `tuesday.<document>.<projet>` (au plus 64 caractères), `tuesday.<document>.src.<table>`, `tuesday_theme`, `tuesday_lang` ; table `Tuesday_Projets` créée seulement après l'accord de la personne ; `Tuesday_Liens` pas encore créée

## Questions pour GFS
- Le script de l'API de Grist se charge depuis `docs.getgrist.com` : est-ce acceptable sur l'instance de la DINUM, ou le courtier le fournit-il ?
- Le glisser-déposer HTML5 (kanban, calendrier) fonctionne-t-il dans le sous-cadre de GFS ? À mesurer au labo

## Demandes à GFS
- Calendrier : voie A (module du kit) ou B, décision du porteur en attente chez GFS ; la grille de mois de Tuesday est provisoire
- Liens entre apps : `choisir` et `ouvrir` (construction maintenant ou plus tard, décision du porteur) ; Tuesday les attend pour activer « Lier un fichier »
- Identité de la personne reconnue d'office (« Mes tâches ») : confort pour plus tard
