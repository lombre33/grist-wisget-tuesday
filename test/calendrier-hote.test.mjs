import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chargerModule, rappels, lignesModule, optionsModule, vueCalendrierModule, CHEMIN_MODULE } from '../js/ui/calendrier-hote.js';
import { roleDeplacement } from '../js/core/calendrier.js';

const tache = (id, extra = {}) => ({ id, titre: `T${id}`, statut: 'À faire', debut: 1, fin: 2, debutEff: '2026-11-03', finEff: '2026-11-05', responsables: [{ label: 'M. Dupont' }], termine: false, enRetard: false, ...extra });
function appFactice(taches, extra = {}) {
  const ecritures = [];
  const app = {
    taches, arbre: new Map(), reglages: { colorier: 'statut' }, reglagesVue: { filtres: { recherche: '', statuts: [], responsables: [], priorites: [], etiquettes: [], enRetard: false, miens: false }, tri: null, groupe: null }, lectureSeule: false, aujourdhui: '2026-11-03', moi: null,
    tache: id => taches.find(t => t.id === id) ?? null, choix: () => [], refus: false,
    modifier: async (id, parRole, libelle) => { ecritures.push({ id, parRole, libelle }); return !app.refus; },
    ...extra,
  };
  return { app, ecritures };
}

test('chargerModule : absent, en erreur ou sans creerCalendrier → null (la grille provisoire reste) ; présent → le module', async () => {
  assert.match(CHEMIN_MODULE, /calendrier/);
  assert.equal(await chargerModule(async () => { throw new Error('404'); }), null);
  assert.equal(await chargerModule(async () => ({})), null);
  assert.equal(await chargerModule(async () => ({ creerCalendrier: 1 })), null);
  const m = { creerCalendrier: () => ({}) };
  assert.equal(await chargerModule(async () => m), m);
});

test('roleDeplacement : seulement les dates que la tâche a déjà, jamais une date inventée', () => {
  assert.deepEqual(roleDeplacement({ debut: 1, fin: 2 }, '2026-11-04', '2026-11-06'), { debut: '2026-11-04', echeance: '2026-11-06' });
  assert.deepEqual(roleDeplacement({ debut: null, fin: 2 }, '2026-11-04', '2026-11-06'), { echeance: '2026-11-06' });
  assert.deepEqual(roleDeplacement({ debut: 1, fin: null }, '2026-11-04', '2026-11-06'), { debut: '2026-11-04' });
  assert.equal(roleDeplacement({ debut: null, fin: null }, '2026-11-04', '2026-11-06'), null);
});

test('rappels : ouvrir, ajouter avec le jour choisi ; déplacer écrit par l\'hôte et lève si Grist refuse (le module remet l\'événement)', async () => {
  const { app, ecritures } = appFactice([tache(1), tache(2, { debut: null, fin: null })]);
  const appels = [];
  const actions = { ouvrirFiche: id => appels.push(['ouvrir', id]), nouvelleTache: (c, o) => appels.push(['ajouter', c, o]) };
  const r = rappels(app, actions);
  r.onOuvrir(1);
  assert.ok(r.onAjouter({ debut: '2026-11-09' }) instanceof Promise, 'le module attend une promesse');
  await r.onAjouter({ debut: '2026-11-10T09:30', titre: '  Appeler  ' });
  await r.onAjouter({ debut: '2026-11-11', titre: '   ' });
  assert.deepEqual(appels, [['ouvrir', 1], ['ajouter', { echeance: '2026-11-09' }, { fiche: true }], ['ajouter', { echeance: '2026-11-10', titre: 'Appeler' }, { fiche: false }], ['ajouter', { echeance: '2026-11-11' }, { fiche: true }]]);
  await r.onDeplacer({ id: 1, debut: '2026-11-04', fin: '2026-11-06' });
  assert.deepEqual(ecritures[0].parRole, { debut: '2026-11-04', echeance: '2026-11-06' });
  await assert.rejects(r.onDeplacer({ id: 2, debut: '2026-11-04', fin: '2026-11-06' }), /rien à écrire/);
  await assert.rejects(r.onDeplacer({ id: 99, debut: '2026-11-04', fin: '2026-11-06' }));
  app.refus = true;
  await assert.rejects(r.onDeplacer({ id: 1, debut: '2026-11-04', fin: '2026-11-06' }), /refusé/);
  r.onEtat({ vue: 'semaine', jourCourant: '2026-11-10' });
  assert.deepEqual(app.calEtat, { vue: 'semaine', jourCourant: '2026-11-10' });
  assert.equal(optionsModule(app).vue, 'semaine'); assert.equal(optionsModule(app).jourCourant, '2026-11-10');
});

test('lignes et options : jours civils, fin incluse, modifiable faux en lecture seule, horloge injectée', () => {
  const { app } = appFactice([tache(1), tache(2, { debutEff: null, finEff: null })], { lectureSeule: true });
  const lignes = lignesModule(app);
  assert.equal(lignes.length, 2, 'une tâche sans date est une ligne sans dates : le module la range dans « Sans date »');
  assert.deepEqual([lignes[1].id, lignes[1].debut, lignes[1].fin], [2, null, null]);
  assert.deepEqual([lignes[0].id, lignes[0].debut, lignes[0].fin, lignes[0].modifiable, lignes[0].avecHeure], [1, '2026-11-03', '2026-11-05', false, false]);
  const o = optionsModule(app);
  assert.equal(o.lectureSeule, true); assert.equal(o.debutSemaine, 1); assert.equal(o.maintenant(), '2026-11-03');
});

test('vueCalendrierModule : sans module → null ; avec module → son élément, une seule instance, définie à chaque rendu ; module en erreur → retour à la grille', () => {
  const { app } = appFactice([tache(1)]);
  assert.equal(vueCalendrierModule(app, {}), null);
  let crees = 0; const definis = [];
  app.moduleCalendrier = { creerCalendrier: r => { crees++; return { element: { nom: 'el' }, definir: x => definis.push(x), r }; } };
  assert.deepEqual(vueCalendrierModule(app, {}), { nom: 'el' });
  vueCalendrierModule(app, {});
  assert.equal(crees, 1); assert.equal(definis.length, 2);
  assert.equal(definis[0].lignes[0].id, 1);
  const { app: cassee } = appFactice([tache(1)]);
  cassee.moduleCalendrier = { creerCalendrier: () => ({ element: {}, definir: () => { throw new Error('boum'); } }) };
  assert.equal(vueCalendrierModule(cassee, {}), null);
  assert.equal(cassee.moduleCalendrier, null);
});

test('une tâche sans date déposée sur un jour (plateau « Sans date ») reçoit l\'échéance, sinon le début, sinon rien : jamais une colonne non reliée', () => {
  const sans = { debut: null, fin: null };
  assert.deepEqual(roleDeplacement(sans, '2026-11-04', '2026-11-04', { echeance: 'Echeance', debut: 'Debut' }), { echeance: '2026-11-04' });
  assert.deepEqual(roleDeplacement(sans, '2026-11-04', '2026-11-06', { echeance: 'Echeance' }), { echeance: '2026-11-06' });
  assert.deepEqual(roleDeplacement(sans, '2026-11-04', '2026-11-04', { debut: 'Debut' }), { debut: '2026-11-04' });
  assert.equal(roleDeplacement(sans, '2026-11-04', '2026-11-04', { titre: 'Titre' }), null);
  assert.equal(roleDeplacement(sans, '2026-11-04', '2026-11-04'), null, 'sans correspondance connue, rien d\'inventé');
  assert.deepEqual(roleDeplacement({ debut: 1, fin: null }, '2026-11-04', '2026-11-04', { echeance: 'Echeance' }), { debut: '2026-11-04' }, 'une tâche déjà datée garde ses rôles');
});
