// La mise en place : l'outil s'ouvre toujours, même vide et même avant d'être relié à une table. Ce module dit ce qu'il montre en attendant (l'aperçu), quelle table proposer, quelles étapes
// raconter, et comment rejouer la tâche qu'on a tapée avant la fin. Pur : aucun DOM, aucun Grist.
import { modeleDocument } from './colonnes.js';
import { reconnaitre } from './mapping.js';
import { modeleDepart } from './modele-depart.js';

export const ID_APERCU = '(aperçu)';
export const NOM_TABLE_DEFAUT = 'Tâches';
export const ETAPES = ['acces', 'table', 'colonnes'];

// L'aperçu : les colonnes et les cinq statuts du modèle de départ, sans aucune ligne. Les vues le montrent comme n'importe quelle table, vide.
export function apercu(aujourdhui) {
  const m = modeleDepart(aujourdhui);
  const { tables } = modeleDocument([{ id: 1, tableId: ID_APERCU }], m.colonnes.map((c, i) => ({ id: i + 1, parentId: 1, colId: c.id, label: c.label ?? c.id, type: c.type, widgetOptions: c.widgetOptions ?? '', parentPos: i })));
  const colonnes = tables[ID_APERCU].colonnes;
  return { id: ID_APERCU, colonnes, mapping: reconnaitre(colonnes, ID_APERCU).mapping };
}

// Ce que la mise en place recommande : la table de la personne quand son titre est reconnu, sinon une table de tâches à créer. `possibles` : [{ id, score }], la meilleure d'abord.
export function recommandation(possibles) {
  const meilleure = possibles[0];
  return meilleure && meilleure.score > 0 ? { choix: 'existante', table: meilleure.id } : { choix: 'creer', table: possibles[0]?.id ?? null };
}

// Les étapes que la personne voit, dans l'ordre : l'accès seulement tant que Grist n'a pas répondu, les colonnes seulement pour une table existante.
export function etapesVisibles({ attenteAcces, choix }) {
  return ETAPES.filter(e => (e === 'acces' ? attenteAcces : e === 'colonnes' ? choix === 'existante' : true));
}

// L'étape par laquelle la mise en place s'ouvre.
export const etapeDepart = ({ attenteAcces }) => (attenteAcces ? 'acces' : 'table');

// La tâche tapée avant la fin de la mise en place, rejouée sur la vraie table : le titre est gardé, le statut seulement si la table le connaît ; le reste dépend des colonnes de l'aperçu.
export function adapterTache(parRole, mapping, choixStatut) {
  const sortie = { titre: parRole?.titre ?? '' };
  if (mapping?.statut && parRole?.statut && choixStatut.some(c => c.valeur === parRole.statut)) sortie.statut = parRole.statut;
  return sortie;
}

// Le nom d'une table à créer : lettres, chiffres et « _ » (Grist retire le reste) ; vide, on garde le nom par défaut. Un nom déjà pris reçoit un numéro.
export function nomTable(saisi, existantes = []) {
  const base = String(saisi ?? '').trim().replace(/[^\p{L}\p{N}_]+/gu, '_').replace(/^_+|_+$/g, '') || NOM_TABLE_DEFAUT;
  const prises = new Set(existantes.map(n => n.toLowerCase()));
  if (!prises.has(base.toLowerCase())) return base;
  let n = 2;
  while (prises.has(`${base}_${n}`.toLowerCase())) n++;
  return `${base}_${n}`;
}
