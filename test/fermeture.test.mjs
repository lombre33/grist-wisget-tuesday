// `fermer { raison }` de GFS (consigne 013) : la décision de Tuesday, sans DOM. Rien n'attend → oui tout de suite ; une écriture en cours finit avant le oui ; un titre tapé jamais ajouté →
// la question de Tuesday (Ajouter, Abandonner, Annuler) ; une écriture qui échoue ne dit jamais oui.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { repondreFermer } from '../js/core/fermeture.js';
import { App } from '../js/app.js';
import { creerDemo } from './support/demo.js';

function deps(surcharge = {}) {
  const journal = [];
  const base = {
    validerSaisie: () => journal.push('sortie'), attendreEcritures: async () => { journal.push('attente'); return true; },
    brouillons: () => [], demander: async () => { journal.push('question'); return null; }, enregistrer: async () => { journal.push('enregistre'); return true; },
  };
  return { journal, d: { ...base, ...surcharge } };
}

test('rien n\'attend : oui tout de suite, après être sorti du champ en cours', async () => {
  const { journal, d } = deps();
  assert.deepEqual(await repondreFermer(d), { ferme: true });
  assert.deepEqual(journal, ['sortie', 'attente'], 'aucune question');
});

test('une écriture qui n\'a pas fini à temps : jamais oui', async () => {
  const { d } = deps({ attendreEcritures: async () => false });
  assert.deepEqual(await repondreFermer(d), { ferme: false });
});

test('un titre tapé sans Entrée : la question ; Ajouter écrit puis dit oui, Abandonner dit oui sans rien écrire, Annuler et Échap disent non', async () => {
  const brouillons = () => ['Appeler'];
  let a = deps({ brouillons, demander: async () => 'enregistrer' });
  assert.deepEqual(await repondreFermer(a.d), { ferme: true });
  assert.deepEqual(a.journal, ['sortie', 'attente', 'enregistre', 'attente'], 'le oui vient après l\'écriture');
  a = deps({ brouillons, demander: async () => 'abandonner' });
  assert.deepEqual(await repondreFermer(a.d), { ferme: true });
  assert.ok(!a.journal.includes('enregistre'));
  a = deps({ brouillons, demander: async () => null });
  assert.deepEqual(await repondreFermer(a.d), { ferme: false });
  assert.ok(!a.journal.includes('enregistre'));
});

test('l\'écriture échoue ou ne finit pas : pas de oui, tout reste en place', async () => {
  assert.deepEqual(await repondreFermer(deps({ brouillons: () => ['x'], demander: async () => 'enregistrer', enregistrer: async () => false }).d), { ferme: false });
  let appels = 0;
  const d = deps({ brouillons: () => ['x'], demander: async () => 'enregistrer', attendreEcritures: async () => (++appels === 1) }).d;
  assert.deepEqual(await repondreFermer(d), { ferme: false });
});

test('App.attendreEcritures : vrai quand rien n\'écrit, vrai dès que l\'écriture en cours finit, faux si elle dure', async () => {
  const app = new App(creerDemo({ maintenant: new Date(2026, 10, 2) }), { document: 'f', maintenant: () => new Date(2026, 10, 2) });
  assert.equal(await app.attendreEcritures(), true);
  app.occupe = 1;
  setTimeout(() => { app.occupe = 0; }, 60);
  assert.equal(await app.attendreEcritures(500), true);
  app.occupe = 1;
  assert.equal(await app.attendreEcritures(80), false);
  app.occupe = 0;
});

test('le module d\'entrée branche la réponse à `fermer` sur le lien de GFS', () => {
  const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  assert.match(main, /brancherFermeture\(GfsLink, app\)/);
});
