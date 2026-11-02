import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encoder, peutEcrire, actionMiseAJour, actionAjout, actionSuppression, actionRestauration, raisonRefus } from '../js/core/ecritures.js';
import { colonnes } from './fixtures.mjs';

const col = id => colonnes.find(c => c.id === id);

test('encoder : dates, listes, références, nombres', () => {
  assert.equal(encoder('2026-11-02', col('Echeance')), 1793577600);
  assert.equal(encoder(null, col('Echeance')), null);
  assert.equal(encoder('', col('Echeance')), null);
  assert.deepEqual(encoder([3, 4], col('Responsable')), ['L', 3, 4]);
  assert.deepEqual(encoder(null, col('Responsable')), ['L']);
  assert.deepEqual(encoder(5, col('Responsable')), ['L', 5]);
  assert.deepEqual(encoder(['Urgent'], col('Etiquettes')), ['L', 'Urgent']);
  assert.equal(encoder(7, col('Parent')), 7);
  assert.equal(encoder(null, col('Parent')), 0);
  assert.equal(encoder('12.5', col('Ordre')), 12.5);
  assert.equal(encoder('', col('Ordre')), null);
  assert.equal(encoder('abc', col('Titre')), 'abc');
  assert.equal(encoder(null, col('Titre')), '');
});

test('une colonne à formule ne s\'écrit pas', () => {
  assert.deepEqual(peutEcrire(col('Avancement')), { ok: false, raison: 'formule' });
  assert.deepEqual(peutEcrire(undefined), { ok: false, raison: 'absente' });
  assert.deepEqual(peutEcrire(col('Titre')), { ok: true });
  assert.throws(() => actionMiseAJour('Taches', 1, { Avancement: 1 }, colonnes), /formule/);
});

test('jamais d\'écriture dans une colonne absente (une seule annulerait tout le lot)', () => {
  assert.throws(() => actionMiseAJour('Taches', 1, { Titre: 'a', Fantome: 1 }, colonnes), /absente/);
  assert.throws(() => actionAjout('Taches', { Fantome: 1 }, colonnes), /absente/);
});

test('mise à jour : un lot de colonnes est une seule action', () => {
  const a = actionMiseAJour('Taches', 5, { Debut: '2026-11-02', Echeance: '2026-11-05' }, colonnes);
  assert.deepEqual(a, ['UpdateRecord', 'Taches', 5, { Debut: 1793577600, Echeance: 1793836800 }]);
});

test('ajout, suppression et restauration', () => {
  assert.deepEqual(actionAjout('Taches', { Titre: 'Nouvelle', Statut: 'À faire' }, colonnes), ['AddRecord', 'Taches', null, { Titre: 'Nouvelle', Statut: 'À faire' }]);
  assert.deepEqual(actionSuppression('Taches', 3), ['RemoveRecord', 'Taches', 3]);
  assert.deepEqual(actionRestauration('Taches', 3, { Titre: 'x', Ordre: 2 }), ['BulkAddRecord', 'Taches', [3], { Titre: ['x'], Ordre: [2] }]);
});

test('refus de Grist traduits en clés de message', () => {
  assert.equal(raisonRefus(new Error("Can't save value to formula column Avancement")), 'refus.formule');
  assert.equal(raisonRefus(new Error('[Sandbox] access denied')), 'refus.droit');
  assert.equal(raisonRefus('document is read-only'), 'refus.droit');
  assert.equal(raisonRefus(new Error('boum')), 'refus.autre');
  assert.equal(raisonRefus(null), 'refus.autre');
});
