import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lignes, optionsDe, modeleDocument, colonneDe, baseType, tableVisee, estReference, estListe, estInterne } from '../js/core/colonnes.js';
import { modele, tablesMeta, colonnesMeta } from './fixtures.mjs';

test('lignes remet les colonnes de fetchTable en lignes', () => {
  assert.deepEqual(lignes({ id: [1, 2], A: ['x', 'y'] }), [{ id: 1, A: 'x' }, { id: 2, A: 'y' }]);
  assert.deepEqual(lignes({ id: [] }), []);
  assert.deepEqual(lignes(null), []);
  assert.deepEqual(lignes({}), []);
});

test('widgetOptions : JSON, objet, vide ou cassé', () => {
  assert.deepEqual(optionsDe('{"choices":["a"]}'), { choices: ['a'] });
  assert.deepEqual(optionsDe({ a: 1 }), { a: 1 });
  assert.deepEqual(optionsDe(''), {});
  assert.deepEqual(optionsDe('{pas du json'), {});
  assert.deepEqual(optionsDe(null), {});
  assert.deepEqual(optionsDe('42'), {});
});

test('types : base, table visée, référence, liste', () => {
  assert.equal(baseType('DateTime:Europe/Paris'), 'DateTime');
  assert.equal(tableVisee('Ref:Taches'), 'Taches');
  assert.equal(tableVisee('Text'), null);
  assert.ok(estReference('RefList:X'));
  assert.ok(!estReference('Choice'));
  assert.ok(estListe('ChoiceList'));
  assert.ok(!estListe('Ref:X'));
  assert.ok(estInterne('manualSort'));
  assert.ok(estInterne('gristHelper_Display'));
  assert.ok(!estInterne('Titre'));
});

test('le modèle écarte les tables de synthèse et les colonnes internes', () => {
  assert.deepEqual(Object.keys(modele.tables).sort(), ['Equipe', 'Taches']);
  const ids = modele.tables.Taches.colonnes.map(c => c.id);
  assert.ok(!ids.includes('manualSort'));
  assert.ok(!ids.includes('gristHelper_Display'));
  assert.ok(ids.includes('Titre'));
});

test('les choix gardent leurs couleurs et leur ordre ; sans couleur, null', () => {
  const statut = colonneDe(modele, 'Taches', 'Statut');
  assert.deepEqual(statut.choix.map(c => c.valeur), ['À faire', 'En cours', 'Terminé']);
  assert.equal(statut.choix[0].fond, '#DDDDDD');
  assert.equal(statut.choix[0].texte, '#000000');
  assert.equal(statut.choix[1].texte, null);
  assert.equal(colonneDe(modele, 'Taches', 'Priorite').choix[0].fond, null);
});

test('une colonne à formule est repérée, pas une colonne de données', () => {
  assert.equal(colonneDe(modele, 'Taches', 'Avancement').formule, true);
  assert.equal(colonneDe(modele, 'Taches', 'Titre').formule, false);
});

test('une colonne vide à déclencheur (isFormula faux) n\'est pas une formule', () => {
  const m = modeleDocument(tablesMeta, [{ id: 1, parentId: 1, colId: 'A', type: 'Text', isFormula: false, formula: '$B', widgetOptions: '' }]);
  assert.equal(m.tables.Taches.colonnes[0].formule, false);
});

test('colonne affichée d\'une Référence et table visée', () => {
  const resp = colonneDe(modele, 'Taches', 'Responsable');
  assert.equal(resp.table, 'Equipe');
  assert.equal(resp.voir, 'Nom');
  assert.equal(colonneDe(modele, 'Taches', 'Parent').voir, 'Titre');
});

test('libellé : celui de Grist, ou l\'identifiant à défaut', () => {
  assert.equal(colonneDe(modele, 'Taches', 'Debut').libelle, 'Début');
  const m = modeleDocument(tablesMeta, [{ id: 1, parentId: 1, colId: 'Zzz', type: 'Text', label: '' }]);
  assert.equal(m.tables.Taches.colonnes[0].libelle, 'Zzz');
});

test('les colonnes suivent l\'ordre de la table', () => {
  const m = modeleDocument(tablesMeta, [
    { id: 1, parentId: 1, colId: 'B', type: 'Text', parentPos: 2 },
    { id: 2, parentId: 1, colId: 'A', type: 'Text', parentPos: 1 },
  ]);
  assert.deepEqual(m.tables.Taches.colonnes.map(c => c.id), ['A', 'B']);
});

test('format colonnes de fetchTable accepté tel quel', () => {
  const m = modeleDocument({ id: [1], tableId: ['T'], summarySourceTable: [0] }, { id: [1], parentId: [1], colId: ['X'], type: ['Text'], widgetOptions: [''], isFormula: [false], formula: [''], visibleCol: [0], label: ['X'], parentPos: [1] });
  assert.equal(m.tables.T.colonnes[0].id, 'X');
});

test('colonne ou table inconnue : null, sans lever', () => {
  assert.equal(colonneDe(modele, 'Nope', 'X'), null);
  assert.equal(colonneDe(modele, 'Taches', 'Nope'), null);
  assert.equal(colonneDe(null, 'Taches', 'X'), null);
});

test('une colonne orpheline (table absente) est ignorée', () => {
  const m = modeleDocument(tablesMeta, [...colonnesMeta, { id: 99, parentId: 77, colId: 'Orph', type: 'Text' }]);
  assert.ok(!Object.values(m.tables).some(t => t.colonnes.some(c => c.id === 'Orph')));
});
