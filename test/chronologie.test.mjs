import { test } from 'node:test';
import assert from 'node:assert/strict';
import { echelle, barre, entetes, deplacer, redimensionner, xDe, jourDe, ZOOMS } from '../js/core/chronologie.js';

const t = (debut, fin, extra = {}) => ({ id: 1, debut, fin, debutEff: debut ?? fin, finEff: fin ?? debut, jalon: Boolean((debut ?? fin) && (debut ?? fin) === (fin ?? debut)), ...extra });
const AUJ = '2026-11-02';

test('l\'échelle couvre les données et aujourd\'hui, sur des semaines entières', () => {
  const e = echelle([t('2026-11-10', '2026-12-20')], 'mois', AUJ);
  assert.ok(e.debut <= AUJ && e.fin >= '2026-12-20');
  assert.equal(e.debut.length, 10);
  assert.equal(e.jours % 7, 0);
  assert.equal(e.px > 0, true);
});

test('un projet sur deux années ne bute sur aucune borne', () => {
  const e = echelle([t('2026-03-01', '2027-02-28')], 'trimestre', AUJ);
  assert.ok(e.debut <= '2026-03-01' && e.fin >= '2027-02-28');
});

test('sans date : l\'échelle s\'ouvre autour d\'aujourd\'hui', () => {
  const e = echelle([], 'semaine', AUJ);
  assert.ok(e.debut <= AUJ && e.fin >= AUJ);
  assert.ok(e.jours >= 14);
});

test('zoom inconnu : repli sur le mois ; chaque zoom donne une échelle', () => {
  assert.equal(echelle([], 'zzz', AUJ).zoom, 'mois');
  for (const z of ZOOMS) assert.equal(echelle([t('2026-11-03', '2026-11-05')], z, AUJ).zoom, z);
});

test('plus on dézoome, plus les jours sont étroits', () => {
  const px = ZOOMS.map(z => echelle([], z, AUJ).px);
  assert.deepEqual([...px].sort((a, b) => b - a), px);
});

test('barre : la fin est incluse, un jalon a une largeur d\'un jour', () => {
  const e = echelle([], 'semaine', AUJ);
  const b = barre(t('2026-11-03', '2026-11-05'), e);
  assert.equal(b.jours, 3);
  assert.equal(b.largeur, 3 * e.px);
  assert.equal(b.x, xDe('2026-11-03', e));
  const j = barre(t(null, '2026-11-04'), e);
  assert.equal(j.jalon, true);
  assert.equal(j.largeur, e.px);
  assert.equal(barre(t(null, null), e), null);
});

test('x et jour se répondent', () => {
  const e = echelle([], 'mois', AUJ);
  assert.equal(jourDe(xDe('2026-11-17', e), e), '2026-11-17');
  assert.equal(jourDe(xDe('2026-11-17', e) + e.px - 1, e), '2026-11-17');
});

test('en-têtes : mois en haut, jours ou semaines en bas, sans trou', () => {
  const e = echelle([t('2026-11-03', '2026-12-10')], 'semaine', AUJ);
  const h = entetes(e, 'fr');
  assert.ok(h.haut.length >= 2);
  assert.equal(h.bas.length, e.jours);
  assert.ok(h.bas.some(b => b.weekend));
  const somme = h.haut.reduce((s, x) => s + x.largeur, 0);
  assert.equal(somme, e.jours * e.px);
  const m = entetes(echelle([], 'mois', AUJ), 'fr');
  assert.ok(m.bas[0].label.startsWith('S'));
  const a = entetes(echelle([t('2026-03-01', '2027-06-01')], 'annee', AUJ), 'fr');
  assert.ok(a.haut.length >= 2);
  assert.equal(a.haut.reduce((s, x) => s + x.largeur, 0), echelle([t('2026-03-01', '2027-06-01')], 'annee', AUJ).jours * 2);
});

test('déplacer : les deux dates bougent ensemble, une seule date bouge seule', () => {
  assert.deepEqual(deplacer(t('2026-11-03', '2026-11-05'), 2), { debut: '2026-11-05', echeance: '2026-11-07' });
  assert.deepEqual(deplacer(t(null, '2026-12-31'), 1), { echeance: '2027-01-01' });
  assert.deepEqual(deplacer(t('2026-11-03', null), -3), { debut: '2026-10-31' });
  assert.deepEqual(deplacer(t(null, null), 4), {});
});

test('redimensionner : la fin ne passe jamais avant le début', () => {
  assert.deepEqual(redimensionner(t('2026-11-03', '2026-11-05'), 'fin', 3), { echeance: '2026-11-08' });
  assert.deepEqual(redimensionner(t('2026-11-03', '2026-11-05'), 'fin', -9), { echeance: '2026-11-03' });
  assert.deepEqual(redimensionner(t('2026-11-03', '2026-11-05'), 'debut', -2), { debut: '2026-11-01' });
  assert.deepEqual(redimensionner(t('2026-11-03', '2026-11-05'), 'debut', 9), { debut: '2026-11-05' });
});
