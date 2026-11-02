import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normaliser, correspond, tronquer, initiales } from '../js/core/texte.js';

test('normaliser : accents, casse, ponctuation, ligatures', () => {
  assert.equal(normaliser('Échéance !'), 'echeance');
  assert.equal(normaliser('  Cœur,  d\'été '), 'coeur d ete');
  assert.equal(normaliser(null), '');
  assert.equal(normaliser(undefined), '');
  assert.equal(normaliser(42), '42');
});

test('recherche : mots dans n\'importe quel ordre, accents et casse ignorés', () => {
  assert.ok(correspond('rapport final', 'Final : rapport annuel'));
  assert.ok(correspond('ECHEANCE', 'échéance'));
  assert.ok(!correspond('rapport absent', 'rapport annuel'));
  assert.ok(correspond('', 'n\'importe quoi'));
  assert.ok(correspond('   ', 'x'));
  assert.ok(correspond('bern', ['Sophie', 'L. Bernard']));
});

test('tronquer : ajoute « … » et ne dépasse pas', () => {
  assert.equal(tronquer('abcdef', 4), 'abc…');
  assert.equal(tronquer('abc', 4), 'abc');
  assert.equal(tronquer(null, 4), '');
  assert.equal(tronquer('a'.repeat(100), 10).length, 10);
});

test('initiales : un ou deux mots', () => {
  assert.equal(initiales('L. Bernard'), 'LB');
  assert.equal(initiales('Marie-Claire Dupont'), 'MD');
  assert.equal(initiales('Équipe'), 'É');
  assert.equal(initiales(''), '?');
  assert.equal(initiales(null), '?');
});
