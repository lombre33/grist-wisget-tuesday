> Copie du document de GFS (02/11/2026), reçue du porteur. **Le document d'origine fait foi** (https://claude.ai/artifact/5kpp15jJHNVG4eJxAxaFoK). Croisé avec le cahier dans `../cahier-des-charges.md` (section « Besoins du forum croisés »).

# Tuesday : besoins tirés du forum Grist (analyse de GFS)


Sur le forum Grist, ce qui bloque le plus les outils de projet est la mise en route, pas une fonction manquante : plus de vingt personnes butent sur des tables imposées, des noms exacts ou la copie du document. Viennent ensuite les sous-tâches (11 personnes), les filtres qui restent (7) et les couleurs (7).

Lu : les trois plus gros fils (suite Kanban-Gantt-Calendar, Kanban, Gestion de projet : 237 messages) et cinq petits widgets, presque en entier ; chiffres du 2 novembre 2026. Tuesday est l'app de projets que le cahier de GFS appelle Thusday.

## Les widgets de projet qui existent déjà

Sept widgets se partagent le sujet. Les premiers imposaient leurs tables ; depuis le printemps 2026 la plupart ajoutent une association de colonnes, mais les deux plus gros créent encore les leurs.

| Widget | Ce qu'il impose | Licence, hébergement | Où il en est |
| --- | --- | --- | --- |
| [TaskFlow](https://forum.grist.libre.sh/t/2337) : Kanban, Gantt, Calendar, Dashboard, Plan de charge (100 messages, 5 918 vues) | Tables `Tasks` et `Team` créées par le Kanban, « widget maître » ; depuis octobre le Gantt crée aussi ses tables, une version paramétrable est en test | GitHub Pages ; licence non indiquée dans le fil | Forké par une société : une version « pro » promise avant fin 2026, à proposer à la DINUM ([message 90](https://forum.grist.libre.sh/t/2337/90)) |
| [Gestion de Projet](https://forum.grist.libre.sh/t/3381) : calendrier, Kanban, tableau, Gantt (67 messages, 2 463 vues) | « Une dizaine de tables » (`PM_Tasks`, `PM_Users`, `PM_Projects`…) ; association des colonnes possible depuis le 31 mars | Annoncé « open source », licence non lue ; démo limitée ; hébergement chez soi conseillé | Corrections en quelques jours après chaque retour ; vise la galerie par défaut de Grist ; une validation DINUM/ANCT est demandée ([message 68](https://forum.grist.libre.sh/t/3381/68)) |
| [Kanban](https://forum.grist.libre.sh/t/506) (70 messages, 4 896 vues) | Versions 1 à 3 : table `TODO_LIST` aux noms exacts ; la version de Varamil associe les colonnes dans le panneau de droite | Licence non indiquée ; un fork audité existe chez gristgouv | La v5 n'est plus compatible avec les précédentes ; l'autrice passe à Gristkanban |
| [Gristkanban](https://forum.grist.libre.sh/t/4562) (29/10/2026) | Rien : « votre table n'est jamais restructurée », et rien n'est écrit avant « Créer mon Kanban » | MIT ; GitHub Pages ; suit le design de l'État (DSFR) | Tout neuf, 2 messages |
| [Simple Gantt](https://forum.grist.libre.sh/t/3401) | Colonnes à associer ; dépendances par une colonne Référence multiple « Prédécesseur » | Environ 250 lignes sans bibliothèque externe, pensé pour être audité ; licence non indiquée | En mars, les barres ne se déplaçaient pas ([message 10](https://forum.grist.libre.sh/t/1414/10)) |
| [ChromaGantt](https://forum.grist.libre.sh/t/4214) | Aucune table imposée ; les champs se choisissent dans le widget | Code « largement généré avec Claude » ; licence non précisée | Rôles, notifications, français et anglais ; 1 message |
| [Kanban Dycazo](https://forum.grist.libre.sh/t/2148) | Une colonne Choix ou Liste de choix pour les colonnes du Kanban | Accès complet au document ; licence non précisée | 5 messages ; l'ordre des colonnes suit l'ordre des choix |

## Ce que les gens demandent

Les chiffres comptent des personnes différentes dans les trois grands fils (décompte à la main, ordre de grandeur). La mise en route passe devant toute fonction.

| Demande | Personnes | Déjà livré chez |
| --- | --- | --- |
| Mise en route sans bricolage : s'adapter à ses tables, copier ou intégrer le document, un pas-à-pas | plus de 20 | Gristkanban et ChromaGantt (aucune table imposée) ; Gestion de Projet et Kanban de Varamil (association des colonnes) |
| Sous-tâches : cases à cocher, avancement, responsable et échéance propres, affichage dans le Gantt | 11 | TaskFlow, Gestion de Projet |
| Filtres qui restent : par projet, par personne, par rôle ; vues enregistrées | 7 | Gestion de Projet (filtres en cascade), TaskFlow (vues enregistrées depuis octobre) |
| Couleurs par projet, priorité, catégorie ou statut | 7 | TaskFlow, Gestion de Projet |
| Réglages sans toucher au code : statuts et colonnes du Kanban qu'on nomme soi-même, nombre d'événements visibles, blocs du tableau de bord | 7 | Gestion de Projet, TaskFlow (statuts) |
| Vues de temps : du jour à l'année, plage libre, « aujourd'hui », projet sur deux années | 6 | TaskFlow, Gestion de Projet |
| Charge et temps passé par personne | 5 | TaskFlow (plan de charge), Gestion de Projet ; le lissage du réalisé est contesté ([message 89](https://forum.grist.libre.sh/t/2337/89)) |
| Dépendances : recalcul des dates, « bloqué par » | 4 | TaskFlow (recalcul) ; Gestion de Projet (repère, sans trait) ; Simple Gantt |
| Plusieurs responsables par tâche, avec leur temps | 4 | TaskFlow, Gestion de Projet |
| Tri et regroupement du Kanban : échéance, priorité, projet | 4 | TaskFlow (tri depuis le 5 octobre), Gestion de Projet |
| Droits : cacher les vues de gestion, faire valider la sécurité par la DINUM et l'ANCT | 3 | Gestion de Projet masque des onglets aux éditeurs ; aucune validation |

**Demandes isolées (1 ou 2 personnes)** : récurrence ; export PDF ou Markdown ; dates prévues et dates réelles ; vue du jour ; pièces jointes et commentaires ; alertes par e-mail (les auteurs répondent qu'un widget n'envoie pas d'e-mail seul, et renvoient à n8n) ; structure riche (axe, objectif, action ; champs « contexte », « sponsor »).

**Ce qui plaît, dit tel quel** : la réactivité des auteurs (Gestion de Projet répond point par point en quelques jours) et les gestes simples, double-clic pour modifier une carte, « + » pour ajouter depuis l'agenda.

## Les pièges déjà rencontrés

Chaque lien pointe vers le message du forum : nom du fil et numéro.

- **Tables et noms imposés.** Un nom différent et plus rien ne s'affiche : `TODO_LIST` écrit `TABLE_TODO_LIST` ([Kanban 20](https://forum.grist.libre.sh/t/506/20)), une colonne `Email2` que Grist a renommée en cas de conflit ([Gestion 39](https://forum.grist.libre.sh/t/3381/39)), un Gantt resté en « mode démonstration » après le renommage des colonnes ([TaskFlow 99](https://forum.grist.libre.sh/t/2337/99)).
- **Vues liées entre elles.** « Le widget ne fonctionnera que sur le template des tables définies », le Kanban étant le « widget maître » ([TaskFlow 7](https://forum.grist.libre.sh/t/2337/7)) ; une personne qui ne voulait que le Gantt a demandé des vues indépendantes ([TaskFlow 88](https://forum.grist.libre.sh/t/2337/88)).
- **Dates.** `01/01/1970` à la création d'une tâche ([TaskFlow 8](https://forum.grist.libre.sh/t/2337/8), [27](https://forum.grist.libre.sh/t/2337/27)) ; le 31/12/2026 affiché en janvier 2027 ([TaskFlow 23](https://forum.grist.libre.sh/t/2337/23)) ; échéances à J-1 à cause du fuseau horaire ([Kanban 26](https://forum.grist.libre.sh/t/506/26)) ; dates fictives en l'an 3000 pour ranger les cartes sans date ([Kanban 66](https://forum.grist.libre.sh/t/506/66)).
- **Colonnes Référence.** Elles arrivent comme des numéros et cassent les compteurs ([TaskFlow 32](https://forum.grist.libre.sh/t/2337/32)) ; écrire dedans « mettait Grist en erreur » ([Kanban 39](https://forum.grist.libre.sh/t/506/39)) ; une colonne à formule refuse l'écriture, « Can't save value to formula column » ([Kanban 56](https://forum.grist.libre.sh/t/506/56)).
- **Table source filtrée ou partagée.** Le formulaire d'ajout ne s'affiche plus ([Kanban 66](https://forum.grist.libre.sh/t/506/66)) ; avec deux widgets sur la même table, le projet ne se remplit pas tout seul, « il faudrait une évolution de Grist » ([Kanban 46](https://forum.grist.libre.sh/t/506/46)).
- **Copie du document.** Des personnes ne peuvent ni le télécharger ni le dupliquer ([TaskFlow 68](https://forum.grist.libre.sh/t/2337/68)) ; l'export de la structure donnait une erreur ([TaskFlow 50](https://forum.grist.libre.sh/t/2337/50)), réglée par une case à cocher ([53](https://forum.grist.libre.sh/t/2337/53)).
- **Mises à jour qui n'arrivent pas.** « Aucune différence de tri » : la personne croyait la mise à jour automatique ([TaskFlow 101](https://forum.grist.libre.sh/t/2337/101)) ; il faut « forcer le rechargement (Ctrl+F5) » ([Gestion 67](https://forum.grist.libre.sh/t/3381/67)) ; l'instance de l'État servait une copie non synchronisée ([Kanban 65](https://forum.grist.libre.sh/t/506/65)).
- **Saisies et choix perdus.** La fenêtre d'une tâche perd ce qui n'est pas enregistré quand on ajoute un commentaire, et l'écran remonte tout seul ([Gestion 63](https://forum.grist.libre.sh/t/3381/63)) ; les filtres étaient mémorisés sous une clé commune à tous les documents ([Gestion 67](https://forum.grist.libre.sh/t/3381/67)) ; le mode d'affichage du Gantt se perd en changeant de vue ([TaskFlow 65](https://forum.grist.libre.sh/t/2337/65)).
- **Modifier depuis la vue.** Déplacer, renommer ou supprimer ne s'enregistre pas ou revient au rechargement ([TaskFlow 60](https://forum.grist.libre.sh/t/2337/60), [102](https://forum.grist.libre.sh/t/2337/102), [Kanban 30](https://forum.grist.libre.sh/t/506/30) : six personnes au moins).
- **Droits.** Cacher les tables du widget par les règles d'accès a fait perdre aux agents les données à jour ([Gestion 36](https://forum.grist.libre.sh/t/3381/36)) ; sans droit d'écriture, le bouton d'ajout ne fait rien et ne dit rien ([Kanban 53](https://forum.grist.libre.sh/t/506/53)).
- **Beaucoup de projets.** Une liste de plus de 200 projets est trop longue ([Gestion 26](https://forum.grist.libre.sh/t/3381/26)) ; une organisation en compte 400 ([Gestion 53](https://forum.grist.libre.sh/t/3381/53)).
- **Un modèle de données qui bouge.** La v5 du Kanban « n'est pas vraiment compatible avec les précédentes » ([Kanban 42](https://forum.grist.libre.sh/t/506/42)).
- **Accès complet, code non relu.** Tous ces widgets demandent l'accès complet au document. Les instances de la DINUM et de l'ANCT n'utilisent que des widgets audités ([Kanban 34](https://forum.grist.libre.sh/t/506/34)), et une personne demande que l'outil de projets soit validé pour elles ([Gestion 68](https://forum.grist.libre.sh/t/3381/68)). Voir le [récapitulatif du forum](https://claude.ai/artifact/KbmXEK1kxUEawQ6VneTvks).
- **Un indicateur de surcharge peut faire peur aux équipes** ([Gestion 14](https://forum.grist.libre.sh/t/3381/14)).

## Ce que ça implique pour Tuesday dans GFS

Ce sont des pistes tirées du forum et des règles de GFS, pas des décisions : le contenu de la première version revient à Antoine.

- **Partir de la table de la personne, et compter les tables.** Les règles de GFS vont dans le sens de la mise en route : choix des colonnes dans une liste avec recherche, aucune table créée sans accord, rien d'écrit sans un geste. Gristkanban promet déjà cela, pour le Kanban seul. TaskFlow en crée au moins deux (Tasks et Team) et Gestion de Projet une dizaine, alors que GFS demande d'en limiter le nombre : il faut décider tôt où vivent les sous-tâches, les personnes et les réglages.
- **Les calculs vivent dans Grist.** Dépendances avec recalcul, avancement, charge, récurrence : ce sont des colonnes à formule. Si l'app les crée, elle doit déclarer la capacité `formules` (contrats 3.4), que la personne voit à l'installation. Il faudra dire quelles fonctions entrent dans la première version et lesquelles attendent.
- **Chaque vue marche seule.** Un Kanban seul, un Gantt seul, sur la même table : c'est la plainte vue chez TaskFlow ([TaskFlow 88](https://forum.grist.libre.sh/t/2337/88)) et la règle de GFS (une app complète qui tourne seule).
- **L'isolement répond à « accès complet ».** Dans GFS, l'app ne voit que les tables de son manifeste `gfs.json` ; seule, elle demande l'accès complet comme les autres. C'est l'argument de confiance, à dire sans promettre plus que ce qui est mesuré (cahier 1.3).
- **Tenir dans la durée.** Les mises à jour qui n'arrivent pas et les modèles qui cassent (la v5 du Kanban) sont des pièges chez les autres. Les règles de GFS les couvrent : site qui reste publié (fichier `.nojekyll`, publication vérifiée à chaque lot) et données changées par ajouts seulement. À appliquer dès le premier commit.
- **Ne pas refaire.** Les e-mails entrants et les alertes (il faut un serveur : n8n, ou Automation+), le calendrier (intégré à Grist depuis la 1.7.14, d'après le [récapitulatif du forum](https://claude.ai/artifact/KbmXEK1kxUEawQ6VneTvks)), le tableau blanc (un seul avis, [TaskFlow 82](https://forum.grist.libre.sh/t/2337/82)).
- **Une fenêtre courte.** Une société qui a repris TaskFlow annonce une version « pro » avant fin 2026, proposée à la DINUM ; Gestion de Projet livre en quelques jours et vise la galerie par défaut. Un petit noyau bien installé est plus réaliste qu'un rattrapage de fonctions.
- **Un noyau possible, à discuter.** Ce que les chiffres soutiennent : la mise en route sur sa propre table, les sous-tâches, plusieurs responsables, des statuts qu'on nomme, des couleurs, des filtres qui restent, un Kanban et un Gantt simple (dates, jalons, sous-tâches). Dépendances, charge et récurrence viendraient après, car elles demandent des formules.

## Sources

Chiffres du 2 novembre 2026, lus sur le forum de la communauté Grist ([forum.grist.libre.sh](https://forum.grist.libre.sh/tag/custom-widgets)).

- [Kanban, Gantt, Calendar : suite de widgets pour la gestion de tâches](https://forum.grist.libre.sh/t/2337) : 100 messages, 5 918 vues, 53 j'aime. Tous les messages lus, sauf deux supprimés.
- [[Custom Widget] Kanban](https://forum.grist.libre.sh/t/506) : 70 messages, 4 896 vues, 47 j'aime. Tous lus.
- [Widget : Gestion de Projet](https://forum.grist.libre.sh/t/3381) : 67 messages, 2 463 vues, 51 j'aime. Lus : les messages 1 à 62 (deux numéros absents, supprimés), puis 63, 67, 68 et 71. Non vus : 64 à 66, 69 et 70, les réponses de la fin.
- Petits fils : [Gristkanban](https://forum.grist.libre.sh/t/4562), [Simple Gantt](https://forum.grist.libre.sh/t/3401), [ChromaGantt](https://forum.grist.libre.sh/t/4214), [Kanban Dycazo](https://forum.grist.libre.sh/t/2148), [Modèle de gestion de projet](https://forum.grist.libre.sh/t/1414) (un document modèle, pas un widget).

Non lu : le code et la licence des widgets sur GitHub. À lire avant toute reprise d'une idée, puisque la suite est en GPL 3.0 et que la plupart ne disent pas leur licence. La lecture web du forum passe par un résumé automatique : une citation entre guillemets se recoupe avec le message avant de s'engager sur un détail.
