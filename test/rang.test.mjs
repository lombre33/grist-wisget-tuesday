import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planDeplacement, rangFin } from '../js/core/rang.js';

const l = (...ordres) => ordres.map((ordre, i) => ({ id: 100 + i, ordre }));

test('colonne vide : premier rang', () => {
  assert.deepEqual(planDeplacement([], 1, 0), [{ id: 1, ordre: 1024 }]);
});

test('entre deux voisines : une seule écriture, au milieu', () => {
  assert.deepEqual(planDeplacement(l(10, 20), 1, 1), [{ id: 1, ordre: 15 }]);
  assert.deepEqual(planDeplacement(l(10, 20, 30), 1, 2), [{ id: 1, ordre: 25 }]);
});

test('en tête et en fin', () => {
  assert.deepEqual(planDeplacement(l(10, 20), 1, 0), [{ id: 1, ordre: 10 - 1024 }]);
  assert.deepEqual(planDeplacement(l(10, 20), 1, 2), [{ id: 1, ordre: 20 + 1024 }]);
  assert.deepEqual(planDeplacement(l(10, 20), 1, 99), [{ id: 1, ordre: 20 + 1024 }]);
  assert.deepEqual(planDeplacement(l(10, 20), 1, -5), [{ id: 1, ordre: 10 - 1024 }]);
});

test('voisines sans rang : renumérotation de la colonne, seulement ce qui change', () => {
  const plan = planDeplacement(l(null, null), 1, 1);
  assert.deepEqual(plan.map(e => e.id).sort(), [1, 100, 101]);
  const classes = [...plan].sort((a, b) => a.ordre - b.ordre).map(e => e.id);
  assert.deepEqual(classes, [100, 1, 101]);
});

test('rangs qui se touchent : renumérotation', () => {
  const a = 1;
  const b = a + Number.EPSILON * 2;
  const plan = planDeplacement(l(a, a), 1, 1);
  assert.ok(plan.length >= 2);
  assert.ok(new Set(plan.map(e => e.ordre)).size === plan.length);
  assert.ok(Number.isFinite(b));
});

test('mélange avec et sans rang : renumérotation ordonnée', () => {
  const plan = planDeplacement(l(10, null, 30), 1, 2);
  const classes = [...plan].sort((x, y) => x.ordre - y.ordre).map(e => e.id);
  assert.deepEqual(classes, [100, 101, 1, 102]);
});

test('rangFin : après le plus grand rang, 1024 si aucun', () => {
  assert.equal(rangFin(l(5, 20, null)), 20 + 1024);
  assert.equal(rangFin(l(null)), 1024);
  assert.equal(rangFin([]), 1024);
});

test('déplacer cent fois au même endroit reste strictement ordonné', () => {
  let items = l(0, 1024);
  for (let n = 0; n < 40; n++) {
    const plan = planDeplacement(items, 1000 + n, 1);
    if (plan.length === 1) items = [items[0], { id: 1000 + n, ordre: plan[0].ordre }, ...items.slice(1)];
    else items = plan.sort((a, b) => a.ordre - b.ordre).concat();
    const ordres = items.map(i => i.ordre);
    assert.deepEqual([...ordres].sort((a, b) => a - b), ordres);
    assert.equal(new Set(ordres).size, ordres.length);
  }
});
