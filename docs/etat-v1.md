# État de la V1 de Tuesday (02/11/2026, version 0.1.0)

Ce document dit **ce qui existe, ce qui est mesuré, ce qui ne l'est pas, et ce que GFS doit rejouer**. Il remplace la lecture du code pour qui reprend le travail.

## 1. Ce qui est fait

| Domaine | Contenu |
|---|---|
| Premier lancement | Écran « Confirmez les colonnes » toujours affiché d'abord, déjà rempli ; rien n'est écrit avant « Ouvrir » ; « Garder pour l'équipe » crée `Tuesday_Projets` après accord nommant la table ; écran d'attente d'accès (3 s sans réponse) ; écran « aucune table » avec modèle de départ optionnel |
| Vues | Tableau (sous-tâches repliables, groupes, ajout rapide au clavier), Kanban (glisser-déposer, tri manuel / échéance / priorité), Chronologie (barres, jalons, ligne d'aujourd'hui, déplacer et redimensionner, 4 zooms), Calendrier **provisoire** (grille du mois, puces déplaçables), fiche de tâche à côté ou par-dessus |
| Gestes | Changer statut, responsable, dates, priorité, étiquettes, parent ; case à cocher ; ajouter ; supprimer avec accord ; Annuler / Rétablir 100 % (Ctrl+Z, Ctrl+Y) ; clavier : N, /, Échap |
| Recherche et filtres | Recherche, statut, responsable, priorité, étiquettes, « en retard », « mes tâches » ; étiquettes visibles qu'on retire d'un clic ; mémorisés par document et par projet |
| Lecture seule | Tout se voit, chaque geste d'écriture est grisé avec sa raison |
| Charte | Gris + un bleu, jetons du kit, français et anglais ensemble, clair et sombre, 700 × 400 |
| Écritures | Optimistes avec retour arrière si Grist refuse ; rien n'est écrit pour un rôle absent ou une colonne à formule ; changements venus d'ailleurs repris sans rechargement |

## 2. Ce qui est mesuré, et comment

- **188 essais unitaires** (`node --test "test/*.test.mjs"`) : dates civiles, correspondance de colonnes, écritures, arbre de tâches, filtres, rangs, historique, chronologie, réglages, textes fr/en, hygiène du code (tailles, jetons, CSP, `.nojekyll`, `?v=`).
- **25 essais dans Chromium** (`node test/navigateur/essais.cjs`) à 700 × 400, clair et sombre, français et anglais, souris et clavier, sans violation de la politique de sécurité. Les captures sortent dans `test/navigateur/captures/`.
- Ces essais tournent **contre notre démonstration en mémoire** (`js/data/demo.js`), pas contre Grist.

## 3. Ce qui n'est PAS mesuré (à faire dans le labo de GFS, un vrai Grist)

1. L'adaptateur `js/data/grist.js` (`onRecords`, `fetchTable`, `applyUserActions`, interrogation toutes les 20 s des autres tables) n'a jamais parlé à un vrai Grist.
2. `AddTable` avec `widgetOptions` des colonnes de `Tuesday_Projets` et relecture de l'identifiant réel ; droits d'`AddTable` ; Annuler après `AddTable`.
3. Ce que Grist envoie avant l'accès complet (l'écran d'attente se base sur un délai de 3 s).
4. Glisser-déposer (kanban, calendrier) et capture du pointeur (chronologie) dans l'iframe du bac à sable de GFS.
5. Le script de l'API de Grist est chargé depuis `docs.getgrist.com` ; à vérifier sur l'instance de la DINUM.
6. Couleurs et choix d'un statut lus dans `_grist_Tables_column` : forme exacte du `widgetOptions` sur de vrais documents.

## 4. Ce que GFS doit rejouer

- **Manifeste** : `gfs.json` à la racine (contrat 0, type unique « Projet », `Tuesday_Projets`, lecture de `_grist_Tables` et `_grist_Tables_column`, accès complet). À valider, voir `docs/demandes-a-gfs.md`, 3.
- **Table** : `Tuesday_Projets` (une colonne texte par rôle, `Reglages`, `Schema`), créée seulement après l'accord de la personne.
- **Clés de stockage** : `tuesday.<document>.<projet>` (filtres, tri, groupe, zoom, vue ; au plus 64 caractères), `tuesday.<document>.src.<table>` (mémo de la table source), `tuesday_theme`, `tuesday_lang`. Via le stockage de GFS quand l'app est hébergée, sinon `localStorage` dans un `try/catch`.
- **Rien d'autre** : Tuesday n'importe aucune autre app, n'écrit rien dans les tables des autres.

## 5. Limites connues de la V1

- Le calendrier est une grille de mois provisoire, à remplacer par le module de Calendar+ (dépôt sans code pour l'instant).
- Pas de dépendances (flèches), de charge, de synthèse, de récurrence (V2) ni de liens vers les fichiers de GFS, commentaires, temps (V3).
- Un seul projet ouvert à la fois ; « Mes tâches » repose sur un « Je suis… » choisi dans le navigateur.
- `window.__tuesday` est exposé pour les essais du navigateur (à retirer ou garder : carte de décision).
