// Les textes de Tuesday, français et anglais côte à côte (une entrée par clé). Vouvoiement ; « modèle » et jamais « template » ; une phrase courte par état.
export const TEXTES = {
  'acces.titre': { fr: 'En attente de l\'accès au document', en: 'Waiting for access to the document' },
  'acces.sous': { fr: 'Tuesday lit et écrit dans vos tables, il lui faut l\'accès complet au document.', en: 'Tuesday reads and writes in your tables, so it needs full access to the document.' },
  'acces.etape': { fr: 'Dans Grist, ouvrez les réglages du widget et choisissez « Accès complet au document », puis acceptez.', en: 'In Grist, open the widget settings, choose "Full document access", then accept.' },
  'acces.reessayer': { fr: 'Recharger', en: 'Reload' },
  'app.chargement': { fr: 'Ouverture du projet…', en: 'Opening the project…' },
  'demo.titre': { fr: 'Démonstration', en: 'Demo' },
  'demo.explique': { fr: 'Ces données sont fictives et rien n\'est enregistré.', en: 'This data is made up and nothing is saved.' },

  'barre.vues': { fr: 'Vues', en: 'Views' }, 'barre.projet': { fr: 'Projet', en: 'Project' }, 'barre.rechercher': { fr: 'Rechercher', en: 'Search' }, 'barre.filtres': { fr: 'Filtres', en: 'Filters' },
  'barre.affichage': { fr: 'Affichage', en: 'View options' }, 'barre.annuler': { fr: 'Annuler', en: 'Undo' }, 'barre.retablir': { fr: 'Rétablir', en: 'Redo' }, 'barre.nouvelle': { fr: 'Nouvelle tâche', en: 'New task' },

  'vue.tableau': { fr: 'Tableau', en: 'Table' }, 'vue.kanban': { fr: 'Kanban', en: 'Kanban' }, 'vue.chronologie': { fr: 'Chronologie', en: 'Timeline' }, 'vue.calendrier': { fr: 'Calendrier', en: 'Calendar' },
  'zoom.semaine': { fr: 'Semaine', en: 'Week' }, 'zoom.mois': { fr: 'Mois', en: 'Month' }, 'zoom.trimestre': { fr: 'Trimestre', en: 'Quarter' }, 'zoom.annee': { fr: 'Année', en: 'Year' },

  'role.titre': { fr: 'Titre', en: 'Title' }, 'role.statut': { fr: 'Statut', en: 'Status' }, 'role.responsable': { fr: 'Responsable', en: 'Owner' }, 'role.predecesseurs': { fr: 'Prédécesseurs', en: 'Predecessors' },
  'role.debut': { fr: 'Début', en: 'Start' }, 'role.echeance': { fr: 'Échéance', en: 'Due date' }, 'role.priorite': { fr: 'Priorité', en: 'Priority' }, 'role.etiquettes': { fr: 'Étiquettes', en: 'Labels' },
  'role.parent': { fr: 'Tâche parente', en: 'Parent task' }, 'role.groupe': { fr: 'Groupe', en: 'Group' }, 'role.avancement': { fr: 'Avancement', en: 'Progress' }, 'role.ordre': { fr: 'Ordre', en: 'Order' },
  'role.description': { fr: 'Description', en: 'Description' }, 'role.aucun': { fr: 'Aucun', en: 'None' }, 'role.manuel': { fr: 'Manuel', en: 'Manual' },

  'affichage.regrouper': { fr: 'Regrouper par', en: 'Group by' }, 'affichage.trier': { fr: 'Trier par', en: 'Sort by' }, 'affichage.colorier': { fr: 'Colorier par', en: 'Color by' },
  'regroupement.aucun': { fr: 'Aucun', en: 'None' }, 'regroupement.statut': { fr: 'Statut', en: 'Status' }, 'regroupement.responsable': { fr: 'Responsable', en: 'Owner' }, 'regroupement.priorite': { fr: 'Priorité', en: 'Priority' }, 'regroupement.groupe': { fr: 'Groupe', en: 'Group' },
  'tri.manuel': { fr: 'Ordre manuel', en: 'Manual order' }, 'tri.echeance': { fr: 'Échéance', en: 'Due date' }, 'tri.priorite': { fr: 'Priorité', en: 'Priority' },
  'colorier.statut': { fr: 'Statut', en: 'Status' }, 'colorier.priorite': { fr: 'Priorité', en: 'Priority' }, 'colorier.groupe': { fr: 'Groupe', en: 'Group' }, 'colorier.responsable': { fr: 'Responsable', en: 'Owner' },

  'filtre.mes': { fr: 'Mes tâches', en: 'My tasks' }, 'filtre.mesRaison': { fr: 'Dites qui vous êtes dans le menu du projet.', en: 'Say who you are in the project menu.' }, 'filtre.jeSuis': { fr: 'Qui êtes-vous ?', en: 'Who are you?' },
  'filtre.retard': { fr: 'En retard', en: 'Overdue' }, 'filtre.statuts': { fr: 'Statuts', en: 'Statuses' }, 'filtre.responsables': { fr: 'Responsables', en: 'Owners' }, 'filtre.priorites': { fr: 'Priorités', en: 'Priorities' },
  'filtre.effacer': { fr: 'Effacer les filtres', en: 'Clear filters' }, 'filtre.retirer': { fr: 'Retirer ce filtre', en: 'Remove this filter' }, 'filtre.actifs': { fr: 'Filtres actifs', en: 'Active filters' },

  'statut.sans': { fr: 'Sans statut', en: 'No status' }, 'statut.retard': { fr: 'En retard', en: 'Overdue' }, 'priorite.sans': { fr: 'Sans priorité', en: 'No priority' }, 'responsable.sans': { fr: 'Sans responsable', en: 'Unassigned' },
  'groupe.sans': { fr: 'Sans groupe', en: 'No group' }, 'groupe.toutes': { fr: 'Toutes les tâches', en: 'All tasks' },

  'champ.sansTitre': { fr: 'Sans titre', en: 'Untitled' }, 'champ.nouvelle': { fr: 'Nouvelle tâche', en: 'New task' }, 'champ.ajouter': { fr: 'Ajouter une tâche…', en: 'Add a task…' }, 'champ.ajouterSous': { fr: 'Ajouter une sous-tâche…', en: 'Add a subtask…' },
  'champ.aucune': { fr: 'Aucune', en: 'None' }, 'champ.autres': { fr: 'Autres champs', en: 'Other fields' }, 'champ.statut': { fr: 'Statut', en: 'Status' },
  'champ.terminer': { fr: 'Marquer comme terminée', en: 'Mark as done' }, 'champ.rouvrir': { fr: 'Rouvrir la tâche', en: 'Reopen the task' }, 'champ.replier': { fr: 'Replier', en: 'Collapse' }, 'champ.deplier': { fr: 'Déplier', en: 'Expand' },
  'champ.sousTaches': { fr: '{n} {n|sous-tâche|sous-tâches}', en: '{n} {n|subtask|subtasks}' }, 'champ.sousTachesTitre': { fr: 'Sous-tâches', en: 'Subtasks' },
  'champ.bloquee': { fr: 'Bloquée', en: 'Blocked' }, 'champ.bloqueePar': { fr: 'Bloquée par : {noms}', en: 'Blocked by: {noms}' },

  'fiche.fichiers': { fr: 'Fichiers liés', en: 'Linked files' },
  'fiche.lier': { fr: 'Lier un fichier', en: 'Link a file' },
  'fiche.lierRaison': { fr: 'Les liens vers les fichiers des autres apps arrivent avec leur prise en charge par la suite.', en: 'Links to the other apps\' files arrive once the suite supports them.' },
  'projet.automatiser': { fr: 'Automatiser…', en: 'Automate…' },
  'projet.automatiserRaison': { fr: 'Prévu dans une prochaine version, avec Automation+.', en: 'Planned for a later version, with Automation+.' },
  'fiche.titre': { fr: 'Fiche de la tâche', en: 'Task details' }, 'fiche.fermer': { fr: 'Fermer', en: 'Close' }, 'fiche.supprimer': { fr: 'Supprimer', en: 'Delete' },
  'fiche.supprimerTitre': { fr: 'Supprimer « {nom} » ?', en: 'Delete "{nom}"?' }, 'fiche.supprimerMessage': { fr: 'La ligne est retirée de la table. Vous pourrez l\'annuler.', en: 'The row is removed from the table. You can undo this.' },

  'chrono.aujourdhui': { fr: 'Aujourd\'hui', en: 'Today' }, 'chrono.sansDate': { fr: 'Sans date', en: 'No date' }, 'chrono.zoom': { fr: 'Échelle', en: 'Scale' },
  'cal.precedent': { fr: 'Mois précédent', en: 'Previous month' }, 'cal.suivant': { fr: 'Mois suivant', en: 'Next month' }, 'cal.ajouterLe': { fr: 'Ajouter une tâche le {jour}', en: 'Add a task on {jour}' }, 'cal.autres': { fr: '+ {n} autres', en: '+ {n} more' },

  'vide.taches': { fr: 'Aucune tâche pour l\'instant.', en: 'No tasks yet.' }, 'vide.filtres': { fr: 'Aucune tâche ne correspond.', en: 'No task matches.' },

  'msg.statut': { fr: 'Statut changé', en: 'Status changed' }, 'msg.responsable': { fr: 'Responsable changé', en: 'Owner changed' }, 'msg.priorite': { fr: 'Priorité changée', en: 'Priority changed' }, 'msg.date': { fr: 'Date changée', en: 'Date changed' },
  'msg.parent': { fr: 'Tâche parente changée', en: 'Parent task changed' }, 'msg.etiquettes': { fr: 'Étiquettes changées', en: 'Labels changed' }, 'msg.titre': { fr: 'Titre changé', en: 'Title changed' }, 'msg.description': { fr: 'Description changée', en: 'Description changed' },
  'msg.champ': { fr: 'Champ changé', en: 'Field changed' }, 'msg.terminee': { fr: 'Tâche terminée', en: 'Task done' }, 'msg.rouverte': { fr: 'Tâche rouverte', en: 'Task reopened' },
  'msg.deplacee': { fr: 'Tâche déplacée', en: 'Task moved' }, 'msg.reordonnee': { fr: 'Tâche réordonnée', en: 'Task reordered' }, 'msg.redimensionnee': { fr: 'Durée changée', en: 'Duration changed' },
  'msg.ajoutee': { fr: 'Tâche ajoutée', en: 'Task added' }, 'msg.supprimee': { fr: 'Tâche supprimée', en: 'Task deleted' },
  'msg.annule': { fr: 'Annulé : {libelle}', en: 'Undone: {libelle}' }, 'msg.retabli': { fr: 'Rétabli : {libelle}', en: 'Redone: {libelle}' },
  'msg.conflit': { fr: 'Non annulé : quelqu\'un a modifié cette ligne depuis.', en: 'Not undone: someone changed this row since.' },
  'msg.masquee': { fr: 'Ajoutée, mais masquée par le filtre de la vue Grist.', en: 'Added, but hidden by the Grist view filter.' },
  'msg.enregistre': { fr: 'Projet gardé pour l\'équipe.', en: 'Project saved for the team.' },

  'refus.lectureSeule': { fr: 'Ce document est en lecture seule.', en: 'This document is read-only.' }, 'refus.droit': { fr: 'Grist a refusé : vous n\'avez pas le droit de modifier ici.', en: 'Grist refused: you are not allowed to edit here.' },
  'refus.formule': { fr: 'Cette colonne est calculée par une formule : elle ne se modifie pas ici.', en: 'This column is computed by a formula: it cannot be edited here.' }, 'refus.autre': { fr: 'Grist n\'a pas pu enregistrer ce changement.', en: 'Grist could not save this change.' },
  'raison.statut': { fr: 'Reliez une colonne de statut pour voir le Kanban.', en: 'Link a status column to see the Kanban.' }, 'raison.dates': { fr: 'Reliez une colonne de date (début ou échéance) pour voir les dates.', en: 'Link a date column (start or due date) to see dates.' },
  'raison.ordre': { fr: 'Reliez une colonne Ordre (numérique) pour réordonner à la main.', en: 'Link a numeric Order column to reorder by hand.' }, 'raison.triManuel': { fr: 'Passez le tri en « Ordre manuel » pour réordonner.', en: 'Switch sorting to "Manual order" to reorder.' },
  'raison.relier': { fr: 'Reliez une colonne « {role} ».', en: 'Link a "{role}" column.' }, 'raison.termine': { fr: 'Aucun statut « terminé » n\'existe dans cette colonne.', en: 'There is no "done" status in this column.' },
  'raison.statutDansGrist': { fr: 'Les statuts se nomment dans Grist (menu de la colonne). Ils apparaissent ici aussitôt.', en: 'Statuses are named in Grist (column menu). They appear here right away.' },

  'projet.projets': { fr: 'Projets', en: 'Projects' }, 'projet.autreTable': { fr: 'Ouvrir une autre table…', en: 'Open another table…' }, 'projet.jeSuis': { fr: 'Je suis…', en: 'I am…' }, 'projet.personne': { fr: 'Personne', en: 'Nobody' },
  'projet.apparence': { fr: 'Langue et thème', en: 'Language and theme' }, 'projet.langueGfs': { fr: 'La langue se choisit dans Grist Factory Suite.', en: 'The language is chosen in Grist Factory Suite.' },
  'projet.clair': { fr: 'Thème clair', en: 'Light theme' }, 'projet.sombre': { fr: 'Thème sombre', en: 'Dark theme' }, 'projet.systeme': { fr: 'Thème du système', en: 'System theme' },
  'projet.aPropos': { fr: 'À propos', en: 'About' }, 'projet.version': { fr: 'Version {version} · {mode}', en: 'Version {version} · {mode}' },

  'garder.texte': { fr: 'Ce projet n\'est gardé que pour vous.', en: 'This project is kept for you only.' }, 'garder.bouton': { fr: 'Garder pour l\'équipe', en: 'Keep for the team' }, 'garder.plusTard': { fr: 'Plus tard', en: 'Later' },
  'garder.titre': { fr: 'Garder ce projet pour l\'équipe', en: 'Keep this project for the team' }, 'garder.nom': { fr: 'Nom du projet', en: 'Project name' },
  'garder.creation': { fr: 'Une table « {table} » va être créée dans ce document ({colonnes} colonnes, une ligne par projet). Vos données ne sont pas modifiées.', en: 'A "{table}" table will be created in this document ({colonnes} columns, one row per project). Your data is not changed.' },
  'garder.ajout': { fr: 'Une ligne va être ajoutée à la table des projets. Vos données ne sont pas modifiées.', en: 'A row will be added to the projects table. Your data is not changed.' },

  'demarrage.titreTables': { fr: 'Quelle table contient vos tâches ?', en: 'Which table holds your tasks?' }, 'demarrage.sousTables': { fr: 'Choisissez-en une : rien n\'est modifié.', en: 'Pick one: nothing is changed.' },
  'demarrage.tables': { fr: 'Tables du document', en: 'Document tables' }, 'demarrage.nbColonnes': { fr: '{n} colonnes', en: '{n} columns' }, 'demarrage.continuer': { fr: 'Continuer', en: 'Continue' },
  'demarrage.titreColonnes': { fr: 'Confirmez les colonnes', en: 'Confirm the columns' }, 'demarrage.sousColonnes': { fr: 'Table « {table} ». Tuesday a rempli ce qu\'il a reconnu.', en: 'Table "{table}". Tuesday filled in what it recognized.' },
  'demarrage.choisir': { fr: 'Choisir une colonne…', en: 'Choose a column…' }, 'demarrage.aucune': { fr: 'Aucune', en: 'None' }, 'demarrage.formule': { fr: 'formule', en: 'formula' },
  'demarrage.autresColonnes': { fr: 'Autres colonnes ({n} reconnues)', en: 'Other columns ({n} recognized)' }, 'demarrage.rien': { fr: 'Rien n\'est écrit dans votre document avant que vous le décidiez.', en: 'Nothing is written to your document until you decide.' },
  'demarrage.changerTable': { fr: 'Changer de table', en: 'Change table' }, 'demarrage.ouvrir': { fr: 'Ouvrir', en: 'Open' },
  'demarrage.titreSansTable': { fr: 'Aucune table de tâches trouvée', en: 'No task table found' }, 'demarrage.sousSansTable': { fr: 'Vous pouvez partir d\'un modèle de départ.', en: 'You can start from a starter model.' },
  'demarrage.modeleExplique': { fr: 'Le modèle crée une table de tâches (titre, statut, responsable, dates, priorité) avec trois exemples. C\'est votre table : vous pouvez la modifier librement.', en: 'The model creates a task table (title, status, owner, dates, priority) with three examples. It is your table: edit it freely.' },
  'demarrage.creerModele': { fr: 'Créer un modèle de départ', en: 'Create a starter model' }, 'demarrage.choisirExistante': { fr: 'Choisir une table existante', en: 'Choose an existing table' },
  'demarrage.nomTable': { fr: 'Nom de la table', en: 'Table name' }, 'demarrage.nomTableLabel': { fr: 'Comment voulez-vous l\'appeler ?', en: 'What do you want to call it?' }, 'demarrage.nomTableDefaut': { fr: 'Taches', en: 'Tasks' },
  'demarrage.suivant': { fr: 'Suivant', en: 'Next' }, 'demarrage.accordTitre': { fr: 'Votre accord', en: 'Your approval' }, 'demarrage.creer': { fr: 'Créer', en: 'Create' },
  'demarrage.accordMessage': { fr: 'Une table « {nom} » va être créée avec 6 colonnes et 3 tâches d\'exemple. Rien d\'autre n\'est modifié.', en: 'A "{nom}" table will be created with 6 columns and 3 example tasks. Nothing else is changed.' },

  'erreur.manquant': { fr: 'Choisissez une colonne de titre pour ouvrir.', en: 'Choose a title column to open.' }, 'erreur.absente': { fr: 'La colonne « {colonne} » n\'existe plus : choisissez-en une autre.', en: 'Column "{colonne}" no longer exists: choose another.' },
  'erreur.type': { fr: 'Le type de la colonne « {colonne} » ne convient pas pour ce rôle.', en: 'The type of column "{colonne}" does not fit this role.' },
  'erreur.formule': { fr: 'La colonne « {colonne} » est calculée par une formule : choisissez-en une qui se modifie.', en: 'Column "{colonne}" is computed by a formula: choose one that can be edited.' },
  'question.titre': { fr: 'Quelle colonne donne le titre de la tâche ?', en: 'Which column gives the task title?' }, 'question.statut': { fr: 'Quelle colonne donne l\'état d\'avancement ?', en: 'Which column gives the progress status?' },
  'question.responsable': { fr: 'Quelle colonne désigne la personne responsable ?', en: 'Which column names the person in charge?' },
};

export const ROLES_TEXTES = ['titre', 'statut', 'responsable', 'predecesseurs', 'debut', 'echeance', 'priorite', 'etiquettes', 'parent', 'groupe', 'avancement', 'ordre', 'description'];
