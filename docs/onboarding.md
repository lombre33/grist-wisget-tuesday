# Onboarding de Tuesday : l'outil d'abord, la mise en place en pop-up

Version 0.2 du 03/11/2026. Remplace la 0.1 du 02/11 (« toujours confirmer d'abord, sur un écran à la place de l'outil »), écartée après l'essai d'Antoine sur un Grist vide. Complète le cahier des charges (principe 0, sections 5.2, 5.5, 6.6) et `etat-v1.md`.

## Ce qui s'est passé, et ce qu'on en retient

Le 03/11, Antoine lance Tuesday sur un Grist vide. Il tombe sur un écran « Confirmez les colonnes » : Titre « Choisir une colonne… », Statut « Aucune », « Autres colonnes (0 reconnues) », bouton Ouvrir grisé. Il ne voit pas l'outil, ne comprend pas les choix à faire, et ne peut pas continuer. **L'écran faisait exactement ce que la 0.1 avait prévu (confirmer d'abord) : c'était le mauvais parti.** Un écran de réglage à la place de l'outil est un mur, même bien rempli ; sur une table que Tuesday ne reconnaît pas, il est en plus une impasse.

Consigne du porteur (03/11) :

> Il faut que les gens arrivent sur l'outil, vide si nécessaire mais complet, et puissent naturellement commencer à ajouter des tâches. Et si besoin d'un onboarding pour régler les tables en lecture/écriture : en pop-up au lancement, avec des captures d'écran, en mode tuto ; si on le ferme sans le faire, il se rouvre quand on veut ajouter une tâche.

## En bref

1. **L'outil est toujours là.** Dès le premier affichage : la barre, les quatre vues, le tableau avec sa ligne « Ajouter une tâche ». Sur une table non reliée, il montre un **aperçu vide** (les colonnes et les cinq statuts du modèle de départ). Rien n'est grisé, rien ne manque.
2. **Lire est libre, écrire demande la mise en place.** Si une table est reconnue, ses tâches s'affichent tout de suite, en lecture. Tant que la personne n'a pas confirmé, aucun geste n'écrit.
3. **La mise en place est un pop-up**, en trois étapes au plus (accès, table, colonnes), avec un schéma par étape. Il s'ouvre au lancement tant que rien n'est relié.
4. **Le fermer ne coûte rien** (« Plus tard », Échap). L'outil reste utilisable en lecture, un bandeau fin rappelle « Terminer la mise en place ».
5. **Il se rouvre au moment utile** : dès qu'on veut ajouter, modifier ou supprimer une tâche (bouton « + Tâche », ligne d'ajout, touche N, glisser une carte).
6. **Rien n'est perdu.** La tâche qu'on vient de taper est gardée, affichée dans le pop-up (« Votre tâche « Appeler le client » sera ajoutée dès que tout est prêt »), et ajoutée à la fin.
7. **Aucune table n'est créée sans un geste qui la nomme** : le bouton dit « Créer la table « Tâches » ».

---

## 1. Principes

Dans l'ordre : quand deux principes s'opposent, le premier gagne.

1. **L'outil avant le réglage.** Aucun écran de réglage ne remplace l'outil. Le pop-up passe **par-dessus** l'outil, qu'on voit derrière.
2. **Jamais bloqué.** Chaque état a une sortie dite en une phrase ; ce qui manque est grisé avec sa raison, jamais masqué. Le pop-up se ferme toujours.
3. **Le chemin le plus court d'abord.** Table reconnue : un clic (« Utiliser cette table »). Document vide : un clic (« Créer la table « Tâches » »). Les colonnes ne se choisissent à la main que si Tuesday hésite.
4. **Recommander, pas demander.** Le pop-up propose une réponse (carte « Recommandé » en tête) au lieu de poser une question ouverte.
5. **Rien n'est écrit ni créé sans geste.** Ouvrir l'outil ne modifie pas le document. Le bouton qui crée une table la nomme.
6. **Écrire seulement quand c'est réglé.** Avant la mise en place, un geste d'écriture ouvre le pop-up au lieu d'échouer.
7. **Le texte est court et dit « vous »** (vouvoiement, « modèle » jamais « template », « tâche » jamais « task »), français et anglais ensemble.
8. **Honnête sur les schémas.** Les figures du pop-up sont des schémas dessinés avec les jetons du kit, légendés « Schéma » ; une vraie capture de Grist les remplacera (section 6).

---

## 2. Qui arrive, et dans quel état

| Cas | Situation | Ce que voit la personne |
|---|---|---|
| **A** | Grist vide (une « Table1 » avec A, B, C) | L'outil en aperçu vide ; pop-up « Où voulez-vous ranger vos tâches ? » avec **Créer une table de tâches** recommandée |
| **B** | Une table de tâches reconnue (titre + statut) | Les tâches déjà à l'écran, en lecture ; pop-up avec **Utiliser une table de mon document** recommandée, Reconnu : Titre, Statut, Échéance |
| **C** | Colonnes ambiguës (deux colonnes Choix, par exemple) | Pop-up sur la table ; « Suivant » mène à l'étape **Colonnes**, la ligne ambiguë marquée |
| **D** | Plusieurs tables | La liste déroulante de la carte « Utiliser une table », la plus probable en tête |
| **E** | Accès à Grist pas encore accordé | Pop-up d'abord sur **Accès** (3 s sans réponse de Grist) |
| **F** | Pop-up fermé, puis « + Tâche » | Le pop-up revient, avec la tâche tapée |
| **G** | Projet déjà enregistré, ou déjà confirmé par la personne | Le projet sur sa vue, **aucun pop-up** |
| **H** | Lecture seule | L'outil et ses données, gestes d'écriture grisés avec leur raison ; **jamais de pop-up** |

---

## 3. Le parcours

```
Lancement ──► l'outil s'affiche TOUT DE SUITE (tâches de la table reconnue, ou aperçu vide)
   │
   ├─ projet enregistré / déjà confirmé ──► prêt, aucun pop-up
   │
   └─ sinon ──► pop-up de mise en place par-dessus
                   ├─ (Accès)  seulement si Grist n'a pas répondu
                   ├─ Table    Utiliser une table existante | Créer une table de tâches
                   └─ Colonnes seulement pour une table existante qu'il faut préciser
                         │
        « Plus tard » ◄──┤──► « Utiliser cette table » / « Créer la table… » / « Terminer »
                │                       │
        bandeau « Terminer              ▼
        la mise en place »        prêt : la tâche tapée est ajoutée, ou « Tout est prêt »
                │
   écrire (+ Tâche, ligne d'ajout, N, déplacer…) ──► le pop-up revient
```

### 3.1 Le démarrage, sans écran de réglage

- Le constructeur de l'app pose l'**aperçu** (`core/miseenplace.js`, `apercu`) : les colonnes et les cinq statuts du modèle de départ, aucune ligne. Les vues le montrent comme n'importe quelle table, vide. La barre affiche « Aperçu » à la place du nom du projet.
- `init()` cherche, dans l'ordre : un projet enregistré (cas G), une correspondance déjà confirmée par la personne (cas G), puis une table reconnue (**essai**, en lecture : tâches affichées, rien de mémorisé). Sinon l'aperçu reste.
- Quand l'accès à Grist tarde, l'outil reste affiché ; 3 s plus tard le pop-up s'ouvre sur l'étape **Accès**. Dès que Grist répond, il passe à **Table** tout seul.

### 3.2 Le pop-up (`ui/miseenplace.js`)

Un petit tutoriel : le titre de l'étape, la progression (« 1 Table · 2 Colonnes »), un **schéma** à gauche, le contenu à droite, « Plus tard » en bas à gauche, le bouton principal en bas à droite. Largeur 660 px, il tient dans 700 × 400 (le contenu défile, titre et boutons restent).

**Étape Accès** (seulement tant que Grist n'a pas répondu)
- Schéma : le panneau de droite de Grist, « Niveau d'accès » avec « Accès complet » repéré 1, « Accepter » repéré 2.
- Texte : « Dans le panneau de droite de Grist, repérez « Niveau d'accès » et choisissez « Accès complet ». Cliquez sur « Accepter ». » + « Rien ne quitte votre document. »
- Bouton : **Recharger**.

**Étape Table**
- Deux cartes à bouton radio, la **recommandée en tête** (étiquette « Recommandé ») :
  - **Utiliser une table de mon document** : liste de ses tables (la plus probable en tête, avec le nombre de colonnes) et une phrase « Reconnu : Titre : Tâche · Statut : État · Échéance : Date limite » ; grisée avec sa raison s'il n'y a aucune table (« Aucune table utilisable dans ce document »).
  - **Créer une table de tâches** : un champ nom (« Tâches » par défaut), une case « Ajouter trois tâches d'exemple » (**décochée** : un outil vide est prêt à recevoir la première vraie tâche) et ce qui sera créé : « Colonnes créées : Titre, Statut (5 choix), Responsable, Début, Échéance, Priorité. »
- Bouton principal : **Utiliser cette table** (colonnes sûres), **Suivant** (Tuesday hésite : mène à Colonnes), **Créer la table « Tâches »** (le bouton nomme ce qui sera créé, il suit le champ nom à la frappe).
- Lien « Vérifier les colonnes » quand elles sont sûres.
- Si une tâche a été tapée : le bandeau « Votre tâche « … » sera ajoutée dès que tout est prêt » en tête.

**Étape Colonnes** (table existante à préciser)
- **Titre** et **Statut** en tête (pré-remplis par la reconnaissance), « Autres colonnes (n reconnues) » repliées.
- Une ligne ambiguë est marquée et dit la question (« Quelle colonne donne l'état d'avancement ? »). Un titre manquant dit « Choisissez une colonne de titre pour ouvrir. » et le pop-up reste ouvert. Sans colonne de texte : « revenez en arrière pour en créer une ».
- Boutons : **Précédent**, **Terminer**.

**Après le geste** : le pop-up se ferme, la table est reliée et mémorisée pour cette personne (pas pour l'équipe : voir 3.4), la tâche en attente est ajoutée, sinon le message « Tout est prêt. Ajoutez votre première tâche. » En cas d'échec de Grist (droit refusé, par exemple), le pop-up reste ouvert et dit pourquoi ; rien n'est perdu.

### 3.3 Quand le pop-up revient

`app.verrou()` est le seul point d'entrée des gestes d'écriture. Il répond, dans l'ordre :

1. **Lecture seule** → refus avec sa raison, jamais de pop-up.
2. **Mise en place pas faite** → le pop-up s'ouvre (le geste n'écrit rien). Pour un ajout, la tâche tapée est gardée dans `tacheEnAttente`.
3. Sinon l'écriture se fait.

Cela couvre « + Tâche », la ligne d'ajout de chaque groupe, la touche N, les menus de statut, les cases à cocher, les déplacements du kanban, du calendrier et de la chronologie, la fiche et la suppression. Fermer le pop-up n'efface pas la tâche en attente ; une autre tâche tapée la remplace.

Si le pop-up est déjà ouvert, un geste d'écriture n'efface pas le choix de la personne.

### 3.4 « Garder pour l'équipe » (inchangé)

Une fois l'outil prêt, un bandeau fin propose « Garder pour l'équipe » : seul moment où `Tuesday_Projets` est créée, après un accord qui nomme la table. La mise en place faite ici est **la confirmation de cette personne** ; les autres personnes qui ouvrent le document la refont une fois (un clic : « Utiliser cette table ») tant que le projet n'est pas gardé pour l'équipe. C'est la raison d'être du bandeau.

### 3.5 Revenir plus tard

« Ouvrir une autre table… » du menu du projet rouvre le pop-up sur l'étape **Table**, avec le projet actuel derrière. Aucun menu de réglages supplémentaire.

---

## 4. Les états

| Situation | Ce que dit Tuesday | Sortie |
|---|---|---|
| Grist vide | Aperçu complet ; pop-up « Où voulez-vous ranger vos tâches ? » | **Créer la table « Tâches »** |
| Accès pas encore accordé | Pop-up Accès avec les deux gestes à faire dans Grist | Recharger |
| Table reconnue | Tâches visibles ; pop-up « Reconnu : … » | **Utiliser cette table** |
| Colonne ambiguë | Étape Colonnes, ligne marquée, question en une phrase | Un choix dans la liste |
| Pas de colonne de texte | « …revenez en arrière pour en créer une » | Précédent, ou créer une table |
| Pop-up fermé | Bandeau « Terminez la mise en place pour ajouter des tâches » | Terminer la mise en place |
| Écriture sans mise en place | Le pop-up revient, avec la tâche tapée | Terminer, ou Plus tard |
| Grist refuse (droit, réseau) | Le pop-up reste ouvert, avec la phrase de Grist | Réessayer, ou demander à un propriétaire |
| Lecture seule | Tout visible, gestes grisés avec leur raison | — |
| Démonstration hors de Grist | Le bandeau « Démonstration · données fictives » reste affiché | — |

---

## 5. Textes

Clés `mep.*` et `fig.*` dans `js/textes.js` (français et anglais côte à côte, vouvoiement, test des variables communes). Phrases clés :

| Clé | Français |
|---|---|
| `mep.table.titre` | Où voulez-vous ranger vos tâches ? |
| `mep.table.creer` | Créer une table de tâches |
| `mep.table.existante` | Utiliser une table de mon document |
| `mep.creer` | Créer la table « {nom} » |
| `mep.utiliser` | Utiliser cette table |
| `mep.acces.titre` | Autorisez Tuesday à lire et écrire |
| `mep.bandeau` | Terminez la mise en place pour ajouter des tâches. |
| `mep.table.attente` | Votre tâche « {titre} » sera ajoutée dès que tout est prêt. |
| `mep.pret` | Tout est prêt. Ajoutez votre première tâche. |

---

## 6. Les schémas, et les vraies captures

Les trois figures (accès, table, colonnes) sont dessinées en DOM avec les jetons du kit (`ui/figures.js`). Elles sont **fidèles à l'esprit, pas à Grist** : les libellés du panneau de Grist (« Niveau d'accès », « Accès complet », « Accepter ») sont à vérifier dans un vrai Grist.

**À faire par le porteur ou dans le labo de GFS** : prendre de vraies captures du panneau de droite de Grist (français et anglais) pour l'étape Accès, et les déposer dans `assets/onboarding/` ; la figure se remplace alors par l'image (même taille, 190 px de large). Tant que ce n'est pas fait, les schémas portent la légende « Schéma ». Une image locale passe par `img-src 'self'` de la politique de sécurité, à ajouter à ce moment.

---

## 7. Essais

**Unitaires** (`test/miseenplace.test.mjs`, `test/app.test.mjs`) : l'aperçu a toutes les colonnes et les quatre vues ; la recommandation ; les étapes visibles ; l'adaptation de la tâche tapée ; le nom de table ; un document vide ouvre l'outil et recommande de créer ; une table sans colonne reconnue recommande de créer, sans bloquer ; écrire avant la mise en place l'ouvre et garde la tâche ; fermer ne casse rien ; la lecture seule n'ouvre jamais ; terminer avec une table existante relie et ajoute la tâche ; terminer sans titre reste ouvert ; l'accès tardif ferme l'étape Accès.

**Navigateur** (`test/navigateur/essais.cjs`, 700 × 400, `?demo=vide` pour le document neuf) :

| Essai | Réussite |
|---|---|
| Grist vide | Quatre vues sans grisé, pop-up « Créer » recommandé, « Plus tard » ne bloque rien, rien créé |
| Ajouter avant la mise en place | Le pop-up revient avec la tâche tapée ; la table est créée, la tâche y est |
| « + Tâche », N | Rouvrent le pop-up, rien d'écrit ; Échap = Plus tard |
| Table reconnue | Tâches visibles derrière le pop-up, un clic, rien d'écrit avant |
| Colonnes | « Vérifier » ouvre l'étape ; Terminer sans titre reste ouvert avec sa raison |
| Accès | Le pop-up dit quoi faire, l'outil reste derrière |
| Anglais, thème sombre | Mêmes écrans, textes traduits |
| Lecture seule | Jamais de pop-up |

**Mesuré nulle part encore** : le comportement dans un vrai Grist (section 8).

---

## 8. Ce qui dépend de Grist ou de GFS (à mesurer, pas à supposer)

1. Ce que Grist livre au widget **avant** l'acceptation de l'accès complet : l'étape Accès repose sur un délai de 3 s.
2. Les droits nécessaires pour `AddTable` depuis un widget, et ce que fait « Annuler » de Grist après `AddTable`.
3. Les libellés exacts du panneau de Grist pour l'accès (section 6).
4. Ce que Grist envoie pour une table « Table1 » neuve (colonnes A, B, C de type `Any`) : la reconnaissance suppose qu'aucun type ne convient au titre.
5. **GFS :** l'entrée « Nouveau › Projet » de l'explorateur doit pouvoir ouvrir directement le pop-up sur l'étape Table.

---

## 9. Décisions

Les décisions du 03/11 viennent d'Antoine ; les défauts ci-dessous restent à confirmer.

| N° | Décision | Défaut pris | Autre réponse |
|---|---|---|---|
| ON1 | L'outil d'abord, mise en place en pop-up | **Décidé (03/11)** | — |
| ON2 | Seul le Titre est obligatoire (le cahier 5.2 y ajoute le Statut) | Titre seul ; sans statut, le kanban est grisé avec sa raison | Statut obligatoire : bloque les tables sans statut |
| ON3 | Trois tâches d'exemple à la création de la table | **Décochée** (outil vide, prêt à recevoir la première vraie tâche) | Cochée : plus accueillant, mais des lignes à supprimer |
| ON4 | Le pop-up s'ouvre à **chaque** lancement tant que rien n'est relié | Oui, il se ferme d'un geste | Une seule fois par personne : moins insistant, mais l'ajout le rouvre de toute façon |
| ON5 | Délai de l'étape Accès | 3 secondes | À fixer après mesure dans un vrai Grist |
| ON6 | Pas de visite guidée en plus du pop-up | Aucune | — |
| ON7 | Après « Utiliser cette table », « Garder pour l'équipe » reste un bandeau distinct | Oui | Enchaîner : un clic de moins, une table créée plus tôt |
