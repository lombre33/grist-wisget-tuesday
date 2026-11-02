// Le modèle de départ : pour qui n'a pas de table de tâches. Colonnes recommandées (titre, statut à cinq choix colorés, responsable, début, échéance, priorité) et trois tâches d'exemple.
import { ajouterJours } from './dates.js';

const choix = (liste, couleurs) => JSON.stringify({ choices: liste, choiceOptions: Object.fromEntries(liste.map((v, i) => [v, { fillColor: couleurs[i][0], textColor: couleurs[i][1] }])) });

export const STATUTS_DEPART = ['À faire', 'En cours', 'En revue', 'Terminé', 'Bloqué'];
export const PRIORITES_DEPART = ['Haute', 'Moyenne', 'Basse'];

export function modeleDepart(aujourdhui) {
  const secondes = iso => Date.parse(`${iso}T00:00:00Z`) / 1000;
  const jour = n => secondes(ajouterJours(aujourdhui, n));
  return {
    colonnes: [
      { id: 'Titre', type: 'Text', isFormula: false },
      { id: 'Statut', type: 'Choice', isFormula: false, widgetOptions: choix(STATUTS_DEPART, [['#E0E3EA', '#1B2430'], ['#CFE0FD', '#16367E'], ['#FBE3B0', '#5C3B00'], ['#C9ECD9', '#0E4A31'], ['#F8D0D0', '#7A1F1F']]) },
      { id: 'Responsable', type: 'Text', isFormula: false },
      { id: 'Debut', type: 'Date', isFormula: false, label: 'Début' },
      { id: 'Echeance', type: 'Date', isFormula: false, label: 'Échéance' },
      { id: 'Priorite', type: 'Choice', isFormula: false, label: 'Priorité', widgetOptions: choix(PRIORITES_DEPART, [['#F8D0D0', '#7A1F1F'], ['#FBE3B0', '#5C3B00'], ['#E0E3EA', '#1B2430']]) },
    ],
    lignes: [
      { Titre: 'Première tâche', Statut: 'Terminé', Debut: jour(-3), Echeance: jour(-1), Priorite: 'Moyenne' },
      { Titre: 'Deuxième tâche', Statut: 'En cours', Debut: jour(0), Echeance: jour(4), Priorite: 'Haute' },
      { Titre: 'Troisième tâche', Statut: 'À faire', Debut: jour(5), Echeance: jour(9), Priorite: 'Basse' },
    ],
  };
}
