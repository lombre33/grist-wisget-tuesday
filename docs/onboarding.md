# Onboarding de Tuesday : la première minute

Version 0.1 du 02/11/2026. Complète le cahier des charges (principe 0, sections 5.2, 5.5, 6.6, 6.7) et la maquette (`../maquettes/index.html`, groupe « Premier lancement »). Écrit dans le fil « Concevoir l'onboarding de Tuesday ».

**Consigne du porteur (02/11).** L'onboarding et la facilité d'usage passent avant tout : un outil fluide, qui ne bloque jamais, utilisable pour un projet simple sans boutons partout. La première minute est l'étape la plus importante.

## En bref

- **Une promesse :** brancher Tuesday sur une table qu'on a déjà et voir son travail comme un projet **en deux clics dans le meilleur cas, cinq au pire**, sans rien créer ni recopier.
- **Trois idées font tout le travail :**
  1. **Pré-remplir, puis confirmer d'un clic.** Tuesday lit les colonnes de la table et remplit lui-même la correspondance ; la personne **confirme toujours** (décision du porteur, 02/11) sur **un seul écran** où le bouton principal est « Ouvrir ». Il ne pose une vraie question que s'il hésite, au même écran, une seule à la fois.
  2. **Essayer avant d'enregistrer.** Le projet marche tout de suite, sans rien écrire dans le document. Enregistrer (créer `Tuesday_Projets`) est un geste proposé plus tard, avec un accord explicite, pour que l'équipe retrouve le projet.
  3. **Une confirmation, puis plus rien.** Après l'écran de confirmation, pas de demande à chaque pas : tout geste a son « Annuler », et le message qui suit une première écriture nomme la colonne touchée.
- **Pas de visite guidée, pas de fenêtre d'accueil, pas de liste de tâches « pour bien démarrer ».** L'aide est dans l'écran de confirmation, l'écran vide et le menu du projet.
- **Les autres personnes de l'équipe n'ont jamais d'onboarding** : un projet enregistré s'ouvre sur sa vue, rien d'autre.

---

## 1. Principes

Dans l'ordre : quand deux principes s'opposent, le premier gagne.

1. **Jamais bloqué.** Aucun écran sans sortie. Chaque état dit en une phrase ce qui se passe et ce qu'on peut faire ; quand une fonction manque, elle est **grisée avec sa raison** (charte), jamais masquée. Pas d'écran vide muet, pas de « colonne introuvable » seul (douleur n°1 des widgets existants, étude 33).
2. **Le chemin le plus court d'abord.** Le cas courant (une table de tâches avec un titre et un statut) est un écran et un clic : « Ouvrir ». Les cas rares (ambiguïté, rien de reconnu, pas de table) coûtent un peu plus, jamais une impasse.
3. **Une question à la fois, deux choix au plus.** Chaque écran a une action principale. Le bouton principal porte un verbe (« Ouvrir », « Créer la table »), jamais « OK ».
4. **Rien n'est créé ni écrit sans un geste.** Ouvrir un projet ne modifie pas le document. Une table n'est créée qu'après un accord qui nomme ce qui sera créé (CLAUDE.md, GFS).
5. **On travaille avec la donnée.** Jamais de modèle imposé : la table de la personne est le point de départ. Le modèle de départ est une option, jamais le chemin par défaut.
6. **Le minimum de contrôles visibles.** Pendant le démarrage, la barre du haut ne montre que le nom de l'app ; elle s'enrichit seulement quand un projet est ouvert (au plus sept contrôles, cahier 2.0).
7. **Annuler/Rétablir à 100 %**, y compris pendant l'onboarding (créer le modèle de départ, enregistrer le projet).
8. **Le texte est court et dit « vous ».** Vouvoiement, « modèle » jamais « template », « tâche » jamais « task », français et anglais livrés ensemble. Une phrase par état, 90 caractères en titre, 140 en explication.
9. **Même chemin dans GFS et seul.** Dans GFS, le démarrage est le même ; seuls changent la langue et la barre.
10. **Aucun piège pour les non-propriétaires.** Les personnes sans droit d'écriture ou de schéma voient un projet qui marche (ou une raison claire), jamais une fenêtre qu'elles ne peuvent pas terminer.

---

## 2. Qui arrive, et dans quel état

| Cas | Situation | Ce que voit la personne | Clics |
|---|---|---|---|
| **A** | Constructrice : ajoute le widget à une page qui montre sa table de tâches ; Titre et Statut reconnus sans doute | **L'écran de confirmation** (`colonnes`) déjà rempli, Titre et Statut en tête, bouton **Ouvrir** | **1** après l'accès à Grist |
| **B** | Constructrice : widget ajouté, table non choisie, ou plusieurs tables possibles | L'écran de démarrage : la table la plus probable en avant, les autres dessous (`demarrage`), puis l'écran de confirmation | **2** |
| **C** | Titre ou Statut ambigu (deux colonnes Choix, deux colonnes de texte possibles) | Le même écran de confirmation, avec la ligne ambiguë ouverte : « Quelle colonne donne l'état d'avancement ? » (`statut`) | **2 à 3** |
| **D** | Table sans colonne de statut ou de date | Confirmation, puis tableau ; Kanban et Chronologie grisés avec leur raison | **1 à 2** |
| **E** | Document sans table de tâches | Le choix « Créer un modèle de départ » (`sans-table`, `modele`) | **3** (nom, accord, créer) |
| **F** | Accès à Grist non accordé | L'écran « En attente de l'accès » avec la marche à suivre (`acces`) | 0 (on attend) |
| **G** | Contributrice ou contributeur, projet enregistré | Le projet sur sa dernière vue, aucune confirmation | 0 |
| **H** | Même personne, projet pas encore enregistré, **première ouverture de sa part** | L'écran de confirmation, déjà rempli ; sa confirmation est gardée dans son stockage, elle ne la refait pas | **1** la première fois, puis 0 |
| **I** | Lectrice ou lecteur, projet pas enregistré | Confirmation sans bouton d'enregistrement ; tout est visible, rien ne se modifie | 1 |

Le critère S1 du cahier (60 s, 5 clics) devient : **cas A en 10 s, cas B en 20 s, cas C en 40 s, cas E en 60 s.** (Le porteur a préféré la confirmation systématique à l'ouverture directe : un clic de plus, aucune surprise.)

---

## 3. Le parcours, étape par étape

```
Widget ajouté ──► [3.0 Accès à Grist] ──► [3.1 Reconnaissance, en lecture seule]
                                              │
        ┌─────────────────────┬───────────────┴───────────────┐
        ▼ table connue        ▼ plusieurs tables               ▼ pas de table
  [3.3 Confirmer les     [3.2 Choisir la table] ──►       Modèle de départ (3.7)
   colonnes] ◄──────────────────┘                                │
        │  (ligne ambiguë ouverte si besoin)                      ▼
        ▼                                                 Première tâche (3.8)
  Tableau ouvert ──► [3.4 Garder pour l'équipe] (proposé, jamais imposé)
        │                          │
        ▼                          ▼
  [3.5 Modifier les colonnes plus tard]            Jours suivants (3.9)
```

### 3.0 L'accès à Grist

Tuesday a besoin de l'**accès complet** (cahier 8.2, `lit` et `ecrit` à `"*"`). Tant que Grist ne l'a pas accordé, Grist ne livre rien au widget, et un widget qui attend en silence passe pour cassé.

- Après **3 secondes** sans donnée, Tuesday affiche l'écran `acces` : « En attente de l'accès à vos données » et, en dessous, la marche à suivre : « Dans le panneau de droite de Grist, choisissez *Accès complet au document*, puis *Accepter*. »
- Un bouton « Réessayer ». Aucun écran d'erreur rouge : c'est un état normal du premier lancement.
- **À mesurer dans un vrai Grist** : ce que Grist envoie avant l'acceptation, et si le widget peut déduire « accès refusé » d'« accès pas encore répondu » (labo de GFS). Le délai de 3 s est un défaut.

### 3.1 La reconnaissance (en lecture seule)

Dès qu'il a les données, Tuesday lit `_grist_Tables` et `_grist_Tables_column` (types, choix, couleurs) et **n'écrit rien**.

1. **La table.** Celle de la section du widget, si elle est choisie ; sinon, toutes les tables du document, classées par vraisemblance.
2. **Les rôles**, dans cet ordre : d'abord par **nom** (titre, nom, intitulé, tâche ; statut, état, status ; responsable, assigné, owner ; début, start ; échéance, deadline, due ; accents, casse et ponctuation ignorés), puis par **type** pour ce qui reste (une seule colonne Choix libre ⇒ candidate au statut ; une seule colonne Texte ⇒ candidate au titre).
3. **« Sûr »** veut dire : le rôle a **un seul** candidat, qui est alors pré-rempli. Deux candidats sans que le nom tranche = ambigu : la ligne s'ouvre à l'écran de confirmation (3.3). Aucun = absent. Seuls **Titre** et **Statut** peuvent poser une question ; les autres rôles se pré-remplissent de la même façon et n'arrêtent jamais personne. **Dans tous les cas, la personne voit et confirme** (décision du porteur).
4. **Classement des tables.** Plus une table a de rôles reconnus, plus elle monte ; un titre et un statut sûrs comptent le plus ; les tables de Grist (`_grist_…`) et de la suite (`Tuesday_…`) sont écartées ; une table vide monte moins qu'une table pleine à reconnaissance égale. Le classement n'a pas besoin d'être parfait : la personne voit **toutes** les tables et change d'avis en un clic.
5. **Le résultat est gardé en mémoire.** Rien n'est écrit dans le document.

Une fois la personne a confirmé, **sa confirmation est gardée dans son stockage** (dans un `try/catch`, sinon elle reconfirme à chaque ouverture, sans bloquer) : tant que le projet n'est pas enregistré (cas H), elle ne la refait pas.

### 3.2 Choisir la table (`demarrage`)

N'apparaît que si la table n'est pas déjà connue (section du widget sans table, ou plusieurs tables plausibles).

- Titre : « Quelle table voulez-vous suivre ? ». Une phrase : « Vos données restent où elles sont. Rien n'est créé sans votre accord. »
- **La table la plus probable est en tête**, avec ce que Tuesday a reconnu en clair : « Titre : *Tâche* · Statut : *État* (5 choix) · Échéance : *Date limite* », et un bouton principal **Continuer**.
- Les autres tables dessous, plus discrètes, avec leur nombre de lignes et un bouton « Continuer » secondaire. Une table sans colonne de texte est **grisée avec sa raison** (« Aucune colonne de texte pour les titres »), jamais masquée.
- Une seule autre action : « Créer un modèle de départ… » (3.7), en bas.

### 3.3 Confirmer les colonnes (`colonnes`, `statut`)

**C'est l'écran central de l'onboarding : un seul écran, déjà rempli, un clic sur Ouvrir.** La fenêtre de douze lignes de la maquette V1 n'est plus le premier écran.

- **En tête :** la table (« Tâches du projet · 42 lignes », avec « Changer »), puis **Titre** et **Statut**, chacun avec la colonne pré-choisie et la mention « Reconnue ». Ces deux lignes suffisent pour la plupart des projets simples.
- **Dessous, une ligne de résumé :** « 4 autres colonnes reconnues : Responsable, Début, Échéance, Priorité » avec « Tout afficher » (les douze rôles de la V1, écran `correspondance`).
- **Les rôles manquants qui coûtent une vue** s'affichent sous « Pour aller plus loin », chacun avec sa conséquence en une phrase (« Sans colonne Début, la Chronologie reste grisée ») et une liste avec recherche. Rien d'obligatoire ne s'y trouve.
- **Aperçu de ce qui sera modifiable :** « Tuesday pourra modifier : Statut, Responsable, Début, Échéance. Les autres colonnes ne sont que lues. » (cahier R2)
- **Bouton principal : Ouvrir.** Il a le focus clavier : Entrée suffit. Un bouton secondaire « Annuler » revient en arrière.

**Quand une ligne est ambiguë (`statut`)** : c'est **la seule chose qui change** à l'écran. La ligne en question s'ouvre, marquée « À choisir », et le bouton Ouvrir reste grisé tant que la personne n'a pas choisi :

- chaque candidate est une ligne large avec son **nom**, son **type** et un **aperçu de ses choix en couleurs de Grist** (« À faire · En cours · Terminé ») : on reconnaît sa colonne à ses valeurs ;
- une ligne « Aucune de celles-ci » permet d'ouvrir sans statut (cas D) ; Ouvrir se dégrise ;
- une seule ligne est ouverte à la fois, Titre avant Statut.

### 3.4 Le projet s'ouvre

Le tableau s'affiche avec ses vraies données. Si le projet n'est pas enregistré et que la personne peut l'enregistrer, un **bandeau fin** au-dessus du contenu dit : « Ce projet n'est visible que par vous. **Garder pour l'équipe** » avec un « × » (3.6). Il n'a pas de minuteur, ne masque aucune ligne et revient à l'ouverture suivante tant que le projet n'est pas enregistré, sauf si la personne l'a fermée (sa réponse est gardée dans son stockage). Il est **absent** en lecture seule et quand le projet est enregistré.

**Première écriture.** Un geste qui écrit (changer un statut, déplacer une carte) fonctionne sans nouvelle confirmation ; le message qui suit nomme la colonne : « *État* de « Arbitrage » passé à « En revue » · Annuler ».

### 3.5 Modifier les colonnes plus tard

« Relier les colonnes… » dans le menu du projet rouvre l'écran 3.3, avec les valeurs actuelles et le bouton **Appliquer** à la place d'« Ouvrir ». « Tout afficher » donne les douze rôles. Un **Annuler** défait le changement.

### 3.6 Garder pour l'équipe (`enregistrer`)

C'est le **seul moment** où Tuesday crée quelque chose, et il demande.

- Déclencheur : le bouton du bandeau (3.4), ou « Enregistrer le projet… » dans le menu du projet. Jamais une fenêtre qui surgit seule.
- La fenêtre dit **ce qui sera créé** : « Tuesday va créer une table, *Tuesday_Projets*, dans ce document (une seule fois). Elle garde le nom du projet et les colonnes reliées. Vos tâches ne sont pas copiées. » et propose le **nom du projet** (prérempli du nom de la table).
- Boutons : **Créer la table et enregistrer** / **Plus tard**. « Plus tard » ne cache rien : le bandeau reste.
- Après la création : l'identifiant réel de la table est relu (Grist peut le modifier, cahier 5.1), le bandeau disparaît, un message dit « Projet enregistré. Votre équipe le retrouvera. » avec **Annuler** (qui supprime la ligne du projet ; la table vide reste, la retirer est un geste de Grist).
- Sans droit de schéma (Grist refuse) : le bouton n'est pas masqué, la fenêtre dit « Grist ne permet pas de créer la table avec votre compte. Demandez à une personne propriétaire du document ; en attendant, Tuesday fonctionne en essai. » La personne n'a rien perdu.
- Dans GFS, **« Nouveau › Projet » de l'explorateur** commence à 3.2 (la table est choisie), et l'enregistrement en fin de parcours est immédiat (la personne a déjà donné un nom).
- **À mesurer dans un vrai Grist** : les droits qu'il faut pour `AddTable` depuis un widget, et ce que fait « Annuler » de Grist après `AddTable`.

### 3.7 Le modèle de départ (`sans-table`, `modele`)

Pour qui n'a pas de table de tâches. C'est un **choix**, jamais le chemin par défaut.

- Écran `sans-table` : « Votre document n'a pas encore de table de tâches. » Une action principale : **Créer un modèle de départ…** ; une action secondaire : « Choisir une autre table » (grisée s'il n'y en a aucune, avec la raison).
- Fenêtre `modele` : **un seul champ**, le nom de la table (« Tâches du projet »), puis **la liste de ce qui sera créé** : « Une table *Tâches du projet* avec les colonnes Tâche, Statut (À faire, En cours, En revue, Bloqué, Terminé), Responsable, Début, Échéance, Priorité. » Une case « Ajouter trois tâches d'exemple » **cochée**, avec « Vous pourrez les supprimer d'un geste ». Un bouton **Créer et ouvrir**.
- Après la création : relecture de l'identifiant réel, reconnaissance, puis l'écran de confirmation 3.3 déjà rempli (le modèle est reconnu à coup sûr), **Ouvrir** ; le message « Table créée. » porte **Annuler** (même réserve qu'en 3.6, à mesurer).
- Le modèle crée une table **de la personne**, pas une table `Tuesday_` ; c'est la seule structure que Tuesday crée dans les données (cahier 5.5).

### 3.8 La première tâche (`vide`)

Une table vide ne montre pas un tableau vide.

- Au milieu du tableau : un champ de saisie **déjà actif** « Nom de la première tâche », et sous lui « Appuyez sur Entrée : la ligne est créée dans Grist. » Entrée ajoute la tâche et **garde le champ** pour la suivante (saisie en rafale).
- Le bouton « + Tâche » reste en haut. Aucun texte de bienvenue, aucune illustration.
- Le kanban vide montre ses colonnes (les choix de Grist) avec leur « + Ajouter » : la structure se voit sans donnée.

### 3.9 Les jours suivants

- Projet enregistré : ouverture sur la dernière vue de la personne (cahier 8.3). **Aucune confirmation, aucun bandeau, aucun message.**
- Un seul projet : le nom dans la barre est un simple titre ; il devient un sélecteur à partir de deux projets.
- Une colonne a disparu ou changé de type : l'écran 3.3 se rouvre sur la seule ligne concernée, « La colonne *État* n'existe plus. Choisissez-en une autre », **sans perdre le reste** (scénario S6).

### 3.10 L'aide

- Pas de bouton « ? » dans la barre (le budget des contrôles est tenu). L'aide est dans **le menu du projet** : « Raccourcis clavier », « Comment relier mes colonnes », « À propos ».
- Chaque état d'erreur contient lui-même la phrase d'aide : on ne renvoie pas à une page.
- Les raccourcis (cahier 7) s'affichent dans l'infobulle de chaque bouton.

---

## 4. Les états, et leur sortie

| Situation | Ce que dit Tuesday | Sortie |
|---|---|---|
| Accès à Grist non accordé (3 s) | « En attente de l'accès à vos données » + la marche à suivre | Réessayer |
| Aucune table dans le document | « Votre document n'a pas encore de table de tâches. » | Créer un modèle de départ |
| Table sans colonne de texte | Grisée : « Aucune colonne de texte pour les titres » | Choisir une autre table |
| Titre ou Statut ambigu | Écran de confirmation, ligne ouverte : « Quelle colonne donne l'état d'avancement ? » | Un clic sur une candidate |
| Aucune colonne de statut | Tableau ouvert ; Kanban grisé : « Reliez une colonne Choix pour voir le kanban » | Relier / continuer sans |
| Aucune colonne de date | Chronologie grisée : « Reliez une colonne Début et une colonne Échéance » | Relier |
| Table vide | Champ « Nom de la première tâche » actif | Saisir, Entrée |
| Lecture seule | Tout visible ; boutons grisés : « Lecture seule : rien ne se modifie » | — |
| Pas le droit de créer `Tuesday_Projets` | « Grist ne permet pas de créer la table avec votre compte… » | Essai continue |
| Colonne reliée disparue | Écran de confirmation sur cette ligne : « La colonne *X* n'existe plus » | Choisir une autre colonne |
| Grist refuse une écriture | Message qui dit **laquelle** et **pourquoi** si Grist l'a dit | Annuler / réessayer |
| Très grande table (> 5 000 lignes) | Affichage progressif ; « 8 214 tâches, affichage en cours… » | Utilisable pendant le chargement |

---

## 5. Les textes (français et anglais ensemble)

Clés `onb.*`, à placer dans `i18n/` avec le reste. Pluriels `{n|singulier|pluriel}` (cahier 7).

| Clé | Français | English |
|---|---|---|
| `onb.access.title` | En attente de l'accès à vos données | Waiting for access to your data |
| `onb.access.help` | Dans le panneau de droite de Grist, choisissez « Accès complet au document », puis « Accepter ». | In Grist's right-hand panel, choose "Full document access", then "Accept". |
| `onb.start.title` | Quelle table voulez-vous suivre ? | Which table do you want to follow? |
| `onb.start.sub` | Vos données restent où elles sont. Rien n'est créé sans votre accord. | Your data stays where it is. Nothing is created without your consent. |
| `onb.start.next` | Continuer | Continue |
| `onb.confirm.open` | Ouvrir | Open |
| `onb.confirm.table` | Table | Table |
| `onb.confirm.recognized` | Reconnue | Recognized |
| `onb.confirm.choose` | À choisir | To choose |
| `onb.start.rows` | {n\|1 ligne\|{n} lignes} | {n\|1 row\|{n} rows} |
| `onb.start.noText` | Aucune colonne de texte pour les titres | No text column for titles |
| `onb.start.model` | Créer un modèle de départ… | Create a starter model… |
| `onb.ask.status` | Quelle colonne donne l'état d'avancement ? | Which column gives the progress status? |
| `onb.ask.none` | Aucune de celles-ci | None of these |
| `onb.hint.private` | Ce projet n'est visible que par vous. | Only you can see this project. |
| `onb.hint.keep` | Garder pour l'équipe | Keep for the team |
| `onb.map.more` | {n\|1 autre colonne reconnue\|{n} autres colonnes reconnues} : {list} | {n\|1 other column recognized\|{n} other columns recognized}: {list} |
| `onb.map.all` | Tout afficher | Show all |
| `onb.map.write` | Tuesday pourra modifier : {list}. Les autres colonnes ne sont que lues. | Tuesday will be able to edit: {list}. Other columns are only read. |
| `onb.map.apply` | Appliquer | Apply |
| `onb.map.gone` | La colonne « {nom} » n'existe plus. Choisissez-en une autre. | The column "{nom}" no longer exists. Choose another one. |
| `onb.save.title` | Garder ce projet pour l'équipe | Keep this project for the team |
| `onb.save.body` | Tuesday va créer une table, « Tuesday_Projets », dans ce document (une seule fois). Elle garde le nom du projet et les colonnes reliées. Vos tâches ne sont pas copiées. | Tuesday will create one table, "Tuesday_Projets", in this document (only once). It keeps the project name and the linked columns. Your tasks are not copied. |
| `onb.save.create` | Créer la table et enregistrer | Create the table and save |
| `onb.save.later` | Plus tard | Later |
| `onb.save.denied` | Grist ne permet pas de créer la table avec votre compte. Demandez à une personne propriétaire du document ; en attendant, Tuesday fonctionne en essai. | Grist does not allow creating the table with your account. Ask a document owner; meanwhile, Tuesday works in trial mode. |
| `onb.save.done` | Projet enregistré. Votre équipe le retrouvera. | Project saved. Your team will find it. |
| `onb.model.title` | Créer un modèle de départ | Create a starter model |
| `onb.model.name` | Nom de la table | Table name |
| `onb.model.will` | Sera créé : une table « {nom} » avec les colonnes Tâche, Statut ({choix}), Responsable, Début, Échéance, Priorité. | Will be created: a "{nom}" table with the columns Task, Status ({choix}), Owner, Start, Due, Priority. |
| `onb.model.sample` | Ajouter trois tâches d'exemple (vous pourrez les supprimer d'un geste) | Add three sample tasks (you can delete them in one go) |
| `onb.model.create` | Créer et ouvrir | Create and open |
| `onb.empty.first` | Nom de la première tâche | Name of the first task |
| `onb.empty.hint` | Appuyez sur Entrée : la ligne est créée dans Grist. | Press Enter: the row is created in Grist. |
| `onb.write.first` | « {colonne} » de « {tâche} » passée à « {valeur} » | "{column}" of "{task}" changed to "{value}" |

Règles de rédaction : « modèle » (jamais *template*), « ligne » seulement pour une ligne de Grist (jamais « enregistrement »), « tâche » jamais *task* en français, pas de point d'exclamation, pas de « Oups », pas de « Bienvenue ».

---

## 6. Mesures et essais d'acceptation

Ces essais s'ajoutent aux scénarios S1 à S7 (cahier 3.2) et se jouent à la vraie souris, à 700 × 400, en clair et en sombre, en français et en anglais, avec la barre de GFS aux quatre bords.

| N° | Essai | Réussite |
|---|---|---|
| O1 | Table avec « Tâche », « État » (Choix), « Responsable », « Date limite » : on ajoute le widget | L'écran de confirmation est déjà rempli ; **un clic sur Ouvrir** (ou Entrée) affiche le tableau |
| O2 | Document avec trois tables dont une table de tâches | L'écran de démarrage met la bonne table en tête ; Continuer, puis Ouvrir |
| O3 | Deux colonnes Choix, noms neutres (« Colonne A », « Colonne B ») | Ouvrir est grisé, une seule question avec l'aperçu des choix ; un clic dégrise |
| O4 | Document sans aucune table | Modèle de départ en trois clics et une saisie ; la table est dans Grist, relue avec son identifiant réel |
| O5 | Table sans colonne de date | Tableau et kanban ouverts, Chronologie grisée avec sa phrase |
| O6 | Table vide | Le champ « Nom de la première tâche » est actif ; trois Entrée = trois lignes dans Grist |
| O7 | Compte sans droit de schéma | « Garder pour l'équipe » explique, rien ne casse, le projet reste utilisable |
| O8 | Lecteur | Pas de bandeau d'enregistrement, tout grisé avec sa raison |
| O9 | Après « Garder pour l'équipe » | Un autre compte ouvre le projet sur sa vue, sans confirmation ni bandeau |
| O13 | Projet non enregistré, deuxième ouverture par la même personne | Aucune confirmation (gardée dans son stockage) ; si le stockage lève une erreur, elle reconfirme sans être bloquée |
| O10 | Accès à Grist en attente | L'écran d'attente apparaît après 3 s ; l'acceptation le remplace sans rechargement |
| O11 | Première écriture sur une colonne reconnue | Le message nomme la colonne ; **Ctrl+Z** restaure la valeur |
| O12 | Hors GFS, `localStorage` qui lève une erreur | Le démarrage marche (cahier 10.2, contrat) |

**Budgets (à fixer dès l'essai du démarrage) :** temps de reconnaissance sur 100 colonnes et 5 000 lignes, moins de 200 ms après réception des données ; premier affichage du tableau, moins de 1 s après la fin de la reconnaissance.

**Tests unitaires du cœur** (`core/mapping.js`, section 10.3 du cahier) : reconnaissance par nom puis par type, ambiguïté (et que Ouvrir reste grisé tant qu'elle dure), classement des tables, rôle absent, table sans texte, accents et casse, français et anglais, déterminisme (même table ⇒ même résultat), absence d'écriture pendant la reconnaissance. **Chaque règle de la section 3.1 a au moins un test qui la nomme.**

**Mesure d'usage** (sans collecte à distance, rien ne sort du navigateur) : à des fins de réglage, un essai avec l'équipe de l'instance DINUM (étape 9 du plan) relève à la main : temps jusqu'au tableau, nombre de clics, questions posées.

---

## 7. Écarts au cahier, et décisions à valider

**Décidé par le porteur (02/11, carte dans le fil) : toujours confirmer d'abord.** Le cahier 0.2 (5.2, « proposée, jamais appliquée en silence ») est donc **respecté** : la reconnaissance pré-remplit, la personne confirme, sur un seul écran. L'ouverture directe, écartée, est notée en ON1.

| N° | Décision | Défaut pris | Autre réponse |
|---|---|---|---|
| ON1 | **Ouverture directe** ou **toujours** la confirmation ? | **Décidé : toujours confirmer** (écran unique pré-rempli, bouton Ouvrir) | Ouverture directe : un clic de moins, rejetée par le porteur |
| ON2 | **Seul le Titre est obligatoire** (le cahier 5.2 y ajoute le Statut) | Titre seul ; sans statut, « Aucune de celles-ci » ouvre le tableau et le kanban est grisé | Statut obligatoire : un utilisateur sans colonne de statut est bloqué, contraire au principe 1 |
| ON3 | **Essai avant enregistrement** : le projet marche sans `Tuesday_Projets` tant que la personne n'a pas enregistré | Oui : l'équipe retrouve le projet seulement après « Garder pour l'équipe » | Créer la table au premier lancement : un geste de moins, mais une table créée sans que la personne l'ait vu |
| ON4 | **Trois tâches d'exemple** cochées par défaut dans le modèle de départ | Cochée | Décochée : un tableau vide pour un premier contact, moins accueillant |
| ON5 | **Délai de l'écran d'attente de l'accès** | 3 secondes | À fixer après mesure dans un vrai Grist |
| ON6 | **Pas de visite guidée** (aucune fenêtre d'accueil) | Aucune | Visite en 3 pas : plus de boutons et d'écrans, contraire à la priorité n°1 |

Les décisions ON2 à ON6 sont des défauts à confirmer au même titre que celles du cahier (section 13) ; elles ne changent aucune structure de données. **ON2 s'écarte d'une phrase du cahier** (5.2 : le Statut y est obligatoire) et demande donc son accord avant le code.

---

## 8. Ce qui dépend de Grist ou de GFS (à mesurer, pas à supposer)

1. Ce que Grist livre au widget **avant** l'acceptation de l'accès (3.0).
2. Les droits nécessaires pour `AddTable` depuis un widget, et le comportement d'**Annuler** de Grist après `AddTable` (3.6, 3.7).
3. Si `_grist_Tables` est lisible quand la section n'a pas de table choisie (3.1).
4. **GFS :** l'entrée « Nouveau › Projet » de l'explorateur doit enchaîner sur 3.2 ; la barre de GFS à gauche recouvre le bord des écrans d'onboarding (les écrans de la maquette laissent la gouttière).
5. **GFS :** les droits de la personne (propriétaire, éditeur, lecteur) ; sans eux, Tuesday essaie et explique le refus (3.6).

Tout cela se mesure dans le labo de GFS, jamais contre un faux Grist écrit ici (règle de GFS).

---

## 9. Où se trouve la maquette

`maquettes/index.html` → groupe **Premier lancement** du pupitre : *Accès en attente · Démarrage · Colonnes (confirmation) · Une question (statut ambigu) · Garder pour l'équipe · Sans table · Modèle de départ · Première tâche*. Les captures (700 × 400, clair et sombre) sont dans `maquettes/captures/onboarding-*.png`.
