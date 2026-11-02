# Demandes à GFS et réponses

Tuesday ne pousse jamais dans le dépôt de GFS (règle de GFS). Les demandes partent par Antoine ; GFS répond par des consignes dans `consignes/tuesday/` de `lombre33/grist-widget-gfs`. Dans l'app, elles se déposeront dans la section « Demandes à GFS » de `GFS-ETAT.md`. État au 02/11/2026, après la lecture des consignes 001 à 004 (commit `9bf8db4` de GFS).

## Résumé

| N° | Demande | Réponse de GFS | État |
|---|---|---|---|
| 1 | Automation+ en fond dès qu'une automatisation existe | Décision enregistrée ; construite à l'étape 6 de GFS (consigne 004) | acceptée, rien à coder chez nous |
| 2 | Calendrier : voie A ou B | Choix au porteur (carte posée par GFS) ; consigne à venir | **attend Antoine** |
| 3 | Manifeste | `gfs.json` valide à `99b80e2` (consigne 002) | faite |
| 4 | Liens entre apps | `choisir` et `ouvrir` écrits, pas construits ; entrées grisées en attendant (002) | **attend Antoine** (construire maintenant ?) |
| 5 | Insertion d'une carte (V2) | Forme du rendu portable arrêtée ; déroulement à l'étape 7 (003) | reportée |
| 6 | Barre de GFS | Zone donnée par le kit, deux manières permises (002) | faite côté réponse, à coder |
| 7 | Couleur, point de départ, identité | Neutre ; point de départ en V2 ; identité par choix unique (003) | faite |

## 1. Automation+ en fond (consigne 004)

Acceptée. Automation+ tournera caché derrière l'app active seulement si le document a au moins une automatisation ; sans automatisation, aucun second sous-cadre. Chez Tuesday rien ne change : on ne l'ouvre pas, on ne sait pas s'il tourne, on se met à jour par les changements de nos tables.

- « Il existe un automatisme » : au moins une ligne `Type = Workflow` à `Actif` vrai dans la table `Automation` d'Automation+ (un automatisme désactivé ne compte pas, comme proposé). Pas encore au contrat ; GFS le confirme à l'étape 6 avec Automation+.
- Pas de double exécution : le verrou d'exécution d'Automation+ (ligne `Lock`) existe déjà ; GFS le mesure à l'étape 6.
- Coût mémoire et reprise après rechargement : à mesurer à l'étape 6 dans un vrai Grist, aucun chiffre aujourd'hui.

## 2. Calendrier intégré (003, point 5b)

GFS a posé la question au porteur : voie A (module du kit monté par Tuesday et Calendar+) ou voie B (Calendar+ ouvert par GFS, Tuesday se ferme). GFS répond par une consigne dès qu'il a choisi. Le calendrier de Tuesday reste comme il est. Voir `integration-suite.md`, 1.

## 3. Manifeste (consigne 002)

`gfs.json` passe l'outil de validation sans erreur. Points tranchés :

- Type unique « Projet » (`projet`, `Tuesday_Projets`) permis, présent dans `actions.ouvrir` et `actions.choisir`.
- `Tuesday_Liens` : le préfixe `Tuesday_` la couvre, rien à déclarer ; aucune autre app ne peut l'écrire. GFS préfère une ligne réservée mais admet une table de plus : **défaut pris : une seule table de plus, créée avec l'accord de la personne, identifiant relu après `AddTable`.** À faire dans le cahier : écrire pourquoi une ligne réservée ne suffit pas (plusieurs liens par tâche).
- `gristInterne` (`_grist_Tables`, `_grist_Tables_column`) en lecture, avec le `pourquoi` en français et en anglais : accepté.
- `full` avec `lit` et `ecrit` à `"*"` : couvre les tables de la personne, pas celles d'une autre app ni `GFS_*`.
- `inserer` reste `{ "produit": [], "recoit": [] }` jusqu'à l'étape 7.

## 4. Liens entre apps (002, point 2)

`choisir { types, apps?, titre? }` rend `{ app, id, nom, type }` ou `null` ; `ouvrir { app, fichier: { id, type } }` rend `{ ouvert }`. **Écrit, pas encore construit** (ni courtier ni kit 0.2.0) : un appel reçoit `GFS_INCONNU`. D'ici là « Lier un fichier » et « Ouvrir » sont grisés avec leur raison, jamais masqués. Le porteur décide si GFS construit ce lot maintenant.

Fichier renommé ou disparu (défaut de GFS, à confirmer) : la clé du lien est `{ app, id, type }` ; le nom n'est qu'une étiquette, peut-être périmée. Disparu ou app absente : le lien reste, grisé avec « fichier introuvable » ou « app à installer », jamais effacé tout seul. Option : demander à GFS que `ouvrir` renvoie le nom du jour (un champ de plus), si on y tient.

## 5. Insertion d'une carte (003, point 1)

V2. Le rendu portable est arrêté : `{ format: "svg" | "png" | "valeur", donnees, largeur, hauteur, texteAlternatif, source: { app, id, type, version } }`. Le déroulement et la taille maximale s'écrivent à l'étape 7. La carte sera l'un des trois formats, choisi avec nous alors ; l'accord de Publipostage+ est le sien. En attendant, `inserer.produit` reste vide et l'entrée est grisée.

## 6. Barre de GFS (002, point 3)

À gauche au milieu à 700 × 400 : `{ x: 0, y: 134, largeur: 42, hauteur: 132 }`. Jamais en dur : `GfsLink.onBar(barre => …)` du kit 0.2.0 donne `{ bord, epaisseur, zone }` (ou `null`) à chaque changement. Deux manières permises : écart ligne par ligne recalculé au défilement, ou la gouttière actuelle (épaisseur + 8 px sur toute la hauteur). Condition : rien de cliquable ni de lisible sous la zone, aux quatre bords. GFS mesurera dans GFS, à 700 × 400, en clair et en sombre.

## 7. Couleur, « Automatiser… », identité (003)

- Couleur du type « Projet » : neutre, jusqu'à ce que le porteur en demande une.
- Point de départ de « Automatiser… » (V2) : n'existe ni chez GFS ni chez Automation+ (pas de `ouvrir`) ; sa forme s'écrira à notre V2 par une consigne à chacun. Entrée grisée avec sa raison en attendant ; on n'écrit jamais dans une table d'Automation+.
- « Mes tâches » : défaut du cahier (question 6) : la personne se choisit une fois dans la liste des responsables, retenu par `GfsLink.storageSet`. Aucune identité dans le `contexte`. Reconnaissance d'office : à redemander plus tard si besoin.

## À faire de notre côté

1. Cahier : justifier `Tuesday_Liens` (plusieurs liens par tâche) ; mettre les décisions ci-dessus dans les sections 8 et 13.
2. Code : entrées de liens et « Automatiser… » grisées avec raison ; barre via `GfsLink.onBar`, quatre bords ; `gfs.json` à la racine tel que validé.
3. Quand GFS aura la décision du porteur : calendrier (voie A ou B), construction des liens.
