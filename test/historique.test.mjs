import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Historique } from '../js/core/historique.js';

const lecteur = lignes => (table, id) => lignes[`${table}:${id}`];
const maj = (id, avant, apres) => ({ type: 'maj', table: 'T', id, avant, apres });

test('historique vide : rien à annuler ni à rétablir', () => {
  const h = new Historique();
  assert.equal(h.peutAnnuler, false);
  assert.equal(h.peutRetablir, false);
  assert.deepEqual(h.preparer('annuler', lecteur({})), { ok: false, raison: 'vide' });
  assert.deepEqual(h.preparer('retablir', lecteur({})), { ok: false, raison: 'vide' });
});

test('annuler une mise à jour rend les anciennes valeurs, rétablir les nouvelles', () => {
  const h = new Historique();
  h.pousser({ libelle: 'Statut', ops: [maj(1, { Statut: 'À faire' }, { Statut: 'En cours' })] });
  const a = h.preparer('annuler', lecteur({ 'T:1': { id: 1, Statut: 'En cours' } }));
  assert.deepEqual(a.actions, [['UpdateRecord', 'T', 1, { Statut: 'À faire' }]]);
  h.valider('annuler');
  assert.equal(h.peutAnnuler, false);
  assert.equal(h.peutRetablir, true);
  const r = h.preparer('retablir', lecteur({ 'T:1': { id: 1, Statut: 'À faire' } }));
  assert.deepEqual(r.actions, [['UpdateRecord', 'T', 1, { Statut: 'En cours' }]]);
  h.valider('retablir');
  assert.equal(h.peutAnnuler, true);
});

test('un nouveau pas efface ce qui pouvait être rétabli', () => {
  const h = new Historique();
  h.pousser({ libelle: 'a', ops: [maj(1, { A: 1 }, { A: 2 })] });
  h.valider('annuler') ; // sans effet sur la pile vide du rétablir
  h.preparer('annuler', lecteur({ 'T:1': { A: 2 } }));
  h.valider('annuler');
  assert.equal(h.peutRetablir, true);
  h.pousser({ libelle: 'b', ops: [maj(2, { A: 1 }, { A: 3 })] });
  assert.equal(h.peutRetablir, false);
});

test('conflit : une valeur changée par une autre personne n\'est jamais écrasée', () => {
  const h = new Historique();
  h.pousser({ libelle: 'Statut', ops: [maj(1, { Statut: 'À faire' }, { Statut: 'En cours' })] });
  const r = h.preparer('annuler', lecteur({ 'T:1': { id: 1, Statut: 'Terminé' } }));
  assert.equal(r.ok, false);
  assert.equal(r.raison, 'conflit');
  assert.equal(h.peutAnnuler, true);
});

test('conflit : la ligne a été supprimée entre-temps', () => {
  const h = new Historique();
  h.pousser({ libelle: 'x', ops: [maj(1, { A: 1 }, { A: 2 })] });
  assert.equal(h.preparer('annuler', lecteur({})).raison, 'conflit');
});

test('un pas abandonné ne bloque pas les suivants', () => {
  const h = new Historique();
  h.pousser({ libelle: 'vieux', ops: [maj(1, { A: 1 }, { A: 2 })] });
  h.pousser({ libelle: 'récent', ops: [maj(2, { A: 1 }, { A: 2 })] });
  h.abandonner('annuler');
  assert.equal(h.libelleAnnuler, 'vieux');
});

test('annuler un ajout supprime la ligne ; rétablir la rend avec ses valeurs et son identifiant', () => {
  const h = new Historique();
  h.pousser({ libelle: 'Ajout', ops: [{ type: 'ajout', table: 'T', id: 9, valeurs: { Titre: 'Neuve' } }] });
  const a = h.preparer('annuler', lecteur({ 'T:9': { id: 9, Titre: 'Neuve' } }));
  assert.deepEqual(a.actions, [['RemoveRecord', 'T', 9]]);
  h.valider('annuler');
  const r = h.preparer('retablir', lecteur({}));
  assert.deepEqual(r.actions, [['BulkAddRecord', 'T', [9], { Titre: ['Neuve'] }]]);
});

test('annuler une suppression rend la ligne à son identifiant ; refusé si l\'identifiant est repris', () => {
  const h = new Historique();
  h.pousser({ libelle: 'Suppression', ops: [{ type: 'suppr', table: 'T', id: 4, valeurs: { Titre: 'Perdue', Ordre: 3 } }] });
  assert.deepEqual(h.preparer('annuler', lecteur({})).actions, [['BulkAddRecord', 'T', [4], { Titre: ['Perdue'], Ordre: [3] }]]);
  assert.equal(h.preparer('annuler', lecteur({ 'T:4': { id: 4 } })).raison, 'conflit');
});

test('un pas à plusieurs opérations s\'annule dans l\'ordre inverse, en un lot', () => {
  const h = new Historique();
  h.pousser({ libelle: 'Glisser', ops: [maj(1, { Statut: 'A' }, { Statut: 'B' }), maj(2, { Ordre: 1 }, { Ordre: 5 })] });
  const a = h.preparer('annuler', lecteur({ 'T:1': { Statut: 'B' }, 'T:2': { Ordre: 5 } }));
  assert.deepEqual(a.actions.map(x => x[2]), [2, 1]);
});

test('un pas dont une seule opération est en conflit n\'est pas annulé du tout', () => {
  const h = new Historique();
  h.pousser({ libelle: 'Glisser', ops: [maj(1, { Statut: 'A' }, { Statut: 'B' }), maj(2, { Ordre: 1 }, { Ordre: 5 })] });
  assert.equal(h.preparer('annuler', lecteur({ 'T:1': { Statut: 'B' }, 'T:2': { Ordre: 99 } })).ok, false);
});

test('valeurs de listes comparées en profondeur', () => {
  const h = new Historique();
  h.pousser({ libelle: 'r', ops: [maj(1, { R: ['L'] }, { R: ['L', 1, 2] })] });
  assert.equal(h.preparer('annuler', lecteur({ 'T:1': { R: ['L', 1, 2] } })).ok, true);
  assert.equal(h.preparer('annuler', lecteur({ 'T:1': { R: ['L', 1] } })).ok, false);
});

test('la mémoire est bornée', () => {
  const h = new Historique(3);
  for (let i = 0; i < 10; i++) h.pousser({ libelle: String(i), ops: [maj(i, { A: 0 }, { A: 1 })] });
  assert.equal(h.passes.length, 3);
  assert.equal(h.libelleAnnuler, '9');
});

test('un pas vide n\'est pas gardé', () => {
  const h = new Historique();
  h.pousser({ libelle: 'rien', ops: [] });
  h.pousser(null);
  assert.equal(h.peutAnnuler, false);
});

test('renseigner l\'identifiant d\'un ajout après la réponse de Grist', () => {
  const h = new Historique();
  const pas = { libelle: 'Ajout', ops: [{ type: 'ajout', table: 'T', id: null, valeurs: { Titre: 'x' } }] };
  h.pousser(pas);
  h.renseignerId(pas, 0, 12);
  assert.deepEqual(h.preparer('annuler', lecteur({ 'T:12': { id: 12 } })).actions, [['RemoveRecord', 'T', 12]]);
});
