import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../js/core/dates.js';

test('estValide : jours réels seulement', () => {
  assert.ok(D.estValide('2026-11-02'));
  assert.ok(D.estValide('2028-02-29'));
  assert.ok(!D.estValide('2026-02-29'));
  assert.ok(!D.estValide('2026-13-01'));
  assert.ok(!D.estValide('2026-1-1'));
  assert.ok(!D.estValide(null));
  assert.ok(!D.estValide(20261102));
});

test('ajouterJours : le 31/12 passe au 01/01 de l\'année suivante et pas avant', () => {
  assert.equal(D.ajouterJours('2026-12-31', 1), '2027-01-01');
  assert.equal(D.ajouterJours('2027-01-01', -1), '2026-12-31');
  assert.equal(D.ajouterJours('2028-02-28', 1), '2028-02-29');
  assert.equal(D.ajouterJours('2026-02-28', 1), '2026-03-01');
  assert.equal(D.ajouterJours('2026-03-28', 7), '2026-04-04');
});

test('changement d\'heure : un jour reste un jour', () => {
  assert.equal(D.ajouterJours('2026-03-28', 1), '2026-03-29');
  assert.equal(D.ajouterJours('2026-03-29', 1), '2026-03-30');
  assert.equal(D.ajouterJours('2026-10-24', 2), '2026-10-26');
  assert.equal(D.ecartJours('2026-03-28', '2026-03-31'), 3);
  assert.equal(D.ecartJours('2026-10-24', '2026-10-27'), 3);
});

test('ecartJours est signé', () => {
  assert.equal(D.ecartJours('2026-11-02', '2026-11-09'), 7);
  assert.equal(D.ecartJours('2026-11-09', '2026-11-02'), -7);
  assert.equal(D.ecartJours('2026-12-31', '2027-01-01'), 1);
});

test('jour de la semaine : lundi = 0', () => {
  assert.equal(D.jourSemaine('2026-11-02'), 0); // lundi
  assert.equal(D.jourSemaine('2026-11-08'), 6); // dimanche
  assert.equal(D.jourSemaine('1970-01-01'), 3); // jeudi
  assert.equal(D.debutSemaine('2026-11-04'), '2026-11-02');
  assert.equal(D.debutSemaine('2026-11-08'), '2026-11-02');
  assert.equal(D.debutSemaine('2026-11-02'), '2026-11-02');
});

test('semaines ISO 8601 : 52, 53 et 1', () => {
  assert.deepEqual(D.semaineIso('2026-01-01'), { annee: 2026, semaine: 1 });
  assert.deepEqual(D.semaineIso('2026-12-31'), { annee: 2026, semaine: 53 });
  assert.deepEqual(D.semaineIso('2027-01-01'), { annee: 2026, semaine: 53 });
  assert.deepEqual(D.semaineIso('2027-01-04'), { annee: 2027, semaine: 1 });
  assert.deepEqual(D.semaineIso('2024-12-30'), { annee: 2025, semaine: 1 });
  assert.deepEqual(D.semaineIso('2021-01-03'), { annee: 2020, semaine: 53 });
  assert.deepEqual(D.semaineIso('2026-11-02'), { annee: 2026, semaine: 45 });
});

test('mois : début, fin, années bissextiles, ajout de mois', () => {
  assert.equal(D.debutMois('2026-11-17'), '2026-11-01');
  assert.equal(D.finMois('2026-11-17'), '2026-11-30');
  assert.equal(D.finMois('2028-02-10'), '2028-02-29');
  assert.equal(D.finMois('2026-02-10'), '2026-02-28');
  assert.equal(D.finMois('2026-12-05'), '2026-12-31');
  assert.equal(D.ajouterMois('2026-11-15', 2), '2027-01-01');
  assert.equal(D.ajouterMois('2026-01-15', -1), '2025-12-01');
  assert.equal(D.ajouterMois('2026-11-15', 0), '2026-11-01');
});

test('Grist vers un jour : minuit UTC, vide et 0 ne donnent jamais 1970', () => {
  assert.equal(D.jourDepuisGrist(1793577600, 'Date'), '2026-11-02');
  assert.equal(D.jourDepuisGrist(0, 'Date'), null);
  assert.equal(D.jourDepuisGrist(null, 'Date'), null);
  assert.equal(D.jourDepuisGrist('', 'Date'), null);
  assert.equal(D.jourDepuisGrist(undefined, 'Date'), null);
  assert.equal(D.jourDepuisGrist(NaN, 'Date'), null);
  assert.equal(D.jourDepuisGrist('2026-11-02', 'Date'), null);
});

test('le 31/12 reste le 31/12 (pas de janvier suivant)', () => {
  const secondes = Date.UTC(2026, 11, 31) / 1000;
  assert.equal(D.jourDepuisGrist(secondes, 'Date'), '2026-12-31');
  assert.equal(D.jourVersGrist('2026-12-31', 'Date'), secondes);
});

test('fuseau : un DateTime tard le soir à Paris reste ce jour-là, pas la veille ni le lendemain', () => {
  const soir = Date.UTC(2026, 10, 2, 22, 30) / 1000; // 23h30 à Paris
  assert.equal(D.jourDepuisGrist(soir, 'DateTime:Europe/Paris'), '2026-11-02');
  const apres = Date.UTC(2026, 10, 2, 23, 30) / 1000; // 00h30 le 3 à Paris
  assert.equal(D.jourDepuisGrist(apres, 'DateTime:Europe/Paris'), '2026-11-03');
  assert.equal(D.jourDepuisGrist(apres, 'DateTime:UTC'), '2026-11-02');
  const tot = Date.UTC(2026, 10, 2, 1, 0) / 1000;
  assert.equal(D.jourDepuisGrist(tot, 'DateTime:America/New_York'), '2026-11-01');
});

test('fuseau inconnu : repli sur UTC sans casser', () => {
  assert.equal(D.jourDepuisGrist(Date.UTC(2026, 10, 2, 12) / 1000, 'DateTime:Nulle/Part'), '2026-11-02');
});

test('écrire un jour dans un DateTime garde l\'heure de la valeur d\'avant', () => {
  const avant = Date.UTC(2026, 10, 2, 14, 15, 0) / 1000; // 15h15 à Paris (hiver)
  const apres = D.jourVersGrist('2026-11-10', 'DateTime:Europe/Paris', avant);
  assert.equal(apres, Date.UTC(2026, 10, 10, 14, 15, 0) / 1000);
  assert.equal(D.jourDepuisGrist(apres, 'DateTime:Europe/Paris'), '2026-11-10');
});

test('écrire un jour dans un DateTime traverse le changement d\'heure sans changer de jour', () => {
  const avant = Date.UTC(2026, 9, 20, 7, 0, 0) / 1000; // 09h00 à Paris (été)
  const apres = D.jourVersGrist('2026-11-03', 'DateTime:Europe/Paris', avant); // 09h00 à Paris (hiver) = 08h00 UTC
  assert.equal(apres, Date.UTC(2026, 10, 3, 8, 0, 0) / 1000);
  assert.equal(D.jourDepuisGrist(apres, 'DateTime:Europe/Paris'), '2026-11-03');
});

test('écrire sans valeur d\'avant : midi dans le fuseau', () => {
  const v = D.jourVersGrist('2026-11-03', 'DateTime:Europe/Paris', null);
  assert.equal(v, Date.UTC(2026, 10, 3, 11, 0, 0) / 1000);
});

test('écrire un jour invalide ne produit rien', () => {
  assert.equal(D.jourVersGrist('2026-02-30', 'Date'), null);
  assert.equal(D.jourVersGrist('', 'Date'), null);
  assert.equal(D.jourVersGrist(null, 'Date'), null);
});

test('aller-retour Date', () => {
  for (const iso of ['2026-11-02', '2028-02-29', '2000-01-01', '2099-12-31']) assert.equal(D.jourDepuisGrist(D.jourVersGrist(iso, 'Date'), 'Date'), iso);
});

test('aujourd\'hui se lit sur le calendrier local, pas en UTC', () => {
  assert.equal(D.aujourdhui(new Date(2026, 10, 2, 0, 5)), '2026-11-02');
  assert.equal(D.aujourdhui(new Date(2026, 10, 2, 23, 55)), '2026-11-02');
  assert.equal(D.aujourdhui(new Date(2026, 11, 31, 23, 59)), '2026-12-31');
});

test('grille du mois : semaines pleines du lundi au dimanche', () => {
  const g = D.grilleMois('2026-11-15');
  assert.equal(g[0][0], '2026-10-26');
  assert.equal(g.at(-1).at(-1), '2026-12-06');
  assert.ok(g.every(s => s.length === 7));
  assert.equal(g.length, 6);
  const fev = D.grilleMois('2027-02-01');
  assert.equal(fev.length, 4);
  assert.equal(fev[0][0], '2027-02-01');
});

test('min et max ignorent les valeurs vides', () => {
  assert.equal(D.minIso('2026-01-02', null), '2026-01-02');
  assert.equal(D.minIso('2026-01-02', '2026-01-01'), '2026-01-01');
  assert.equal(D.maxIso(null, '2026-01-01'), '2026-01-01');
  assert.equal(D.maxIso(null, null), null);
});

test('étiquette : texte court, vide si le jour est invalide', () => {
  assert.match(D.etiquette('2026-11-03', 'fr'), /3/);
  assert.equal(D.etiquette('nope', 'fr'), '');
  assert.equal(D.etiquette('2026-11-03', 'fr') === D.etiquette('2026-11-03', 'fr'), true);
});
