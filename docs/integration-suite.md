# Tuesday dans la suite : données partagées et liens entre apps

Ajouté le 02/11/2026, après les retours d'Antoine sur la maquette V1. Ce document précise trois points du cahier des charges : le **Calendrier à part**, les **tables et la donnée référençable partout**, les **liens entre apps** (ouvrir un fichier depuis une carte, insérer une carte dans un document). Il propose des contrats ; ceux de GFS font foi, et chaque point ouvert part en « Demande à GFS » (cahier, 8.5).

## 1. Le Calendrier est un widget à part, que Tuesday intègre

**Décision du porteur (02/11).** Le calendrier est un projet à lui, qui marche **seul** (hors Tuesday, sur n'importe quelle table) et que Tuesday **intègre** comme sa vue Calendrier.

Contrainte de GFS : *une app n'importe jamais le code d'une autre app* ; ce qui sert à deux apps va dans le **kit** (qui n'a aucune bibliothèque). Deux voies :

| Voie | Principe | Pour | Contre |
|---|---|---|---|
| **A. Un module de calendrier dans le kit** (proposée) | Le calendrier est écrit une fois, dans son dépôt, comme un **module ES sans DOM global** (il reçoit des lignes et un élément, rend des événements : `ouvrir`, `deplacer`, `ajouter`). Une version du kit le porte. L'app Calendrier le monte en pleine page ; Tuesday le monte dans sa vue. | Un seul code, deux usages, même page chargée, aucune latence, respecte « kit ← apps » | Le kit grossit ; chaque évolution du calendrier est une étiquette du kit |
| **B. Deux apps, Tuesday ouvre l'autre** | Tuesday ne contient pas de calendrier : sa vue Calendrier est l'app Calendrier ouverte par GFS sur la même table | Aucun code partagé | Deux sous-cadres à la fois (GFS en fait une seule app active par section) ; la vue n'est plus intégrée à la barre et au filtre de Tuesday |

**Conséquences pour la V1 de Tuesday.**

- Tuesday V1 contient en natif **Tableau, Kanban, Chronologie** ; la vue **Calendrier arrive par l'intégration** dès que le module existe. Dans la barre, l'onglet est déjà là : grisé avec « Le Calendrier arrive avec le widget Calendrier » tant qu'il manque (grisé, jamais masqué).
- **Contrat du module** (à écrire avec le projet Calendrier) : entrée = lignes normalisées `{ id, titre, debut, fin, statut, couleur, responsables }` et la correspondance de colonnes ; sortie = événements `ouvrir(id)`, `deplacer(id, debut, fin)`, `ajouter(date)`. Le module ne parle jamais à Grist : l'app hôte écrit.
- Le Calendrier seul a sa propre correspondance de colonnes (la même fenêtre, mêmes rôles : titre, début, fin, couleur, personne), et lit la table de sa section.
- **Demande à GFS** : choisir A ou B (question 11 du cahier).

## 2. Les tables : naviguer partout, une donnée référençable de partout

**Retour du porteur.** Comme GFS et Publipostage+, on doit pouvoir **naviguer entre les tables sans souci**. Le widget peut avoir une ou deux tables à lui, mais la donnée doit être **récupérable et référençable de partout dans le document, aussi efficacement que les variables de Publipostage+**.

### 2.1 Les trois règles

1. **La donnée reste dans Grist, en colonnes lisibles.** Une tâche est une ligne d'une table ordinaire. Tout ce que Tuesday sait d'une tâche est une **colonne** (pas un JSON caché). Donc une variable de Publipostage+ (`#Tâches.Titre`), une formule Grist, un autre widget lié, une règle d'accès ou Automation+ la lisent **sans passer par Tuesday**.
2. **Deux tables propres au maximum**, créées avec l'accord de la personne, à colonnes lisibles et stables :
   - `Tuesday_Projets` : un projet par ligne (source, correspondance, vue par défaut). Colonnes en texte clair ; les réglages d'affichage seuls en JSON (voir cahier, 5.5).
   - `Tuesday_Liens` : une ligne par lien entre une tâche et un fichier d'une autre app (section 3).
3. **Une table de plus seulement avec un cas qui l'exige** (commentaires, V3 : `Tuesday_Activite`) ; sinon la ligne réservée d'une table existante (règle de GFS).

### 2.2 Naviguer entre les tables dans Tuesday

| Geste | Résultat |
|---|---|
| **Changer de projet** (sélecteur du haut) | Change de table source sans quitter le widget ; la dernière vue de chaque projet est retenue |
| **Clic sur une valeur de colonne Référence** (responsable, tâche parente, client…) | Ouvre la **ligne liée** dans un panneau, avec son fil d'Ariane (« Tâches › Équipe › Camille ») ; un second clic va plus loin, « Retour » revient. Ce sont les « Tables liées » de Publipostage+, par les colonnes Référence de Grist |
| **« Ouvrir dans Grist »** | Place le curseur de Grist sur la ligne (page et table de la ligne), pour la fiche native et les widgets liés |
| **Un projet = une table, mais plusieurs projets par document** | Un même document peut suivre des tâches, des risques et des jalons en trois projets, côte à côte dans le sélecteur |
| **Filtrer par une référence** (« les tâches de ce responsable ») | Depuis la ligne liée, un clic filtre la vue sur elle |

Aucune donnée n'est recopiée : un projet lit la table, un clic de navigation lit une autre table par la colonne Référence.

### 2.3 Référencer la donnée de Tuesday ailleurs

- **Publipostage+** : les tâches étant des lignes de table, ses variables les prennent comme n'importe quelle table. Ce que Tuesday ajoute doit rester **lisible comme une variable** : noms de colonnes stables, versionnés par `Schema`, listés dans la documentation (`docs/donnees.md`, à écrire avec le modèle), jamais renommés.
- **Une cellule de Grist** : colonnes `Tuesday_Liens` référençant la tâche (`Ref`) ; une formule Grist peut compter les fichiers liés d'une tâche.
- **Une carte dans un document** : section 3.2.

## 3. Intégration entre les widgets de GFS, prévue dès la V1

### 3.1 Ouvrir un fichier d'une autre app depuis une carte

Le cas : « Ouvrir le compte rendu de la réunion » depuis une tâche, dans Publipostage+ (document, grille ou **présentation** : les diapositives sont désormais une extension de Publipostage+ ; Slides+ reste une référence).

- La fiche a une section **Fichiers liés** : liste de fichiers (icône du type, nom, application), « Lier un fichier… », « Ouvrir ».
- **Lier** : action `choisir` de GFS (l'explorateur s'ouvre en mode choix, filtré par type) → `{ app, id, nom, type }`. Tuesday écrit une ligne de `Tuesday_Liens`.
- **Ouvrir** : action `ouvrir` de GFS (« fermer » d'abord, puis l'app active). Quand Tuesday tourne seul : grisé, texte commun de GFS.
- Le **nom** du fichier est relu à l'ouverture (GFS permet de le renommer) ; si le fichier a disparu : lien grisé « Fichier introuvable », jamais supprimé en silence.

Table `Tuesday_Liens` (colonnes lisibles) :

| Colonne | Contenu |
|---|---|
| `Projet` | Référence vers `Tuesday_Projets` |
| `Table`, `Ligne` | Table et identifiant de la tâche (texte et numérique, pour survivre à une suppression de ligne) |
| `App`, `Fichier`, `Type`, `Nom` | `{ app, id, type, nom }` rendu par `choisir` |
| `Cree` | Date de création du lien |

### 3.2 Insérer une carte de Tuesday dans un document

Le cas inverse : mettre dans un compte rendu de Publipostage+ la **carte** d'une tâche (titre, statut, responsable, échéance), qui reste à jour.

Cela suit l'action `insérer` de GFS (contrats 5.2 et 5.4 : rendu portable) :

- Tuesday déclare dans son manifeste : `"inserer": { "produit": ["carte"], "recoit": [] }` (forme du brouillon, à valider avec GFS).
- Le rendu est un **rendu portable** : `{ format: "svg", donnees, largeur, hauteur, texteAlternatif, source: { app: "tuesday", id, type: "carte", version } }`. `source.id` désigne la tâche (`table:ligne`).
- Publipostage+ **garde le rendu et la source** ; sans Tuesday, le rendu reste affiché et sa mise à jour est grisée. Il ne charge jamais le code de Tuesday ; il traite `donnees` comme non fiable (image, jamais insérée dans la page).
- **Mise à jour** : la source dit quelle ligne lire. Pour une carte qui doit rester vivante, la **donnée prime sur le rendu** : Publipostage+ peut relire la ligne par sa variable (`table:ligne`) et ne garder le rendu que comme repli. C'est l'avantage de la règle 2.1 : la valeur « simple » d'une tâche (un statut, une échéance) s'insère **comme une variable**, sans passer par Tuesday.
- Dans Tuesday : « Insérer la carte dans un document… » dans le menu « … » de la fiche, qui lance l'insertion (grisé sans GFS).

**Ce qui dépend de GFS et de Publipostage+** (étape 7 de GFS, pas encore écrite) : le déroulement de l'insertion (deux sous-cadres à la fois), la taille maximale d'un rendu, et le côté Publipostage+ (accepter `carte`). Ce document n'invente pas ce déroulement.

### 3.3 Ce qui part en demande

| À qui | Demande |
|---|---|
| GFS | Voie A ou B pour le Calendrier (1) ; forme de `inserer.produit` pour une carte ; état du déroulement de l'insertion (étape 7) ; type « Projet » dans l'explorateur ; fichier lié renommé ou disparu |
| Publipostage+ | Accepter un rendu `carte` ; lire une carte par la variable de sa source ; ouvrir un document à partir d'un identifiant donné par Tuesday (déjà : `ouvrir`) |
| Projet Calendrier | Contrat du module (1) |

## 4. Effets sur le cahier des charges

- **V1** : Tableau, Kanban, Chronologie en natif ; Calendrier par intégration ; **Fichiers liés** (lier, ouvrir) ; navigation entre tables (changer de projet, suivre une Référence) ; deux tables propres au plus.
- **V2** : insertion d'une carte dans un document ; dépendances ; charge ; synthèse.
- **V3** : commentaires (`Tuesday_Activite`), temps passé, portefeuille.
