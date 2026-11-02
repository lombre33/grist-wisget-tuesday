import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selection, lignesTableau, colonnesKanban } from '../js/core/vue.js';
import { construire, arbre } from '../js/core/taches.js';
import { reconnaitre } from '../js/core/mapping.js';
import { lire } from '../js/core/reglages.js';
import { colonnes } from './fixtures.mjs';

const { mapping } = reconnaitre(colonnes, 'Taches');
const refs = { Responsable: new Map([[1, 'Anne'], [2, 'Paul']]) };
const rows = [
  { id: 1, Titre: 'Mère', Statut: 'En cours', Ordre: 1 },
  { id: 2, Titre: 'Fille A', Statut: 'Terminé', Parent: 1, Ordre: 2 },
  { id: 3, Titre: 'Fille B', Statut: 'À faire', Parent: 1, Ordre: 3, Responsable: ['L', 2] },
  { id: 4, Titre: 'Seule', Statut: 'À faire', Ordre: 4, Responsable: ['L', 1] },
  { id: 5, Titre: 'Sans statut', Statut: '', Ordre: 5 },
];
const taches = construire(rows, { mapping, colonnes, refs, aujourdhui: '2026-11-02' });
const a = arbre(taches);
const choix = { statut: colonnes.find(c => c.id === 'Statut').choix, priorite: colonnes.find(c => c.id === 'Priorite').choix };
const reglages = (extra = {}) => ({ ...lire(''), ...extra, filtres: { ...lire('').filtres, ...(extra.filtres ?? {}) } });
const ids = g => g.lignes.map(l => l.tache.id);

test('sans filtre : tout est visible, aucun ancêtre en contexte', () => {
  const s = selection(taches, a, reglages());
  assert.equal(s.actif, false);
  assert.equal(s.visibles.size, 5);
});

test('une sous-tâche trouvée fait apparaître sa mère, grisée (contexte)', () => {
  const r = reglages({ filtres: { recherche: 'fille b' } });
  const g = lignesTableau({ taches, arbre: a, reglages: r, choix });
  assert.deepEqual(ids(g[0]), [1, 3]);
  assert.equal(g[0].lignes[0].contexte, true);
  assert.equal(g[0].lignes[1].contexte, false);
});

test('tableau sans regroupement : un groupe, les sous-tâches sous leur mère, décompte', () => {
  const g = lignesTableau({ taches, arbre: a, reglages: reglages(), choix });
  assert.equal(g.length, 1);
  assert.deepEqual(ids(g[0]), [1, 2, 3, 4, 5]);
  assert.deepEqual(g[0].lignes.map(l => l.profondeur), [0, 1, 1, 0, 0]);
  assert.equal(g[0].lignes[0].total, 2);
  assert.equal(g[0].lignes[0].faites, 1);
});

test('mère repliée : ses sous-tâches disparaissent mais restent comptées', () => {
  const g = lignesTableau({ taches, arbre: a, reglages: reglages({ replies: ['1'] }), choix });
  assert.deepEqual(ids(g[0]), [1, 4, 5]);
  assert.equal(g[0].lignes[0].replie, true);
  assert.equal(g[0].lignes[0].total, 2);
});

test('regroupement par statut : les groupes portent les racines, les filles suivent leur mère', () => {
  const g = lignesTableau({ taches, arbre: a, reglages: reglages({ regroupement: 'statut' }), choix, sans: { statut: 'Sans statut' } });
  assert.deepEqual(g.map(x => x.label), ['À faire', 'En cours', 'Sans statut']);
  assert.deepEqual(ids(g[1]), [1, 2, 3]);
  assert.equal(g[1].nombre, 1);
});

test('tri par échéance appliqué aux racines et aux sous-tâches', () => {
  const g = lignesTableau({ taches, arbre: a, reglages: reglages({ tri: 'echeance' }), choix });
  assert.equal(g[0].lignes.length, 5);
});

test('kanban : toutes les colonnes de statut, y compris vides, sans filtre', () => {
  const k = colonnesKanban({ taches, reglages: reglages(), choix, sans: 'Sans statut' });
  assert.deepEqual(k.map(c => c.label), ['À faire', 'En cours', 'Terminé', 'Sans statut']);
  assert.equal(k[2].taches.length, 1);
});

test('kanban filtré : seules les cartes qui passent, colonnes gardées', () => {
  const k = colonnesKanban({ taches, reglages: reglages({ filtres: { statuts: ['À faire'] } }), choix, sans: 'Sans statut' });
  assert.deepEqual(k.map(c => c.label).slice(0, 3), ['À faire', 'En cours', 'Terminé']);
  assert.equal(k[0].taches.length, 2);
  assert.equal(k[1].taches.length, 0);
});

test('filtre sans résultat : aucun groupe, pas d\'erreur', () => {
  const g = lignesTableau({ taches, arbre: a, reglages: reglages({ filtres: { recherche: 'zzzz' } }), choix });
  assert.equal(g.reduce((n, x) => n + x.lignes.length, 0), 0);
});

test('mes tâches avec identité', () => {
  const s = selection(taches, a, reglages({ moi: 1, filtres: { mesTaches: true } }));
  assert.deepEqual([...s.passants], [4]);
});
