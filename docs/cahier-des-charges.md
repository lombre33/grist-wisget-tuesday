# Cahier des charges : Tuesday

Gestion de projet pour Grist, dans Grist Factory Suite (GFS). Version 0.3 du 02/11/2026, rédigée avec la maquette V1 (`../maquettes/index.html`). **0.2 : retours du porteur intégrés** (Calendrier à part, tables et donnée référençable partout, intégration entre apps dès la V1) ; détail dans `integration-suite.md`. **0.3 : analyse des besoins du forum croisée avec le cahier** (section 1.4, copie de la source dans `sources/besoins-forum-gfs.md`) et **noyau de la V1 proposé** (section 11.1). Les raisons de chaque choix viennent de l'étude de l'existant (`etude-existant.md`), des documents de GFS (cahier, guide des apps, contrats) et de la charte Grist Factory (section 1).

**Nom.** « Tuesday » est le nom de travail, celui du dépôt. Les documents de GFS parlent de « Thusday » (faute de frappe probable). Les identifiants proposés ici : app `tuesday`, tables `Tuesday_…`. À confirmer (section 13, question 1).

## En bref

- **Priorité n°1 : l'onboarding et la fluidité** (principe 0, section 2).
- **Ce que c'est.** Un widget Grist qui montre les lignes d'une table comme un projet : un **tableau**, un **kanban** et une **chronologie**, avec une **fiche** par tâche ; le **calendrier** est un widget à part que Tuesday intègre (`integration-suite.md`, 1). Inspiré de monday.com pour la clarté, volontairement bien plus simple.
- **Ce qu'il fait de différent.** Il travaille **avec** la donnée de la personne : il se **branche sur une table existante** par une correspondance de colonnes choisie dans l'interface, et n'impose aucune structure. Les statuts, les couleurs, les personnes viennent de Grist.
- **Ce qu'il ne fait pas.** Pas de calcul (les formules restent dans Grist), pas de formulaires (Form+), pas d'automatisations (Automation+), pas de tableaux de bord riches (Grist-BI), pas de documents (Publipostage+).
- **Dans GFS.** Un **projet** est un fichier de l'explorateur de GFS (une ligne de la table `Tuesday_Projets`). Tuesday suit les contrats de GFS : manifeste `gfs.json`, kit commun en sous-module, langue et barre de GFS, stockage par le courtier, grisé jamais masqué.
- **Livraison.** Pages statiques sur GitHub Pages, sans étape de construction, sans bibliothèque tierce en V1. Utilisé surtout sur l'instance Grist de la DINUM.
- **Tests.** Exhaustifs dès la première ligne de code (section 10).
- **Données.** Navigation libre entre les tables, **deux tables propres au plus**, tout en colonnes lisibles : une tâche se référence de partout dans le document comme une variable de Publipostage+ (section 5.7).
- **Intégration entre apps dès la V1.** Ouvrir un fichier de Publipostage+ (document, grille, présentation) depuis une carte ; ensuite, insérer une carte dans un document (V2, contrat posé dès maintenant).
- **Trois versions.** V1 « Suivre » (tableau, kanban, chronologie, calendrier intégré, fiche, correspondance, fichiers liés), V2 « Piloter » (insertion de carte, dépendances, charge, synthèse, récurrence), V3 « Connecter » (commentaires, temps, portefeuille).

---

## 1. Contexte et vision

### 1.1 Pourquoi

Les équipes qui travaillent dans Grist suivent déjà leur activité dans des tables : actions, dossiers, demandes, chantiers. Pour **les piloter**, elles empruntent des outils extérieurs (monday.com, ClickUp, Trello) ou bricolent des widgets de la communauté. L'étude de l'existant montre que ces widgets répondent au besoin mais butent toujours sur les mêmes points : une structure de tables imposée, un démarrage semé d'erreurs muettes, des listes écrites dans le code, des vues qui ne se parlent pas.

### 1.2 La vision en une phrase

> **Brancher Tuesday sur une table Grist, et voir son travail comme un projet en moins d'une minute, sans rien recréer.**

### 1.3 Ce que Tuesday est, et n'est pas

| Tuesday est | Tuesday n'est pas |
|---|---|
| Une **lentille** posée sur des lignes Grist : voir, déplacer, éditer | Un deuxième endroit où la donnée se stocke |
| Simple d'emblée, plus riche à la demande | Un kanban « hyper sophistiqué » avec workflow, règles et conditions |
| Une app de la suite GFS, qui tourne aussi seule | Un outil qui ne marche que dans GFS |
| Un affichage des valeurs que Grist calcule | Un moteur de calcul |
| Un point d'entrée vers les autres apps de la suite | Une copie de leurs fonctions |

---

### 1.4 Besoins du forum croisés avec le cahier (0.3)

GFS a lu les trois plus gros fils du forum (237 messages) et cinq petits widgets ; la copie de l'analyse est dans [`sources/besoins-forum-gfs.md`](sources/besoins-forum-gfs.md) (le document d'origine fait foi). Ce que ça change, demande par demande :

| Demande du forum (personnes) | Ce que disait le cahier 0.2 | Décision en 0.3 |
|---|---|---|
| Mise en route sans bricolage (plus de 20) | Principe 0, correspondance, démarrage | **Confirmé**, c'est le cœur ; renforcé : rien d'écrit avant un geste, aucune table imposée, liaison refusée si une colonne à formule est choisie pour un rôle qu'on écrit |
| Sous-tâches (11) | Repliables sous la tâche | **Complété** : case à cocher, responsable et échéance propres, affichées dans la chronologie (6.1, 6.4) |
| Filtres qui restent (7) | Filtres et regroupement « mémorisés » | **Précisé** : par projet et par document, jamais une clé commune ; changer de vue ne perd rien (7) |
| Couleurs (7) | Couleurs de Grist pour le statut | **Complété** : « Colorier par » statut, priorité, groupe ou responsable (6.2, 7) |
| Réglages sans toucher au code (7) | Correspondance dans l'interface | **Confirmé** ; « + Statut » du kanban **grisé en V1** (question 13) |
| Vues de temps (6) | Semaine, Mois, Trimestre | **Complété** : Année, plage qui suit les données, ouverture sur aujourd'hui (6.4) |
| Charge et temps passé (5) | V2 | **Inchangé** : V2, une formule de Grist ; indicateur de surcharge jamais par défaut (il fait peur aux équipes) |
| Dépendances (4) | V2 | **Découpé** : repère « Bloquée par » en V1 (colonne Prédécesseurs, sans trait), flèches et recalcul en V2 |
| Plusieurs responsables (4) | V2 (défaut de la question 10) | **Avancé en V1** (question 10) |
| Tri du kanban (4) | « Celui de la vue Grist » | **Changé** : ordre manuel, échéance ou priorité, mémorisé par projet |
| Droits, validation DINUM et ANCT (3) | Risque R10 | **Ajouté** : risque R12 et note de sécurité dès la V1 |

Les pièges déjà rencontrés ailleurs (dates à 1970, J-1, Référence lue comme un numéro, écritures qui reviennent au rechargement, saisies perdues, mises à jour qui n'arrivent pas, 200 à 400 projets) sont devenus des **cas limites** (5.6), des **règles transverses** (7) et des **tests** (10.3). Ce qu'on ne refait pas, conformément à l'analyse : e-mails entrants et alertes (n8n ou Automation+), tableau blanc. *À vérifier avant de s'en servir* : l'analyse dit que Grist intègre un calendrier depuis la 1.7.14 ; je ne l'ai pas vérifié dans cette version, et la décision de Calendrier+ (widget à part, standalone) tient dans tous les cas.


## 2. Principes directeurs

Dans l'ordre : quand deux principes s'opposent, le premier gagne.

0. **Onboarding et fluidité d'abord** (priorité n°1, porteur, 02/11). Un outil qui ne bloque jamais, utilisable pour un projet simple **sans boutons partout** : la première minute est l'étape la plus importante, et chaque choix de ce cahier se juge d'abord à ce critère. Règles qui en découlent : un projet simple n'a besoin d'aucune configuration au-delà de la correspondance ; la barre du haut garde au plus **sept contrôles visibles** à 700 × 400 (projet, quatre vues, recherche, filtre, groupement, ajout) et une fonction avancée se montre quand on en a besoin (menu, fiche), pas avant ; aucune erreur muette ni écran bloquant, toujours une sortie dite en une phrase. L'onboarding détaillé (premier lancement, confirmation des colonnes, modèle de départ, aide) est dans [`onboarding.md`](onboarding.md) : **on confirme toujours d'abord** (décision du porteur, 02/11), sur un écran déjà rempli ; ce cahier en fixe le critère. Une phrase de ce cahier s'en écarte et attend l'accord du porteur : le **Statut n'y est plus obligatoire** (5.2, onboarding ON2).
1. **UX d'abord, simple et efficace.** Chaque écran a une action principale évidente. Quatre vues au premier jour, jamais quinze. Une option nouvelle doit justifier la place qu'elle prend.
2. **On fait AVEC la donnée, pas à la place d'elle.** Aucune structure imposée. Une table existante, une correspondance de colonnes, et c'est parti. Les couleurs des statuts de Grist sont **celles de Grist**.
3. **Grist décide.** Les droits sont ceux de Grist (une personne en lecture seule ne modifie rien), les filtres et le tri de la vue Grist sont respectés, la fiche native reste à un clic.
4. **Pas de calcul dans le widget** (décision de GFS du 09/10). Un retard, un avancement, un total sont des colonnes à formule de Grist que Tuesday affiche.
5. **Grisé, jamais masqué** (charte). Une vue qui manque d'une colonne reste visible, grisée ; un clic dit laquelle relier.
6. **Rien ne se perd, rien ne s'écrit par surprise.** Changements additifs, aucune écriture hors des colonnes reliées, aucune table créée sans accord, et **Annuler/Rétablir couvrent 100 % des actions** (règle de la charte).
7. **Prêt pour GFS dès le premier commit** (guide des apps, 3) : kit, manifeste, liste unique de bibliothèques, charte.
8. **Lisible par l'audit** : modules ES, aucun framework, aucune étape de construction, fichiers sous 600 lignes de code, fonctions sous 81 lignes, complexité 15 au plus.

---

## 3. Personnes et scénarios

### 3.1 Trois profils

| Profil | Ce qu'elle ou il veut | Ce qui la ou le fait fuir |
|---|---|---|
| **Cheffe ou chef de projet** d'un service public (profil de l'instance DINUM) | Voir où en est le projet, déplacer le travail, préparer un point d'équipe | Configurer pendant une heure ; une interface qu'il faut expliquer |
| **Contributrice ou contributeur** | Trouver ses tâches, changer leur statut, ajouter une tâche en dix secondes | Un champ obligatoire inutile ; ne pas savoir ce qui a bougé |
| **Lectrice ou lecteur** (direction, partenaire) | Comprendre l'avancement d'un coup d'œil, sans rien casser | Des boutons qui ne servent pas à ce qu'elle ou il fait |

Une quatrième personne agit une fois : la **constructrice ou le constructeur du document Grist**, qui a les droits de propriétaire. Elle ou il relie la table (section 5.2) ; les autres n'ont jamais à le faire.

### 3.2 Scénarios de référence

Chacun sert de **test d'acceptation de l'interface** (section 10.5).

| N° | Scénario | Critère de réussite |
|---|---|---|
| S1 | La cheffe de projet ajoute Tuesday à une page qui montre sa table de tâches. Elle relie ses colonnes. | Un tableau utile s'affiche en **moins de 60 s et 5 clics** ; les colonnes évidentes sont déjà reconnues |
| S2 | Un contributeur ouvre le kanban et fait glisser sa tâche vers « En cours ». | Un seul geste, la ligne Grist est modifiée, **Ctrl+Z** la rend |
| S3 | La cheffe de projet prépare un point : elle filtre « En retard », regroupe par personne. | Deux clics, sans quitter la vue ; ses choix se retrouvent à la réouverture |
| S4 | Un lecteur ouvre le projet. | Tout est visible, **rien n'est modifiable** (boutons grisés avec leur raison) |
| S5 | La table n'a pas de colonne « Début ». | La chronologie est **grisée** et dit « Reliez une colonne Début et une colonne Échéance » ; les autres vues marchent |
| S6 | Quelqu'un renomme la colonne « Statut » dans Grist. | Tuesday la retrouve par son identifiant ; sinon, un bandeau demande de la relier, sans perte de la configuration |
| S7 | Un utilisateur de GFS ouvre « Projet Site web » depuis l'explorateur. | Le projet s'ouvre sur sa vue de dernière fois, dans la langue de GFS, la barre de GFS dégagée |

---

## 4. Modèle conceptuel

### 4.1 Les objets

```
Document Grist
 ├─ Table des tâches (la leur, existante)   ← « source », jamais copiée
 ├─ Tuesday_Projets  un projet par ligne : source + correspondance + réglages des vues
 └─ Tuesday_Liens    liens d'une tâche vers des fichiers d'autres apps (facultative)

Un projet montre sa source par des vues : Tableau · Kanban · Chronologie · Calendrier (intégré)
```

| Objet | Définition | Où il vit |
|---|---|---|
| **Source** | La table Grist dont les lignes sont les tâches | La table de la personne, jamais copiée |
| **Tâche** | Une ligne de la source | Grist |
| **Correspondance** | Quelle colonne joue quel rôle (titre, statut, personne, début, échéance…) | `Tuesday_Projets` |
| **Projet** | Source + correspondance + réglages de vues ; un fichier de l'explorateur de GFS | `Tuesday_Projets` |
| **Groupe** | Un regroupement de tâches par la valeur d'une colonne (Choice ou Référence) | Calculé à l'affichage |
| **Sous-tâche** | Une tâche dont la colonne « Tâche parente » désigne une autre ligne de la même table | Grist |
| **Vue** | Une manière de montrer les tâches ; les réglages de vue (groupement, champs visibles, zoom) sont gardés par projet | `Tuesday_Projets` |

### 4.2 Pourquoi pas un modèle imposé

C'est ce que font Taskflow et « Gestion de Projet » : ils créent leurs tables (`Tasks`, `Team`, `PM_…`) et cassent dès qu'on y touche. Pour une équipe qui a déjà sa table de suivi (le cas le plus courant sur l'instance DINUM), c'est un mur. Tuesday inverse la logique : **il s'adapte à la table, pas l'inverse**. Pour les équipes qui partent de zéro, un **modèle de départ optionnel** crée une table (section 5.5).

### 4.3 Correspondance avec Monday et ClickUp

| Monday | ClickUp | Tuesday |
|---|---|---|
| Tableau (board) | Liste | Projet |
| Groupe | Statut ou section | Groupe |
| Élément | Tâche | Tâche (ligne Grist) |
| Sous-élément | Sous-tâche | Sous-tâche (Référence vers la même table) |
| Colonne | Champ | Colonne Grist |
| Colonne Statut | Statut | Colonne Choice avec ses couleurs |
| Vue | Vue | Vue (quatre en V1) |
| Mise en miroir, tableaux connectés | Relations | Colonnes Référence de Grist |

---

## 5. Données

### 5.1 Principes (contrats de GFS, 5.3)

- Tuesday **lit** la table source et **écrit** uniquement dans les colonnes reliées, sur un geste de la personne.
- Changements **additifs** : jamais de colonne renommée, supprimée ou recréée ; une colonne inconnue est tolérée ; **jamais d'écriture dans une colonne absente** (une seule annule tout le lot).
- Après un `AddTable`, l'identifiant réel de la table est relu (Grist retire les accents et les « _ » de tête).
- La table `Tuesday_Projets` est créée **avec l'accord de la personne**, une fois. Le préfixe de l'app est `Tuesday_` (contrats 2.3 : le préfixe finit par « _ »).
- La structure de la source n'est jamais modifiée, sauf le modèle de départ (5.5), sur demande.

### 5.2 Les rôles de colonnes

| Rôle | Type Grist accepté | V1 | Sert à | Si absent |
|---|---|---|---|---|
| **Titre** | Texte | obligatoire | Nommer la tâche | Tuesday n'ouvre pas : bandeau « Reliez une colonne de titre » |
| **Statut** | Choice | obligatoire | Colonnes du kanban, pastilles, groupes | Kanban grisé ; le tableau ne groupe plus par statut |
| **Responsable** | Référence ; Liste de références ; Texte | facultatif | Avatar, filtre « Mes tâches », regroupement, charge (V2). **Plusieurs responsables dès la V1** si la colonne est une Liste de références | Colonne masquée dans la fiche et les cartes |
| **Prédécesseurs** | Liste de références vers la même table | facultatif | Repère « Bloquée par… » (V1, sans trait) ; flèches de la chronologie (V2) | Pas de repère |
| **Début** | Date, DateTime | facultatif | Chronologie, calendrier | Chronologie grisée |
| **Échéance** | Date, DateTime | facultatif | Calendrier, retards, chronologie | Calendrier et chronologie grisés |
| **Priorité** | Choice | facultatif | Repère de priorité | Pas de repère |
| **Étiquettes** | Liste de choix | facultatif | Puces sur la carte | Pas de puces |
| **Tâche parente** | Référence vers la même table | facultatif | Sous-tâches | Pas de sous-tâches |
| **Groupe** | Choice, Référence | facultatif | Sections du tableau et couloirs | Un seul groupe |
| **Avancement** | Numérique (0 à 100 ou 0 à 1) | facultatif | Barre de progression | Pas de barre |
| **Ordre** | Numérique | facultatif | Rang manuel dans une colonne du kanban | Glisser vers une autre colonne seulement ; réordonner est grisé |
| **Description** | Texte | facultatif | Fiche | Fiche sans description |

- **Reconnaissance automatique** à la première liaison : par type d'abord (une seule colonne Choice ⇒ candidate au statut), puis par nom (statut, état, status ; responsable, assigné, owner ; début, start ; échéance, deadline, due ; avec accents, casse et ponctuation ignorés). Chaque reconnaissance est **proposée**, jamais appliquée en silence.
- **Les colonnes non reliées** restent consultables dans la fiche (liste « Autres champs », en lecture et édition selon leur type), pour que rien de la donnée ne reste caché.
- **Les colonnes à formule** sont affichées et jamais écrites.

### 5.3 Ce que Tuesday lit dans Grist

| Besoin | Moyen | Déclaré dans le manifeste |
|---|---|---|
| Lignes de la source | API des widgets (`onRecords`, `fetchSelectedTable`) | `lit` |
| Liste des tables et colonnes, types | `_grist_Tables`, `_grist_Tables_column` | `gristInterne`, lecture |
| **Choix et couleurs** d'une colonne Choice | `widgetOptions` de `_grist_Tables_column` (choix, couleurs de fond et de texte) | idem |
| Nom affiché d'une Référence | colonne affichée (`visibleCol`) | idem |
| Filtres et tri de la vue Grist | rendus par l'API pour la section liée | — |
| Ligne sélectionnée | `onRecord`, `setCursorPos` | — |

La source est la table de la **section** du widget (le choix naturel : « Sélectionner les données » de Grist). Un projet peut aussi viser une autre table : Tuesday la lit alors par la liste des tables.

### 5.4 Écritures

| Geste | Écriture | Annulable |
|---|---|---|
| Changer de statut (clic ou glisser) | `UpdateRecord` sur la colonne Statut | oui |
| Changer de responsable | idem | oui |
| Déplacer ou redimensionner une barre, déposer sur un jour | `UpdateRecord` sur Début et/ou Échéance | oui |
| Ajouter une tâche | `AddRecord` avec le titre, le groupe ou le statut du contexte | oui |
| Réordonner | `UpdateRecord` sur Ordre (rang fractionnaire) | oui |
| Modifier un champ dans la fiche | `UpdateRecord` | oui |
| Supprimer | `RemoveRecord`, après confirmation par une fenêtre du widget | oui, rend la ligne |
| Enregistrer un projet ou ses réglages | `Tuesday_Projets` | oui |

**Annuler/Rétablir** garde l'inverse de chaque action (ancienne valeur par colonne), dans l'ordre, et **n'écrase jamais** une valeur qu'une autre personne a changée depuis : le coin d'état le dit (même principe que `ActionHistory` de Publipostage+). Un lot d'écritures (un glisser qui change deux colonnes) est un pas.

### 5.5 Les tables `Tuesday_Projets` et `Tuesday_Liens`, et le modèle de départ

**Deux tables au plus**, créées avec l'accord de la personne : `Tuesday_Projets` (ci-dessous) et `Tuesday_Liens` (liens d'une tâche vers des fichiers d'autres apps, `integration-suite.md`, 3.1). Proposition de colonnes (additif, versionné par `Schema`) :

| Colonne | Contenu |
|---|---|
| `Nom` | Nom du projet (colonne `nom` de l'explorateur) |
| `TypeProjet` | `projet` (valeur unique en V1) |
| `Dossier` | Rangement dans GFS |
| `DateModif` | Dernière modification |
| `Source` | Identifiant de la table source |
| `ColTitre`, `ColStatut`, `ColResponsable`, `ColDebut`, `ColEcheance`, `ColPriorite`, `ColEtiquettes`, `ColParente`, `ColGroupe`, `ColAvancement`, `ColOrdre`, `ColDescription` | L'identifiant de la colonne qui joue chaque rôle (texte) |
| `Reglages` | Texte JSON : vue par défaut, groupement, champs visibles, zoom de la chronologie, repli des groupes |
| `Schema` | Numéro de version de la structure |

Les identifiants de colonnes sont des colonnes de texte et non un seul JSON : on les **voit et on les corrige** depuis Grist. Seuls les réglages d'affichage, sans valeur pour la donnée, sont en JSON.

**Modèle de départ (facultatif).** Pour qui n'a pas de table : « Créer un modèle de départ » propose une table de tâches nommée par la personne, avec les colonnes recommandées (titre, statut avec cinq choix colorés, responsable, début, échéance, priorité) et quelques lignes d'exemple, **uniquement après accord**, avec la liste de ce qui sera créé. C'est une table de la personne, pas une table `Tuesday_`.

### 5.6 Cas limites à traiter (chacun a ses tests)

Table vide ; ligne sans statut (rangée dans une colonne « Sans statut », jamais perdue) ; statut absent de la liste des choix (affiché tel quel, grisé) ; référence cassée ; dates invalides, fin avant début ; dates avec heure (la date locale suffit) ; milliers de lignes (affichage fenêtré, section 9.4) ; titre très long (tronqué par « … ») ; colonne reliée supprimée ou renommée ; document en lecture seule ; Choice sans couleur ; plusieurs responsables ; sous-tâche dont le parent est filtré. Pièges relevés sur le forum (chacun a son test) : date `0` ou vide qui s'affiche `01/01/1970` ; le 31/12 qui passe en janvier de l'année suivante ; échéance à J-1 par le fuseau horaire (un jour civil se lit en UTC, jamais en heure locale) ; **aucune date fictive** pour ranger une carte sans date ; valeur d'une Référence lue comme un numéro (toujours passer par la colonne affichée) ; colonne à formule reliée à un rôle qu'on écrit (refusée **à la liaison**, pas à l'écriture, avec la raison « Can't save value to formula column » traduite) ; ligne ajoutée puis masquée par le filtre de la vue Grist (« Ajoutée, mais masquée par le filtre de la vue ») ; table devenue illisible par une règle d'accès (message clair, jamais des données périmées) ; colonne renommée par Grist après conflit (`Email2`) ; écriture refusée (l'affichage revient en arrière avec la raison de Grist, jamais une modification qui revient seule au rechargement).

### 5.7 Naviguer entre les tables, référencer la donnée partout

Retour du porteur (02/11) : comme dans GFS et Publipostage+, **on navigue entre les tables sans souci**, et la donnée se récupère et se référence **de partout dans le document, aussi efficacement que les variables de Publipostage+**. Trois règles (détail : `integration-suite.md`, 2) :

1. **Colonnes lisibles, rien de caché.** Tout ce que Tuesday sait d'une tâche est une colonne de Grist ; une variable de Publipostage+, une formule, un widget lié ou Automation+ la lisent sans passer par Tuesday.
2. **Deux tables propres au plus**, à colonnes stables et versionnées (`Schema`), documentées dans `docs/donnees.md` (à écrire avec le modèle).
3. **Navigation** : changer de projet sans quitter le widget ; un clic sur une valeur Référence ouvre la ligne liée avec son fil d'Ariane ; « Ouvrir dans Grist » place le curseur sur la ligne.

---

## 6. Les vues

Toutes les vues partagent la **barre du haut** : sélecteur de projet, onglets de vue, recherche, filtre, regroupement, bouton « + Tâche ». Une fonction indisponible est grisée. Le détail visuel est dans la maquette.

### 6.1 Tableau (vue par défaut)

**But** : voir toutes les tâches d'un coup d'œil et en changer les valeurs sur place. **C'est la vue que monday.com a rendue célèbre.**

- Sections **repliables** par groupe (colonne Groupe ou, à défaut, Statut), avec leur nombre de tâches.
- Colonnes : Tâche, Statut (pastille cliquable), Responsable (avatar et nom), Échéance (en rouge si en retard et non terminée, texte « En retard » pour qu'elle ne soit pas portée par la couleur seule), Priorité. Les autres champs s'ajoutent par « Colonnes visibles » (V1).
- **Sous-tâches** repliables sous leur tâche.  Chaque sous-tâche a sa **case à cocher**, son **responsable** et son **échéance** (onze personnes les demandent sur le forum) ; l'avancement d'une tâche mère vient d'une colonne de Grist (formule), jamais de Tuesday.
- Ligne « + Ajouter une tâche » en bas de chaque groupe : on tape le titre, Entrée, la ligne existe dans Grist.
- Édition sur place : clic sur un statut (menu des choix), double-clic sur un titre, clic sur une date.
- Clic sur une ligne : ouvre la **fiche**.

### 6.2 Kanban

**But** : voir et déplacer le travail par étape.

- Une colonne par choix de la colonne Statut, **dans l'ordre et avec les couleurs de Grist** ; une colonne « Sans statut » seulement s'il y a des lignes sans statut.
- Cartes volontairement **pauvres** : titre, échéance, priorité, responsable, une étiquette. Pas de mise en page de carte à configurer en V1.
- **Glisser-déposer** : vers une autre colonne = changer le statut ; dans la colonne = réordonner (si une colonne Ordre est reliée, sinon grisé avec sa raison).
- **Tri** des cartes dans une colonne : ordre manuel (défaut), échéance ou priorité (menu « Affichage »). **« Colorier par »** : statut (défaut), priorité, groupe ou responsable.
- **« + Statut »** en fin de ligne de colonnes : **grisé avec sa raison** en V1 (les statuts se nomment dans Grist ; question 13).
- « + Ajouter » en bas de chaque colonne.
- Colonnes repliables ; nombre de cartes dans l'en-tête. **Pas de limites de travail en cours, pas de règles d'entrée** : c'est le territoire d'Automation+.
- Option V1 : **couloirs** (regroupement par ligne, par responsable ou groupe), repliés par défaut.

### 6.3 Calendrier (widget à part, intégré)

**Décision du porteur (02/11)** : le calendrier est un **widget à part**, qui marche seul, et que Tuesday intègre pour son usage. Voie proposée : un module du kit monté par les deux (`integration-suite.md`, 1). En V1 de Tuesday, l'onglet existe, **grisé avec sa raison** tant que le module n'est pas là. La maquette montre l'écran cible.

**But** : voir ce qui tombe quand.

- Mois et semaine. **La semaine commence le lundi**, le calendrier s'ouvre sur **aujourd'hui**, les **numéros de semaine** sont affichés (les trois défauts du calendrier officiel signalés par la communauté).
- Une tâche s'affiche sur son échéance (et sur la durée Début → Échéance dans la vue semaine).
- Glisser une tâche sur un autre jour = changer sa date (Début et Échéance gardent leur écart).
- Un plateau **« Sans date »** montre les tâches à planifier ; les déposer sur un jour leur donne une date.
- Une journée très chargée affiche « +n » ; un clic ouvre la liste du jour.

### 6.4 Chronologie

**But** : voir l'enchaînement et la durée, sans prétendre remplacer un logiciel de planification.

- Une ligne par tâche, groupée comme le tableau ; une barre du Début à l'Échéance, **colorée selon le statut**, remplie selon l'Avancement s'il est relié.
- **Ligne du jour**, ouverture sur aujourd'hui, zoom **Semaine, Mois, Trimestre, Année** ; la plage suit les données (un projet sur deux années ne bute sur aucune borne) ; les **sous-tâches** s'affichent sous leur tâche.
- Déplacer une barre ou tirer ses extrémités change les dates. Une tâche sans date est rangée dans le plateau « Sans date ».
- **Jalons** : une tâche dont Début = Échéance s'affiche en losange.
- **Repère « Bloquée par… »** (V1, si la colonne Prédécesseurs est reliée) : pastille dans le tableau, la chronologie et la fiche, sans trait. Les flèches et le recalcul des dates sont V2 (le recalcul est une formule de Grist ou Automation+, jamais Tuesday).
- **Dépendances** (flèches) : V2. Le bouton existe dès la V1, grisé, avec sa raison.

### 6.5 La fiche d'une tâche

**But** : tout voir et tout modifier sur une tâche, sans quitter la vue.

- Panneau à droite (voir question 5, section 13) : titre modifiable, statut, responsable, dates, priorité, étiquettes, avancement, description.
- **Sous-tâches** : liste à cases, ajout rapide.
- **Autres champs** : toutes les colonnes de la table non reliées, par leur type ; une valeur Référence est cliquable (ligne liée et fil d'Ariane).
- **Fichiers liés** (V1) : documents, grilles, présentations d'autres apps de GFS ; « Lier un fichier… » (action `choisir`), « Ouvrir » (action `ouvrir`).
- « **Ouvrir dans Grist** » : place le curseur de Grist sur la ligne, pour la fiche native et les widgets liés.
- Menu « … » : dupliquer, supprimer (confirmation).
- Menu « … » : « Insérer la carte dans un document… » (V2, action `insérer`).
- V3 : commentaires, temps passé.

### 6.6 Correspondance des colonnes (la première fenêtre)

**But** : la porte d'entrée. Elle doit être **parfaite**, parce que c'est là que les autres widgets perdent leurs utilisateurs.

- Choix de la table par la **liste avec recherche** de la charte.
- Une ligne par rôle ; les colonnes reconnues sont déjà choisies et marquées « Reconnue ». Les rôles obligatoires sont signalés ; les colonnes incompatibles avec un rôle sont grisées (patron emprunté à Advanced Charts).
- Une phrase pour chaque conséquence : « Sans colonne Début, la Chronologie est grisée ».
- Aperçu de ce qui sera écrit : « Tuesday pourra modifier : Statut, Responsable, Début, Échéance ».
- Enregistrer crée ou met à jour la ligne de `Tuesday_Projets` (avec accord si la table n'existe pas).

### 6.7 États à dessiner (tous dans la maquette)

Démarrage sans projet ; table vide ; chargement ; colonne manquante ; lecture seule ; hors GFS (seul) ; erreur d'écriture refusée par Grist (message qui dit quoi faire) ; document sans table.

### 6.8 Vues reportées

| Vue | Version | Raison |
|---|---|---|
| Charge de travail | V2 | Demande forte, demande des estimations et une personne par tâche |
| Synthèse (quatre chiffres et les prochaines échéances) | V2 | Utile aux lecteurs ; les graphiques riches sont à Grist-BI |
| Mon travail (toutes mes tâches de plusieurs projets) | V3 | Demande de l'identité de la personne |
| Portefeuille de projets | V3 | Plusieurs projets dans une vue |

---

## 7. Fonctions transverses

| Fonction | Règle |
|---|---|
| **Recherche** | Mots dans n'importe quel ordre, accents, casse et ponctuation ignorés (charte) ; porte sur le titre et les champs de texte reliés |
| **Filtres rapides** | « Mes tâches », « En retard », par statut, par responsable ; s'ajoutent à ceux de la vue Grist, jamais à leur place. Les filtres sont des étiquettes visibles qu'on retire d'un clic |
| **Regroupement** | Par Groupe, Statut, Responsable, Priorité ; mémorisé par projet |
| **Mémoire des choix** | Filtres, regroupement, tri, zoom et vue active **restent par projet** (clé `tuesday.<document>.<projet>` dans le stockage de GFS : jamais une clé commune à tous les documents, piège relevé sur le forum). Changer de vue ne perd aucun réglage ; ce qui est partagé par l'équipe va dans `Tuesday_Projets.Reglages`, sur un geste |
| **Colorier par** | Statut (couleurs de Grist), priorité, groupe ou responsable ; la couleur ne porte jamais seule le sens |
| **Tri** | Tableau et kanban : **ordre manuel** (défaut), **échéance**, **priorité** ; menu « Affichage », mémorisé par projet (quatre demandes). Il n'écrit rien dans Grist ; l'ordre de la vue Grist reste la base |
| **Annuler / Rétablir** | 100 % des actions, Ctrl+Z / Ctrl+Y, boutons ; jamais dans un champ de saisie |
| **Écritures** | **Optimistes avec retour arrière** : l'affichage change tout de suite ; si Grist refuse (droit, formule, règle), il revient en arrière avec la raison de Grist. Rien ne « revient au rechargement » sans avoir prévenu (six personnes ont rencontré ce piège) |
| **Saisies** | Un champ s'enregistre à sa validation ; rien de ce qu'on tape n'est perdu quand on change de champ ou qu'on ajoute un élément ; la position de défilement est gardée |
| **Version** | Le numéro de version est visible (Réglages, « À propos ») ; GitHub Pages met tout en cache 10 minutes, donc `?v=` monté à chaque lot : « forcer avec Ctrl+F5 » n'est jamais une réponse |
| **Beaucoup de projets** | Le sélecteur a une **recherche** et suit les dossiers de GFS ; liste fenêtrée (200 à 400 projets existent déjà sur le forum) |
| **Clavier** | Tout se fait au clavier : Tab, flèches dans le tableau, Entrée pour éditer, Échap pour quitter, `N` pour une nouvelle tâche, `/` pour chercher |
| **Accessibilité** | Contraste 4,5:1 au moins, focus visible, `aria-` sur les menus et les fenêtres, **aucune information portée par la seule couleur** (le statut a toujours son nom, le retard son mot) |
| **Langues** | Français et anglais livrés ensemble, pluriels `{n\|singulier\|pluriel}`, « — Choisir … — » pour le vide, vouvoiement, « tâche » et jamais « task » en français |
| **Thèmes** | Clair et sombre par les jetons du kit ; thème de Grist suivi par défaut |
| **Panneau 700 × 400** | Tout tient et se manie à la souris ; texte long tronqué par « … » |
| **Barre de GFS** | Tuesday laisse libre la zone que GFS indique, à n'importe quel bord, sans bande réservée |
| **Lecture seule** | Tout est visible, rien ne se modifie : boutons grisés avec leur raison |

### Couleurs

Chrome en gris avec un seul bleu d'accent, comme la charte. **Exception à valider (question 4)** : les pastilles de statut reprennent **les couleurs de la colonne Choice de Grist**, parce qu'elles sont la donnée de la personne. Le texte d'une pastille est corrigé pour atteindre 4,5:1 sur son fond. Quand Grist n'a pas de couleur, la pastille est grise. L'icône d'un projet dans l'explorateur de GFS reste neutre tant que le porteur n'en demande pas une.

---

## 8. Intégration dans GFS

### 8.1 Rôle de chaque partie

| GFS donne | Tuesday fait |
|---|---|
| Le cadre isolé, sans `allow-same-origin` ; le courtier qui relaie l'API de Grist en filtrant d'après le manifeste | N'accède à Grist qu'à travers lui (le kit s'en charge) |
| L'explorateur de fichiers | Expose ses **projets** comme des fichiers : nom, type, dossier, date |
| Le contexte (document, page, accès, lecture seule), la **langue**, la **barre** | Les suit ; pas de choix de langue propre dans GFS (grisé avec la raison) |
| Le stockage par app (1 Mo) | Y range les choix de la personne (vue active, repli des groupes, « moi ») |
| Les actions `ouvrir`, `choisir`, `insérer`, `fermer` | `ouvrir` un projet ; répond à `fermer` après sa question d'enregistrement ; `choisir` en V3 |

### 8.2 Manifeste proposé (`gfs.json`)

Proposition, au format du cahier de GFS (5.1) ; les chiffres et la forme exacte seront arrêtés avec le projet de GFS pendant le développement.

```json
{
  "contrat": 0,
  "id": "tuesday",
  "nom": { "fr": "Tuesday", "en": "Tuesday" },
  "version": "0.1.0",
  "entree": "index.html",
  "tables": { "prefixe": "Tuesday_" },
  "fichiers": [{
    "table": "Tuesday_Projets",
    "colonnes": { "id": "id", "nom": "Nom", "type": "TypeProjet", "dossier": "Dossier", "date": "DateModif" },
    "typeParDefaut": "projet",
    "types": [
      { "valeur": "projet", "nom": { "fr": "Projet", "en": "Project" } }
    ]
  }],
  "reglages": [],
  "permissions": {
    "acces": "full",
    "lit": ["*"],
    "ecrit": ["*"],
    "gristInterne": [
      {
        "tables": ["_grist_Tables", "_grist_Tables_column"],
        "lit": true,
        "pourquoi": {
          "fr": "Connaître les tables et les colonnes du document, leurs types, et les choix colorés d'un statut pour les montrer comme dans Grist.",
          "en": "Know the document's tables and columns, their types, and a status's colored choices to show them as Grist does."
        }
      }
    ]
  },
  "extensions": [],
  "dependances": "package.json",
  "actions": { "ouvrir": ["projet"], "choisir": ["projet"], "inserer": { "produit": [], "recoit": [] } }
}
```

- **Accès complet** : Tuesday doit lire la table de la personne, qu'on ne connaît pas à l'avance. `lit` et `ecrit` à `"*"`, comme Publipostage+, parce que la source est choisie à l'exécution. Mitigation : **rien ne s'écrit hors des colonnes reliées**, et l'étape de correspondance affiche exactement ce que Tuesday pourra modifier (6.6). Voir le risque R2.
- **Aucune extension en V1** : pas de bibliothèque lourde. Un second jeu de tables (`Tuesday_Liens`) s'ajoute à `fichiers` ou `tables` selon ce que GFS décide ; `inserer.produit` passera à `["carte"]` en V2.
- **Aucune clé de réglage de la vue en V1** : la définition d'un projet vit dans une table (guide des apps, 1.1 règle 2). Une clé `tuesday_projet` (identifiant du projet de la vue) pourra s'ajouter pour que « une vue qui porte ton réglage s'ouvre sur ton app ».

### 8.3 Ouverture et arrivée

1. Via GFS : `ouvrir` donne l'identifiant du projet ; Tuesday l'ouvre sur sa vue mémorisée.
2. Sans fichier désigné : le dernier projet de la personne (stockage), sinon, la liste des projets du document, sinon l'écran de démarrage.
3. Seule (hors GFS) : mêmes ordres, la liste des projets étant le sélecteur de projet de la barre du haut.

### 8.4 Interopérabilité avec la suite (prévue dès la V1, par la donnée et les contrats)

Détail et contrats proposés : `integration-suite.md`, 3.

- **Ouvrir un fichier depuis une carte** (V1) : Publipostage+ (document, grille, **présentation**, les diapositives étant son extension) par `choisir` puis `ouvrir` ; liens gardés dans `Tuesday_Liens`. Slides+ n'est pas une app de GFS : ses diapositives vivent dans Publipostage+.
- **Insérer une carte dans un document** (V2, contrat posé maintenant) : rendu portable (`inserer`, contrats 5.4) avec la source de la tâche ; la valeur simple d'une tâche s'insère aussi comme une **variable**, parce que la donnée est en colonnes lisibles.
- **Form+** : un formulaire qui alimente la table source ; Tuesday voit les lignes arriver. **Grist-BI / Dashboard** : lit la même table.
- **Automation+** (retour du porteur, 02/11) : prévu **dans le cadre de GFS** pour faire évoluer le kanban, ajouter des tâches dans l'agenda ou autre. Couplage **par la table**, sans code partagé : Tuesday écrit des modifications ordinaires et se met à jour en direct. Contrainte : Automation+ ne tourne que vue ouverte et GFS n'active qu'une app par section ; options et recommandation dans `integration-suite.md`, 4.
- **Calendrier** : widget à part, intégré (6.3).

### 8.5 Demandes à GFS à poser pendant le développement

À écrire dans la section « Demandes à GFS » du futur `GFS-ETAT.md` :

1. Valider la forme du manifeste (8.2), en particulier le type unique « Projet » et les colonnes `fichiers`.
2. Demander si un projet peut être un fichier **sans toucher à la source** (le fichier ne porte que la correspondance).
3. Définir comment les personnes d'un document sont connues (pour « Mes tâches »), sans table-sonde si possible.
4. Couleur du type « Projet » dans l'explorateur (neutre pour l'instant).
5. Écarter la barre de GFS quand elle recouvre un tableau (zone à gauche au milieu à 700 × 400).
6. Calendrier : voie A (module du kit) ou B (app ouverte par GFS) ; contrat du module.
7. Insertion d'une carte : forme de `inserer.produit`, déroulement (étape 7 de GFS), accord de Publipostage+ pour accepter `carte`.
8. Liens vers des fichiers : où ranger `Tuesday_Liens` dans `fichiers`/`tables`, et que faire d'un fichier renommé ou disparu.
9. Automation+ : fond ou section à part (question 4 de GFS), point de départ passé à l'app ouverte, prévenance des changements d'une autre table.

---

## 9. Architecture technique

### 9.1 Contraintes reprises de GFS

JavaScript en modules ES, HTML et CSS, **aucun framework, aucune étape de construction** ; ce qu'un outil génère est commité. Kit en sous-module (`kit/`, commit `c0c8660`, v0.2.0). Pas de `console.log` publié. `addEventListener('message')`, jamais `window.onmessage =`. Accès au stockage du navigateur dans des `try/catch`. Un `?v=` monte à chaque changement de CSS ou JS (GitHub Pages met tout en cache 10 minutes) et un fichier `.nojekyll` est à la racine. Aucune couleur ni `z-index` en dur. Pas de prénom de personne dans le code. Licence GPL 3.0.

### 9.2 Découpage proposé

```
index.html          page d'entrée (CSP stricte)
gfs.json            manifeste
package.json        liste unique des bibliothèques (vide en V1), scripts de test
kit/                sous-module : jetons, thème, langue, fenêtres, lien GFS
css/                tuesday.css (+ une feuille par vue)
js/
  core/             PUR, sans DOM ni Grist : testé à 100 %
    mapping.js      rôles, reconnaissance, validation de la correspondance
    tasks.js        normalisation des lignes en tâches, sous-tâches
    grouping.js     groupes, tri, couloirs
    filters.js      recherche (accents, casse), filtres rapides
    dates.js        semaines du lundi, numéros ISO, retard, géométrie de dates
    rank.js         rangs fractionnaires pour l'ordre manuel
    timeline.js     géométrie de la chronologie (échelle, barres, jours)
    history.js      pile Annuler/Rétablir avec détection de conflit
    colors.js       couleurs de Grist, correction de contraste
  data/             accès à Grist, avec une interface remplaçable
    grist-adapter.js
    projects.js     lecture et écriture de Tuesday_Projets
    schema.js       lecture des tables, colonnes, choix (_grist_*)
  ui/               DOM seulement (aucune règle métier)
    app.js, toolbar.js, table-view.js, kanban-view.js, calendar-view.js,
    timeline-view.js, task-panel.js, mapping-dialog.js, states.js, menus.js
  i18n/             textes fr et en
test/               tests unitaires (Node), hygiène, contrat
navigateur/         essais dans un vrai navigateur (700 × 400, vraie souris)
```

Règle de partage : la **logique est dans `core/`**, qui ne connaît ni le DOM ni Grist ; `ui/` n'a pas de règle métier. C'est ce qui permet des tests unitaires exhaustifs sans faux Grist.

### 9.3 Bibliothèques

**Aucune en V1.** Le glisser-déposer se fait aux événements de pointeur ; la chronologie et le calendrier sont du DOM et du SVG ; les dates sont `Intl` du navigateur. Une bibliothèque ne s'ajoute que si elle sert à l'app seule (liste de l'app, version exacte, CDN figé) ou, si c'est une extension, par GFS.

### 9.4 Performance

- Lignes fournies par Grist en une fois : le tableau est **fenêtré** (seules les lignes visibles sont dans le DOM) au-delà de 300 lignes ; l'objectif est la fluidité à 5 000 lignes dans le tableau, 2 000 dans le kanban (cartes fenêtrées par colonne).
- Aucune relecture complète à chaque frappe ; les mises à jour de Grist sont appliquées par différence de lignes.
- Chronologie : barres positionnées par transformation, pas de recalcul de mise en page à chaque déplacement.
- Mesures : temps d'affichage de 500, 2 000 et 5 000 lignes sont des tests (budgets chiffrés en 10.4).

### 9.5 Sécurité

Isolement de GFS (sous-cadre sans `allow-same-origin`). CSP stricte : `default-src 'none'`, scripts et styles du seul site, aucune adresse externe. Les valeurs de cellule sont du **texte non fiable** : jamais d'`innerHTML` avec une valeur de Grist (le kit fournit `h()`). Droits : ceux de Grist ; Tuesday ne tient aucun verrou d'interface qui le remplace.

---

## 10. Qualité et tests

Consigne du porteur : **des tests unitaires exhaustifs dès que le développement commence**. Les règles de GFS s'y ajoutent.

### 10.1 Principes

- **Chaque règle de ce cahier a au moins un test qui la nomme.** Le fichier de test cite le numéro de section.
- **Chaque correction a son test, qui échoue sur l'ancien code.**
- Ce qui dépend de ce que Grist envoie est mesuré dans un **vrai Grist** (labo `grist-static` de GFS), jamais contre un faux Grist écrit par nous. Les tests unitaires ne touchent donc que `core/`, qui est pur.
- Une seule passe ciblée juste avant chaque push (ce que le push change) ; la suite complète à la demande.

### 10.2 Couches

| Couche | Outil | Cible |
|---|---|---|
| **Cœur pur** (`core/`) | `node --test` | **100 % des lignes et des branches**, mesuré (`c8`) ; tests par propriété pour les dates et les rangs |
| **Données** (`data/`) | `node --test` avec un adaptateur en mémoire **limité à l'interface** | Les actions envoyées à Grist sont celles attendues (colonnes reliées seules, jamais une colonne absente) |
| **Hygiène du code** | `node --test` (patron `codeHygiene` de Publipostage+) | Aucun `console.log`, `window.onmessage =`, `document.referrer` hors du kit, couleur ou `z-index` en dur, police externe, « template » / « ligne(s) » / tutoiement / « e-mail » en français, `innerHTML` avec une valeur, fichier ou fonction au-dessus des seuils |
| **Contrat GFS** | `node --test` | `gfs.json` conforme au cahier de GFS ; table, colonnes, clés déclarées = celles utilisées ; démarrage quand `localStorage` lève une erreur |
| **Interface** (`navigateur/`) | Playwright, **vraie souris et vrai clavier** | 700 × 400, clair et sombre, français et anglais, barre de GFS aux quatre bords |
| **Dans un vrai Grist** | labo de GFS | Aller-retour seule → GFS → seule sans perte ; droits ; lecture seule ; gros tableaux |

### 10.3 Ce que le cœur doit couvrir (liste de départ)

- **Correspondance** : reconnaissance par type et par nom (accents, casse, ponctuation, français et anglais), ambiguïtés (deux colonnes Choice), rôles obligatoires, types refusés, colonne supprimée ou renommée, correspondance versionnée.
- **Tâches** : toutes les formes de valeur de Grist (`['d', v]`, `['D', v, fuseau]`, `['R', table, v]`, listes), lignes sans statut, doublons, ligne sans titre.
- **Groupes et tri** : ordre des choix de Grist, groupe vide, groupe replié, « Sans statut », couloirs.
- **Sous-tâches** : parent filtré, cycle (A parente de B parente de A), profondeur, parent supprimé.
- **Dates** : début de semaine au lundi, numéros ISO 8601 (semaines 52, 53 et 1), années bissextiles, changement d'heure, retard à minuit, dates avec heure et fuseau, début après fin. **Pièges du forum** : `01/01/1970`, 31/12 passé en janvier, J-1 par le fuseau, date fictive pour ranger une carte sans date, Référence lue comme un numéro.
- **Rangs fractionnaires** : insertion entre, en tête, en queue, rangs identiques, épuisement de la précision et renumérotation, stabilité sous 10 000 insertions aléatoires.
- **Chronologie** : géométrie pour les trois zooms, barre d'un jour, jalon, tâche sans date, barre hors de la fenêtre.
- **Couleurs** : correction de contraste à 4,5:1 sur toute couleur de Grist, clair et sombre ; couleur absente.
- **Annuler/Rétablir** : un pas, un lot, enchaînements, conflit (valeur changée entre-temps), mémoire bornée.
- **Recherche et filtres** : mots dans n'importe quel ordre, accents, caractères spéciaux, texte vide.
- **Langues** : chaque clé a son fr et son en ; pluriels (0, 1, 2, 21) ; aucune clé orpheline.

### 10.4 Budgets mesurés

Affichage initial de 500, 2 000, 5 000 lignes ; glisser d'une carte (pas d'image perdue) ; ouverture de la fiche ; poids de la page d'entrée et des modules (plafond à fixer dès le premier lot).

### 10.5 Tests d'acceptation

Les sept scénarios S1 à S7 (section 3.2) sont écrits comme essais de navigateur, à la vraie souris, avant la fin de la V1.

---

## 11. Périmètre par version

| | **V1 « Suivre »** | **V2 « Piloter »** | **V3 « Connecter »** |
|---|---|---|---|
| Vues | Tableau, Kanban, Chronologie, fiche ; **Calendrier par intégration** | Charge de travail, Synthèse | Mon travail, Portefeuille |
| Données | Correspondance, modèle de départ, sous-tâches (case, responsable, échéance), **plusieurs responsables**, ordre manuel, **navigation entre tables**, **fichiers liés** (`Tuesday_Liens`, dernier lot) | Dépendances avec flèches et recalcul, jalons enrichis, récurrence, **statuts écrits depuis le kanban** | Commentaires, temps passé |
| Gestes | Glisser, édition sur place, ajout rapide, annuler/rétablir, recherche, filtres et tri **qui restent par projet**, regroupement, colorier par, suivre une Référence | Sélection multiple et actions groupées, copier-coller depuis un tableur, vues enregistrées partagées | — |
| GFS | Fichier « Projet », langue, barre, stockage, lecture seule, ouvrir/fermer, `choisir` et `ouvrir` vers Publipostage+ | **Insertion d'une carte** (`inserer`), clé de réglage de la vue, dossiers d'équipe | Responsable d'espace |
| Qualité | Tests exhaustifs du cœur, hygiène, contrat, essais 700 × 400, labo GFS | Budgets de performance en continu | Essais d'interopérabilité |



### 11.1 Noyau de la V1 (proposition à valider)

GFS demande « ce qui entre, ce qui attend » avant le code. Le critère : un petit noyau bien installé vaut mieux qu'un rattrapage de fonctions (fenêtre courte, R11).

**Entre dans la V1**
- La **mise en route** sur sa propre table : démarrage, correspondance confirmée en un écran, aucun modèle imposé, rien d'écrit avant un geste (fil « onboarding », `onboarding.md`).
- **Tableau**, **Kanban** et **Chronologie simple** (dates, jalons, sous-tâches, zoom jusqu'à l'année, repère « Bloquée par ») + **fiche** ; le **Calendrier** par intégration de Calendrier+.
- **Sous-tâches** (case, responsable, échéance), **plusieurs responsables**, **statuts de Grist** avec leurs couleurs, **Colorier par**.
- **Filtres, tri et regroupement qui restent** par projet ; recherche ; annuler/rétablir à 100 % ; lecture seule grisée avec sa raison ; version visible.
- **Fichiers liés** à Publipostage+ et Form+ (`choisir`, `ouvrir`), en **dernier lot** de la V1 (étape 8 bis du plan).
- Une **note de sécurité** (ce que l'app lit, ce qu'elle écrit, pourquoi) pour l'audit.

**Attend (V2 « Piloter », V3 « Connecter »)**
- Dépendances avec flèches et recalcul des dates ; charge de travail et temps passé ; récurrence ; avancement calculé.
- Écrire les statuts depuis le kanban (question 13) ; insertion d'une carte dans un document (`inserer`) ; vues enregistrées partagées ; sélection multiple ; copier-coller depuis un tableur.
- Commentaires ; export PDF ou Markdown ; « Mon travail » et portefeuille ; alertes par e-mail (n8n ou Automation+).

**Fonctions qui demandent des formules : aucune n'entre.** En V1 Tuesday ne crée aucune colonne à formule : il **lit** celles que la personne a déjà (avancement, charge, retard). Il n'a donc pas besoin de la capacité `formules` (contrats 3.4). Dès la V2, si Tuesday propose de créer une colonne calculée (prédécesseurs recalculés, charge), il déclarera cette capacité, avec l'accord de la personne et sans jamais modifier une colonne existante.

**Hors périmètre**, sauf décision du porteur : tableaux blancs, chat, assistant d'IA, objectifs, formulaires, automatisations, graphiques riches, documents, notifications par courriel.

---

## 12. Risques

| N° | Risque | Effet | Parade |
|---|---|---|---|
| R1 | Les widgets de la communauté couvrent déjà une partie du besoin (Taskflow est sur l'instance DINUM) | Perception de doublon | Argument : **s'adapter à la table existante** et **s'intégrer à la suite** ; le dire d'emblée |
| R2 | Accès complet nécessaire (`lit` et `ecrit` à `"*"`) | Méfiance de l'administrateur | Aperçu explicite de ce qui sera écrit ; aucune écriture hors colonnes reliées ; test de contrat |
| R3 | La dépendance à `_grist_Tables_column` pour les couleurs des choix | Format interne de Grist qui change | Lecture tolérante ; repli sur couleurs neutres ; test dans un vrai Grist à chaque montée de version |
| R4 | L'API des widgets ne donne pas la tâche « moi » | « Mes tâches » impossible | Choix de la personne une fois (stockage) en V1 ; demande à GFS (8.5) |
| R5 | Le tri manuel de Grist n'est pas accessible au widget | Réordonner dans une colonne impossible sans colonne Ordre | Colonne Ordre facultative ; grisé avec raison sinon |
| R6 | Panneau étroit (700 × 400) et barre de GFS | Vues trop denses | Maquette dès la V1, essais à la vraie souris, zone de la barre écartée |
| R7 | Le cadre isolé de GFS limite le glisser-déposer ou le presse-papiers | Gestes dégradés | Mesure au labo avant de promettre ; solutions de repli au clavier |
| R8 | Glissement du périmètre vers Monday entier | Retour du « kanban hyper sophistiqué » | Principe 1, section 11 « hors périmètre », une carte de décision pour toute fonction hors cahier |
| R9 | Grandes tables (milliers de lignes) | Lenteur | Affichage fenêtré, budgets mesurés (9.4, 10.4) |
| R10 | Instance DINUM : politique sur les widgets personnalisés et les adresses GitHub Pages | Widget bloqué | Déjà traité par GFS ; vérifier avec une première mise en ligne de la page d'entrée |
| R11 | **Fenêtre courte** : TaskFlow repris par une société (version « pro » annoncée avant fin 2026, proposée à la DINUM) ; Gestion de Projet livre en quelques jours ; Gristkanban (MIT, DSFR) est sorti le 29/10 | Arriver trop tard avec trop de choses | Noyau V1 petit (11.1), onboarding irréprochable, avantage propre : s'adapter à la table et vivre dans la suite | 
| R12 | **Validation DINUM / ANCT** : leurs instances n'utilisent que des widgets audités ; tous les widgets existants demandent l'accès complet | Widget refusé | Code lisible sans bibliothèque, outil d'audit de GFS, isolement de GFS (ne voit que les tables du manifeste), note de sécurité dès la V1 ; ne rien promettre de plus que ce qui est mesuré |

---

## 13. Décisions à valider

Antoine a répondu à la question 2 en parlant de « une ou deux tables pour le widget, la donnée référençable de partout » : tables existantes d'abord, deux tables propres au plus (5.7). Pour les autres, **un défaut a été pris**, écrit ici ; rien ne se code avant son accord (règle de GFS).

| N° | Question | Défaut pris | Effet si l'autre réponse |
|---|---|---|---|
| 1 | **Nom** : Tuesday ou Thusday (graphie de GFS) ? | Tuesday | Renommer le dépôt, le manifeste et le préfixe des tables, avant la première table créée |
| 2 | **Qu'est-ce qu'un projet dans l'explorateur ?** Une configuration posée sur une table existante, ou un projet qui porte ses propres tables ? | Configuration sur table existante, avec modèle de départ en option | Avec un modèle imposé : des tables `Tuesday_…` à créer, correspondance inutile, mais retour au mur des widgets existants |
| 3 | **Totaux de groupe** : afficher « 4 tâches » ou un cumul d'une colonne Numérique ? | Nombre de tâches seulement (affichage, pas de calcul métier) ; tout cumul = une formule Grist affichée | Un cumul calculé par Tuesday contredit « pas de calcul dans le widget » (décision de GFS) | *Note (0.3)* : l'étiquette « En retard » compare l'échéance à aujourd'hui à l'affichage ; c'est une règle de présentation, pas un calcul métier : à confirmer |
| 4 | **Couleurs de statut de Grist** dans le chrome, alors que la charte limite les couleurs | Oui, corrigées pour le contraste ; gris sinon | Pastilles toutes grises : lecture plus lente |
| 5 | **Fiche** : panneau à droite (non modal) ou fenêtre de la base commune (largeur 480) ? | Panneau à droite : on garde la vue sous les yeux | Fenêtre : conforme à la charte « une seule base », mais cache la vue |
| 6 | **Identité de la personne** (« Mes tâches ») : choix une fois dans le stockage, ou table-sonde comme Grist-BI ? | Choix une fois (aucune table de plus) | Table-sonde : automatique, mais une table de plus (« limiter les tables ») |
| 7 | **Couleur du type « Projet »** dans l'explorateur | Neutre | Une couleur de plus à la liste de la charte (bleu, vert, orange déjà pris) |
| 8 | **Commentaires et mises à jour** (V3) : table `Tuesday_Activite` ou rien | Reporté à la V3 | — |
| 9 | **Récurrence** (V2) : dans Tuesday ou dans Automation+ ? | Automation+ crée la ligne suivante (modèle d'automatisation) ; Tuesday l'affiche | Dans Tuesday : un calcul de plus dans le widget |
| 10 | **Plusieurs responsables** : dès la V1 ? | **Oui** (quatre demandes, et attendu par la communauté) : si la colonne est une Liste de références, affichage et édition ; sinon un seul | Un seul en V1 : plus simple, mais une demande n° 1 manquée |
| 11 | **Calendrier à part** : voie A (module du kit monté par les deux) ou B (app ouverte par GFS) ? | A : un seul code, la vue reste dans la barre et le filtre de Tuesday | B : aucun code partagé, mais une app à la fois et une vue détachée |
| 12 | **Automation+ pendant que Tuesday est ouvert** : **tranchée par le porteur (02/11)** : sous-cadre en fond (B), **seulement dès qu'au moins une automatisation est définie** ; en attendant, section à part (A) ; formules Grist (C) pour les cas simples | B conditionnel, demandé à GFS | Sans B, une automatisation ne tourne que si sa page est ouverte quelque part |
| 13 | **Ajouter un statut depuis le kanban** (« des statuts qu'on nomme soi-même », sept personnes) : écrire les choix d'une colonne demande d'écrire `_grist_Tables_column` (`widgetOptions`) | V1 : les statuts se nomment dans Grist ; « + Statut » existe, **grisé avec la raison** ; V2 : l'écrire avec une entrée `gristInterne` déclarée et l'accord de la personne | Dès la V1 : une écriture de structure de plus à déclarer et à mesurer dans un vrai Grist |

---

## 14. Plan de réalisation proposé

| Étape | Contenu | Sortie |
|---|---|---|
| 0 | Ce cahier, l'étude et la maquette V1 | Validation par Antoine |
| 1 | Squelette prêt pour GFS : kit, manifeste, `package.json`, CSP, hygiène, intégration continue des tests | Page qui s'ouvre seule et dans GFS, 0 fonction |
| 2 | Cœur pur et ses tests exhaustifs : correspondance, tâches, dates, groupes, rangs, historique | `core/` à 100 % |
| 3 | Données : adaptateur, lecture de `_grist_*`, `Tuesday_Projets`, correspondance branchée | Fenêtre de correspondance fonctionnelle dans un vrai Grist |
| 4 | Tableau, fiche, ajout rapide, annuler/rétablir | Premier usage réel |
| 5 | Kanban | |
| 6 | Calendrier | |
| 7 | Chronologie | |
| 8 | Essais 700 × 400, thèmes, langues, lecture seule, performance ; échange avec GFS (`GFS-ETAT.md`) | V1 candidate |
| 8 bis | **Fichiers liés** (`Tuesday_Liens`, `choisir`, `ouvrir`) et note de sécurité | Dernier lot de la V1 |
| 9 | Essai par une équipe de l'instance DINUM | Retours, ajustements |

Les étapes 1 à 3 ne montrent presque rien, mais tout le reste repose dessus : ce sont aussi celles où l'on prévient le plus de dette.
