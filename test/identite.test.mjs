// L'adresse e-mail de la personne (consigne 008) : GFS la donne par `GfsLink.identity()`, Tuesday la compare aux adresses de la table des personnes ; sans elle, « Je suis… » sert.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createGfsLink } from '../kit/js/gfs-link.js';
import { colonneCourriel, courriels, reconnaitre, moiEffectif, minuscules } from '../js/core/identite.js';
import { courrielsRefs } from '../js/data/refs.js';
import { App } from '../js/app.js';
import { modele } from './fixtures.mjs';
import { creerDemo } from './support/demo.js';

const MAINT = () => new Date(2026, 10, 2);
async function ouverte() {
  const port = creerDemo({ maintenant: MAINT() });
  const app = new App(port, { document: `essai${Math.random()}`, maintenant: MAINT });
  await app.init();
  return app;
}
const EQUIPE = [{ id: 1, Nom: 'Une', Courriel: 'Une@Exemple.test ' }, { id: 2, Nom: 'Deux', Courriel: 'pas une adresse' }, { id: 3, Nom: 'Trois', Courriel: '' }];

test('la colonne d\'adresses : une colonne de texte dont le nom parle de courriel, sinon aucune', () => {
  const c = (id, type, libelle = id) => ({ id, type, libelle });
  assert.equal(colonneCourriel([c('Nom', 'Text'), c('Courriel', 'Text')]), 'Courriel');
  assert.equal(colonneCourriel([c('Nom', 'Text'), c('Mel', 'Text', 'E-mail')]), 'Mel');
  assert.equal(colonneCourriel([c('Email', 'Choice')]), null);
  assert.equal(colonneCourriel([c('Nom', 'Text')]), null);
  assert.equal(colonneCourriel(undefined), null);
});

test('les adresses d\'une table : en minuscules, sans les lignes vides ni ce qui n\'est pas une adresse', () => {
  const m = courriels(EQUIPE, 'Courriel');
  assert.deepEqual([...m], [[1, 'une@exemple.test']]);
  assert.equal(courriels(EQUIPE, null).size, 0);
  assert.equal(courriels(undefined, 'Courriel').size, 0);
  assert.equal(minuscules(undefined), '');
});

test('reconnaître : l\'adresse à la lettre près, casse mise à part ; une adresse qui manque ne reconnaît personne', () => {
  const parId = courriels(EQUIPE, 'Courriel');
  assert.equal(reconnaitre({ email: 'UNE@exemple.TEST', parId }), 1);
  assert.equal(reconnaitre({ email: 'autre@exemple.test', parId }), null);
  assert.equal(reconnaitre({ email: null, parId }), null);
  assert.equal(reconnaitre({ email: '', parId }), null);
  assert.equal(reconnaitre({ email: 'sans-arobase', libelles: [{ id: 'sans-arobase', label: 'sans-arobase' }] }), null);
  assert.equal(reconnaitre({ email: 'a@b.test', libelles: [{ id: 'A@B.test', label: 'A@B.test' }] }), 'A@B.test');
});

test('la personne qui est là : l\'adresse d\'abord, « Je suis… » ensuite, sinon personne', () => {
  assert.equal(moiEffectif({ reconnue: 1, choisie: 2 }), 1);
  assert.equal(moiEffectif({ reconnue: null, choisie: 2 }), 2);
  assert.equal(moiEffectif({ reconnue: null, choisie: null }), null);
  assert.equal(moiEffectif({ reconnue: 0, choisie: 2 }), 0);
});

test('adresses des personnes pour chaque Référence : vide quand la table visée n\'a pas de colonne d\'adresses', () => {
  const avec = { ...modele, tables: { ...modele.tables, Equipe: { ...modele.tables.Equipe, colonnes: [...modele.tables.Equipe.colonnes, { id: 'Courriel', libelle: 'Courriel', type: 'Text' }] } } };
  assert.deepEqual([...courrielsRefs(avec, 'Taches', { Equipe: EQUIPE }).Responsable], [[1, 'une@exemple.test']]);
  assert.equal(courrielsRefs(modele, 'Taches', { Equipe: EQUIPE }).Responsable.size, 0);
});

test('Mes tâches : l\'adresse que GFS donne reconnaît la personne, sans « Je suis… »', async () => {
  const app = await ouverte();
  assert.equal(app.moi, null);
  assert.equal(app.reglagesVue.moi, null);
  app.poserIdentite({ email: 'M.Dupont@exemple.test' });
  assert.equal(app.moiReconnu, 2);
  assert.equal(app.moi, 2);
  assert.equal(app.reglages.moi, null, 'rien n\'est écrit dans les réglages de la vue');
  assert.equal(app.reglagesVue.moi, 2);
});

test('Mes tâches : sans adresse reconnue, « Je suis… » sert ; l\'adresse reconnue l\'emporte', async () => {
  const app = await ouverte();
  app.regler({ moi: 4 });
  app.poserIdentite({ email: 'inconnu@exemple.test' });
  assert.equal(app.moiReconnu, null);
  assert.equal(app.moi, 4);
  app.poserIdentite({ email: 'l.bernard@exemple.test' });
  assert.equal(app.moi, 1);
  app.poserIdentite(null);
  assert.equal(app.moi, 4, 'GFS ne sait plus : on revient à « Je suis… »');
});

test('Mes tâches : le filtre garde les tâches de la personne reconnue par son adresse', async () => {
  const app = await ouverte();
  app.poserIdentite({ email: 'a.petit@exemple.test' });
  const { filtrer } = await import('../js/core/regroupement.js');
  const ids = filtrer(app.taches, { ...app.reglages.filtres, mesTaches: true }, app.reglagesVue.moi);
  assert.deepEqual([...ids].sort((a, b) => a - b), app.taches.filter(t => t.responsables.some(r => r.id === 4)).map(t => t.id).sort((a, b) => a - b));
  assert.ok(ids.size > 0);
});

test('poserIdentite : une adresse qui ne change pas ne refait rien, un changement prévient les vues', async () => {
  const app = await ouverte();
  let n = 0;
  app.abonner?.(() => { n += 1; });
  const avant = n;
  app.poserIdentite({ email: 'x@exemple.test' });
  app.poserIdentite({ email: 'x@exemple.test' });
  assert.equal(app.identite.email, 'x@exemple.test');
  if (app.abonner) assert.equal(n, avant + 1);
  app.poserIdentite({ email: '' });
  assert.equal(app.identite, null);
});

function gfs(contexte) {
  const sent = []; const listeners = [];
  const parent = { postMessage: message => sent.push(structuredClone(message)) };
  const host = { location: { search: '?gfs=0&language=fr' }, parent, localStorage: null, addEventListener: (type, fn) => { if (type === 'message') listeners.push(fn); } };
  const deliver = data => listeners.forEach(fn => fn({ data, source: parent }));
  const lien = createGfsLink({ host, timeoutMs: 1000 });
  deliver({ gfs: 0, type: 'reponse', id: sent.find(m => m.nom === 'contexte').id, data: { contrat: 0, hote: 'GFS', instance: 'https://grist.example', document: 'doc1', acces: 'full', lectureSeule: false, ...contexte } });
  return { lien, evenement: data => deliver({ gfs: 0, type: 'evenement', nom: 'identite', data }) };
}

test('le lien de GFS : l\'adresse arrive avec le contexte, puis par l\'événement identite ; « Mes tâches » la suit', async () => {
  const { lien, evenement } = gfs({ identite: { email: 'S.Martin@exemple.test' } });
  await lien.ready;
  const port = creerDemo({ maintenant: MAINT() });
  const app = new App(port, { document: `id${Math.random()}`, maintenant: MAINT, lien });
  await app.init();
  const arret = app.suivreIdentite();
  assert.equal(app.moi, 3, 'l\'adresse du contexte');
  evenement({ identite: { email: 'a.petit@exemple.test' } });
  assert.equal(app.moi, 4, 'une adresse qui arrive plus tard');
  evenement({ identite: null });
  assert.equal(app.moi, null);
  arret();
  evenement({ identite: { email: 'l.bernard@exemple.test' } });
  assert.equal(app.moi, null, 'arrêté, il n\'écoute plus');
});

test('seule, l\'app n\'a pas d\'adresse : suivreIdentite ne change rien et « Je suis… » sert', async () => {
  const lien = createGfsLink({ host: { location: { search: '' }, parent: null, addEventListener() {} } });
  const port = creerDemo({ maintenant: MAINT() });
  const app = new App(port, { document: `id${Math.random()}`, maintenant: MAINT, lien });
  await app.init();
  app.suivreIdentite();
  assert.equal(app.identite, null);
  app.regler({ moi: 2 });
  assert.equal(app.moi, 2);
});

test('gfs.json déclare l\'identité avec sa raison en français et en anglais', () => {
  const manifeste = JSON.parse(readFileSync(new URL('../gfs.json', import.meta.url), 'utf8'));
  const id = manifeste.permissions.identite;
  assert.ok(id.pourquoi.fr.length > 10);
  assert.ok(id.pourquoi.en.length > 10);
  assert.ok(!('tables' in id), 'elle ne demande aucun accès à une table');
});
