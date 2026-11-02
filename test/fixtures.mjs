// Une table de tâches typique, au format des tables internes de Grist (_grist_Tables, _grist_Tables_column), pour les essais du cœur.
import { modeleDocument } from '../js/core/colonnes.js';

export const tablesMeta = [{ id: 1, tableId: 'Taches', summarySourceTable: 0 }, { id: 2, tableId: 'Equipe', summarySourceTable: 0 }, { id: 3, tableId: 'Taches_summary_Statut', summarySourceTable: 1 }];

const col = (id, parentId, colId, type, extra = {}) => ({ id, parentId, colId, label: extra.label ?? colId, type, widgetOptions: extra.widgetOptions ?? '', isFormula: extra.isFormula ?? false, formula: extra.formula ?? '', visibleCol: extra.visibleCol ?? 0, parentPos: extra.parentPos ?? id });

export const colonnesMeta = [
  col(1, 1, 'Titre', 'Text'),
  col(2, 1, 'Statut', 'Choice', { widgetOptions: JSON.stringify({ choices: ['À faire', 'En cours', 'Terminé'], choiceOptions: { 'À faire': { fillColor: '#DDDDDD', textColor: '#000000' }, 'En cours': { fillColor: '#BBDDFF' }, 'Terminé': { fillColor: '#B8E6C8' } } }) }),
  col(3, 1, 'Responsable', 'RefList:Equipe', { visibleCol: 21 }),
  col(4, 1, 'Debut', 'Date', { label: 'Début' }),
  col(5, 1, 'Echeance', 'Date', { label: 'Échéance' }),
  col(6, 1, 'Priorite', 'Choice', { label: 'Priorité', widgetOptions: JSON.stringify({ choices: ['Haute', 'Moyenne', 'Basse'] }) }),
  col(7, 1, 'Parent', 'Ref:Taches', { label: 'Tâche parente', visibleCol: 1 }),
  col(8, 1, 'Ordre', 'Numeric'),
  col(9, 1, 'Etiquettes', 'ChoiceList', { widgetOptions: JSON.stringify({ choices: ['Urgent', 'Client'] }) }),
  col(10, 1, 'Avancement', 'Numeric', { isFormula: true, formula: '$Fait / 100' }),
  col(11, 1, 'Predecesseurs', 'RefList:Taches', { label: 'Prédécesseurs', visibleCol: 1 }),
  col(12, 1, 'manualSort', 'ManualSortPos'),
  col(13, 1, 'gristHelper_Display', 'Any', { isFormula: true, formula: '$Titre' }),
  col(20, 2, 'Id_', 'Int'),
  col(21, 2, 'Nom', 'Text'),
];

export const modele = modeleDocument(tablesMeta, colonnesMeta);
export const colonnes = modele.tables.Taches.colonnes;
