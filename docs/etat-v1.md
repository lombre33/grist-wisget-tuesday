# État de la V1 de Tuesday (03/11/2026, version 0.1.9)

Ce document dit **ce qui existe, ce qui est mesuré, ce qui ne l'est pas, et ce que GFS doit rejouer**. Il remplace la lecture du code pour qui reprend le travail.

## 1. Ce qui est fait

| Domaine | Contenu |
|---|---|
| Premier lancement | **L'outil d'abord** (03/11) : l'outil est complet dès l'arrivée, sur ses données si une table est reconnue (lecture), sinon sur un aperçu vide ; la mise en place s'ouvre en **pop-up** (accès, table, colonnes, un schéma par étape), se ferme d'un geste et revient à la première écriture, avec la tâche tapée gardée ; créer la table de tâches nomme ce qui sera créé ; « Garder pour l'équipe » crée `Tuesday_Projets` après accord (`docs/onboarding.md`) |
| Vues | Tableau (sous-tâches repliables, groupes, ajout rapide au clavier), Kanban (glisser-déposer, tri manuel / échéance / priorité), Chronologie (barres, jalons, ligne d'aujourd'hui, déplacer et redimensionner, 4 zooms), Calendrier (le module du kit : mois, semaine, jour, plateau « Sans date »), fiche de tâche à côté ou par-dessus |
| Gestes | Changer statut, responsable, dates, priorité, étiquettes, parent ; case à cocher ; ajouter ; supprimer avec accord ; Annuler / Rétablir 100 % (Ctrl+Z, Ctrl+Y) ; clavier : N, /, Échap |
| Recherche et filtres | Recherche, statut, responsable, priorité, étiquettes, « en retard », « mes tâches » ; étiquettes visibles qu'on retire d'un clic ; mémorisés par document et par projet |
| Lecture seule | Tout se voit, chaque geste d'écriture est grisé avec sa raison |
| Charte | Gris + un bleu, jetons du kit, français et anglais ensemble, clair et sombre, 700 × 400 |
| Écritures | Optimistes avec retour arrière si Grist refuse ; rien n'est écrit pour un rôle absent ou une colonne à formule ; changements venus d'ailleurs repris sans rechargement |

## 2. Ce qui est mesuré, et comment

- **208 essais unitaires** (`node --test "test/*.test.mjs"`) : dates civiles, correspondance de colonnes, écritures, arbre de tâches, filtres, rangs, historique, chronologie, réglages, textes fr/en, hygiène du code (tailles, jetons, CSP, `.nojekyll`, `?v=`).
- **30 essais dans Chromium** (`node test/navigateur/essais.cjs`) à 700 × 400, clair et sombre, français et anglais, souris et clavier, sans violation de la politique de sécurité. Les captures sortent dans `test/navigateur/captures/`.
- Ces essais tournent **contre notre démonstration en mémoire** (`js/data/demo.js`), pas contre Grist.

## 2 bis. Le vrai Grist de test (`test/grist/`)

Décision du porteur (03/11) : l'app ne tourne **jamais hors de Grist**, et ses essais se font dans une instance Grist. `test/grist/lancer-grist.sh` lance l'image officielle (docker, port 8484) ; `node test/grist/essais.cjs` (`npm run test:grist`) y crée un document, y pose Tuesday comme widget personnalisé et le pilote à la souris et au clavier, puis relit les tables par l'API de Grist. Il a déjà trouvé quatre défauts que la démonstration en mémoire cachait (dates rendues en objets Date par `onRecords`, menu derrière la fiche, clic sur une cellule qui ouvrait la fiche, refus d'accès non rattrapé). L'app livrée n'a plus ni démonstration ni `window.__tuesday` : le port en mémoire est `test/support/demo.js`, pour les essais unitaires et la suite rapide du navigateur.

## 3. Ce qui reste à mesurer

Mesuré dans le Grist de test (03/11) : l'adaptateur (`fetchTable`, `applyUserActions`, `onRecords` comme signal), `AddTable` de `Tuesday_Projets` avec relecture de l'identifiant réel, les couleurs des choix, les dates en jours civils, le glisser-déposer du kanban et la capture du pointeur de la chronologie dans le cadre du widget, le refus d'accès.

Pas encore mesuré :
1. **Dans le cadre de GFS** (bac à sable) : glisser-déposer, pointeur, stockage, barre. À faire au labo de GFS.
2. L'instance Grist de la **DINUM** : le script de l'API des widgets est demandé à `docs.getgrist.com` (la page de Tuesday doit-elle le prendre sur l'instance ?). L'API pose aussi une feuille de style de thème que la politique de sécurité refuse (sans effet).
3. Un document en **lecture seule** réelle (droits d'accès) et d'autres types de colonnes (listes de références, DateTime avec fuseau) dans le vrai Grist.
4. Annuler après `AddTable`.

## 4. Ce que GFS doit rejouer

- **Manifeste** : `gfs.json` à la racine (contrat 0, type unique « Projet », `Tuesday_Projets`, lecture de `_grist_Tables` et `_grist_Tables_column`, accès complet). À valider, voir `docs/demandes-a-gfs.md`, 3.
- **Table** : `Tuesday_Projets` (une colonne texte par rôle, `Reglages`, `Schema`), créée seulement après l'accord de la personne.
- **Clés de stockage** : `tuesday.<document>.<projet>` (filtres, tri, groupe, zoom, vue ; au plus 64 caractères), `tuesday.<document>.src.<table>` (mémo de la table source), `tuesday_theme`, `tuesday_lang`. Via le stockage de GFS quand l'app est hébergée, sinon `localStorage` dans un `try/catch`.
- **Rien d'autre** : Tuesday n'importe aucune autre app, n'écrit rien dans les tables des autres.

## 5. Limites connues de la V1

- Le calendrier est le module de Calendar+ rangé dans le kit (0.8.0, consigne 011) : mois, semaine, jour, plateau « Sans date » ; les heures et la saisie rapide demandent encore des colonnes DateTime.
- Pas de dépendances (flèches), de charge, de synthèse, de récurrence (V2) ni de liens vers les fichiers de GFS, commentaires, temps (V3).
- Un seul projet ouvert à la fois ; « Mes tâches » repose sur un « Je suis… » choisi dans le navigateur.
- Le calendrier attend le module de Calendar+ (hôte prêt, `js/ui/calendrier-hote.js`) ; « Mes tâches » attend l'identité (cahier 5.5).
