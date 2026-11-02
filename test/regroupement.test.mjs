import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filtrer, trier, grouper, filtresActifs, FILTRES_VIDES } from '../js/core/regroupement.js';
import { construire } from '../js/core/taches.js';
import { reconnaitre } from '../js/core/mapping.js';
import { colonnes } from './fixtures.mjs';

const { mapping } = reconnaitre(colonnes, 'Taches');
const refs = { Responsable: new Map([[1, 'Anne'], [2, 'Paul']]) };
const jour = (y, m, d) => Date.UTC(y, m - 1, d) / 1000;
const rows = [
  { id: 1, Titre: 'Rédiger le rapport', Statut: 'En cours', Responsable: ['L', 1], Echeance: jour(2026, 11, 20), Priorite: 'Moyenne', Ordre: 20 },
  { id: 2, Titre: 'Relire', Statut: 'À faire', Responsable: ['L', 2], Echeance: jour(2026, 11, 1), Priorite: 'Haute', Ordre: 10 },
  { id: 3, Titre: 'Envoyer', Statut: 'Terminé', Responsable: ['L', 1, 2], Echeance: jour(2026, 10, 1), Priorite: 'Basse' },
  { id: 4, Titre: 'Idée', Statut: '', Responsable: ['L'] },
  { id: 5, Titre: 'Étrange', Statut: 'Archivé' },
];
const taches = construire(rows, { mapping, colonnes, refs, aujourdhui: '2026-11-02' });
const ids = s => [...s].sort((a, b) => a - b);

test('aucun filtre : tout passe', () => {
  assert.deepEqual(ids(filtrer(taches, FILTRES_VIDES)), [1, 2, 3, 4, 5]);
  assert.equal(filtresActifs(FILTRES_VIDES), false);
});

test('recherche : titre, responsable, accents ignorés, mots dans le désordre', () => {
  assert.deepEqual(ids(filtrer(taches, { ...FILTRES_VIDES, recherche: 'RAPPORT redige' })), [1]);
  assert.deepEqual(ids(filtrer(taches, { ...FILTRES_VIDES, recherche: 'paul' })), [2, 3]);
  assert.deepEqual(ids(filtrer(taches, { ...FILTRES_VIDES, recherche: 'etrange' })), [5]);
  assert.deepEqual(ids(filtrer(taches, { ...FILTRES_VIDES, recherche: 'zzz' })), []);
});

test('filtres par statut, responsable, priorité : cumulés (ET)', () => {
  assert.deepEqual(ids(filtrer(taches, { ...FILTRES_VIDES, statuts: ['En cours', 'À faire'] })), [1, 2]);
  assert.deepEqual(ids(filtrer(taches, { ...FILTRES_VIDES, responsables: [2] })), [2, 3]);
  assert.deepEqual(ids(filtrer(taches, { ...FILTRES_VIDES, responsables: [1], statuts: ['Terminé'] })), [3]);
  assert.deepEqual(ids(filtrer(taches, { ...FILTRES_VIDES, priorites: ['Haute'] })), [2]);
  assert.equal(filtresActifs({ ...FILTRES_VIDES, statuts: ['x'] }), true);
});

test('en retard : exclut les tâches terminées', () => {
  assert.deepEqual(ids(filtrer(taches, { ...FILTRES_VIDES, retard: true })), [2]);
});

test('mes tâches : sans identité, rien ne passe (jamais « tout »)', () => {
  assert.deepEqual(ids(filtrer(taches, { ...FILTRES_VIDES, mesTaches: true }, null)), []);
  assert.deepEqual(ids(filtrer(taches, { ...FILTRES_VIDES, mesTaches: true }, 1)), [1, 3]);
});

test('tri manuel : colonne Ordre puis ordre de la vue ; sans ordre en dernier', () => {
  assert.deepEqual(trier(taches, 'manuel').map(t => t.id), [2, 1, 3, 4, 5]);
});

test('tri par échéance : sans date en dernier, ex æquo dans l\'ordre de la source', () => {
  assert.deepEqual(trier(taches, 'echeance').map(t => t.id), [3, 2, 1, 4, 5]);
});

test('tri par priorité : ordre des choix, sans priorité en dernier', () => {
  assert.deepEqual(trier(taches, 'priorite', ['Haute', 'Moyenne', 'Basse']).map(t => t.id), [2, 1, 3, 4, 5]);
  assert.deepEqual(trier(taches, 'priorite', []).map(t => t.id), [3, 2, 1, 4, 5]);
});

test('trier ne modifie pas la liste d\'origine', () => {
  const avant = taches.map(t => t.id);
  trier(taches, 'echeance');
  assert.deepEqual(taches.map(t => t.id), avant);
});

const choixStatut = colonnes.find(c => c.id === 'Statut').choix;

test('groupes par statut : ordre et couleurs de Grist, colonnes vides gardées pour le kanban', () => {
  const g = grouper(taches, 'statut', { choix: { statut: choixStatut }, sans: 'Sans statut', garderVides: true });
  assert.deepEqual(g.map(x => x.label), ['À faire', 'En cours', 'Terminé', 'Archivé', 'Sans statut']);
  assert.equal(g[0].fond, '#DDDDDD');
  assert.equal(g[3].inconnu, true);
  assert.equal(g[4].sans, true);
});

test('groupes par statut sans colonnes vides ni « Sans statut » quand il n\'y a personne', () => {
  const g = grouper(taches.filter(t => t.statut === 'En cours'), 'statut', { choix: { statut: choixStatut }, sans: 'Sans statut' });
  assert.deepEqual(g.map(x => x.label), ['En cours']);
});

test('groupes par responsable : une tâche à deux responsables est dans les deux groupes', () => {
  const g = grouper(taches, 'responsable', { sans: 'Sans responsable' });
  assert.deepEqual(g.map(x => x.label), ['Anne', 'Paul', 'Sans responsable']);
  assert.deepEqual(g[0].taches.map(t => t.id), [1, 3]);
  assert.deepEqual(g[1].taches.map(t => t.id), [2, 3]);
  assert.deepEqual(g[2].taches.map(t => t.id), [4, 5]);
});

test('groupes par priorité et par groupe libre', () => {
  const p = grouper(taches, 'priorite', { choix: { priorite: colonnes.find(c => c.id === 'Priorite').choix }, sans: 'Sans priorité' });
  assert.deepEqual(p.map(x => x.label), ['Haute', 'Moyenne', 'Basse', 'Sans priorité']);
  const avecGroupe = taches.map((t, i) => ({ ...t, groupe: i < 2 ? 'Zèbre' : i < 3 ? 'Alpha' : '' }));
  const g = grouper(avecGroupe, 'groupe', { sans: 'Sans groupe' });
  assert.deepEqual(g.map(x => x.label), ['Alpha', 'Zèbre', 'Sans groupe']);
});

test('aucun regroupement : un seul groupe avec tout', () => {
  const g = grouper(taches, 'aucun');
  assert.equal(g.length, 1);
  assert.equal(g[0].taches.length, 5);
});

test('table vide : aucun groupe parasite', () => {
  assert.deepEqual(grouper([], 'statut', { choix: { statut: [] }, sans: 'x' }), []);
  assert.deepEqual(grouper([], 'responsable', { sans: 'x' }), []);
});
