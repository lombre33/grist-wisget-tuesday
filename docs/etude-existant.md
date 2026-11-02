# Étude de l'existant : widgets Grist, Monday, ClickUp

État au 02/11/2026. Cette étude nourrit le cahier des charges (`cahier-des-charges.md`). Elle sépare ce qui a été **lu** (page consultée, lien en section 6) de ce qui vient de la **connaissance générale** des outils (marqué « à revérifier »), faute d'avoir pu ouvrir leurs aides en ligne depuis l'environnement de travail.

Limite assumée : le forum `forum.grist.libre.sh` interdit l'accès automatisé à ses pages. Les fils ci-dessous ont été lus par un moteur de lecture qui en restitue le début (première page de discussion, pas toujours les derniers messages). Ils donnent les grandes lignes, pas l'exhaustivité.

## 1. Ce qui existe déjà dans Grist

### 1.1 Les widgets officiels

Le dépôt `gristlabs/grist-widget` contient `calendar` et `timeline`, mais **ni kanban, ni gantt, ni cartes**. Le widget Calendrier officiel a des défauts connus des francophones : semaine qui commence le dimanche, heures à l'américaine, ouverture sur la date du premier enregistrement plutôt que sur aujourd'hui (fil « Améliorations du calendrier pour les utilisateurs français/européens »). Grist sait aussi montrer une table en **Cartes** et en **Liste de cartes**, mais sans glisser-déposer entre colonnes.

### 1.2 Les widgets de la communauté

| Widget | Auteur / date | Ce qu'il fait | Ce qui coince | Leçon pour Tuesday |
|---|---|---|---|---|
| **Kanban** (fil 506) | Céline, janv.-févr. 2025, trois versions | Colonnes avec compteur, glisser-déposer, création et suppression de cartes, tri par échéance, fiche au clic, colonnes repliables, confettis en « Fait » | Noms de table et de colonnes **figés dans le code** ; une faute de nom bloque tout sans message ; listes de responsables et de types **codées en dur** ; une ligne sans statut n'apparaît nulle part ; une utilisatrice débutante n'a pas pu ajouter de carte | Correspondance de colonnes **choisie par la personne**, erreurs qui disent quoi faire, listes lues dans Grist |
| **Kanban** (Varamil, `kanban2`) | communauté, 2025 | Colonnes dynamiques (ordre, titre, couleur), glisser-déposer, double-clic vers la fiche Grist native, widget lié qui reçoit la sélection | Le popup d'édition ne couvre pas pièces jointes ni listes de références ; l'API de Grist ne fournit pas les choix filtrés des références ; création non annulable | Garder la **fiche native de Grist** à portée (curseur synchronisé) ; **annuler** toute action |
| **Kanban léger et personnalisable** (fil 2148) | Dycazo / Fastcube, nov. 2025 | Léger, adaptatif, colonnes choisies parmi une colonne Choice ou ChoiceList, masquage de colonnes, champs visibles, regroupement par ligne | (début du fil seulement) | Choisir la colonne de colonnes parmi les Choice ; **couloirs** (regroupement par ligne) plus tard |
| **Ultra Kanban** (fil 1654) | communauté | Kanban à **workflow** : conditions d'entrée, déplacements automatiques, limites WIP, création de sous-processus, panneau latéral des sous-tables, 5 langues | **Trop configurable pour un débutant**, de l'aveu de l'auteur ; un utilisateur lui a préféré un kanban plus simple ; erreurs « Unknown interface » et « Could not find a column… Is the link two-way ? » | L'exact contraire de l'objectif « UX d'abord » : ne pas y aller. Le workflow est le travail d'**Automation+** |
| **Mega Ultimate Power Galactic Kanban** | Grist Creators, mai 2025 | Kanban « utilisable partout », collé dans le Custom Widget Builder | Installation par copier-coller de code | Aucun copier-coller : une adresse, ou GFS |
| **Taskflow** : Kanban, Gantt, Calendar, Dashboard, Plan, Whiteboard (fil 2337) | nic01asFr, déc. 2025 | **Suite** de widgets sur deux tables `Tasks` et `Team` créées par le Kanban ; fenêtres temporelles mois à année ; affectation multiple (ajoutée en janv. 2026) ; exemple hébergé sur `grist.numerique.gouv.fr` | Marche **seulement sur son modèle de tables** : toute modification de structure casse ; le compteur par membre du Dashboard n'a pas abouti pour un utilisateur ; libellés (« En review ») non modifiables ; semaines non numérotées, agenda sur 5 jours demandé | La demande est réelle et déjà présente sur l'instance DINUM. Tuesday doit marcher **sur les tables existantes** là où Taskflow impose les siennes |
| **Gestion de Projet** (fil 3381) | Isaytoo, mars 2026 ; fait en « vibecoding » | Calendrier (mois, semaine, jour), Kanban, tableau, Gantt ; sous-tâches avec responsable et échéance ; **tâches récurrentes** ; charge par agent sur 8 semaines ; une dizaine de tables `PM_…` créées ; **correspondance de colonnes** documentée dans un guide | Documentation insuffisante (demandée par trois personnes) ; adapter le modèle (renommer, traduire, ajouter un champ) reste difficile ; pas de temps passé par sous-tâche (reporté) ; fenêtre d'édition tronquée | Le besoin va jusqu'à la **charge** et la **récurrence**. La correspondance de colonnes est la bonne idée, mais elle doit s'**faire dans l'interface**, pas dans un guide |
| **ChromaGantt** (fil 4214) | août 2026 | Gantt de production : regroupement par machine ou équipe, jalons, rôles configurables dans le widget | (début du fil seulement) | Rôles : Tuesday suit **les droits de Grist**, pas un système à part |
| **Simple Gantt** (fil 3401) | mars 2026 | Planning, échelle du jour à l'année, couleur selon l'état, trait du jour, **aucune bibliothèque** pour que le code soit auditable | (début du fil seulement) | Même contrainte que GFS : pas de bibliothèque lourde, code lisible |
| **ws-timeline** (communauté Grist) | 2024-2025 | Frise horizontale, regroupement à deux niveaux, création d'une tâche dans la vue | Dates avec heure obligatoire ; pas de dépendances ; plusieurs responsables non gérés ; ouverture sur 2024 ; texte tronqué dans la barre | Dates **sans heure** par défaut ; ouvrir sur **aujourd'hui** ; plusieurs responsables (RefList) |
| **Advanced Charts** (Anupress) | 2026 | Tableau de bord par blocs, **consentement avant l'édition**, **étape de correspondance de colonnes** avec colonnes incompatibles grisées et meilleure option signalée d'une étoile, modèles de départ, navigation au clavier | (hors sujet gestion de projet) | Très bon **patron d'interface** pour notre fenêtre de correspondance |
| **Modèle de gestion de projet** (fil 1414) | communauté | Document Grist (actions, risques, événements, décisions, jalons) avec matrice de risques et vue planning | Structure propre au document | Montre le besoin de **lier** actions, risques et jalons |
| **GristUp / GristHub** | 2025-2026 | Catalogues communautaires de widgets, installation en un clic | — | Tuesday sera servi par GFS ; GitHub Pages pour l'adresse |

### 1.3 Six constats récurrents

1. **Le démarrage est le point de douleur numéro un.** Presque chaque fil contient une personne bloquée par un nom de colonne, un accès « complet » oublié ou une table à créer à la main, sans message d'erreur utile.
2. **Les modèles imposés cassent dès qu'on touche à la structure** (Taskflow, Gestion de Projet, Kanban de Céline). La donnée existe déjà chez les gens : elle doit rester la leur.
3. **Les listes codées en dur** (responsables, types, libellés de statut) forcent à modifier le code. Tout doit venir des colonnes Choice et Référence de Grist.
4. **Les mêmes demandes reviennent** : plusieurs responsables, dates sans heure, ouverture sur aujourd'hui, semaine commençant le lundi, numéros de semaine, fenêtres plus longues, charge par personne, récurrence, documentation.
5. **Le trop-configurable fait fuir** (Ultra Kanban). Le trop-simple ne suffit plus au bout de deux mois (Kanban de Céline). Il faut une **trajectoire** : simple d'emblée, plus de choses quand on les demande.
6. **Aucun widget ne rattache la tâche à autre chose que lui-même.** Pas de lien vers un document, un formulaire, un tableau de bord : c'est l'espace laissé libre par la suite GFS.

## 2. monday.com

### 2.1 Ce qui fait son succès (lu et connaissance générale)

- **Un tableau coloré qui se comprend d'un coup d'œil**, utilisable par des non-techniciens en quelques heures (comparatifs TDPM et ToolFinder, lus).
- **Un seul objet de base, le tableau** : des **groupes** (sections repliables), des **éléments** (lignes) et des **sous-éléments**, avec des **colonnes typées** (statut, personne, date, échéance, chronologie, priorité, étiquettes, nombre, progression, liens entre tableaux, fichiers, formule, suivi du temps, etc. ; à revérifier dans l'aide).
- **La colonne Statut** : des pastilles pleines de couleur, que l'on change d'un clic. C'est le geste emblématique.
- **Plusieurs vues du même tableau** : Tableau, Kanban, Calendrier, Gantt, Chronologie, Charge, Graphique, Fichiers, Carte, Formulaire (à revérifier).
- **Automatisations « quand… alors… »** sans code, **tableaux de bord**, **documents**, **formulaires**, **plus de 200 intégrations** (lu).

### 2.2 Ce qu'on lui reproche (lu)

- La **courbe d'apprentissage reste raide** pour les novices (TDPM).
- Les fonctions avancées sont **réservées aux forfaits supérieurs** : suivi du temps à partir de Pro, tâches récurrentes traitées comme une automatisation payante, plan gratuit limité à 2 personnes.
- Le **Gantt est jugé peu utile pour construire un projet** (TDPM).
- Le coût monte vite avec la taille de l'équipe.
- **Hébergement dans le cloud uniquement** (comparatif de Grist, source commerciale : à prendre avec prudence).

## 3. ClickUp

### 3.1 Ce qu'il offre (lu et connaissance générale)

- La promesse « **une seule application pour tout remplacer** » : tâches, documents, wiki, tableaux blancs, objectifs, suivi du temps, chat, assistant d'IA ; plus de 15 vues ; plus de 1 000 intégrations (ToolFinder, lu).
- Une **hiérarchie profonde** : espace de travail, espaces, dossiers, listes, tâches, sous-tâches (à revérifier).
- **Dépendances entre tâches**, **champs personnalisés**, **charge de travail**, **récurrence**, **modèles communautaires**.

### 3.2 Ce qu'on lui reproche (lu)

- **Courbe d'apprentissage raide**, interface **encombrée**, ralentissements sur les grands espaces, beaucoup de fonctions jamais utilisées (ToolFinder, TDPM).
- Demande « un administrateur désigné » pour configurer.

## 4. Ce que Tuesday garde, remplace ou laisse aux autres

La règle : **Tuesday fait ce qu'un tableau de projet fait de mieux (voir et déplacer du travail) et laisse le reste aux apps de la suite**, parce que la suite les a déjà ou les aura.

| Fonction de Monday ou ClickUp | Dans Tuesday | Comment |
|---|---|---|
| Tableau, groupes, éléments, sous-éléments | **Oui, V1** | Les lignes d'une table Grist, groupées par une colonne ; sous-tâches par une colonne Référence vers la même table |
| Colonnes typées (statut, personne, date…) | **Oui, V1** | Ce sont les colonnes de Grist : Choice, Référence, Date, Numérique, Bool… Rien à recréer |
| Vues Tableau, Kanban, Calendrier, Chronologie | **Oui, V1** | Quatre vues, pas plus au premier jour |
| Gantt avec dépendances | **V2** | Une colonne Référence vers une autre tâche ; flèches |
| Charge de travail | **V2** | Estimation × assignation, lue dans des colonnes ; le calcul reste une formule Grist |
| Tâches récurrentes | **V2** | Demande du forum ; à décider avec Automation+ |
| Formulaires | **Non : Form+** | Un lien « créer via un formulaire » plus tard (V3) |
| Automatisations | **Non : Automation+** | Tuesday fournit les données et les gestes ; Automation+ réagit |
| Tableaux de bord et graphiques | **Non : Grist-BI / Dashboard** | Une vue « Synthèse » minimale (V2), les graphiques riches ailleurs |
| Documents, wiki | **Non : Publipostage+** | Lier un document à une tâche par l'action « choisir » de GFS (V3) |
| Tableaux blancs, chat, IA, objectifs | **Non** | Hors périmètre |
| Commentaires et fil de mises à jour | **V3** | Une table `Tuesday_…` optionnelle ; à décider |
| Suivi du temps | **V3** | Une colonne numérique lue, saisie simple |
| Invités et permissions | **Grist** | Les droits d'accès de Grist s'appliquent, rien d'autre ne les remplace |
| Modèles de tableau | **V1 minimal** | Un modèle de départ, créé seulement avec l'accord de la personne |

## 5. Dix enseignements qui guident la conception

1. **Un seul geste emblématique bien fait** : changer le statut d'une tâche en un clic ou en la faisant glisser.
2. **Le premier écran compte plus que tous les autres** : de « j'ai ajouté le widget » à « je vois mon projet » en moins d'une minute, avec une table existante.
3. **Les erreurs disent quoi faire.** Pas de « colonne introuvable » seul.
4. **Aucune liste dans le code.** Statuts, personnes, priorités viennent de Grist.
5. **Quatre vues au départ**, nommées comme les gens les nomment.
6. **Grisé, jamais masqué** : une vue qui manque d'une colonne reste visible, et un clic explique laquelle relier. C'est aussi la règle de la charte Grist Factory.
7. **Les valeurs viennent de Grist** : retard, avancement, totaux sont des **formules** de Grist que Tuesday affiche. Tuesday ne calcule pas.
8. **Le lundi, aujourd'hui, les numéros de semaine** : les trois demandes de la communauté francophone, résolues dès le premier jour.
9. **Pas de bibliothèque tierce en V1** : du DOM et du SVG, comme Simple Gantt, pour un code que l'audit peut lire.
10. **La fiche native de Grist reste à un clic** : Tuesday ne remplace pas Grist, il le met en valeur.

## 6. Sources

Lues pour cette étude :

- Fil « Kanban, Gantt, Calendar : Suite de widgets pour la gestion de tâches » — https://forum.grist.libre.sh/t/kanban-gantt-calendar-suite-de-widgets-pour-la-gestion-de-taches/2337
- Fil « Widget : Gestion de Projet » — https://forum.grist.libre.sh/t/widget-gestion-de-projet/3381
- Fil « Ultra Kanban » — https://forum.grist.libre.sh/t/ultra-kanban-un-kanban-ultra-configurable-avec-workflow/1654
- Fil « [Custom Widget] Kanban » — https://forum.grist.libre.sh/t/custom-widget-kanban/506
- Fil « Kanban léger et personnalisable » — https://forum.grist.libre.sh/t/custom-widget-kanban-leger-et-personnalisable/2148
- Fil « Widget : ChromaGantt » — https://forum.grist.libre.sh/t/widget-chromagantt/4214
- Fil « Simple Gantt » — https://forum.grist.libre.sh/t/simple-gantt-affichage-dun-planning/3401
- Fil « Modèle de gestion de projet » — https://forum.grist.libre.sh/t/modele-de-gestion-de-projet/1414
- Fil « Améliorations du calendrier pour les utilisateurs français/européens » — https://forum.grist.libre.sh/t/widget-ameliorations-du-calendrier-pour-les-utilisateurs-francais-europeens/3215
- Fil « GristUp » — https://forum.grist.libre.sh/t/gristup-un-catalogue-communautaire-de-widgets-pour-grist/2949
- Fil « Kanban custom widget » (Varamil) — https://community.getgrist.com/t/kanban-custom-widget/10610
- Fil « Ws-timeline » — https://community.getgrist.com/t/ws-timeline-timeline-widget/7424
- Fil « Suggestion for Gantt + TimeLine visualisation tool » — https://community.getgrist.com/t/suggestion-for-gantt-timeline-visualisation-tool/1863
- Fil « Advanced Charts » (Anupress) — https://community.getgrist.com/t/showcase-new-advanced-charts-a-no-code-dashboard-widget-for-grist-by-anupress/13998
- Dépôt des widgets officiels — https://github.com/gristlabs/grist-widget
- Comparatif Grist / monday (source commerciale) — https://www.getgrist.com/lookup/grist-vs-monday/
- Comparatif monday / ClickUp — https://thedigitalprojectmanager.com/monday-com-vs-clickup/
- Comparatif monday / ClickUp — https://toolfinder.com/comparisons/clickup-vs-monday-dot-com

Non lues (accès refusé depuis l'environnement) : les aides en ligne de monday.com et de ClickUp. Tout ce qui est marqué « à revérifier » doit l'être avant de s'en servir comme argument.

## Complément du 02/11/2026 : l'analyse croisée de GFS

GFS a lu le forum plus à fond (copie : [`sources/besoins-forum-gfs.md`](sources/besoins-forum-gfs.md), le document d'origine fait foi). Ce qui complète ce document :

- **Sept widgets de projet** existent (TaskFlow, Gestion de Projet, Kanban de Céline/Varamil, **Gristkanban** sorti le 29/10 sous MIT sans table imposée, Simple Gantt, ChromaGantt, Kanban Dycazo). Les deux plus gros créent encore leurs tables ; la plupart ajoutent depuis le printemps 2026 une association de colonnes.
- **Fenêtre courte** : TaskFlow repris par une société annonçant une version « pro » avant fin 2026 pour la DINUM ; Gestion de Projet livre en quelques jours.
- **Demandes** classées par nombre de personnes (mise en route plus de 20, sous-tâches 11, filtres qui restent 7, couleurs 7, réglages 7, vues de temps 6, charge 5, dépendances 4, plusieurs responsables 4, tri 4) : leur effet sur le cahier est dans `cahier-des-charges.md`, section 1.4.
- **Pièges** (dates 1970 et J-1, Références lues comme des numéros, écritures qui reviennent au rechargement, mises à jour qui n'arrivent pas, clé de filtres commune à tous les documents) : devenus cas limites et tests.
- Réserve : la licence de la plupart de ces widgets n'est pas lue ; rien n'en est repris, et la suite est en GPL 3.0.
