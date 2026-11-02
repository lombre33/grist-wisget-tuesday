import { test } from 'node:test';
import assert from 'node:assert/strict';
import { referencesDe, etiquettesRefs } from '../js/data/refs.js';
import { modele } from './fixtures.mjs';
import { creerDemo } from '../js/data/demo.js';
import { TABLE_PROJETS } from '../js/core/projet.js';

test('références d\'une table : table visée et colonne affichée', () => {
  const r = referencesDe(modele, 'Taches');
  const resp = r.find(x => x.colId === 'Responsable');
  assert.deepEqual(resp, { colId: 'Responsable', table: 'Equipe', voir: 'Nom' });
  assert.equal(r.find(x => x.colId === 'Parent').table, 'Taches');
  assert.deepEqual(referencesDe(modele, 'Nope'), []);
});

test('noms affichés : le texte de la colonne affichée, #id si vide', () => {
  const m = etiquettesRefs(modele, 'Taches', { Equipe: [{ id: 1, Nom: 'Anne' }, { id: 2, Nom: '' }, { id: 3, Nom: null }], Taches: [{ id: 5, Titre: 'Mère' }] });
  assert.equal(m.Responsable.get(1), 'Anne');
  assert.equal(m.Responsable.get(2), '#2');
  assert.equal(m.Responsable.get(3), '#3');
  assert.equal(m.Parent.get(5), 'Mère');
});

test('table visée absente des données : carte vide, pas d\'erreur', () => {
  const m = etiquettesRefs(modele, 'Taches', {});
  assert.equal(m.Responsable.size, 0);
});

test('démonstration : lecture, écriture, identifiants, retour arrière sur échec', async () => {
  const port = creerDemo({ maintenant: new Date(2026, 10, 2) });
  const avant = await port.lignes('Taches');
  assert.ok(avant.length >= 10);
  const retours = await port.appliquer([['AddRecord', 'Taches', null, { Titre: 'Neuve' }]]);
  assert.equal(retours[0], avant.length + 1);
  await port.appliquer([['UpdateRecord', 'Taches', 1, { Statut: 'À faire' }]]);
  assert.equal(port.lire('Taches', 1).Statut, 'À faire');
  await assert.rejects(port.appliquer([['UpdateRecord', 'Taches', 2, { Statut: 'X' }], ['UpdateRecord', 'Taches', 9999, { Statut: 'Y' }]]));
  assert.notEqual(port.lire('Taches', 2).Statut, 'X');
  await port.appliquer([['RemoveRecord', 'Taches', retours[0]]]);
  assert.equal(port.lire('Taches', retours[0]), undefined);
  await port.appliquer([['BulkAddRecord', 'Taches', [retours[0]], { Titre: ['Rendue'] }]]);
  assert.equal(port.lire('Taches', retours[0]).Titre, 'Rendue');
});

test('démonstration : abonnés prévenus, table des projets créable', async () => {
  const port = creerDemo({ maintenant: new Date(2026, 10, 2) });
  const vues = [];
  const stop = port.abonner(t => vues.push(t));
  await port.appliquer([['UpdateRecord', 'Taches', 1, { Titre: 'x' }]]);
  port._exterieur([['UpdateRecord', 'Taches', 1, { Titre: 'y' }]]);
  stop();
  await port.appliquer([['UpdateRecord', 'Taches', 1, { Titre: 'z' }]]);
  assert.deepEqual(vues, ['Taches', 'Taches']);
  assert.equal((await port.modele()).tables[TABLE_PROJETS], undefined);
  await port.appliquer([['AddTable', TABLE_PROJETS, []]]);
  assert.ok((await port.modele()).tables[TABLE_PROJETS]);
});

test('démonstration : les dates sont relatives à aujourd\'hui, jamais vieillies', async () => {
  const a = await creerDemo({ maintenant: new Date(2026, 10, 2) }).lignes('Taches');
  const b = await creerDemo({ maintenant: new Date(2030, 0, 15) }).lignes('Taches');
  assert.equal(b[5].Echeance - a[5].Echeance, Date.UTC(2030, 0, 15) / 1000 - Date.UTC(2026, 10, 2) / 1000);
});
