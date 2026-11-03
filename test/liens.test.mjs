// Les liens vers les fichiers d'autres apps : le cœur pur, puis l'app face au lien du kit (`createGfsLink`) qui parle à un GFS joué par l'essai (les formes sont celles des contrats de GFS, section 5).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGfsLink } from '../kit/js/gfs-link.js';
import { App } from '../js/app.js';
import { creerDemo } from './support/demo.js';
import { TABLE_LIENS, COLONNES_LIENS, lienDepuisLigne, versLigneLien, liensDe, cleLien, suiteRefus } from '../js/core/liens.js';

const MAINT = () => new Date(2026, 10, 2);

function gfs({ search = '?gfs=0&language=fr' } = {}) {
  const sent = []; const listeners = [];
  const parent = { postMessage: message => sent.push(structuredClone(message)) };
  const host = { location: { search }, parent, localStorage: null, addEventListener: (type, fn) => { if (type === 'message') listeners.push(fn); } };
  const deliver = data => listeners.forEach(fn => fn({ data, source: parent }));
  const calls = nom => sent.filter(m => m.type === 'appel' && m.nom === nom);
  const reponds = (nom, data) => deliver({ gfs: 0, type: 'reponse', id: calls(nom).at(-1).id, data });
  const refuse = (nom, code, message) => deliver({ gfs: 0, type: 'erreur', id: calls(nom).at(-1).id, code, message });
  return { host, sent, deliver, calls, reponds, refuse };
}

async function appAvecGfs(search) {
  const faux = gfs({ search });
  const lien = createGfsLink({ host: faux.host, timeoutMs: 1000 });
  if (lien.hosted) faux.reponds('contexte', { contrat: 0, hote: 'GFS', instance: 'https://grist.example', document: 'doc1', acces: 'full', lectureSeule: false });
  await lien.ready;
  const port = creerDemo({ maintenant: MAINT() });
  const app = new App(port, { document: `liens${Math.random()}`, maintenant: MAINT, lien });
  await app.init();
  await app.ouvrir('Taches', app.miseEnPlace.mapping, null);
  return { app, faux, lien };
}
const attendre = async cond => { for (let i = 0; i < 100 && !cond(); i++) await new Promise(r => setTimeout(r, 5)); };

test('lienDepuisLigne : une clé { app, fichier, type } et la tâche ; une ligne incomplète n\'est pas un lien', () => {
  assert.deepEqual(lienDepuisLigne({ id: 4, Table: 'Taches', Ligne: 7, App: 'publipostage', Fichier: 16, Type: 'document', Nom: ' Contrat ' }), { id: 4, table: 'Taches', ligne: 7, app: 'publipostage', fichier: '16', type: 'document', nom: 'Contrat' });
  for (const mauvaise of [null, {}, { Table: 'T', Ligne: 0, App: 'a', Fichier: '1', Type: 't' }, { Table: 'T', Ligne: 1, App: '', Fichier: '1', Type: 't' }, { Table: 'T', Ligne: 1.5, App: 'a', Fichier: '1', Type: 't' }]) assert.equal(lienDepuisLigne(mauvaise), null);
});

test('versLigneLien et liensDe : le choix de GFS devient une ligne lisible ; les liens d\'une tâche, seulement les siens', () => {
  assert.deepEqual(versLigneLien({ table: 'Taches', ligne: 3, choix: { app: 'publipostage', id: '16', nom: 'Contrat', type: 'document' }, jour: 1793836800 }),
    { Table: 'Taches', Ligne: 3, App: 'publipostage', Fichier: '16', Type: 'document', Nom: 'Contrat', Cree: 1793836800 });
  assert.equal(versLigneLien({ table: 'Taches', ligne: 3, choix: { app: 'p', type: 'document' } }), null);
  assert.equal(versLigneLien({ table: 'Taches', ligne: 3, choix: null }), null);
  const liens = [{ id: 1, table: 'Taches', ligne: 3 }, { id: 2, table: 'Taches', ligne: 4 }, { id: 3, table: 'Autre', ligne: 3 }];
  assert.deepEqual(liensDe(liens, 'Taches', 3).map(l => l.id), [1]);
  assert.equal(cleLien({ app: 'a', type: 't', fichier: '1' }), 'a/t/1');
  assert.equal(COLONNES_LIENS.length, 7);
});

test('suiteRefus : introuvable grise sans supprimer, annulé ne dit rien, refusé avertit, accès dit où régler', () => {
  assert.deepEqual(suiteRefus('GFS_INTROUVABLE'), { introuvable: true, dire: false, avertir: false });
  assert.deepEqual(suiteRefus('GFS_ANNULE'), { introuvable: false, dire: false, avertir: false });
  assert.deepEqual(suiteRefus('GFS_REFUSE'), { introuvable: false, dire: false, avertir: true });
  assert.deepEqual(suiteRefus('GFS_ACCES'), { introuvable: false, dire: true, avertir: false });
});

test('seule : « Lier un fichier » et « Ouvrir » sont grisés avec leur raison, rien n\'est envoyé à personne', async () => {
  const { app, faux } = await appAvecGfs('?language=fr');
  assert.equal(app.liens.actifs, false);
  assert.equal(app.liens.raison('lier'), 'liens.seule');
  assert.equal(app.liens.raison('ouvrir', { app: 'a', type: 't', fichier: '1' }), 'liens.seule');
  assert.equal(await app.liens.choisir('titre'), null);
  assert.equal(await app.liens.ouvrir({ app: 'a', type: 't', fichier: '1' }), false);
  assert.equal(faux.sent.length, 0);
  assert.equal(app.modele.tables[TABLE_LIENS], undefined);
});

test('dans GFS : choose part avec les types et le titre, le lien est écrit dans Tuesday_Liens (créée à ce moment), Annuler le retire', async () => {
  const { app, faux } = await appAvecGfs();
  assert.equal(app.liens.actifs, true);
  assert.equal(app.liens.raison('lier'), null);
  const choix = app.liens.choisir('Lier un fichier à cette tâche');
  assert.deepEqual(faux.calls('choisir')[0].args, { types: ['document', 'grille', 'presentation'], titre: 'Lier un fichier à cette tâche' });
  faux.reponds('choisir', { app: 'publipostage', id: 16, nom: 'Compte rendu', type: 'document' });
  const fichier = await choix;
  assert.deepEqual(fichier, { app: 'publipostage', id: '16', nom: 'Compte rendu', type: 'document' });
  assert.equal(app.liens.tableExiste, false, 'rien n\'est créé avant l\'accord de la personne (donné dans l\'interface, avant lier)');
  assert.equal(await app.liens.lier(3, fichier, 'Fichier lié'), true);
  assert.equal(app.liens.tableExiste, true);
  assert.equal(app.liens.de(3).length, 1);
  assert.equal(app.liens.de(3)[0].nom, 'Compte rendu');
  assert.equal(app.liens.de(4).length, 0);
  assert.equal(app.port._etat.donnees[TABLE_LIENS].length, 1);
  assert.equal(await app.annuler(), true);
  assert.equal(app.liens.de(3).length, 0);
  assert.equal(await app.retablir(), true);
  assert.equal(app.liens.de(3)[0].fichier, '16');
});

test('annuler un choix : choose rend null, rien n\'est écrit, rien n\'est créé', async () => {
  const { app, faux } = await appAvecGfs();
  const choix = app.liens.choisir('x');
  faux.reponds('choisir', null);
  assert.equal(await choix, null);
  assert.equal(app.liens.tableExiste, false);
});

test('ouvrir : la clé part en { app, fichier: { id, type } } ; les écritures en cours finissent d\'abord ; un fichier introuvable grise le lien sans le supprimer', async () => {
  const { app, faux } = await appAvecGfs();
  await app.liens.lier(3, { app: 'publipostage', id: '16', nom: 'CR', type: 'document' }, 'Fichier lié');
  const lien = app.liens.de(3)[0];
  app.occupe++;
  const ouverture = app.liens.ouvrir(lien);
  await new Promise(r => setTimeout(r, 50));
  assert.equal(faux.calls('ouvrir').length, 0, 'GFS n\'est pas appelé tant qu\'une écriture est en cours');
  app.occupe--;
  await attendre(() => faux.calls('ouvrir').length === 1);
  assert.deepEqual(faux.calls('ouvrir')[0].args, { app: 'publipostage', fichier: { id: '16', type: 'document' } });
  faux.reponds('ouvrir', { ouvert: true });
  assert.equal(await ouverture, true);

  const perdu = app.liens.ouvrir(lien);
  await attendre(() => faux.calls('ouvrir').length === 2);
  faux.refuse('ouvrir', 'GFS_INTROUVABLE', 'Le fichier 16 n\'est plus là');
  assert.equal(await perdu, false);
  assert.equal(app.liens.estIntrouvable(lien), true);
  assert.equal(app.liens.raison('ouvrir', lien), 'liens.introuvable');
  assert.equal(app.liens.de(3).length, 1, 'le lien n\'est jamais supprimé tout seul');
  assert.equal(await app.liens.ouvrir(lien), false);
  assert.equal(faux.calls('ouvrir').length, 2, 'un lien grisé n\'appelle plus GFS');
  assert.equal(await app.liens.retirer(lien.id, 'Lien retiré'), true);
  assert.equal(app.liens.de(3).length, 0);
});

test('autres refus de GFS : annulé ne dit rien, accès dit où régler, refusé avertit sans rien dire à la personne', async () => {
  const { app, faux } = await appAvecGfs();
  await app.liens.lier(3, { app: 'publipostage', id: '16', nom: 'CR', type: 'document' }, 'Fichier lié');
  const lien = app.liens.de(3)[0];
  const essayer = async (code, message) => { app.message = null; const p = app.liens.ouvrir(lien); await attendre(() => faux.calls('ouvrir').length > essayer.n); essayer.n = faux.calls('ouvrir').length; faux.refuse('ouvrir', code, message); await p; };
  essayer.n = 0;
  await essayer('GFS_ANNULE', 'fermée'); assert.equal(app.message, null); assert.equal(app.liens.estIntrouvable(lien), false);
  await essayer('GFS_ACCES', 'Réglez l\'accès complet dans Grist'); assert.match(app.message.texte, /accès complet/); assert.equal(app.liens.estIntrouvable(lien), false);
  const avertissements = []; const original = console.warn; console.warn = (...p) => avertissements.push(p.join(' '));
  try { await essayer('GFS_REFUSE', 'type inconnu'); } finally { console.warn = original; }
  assert.equal(app.message, null); assert.equal(avertissements.length, 1); assert.equal(app.liens.estIntrouvable(lien), false);
});

test('en lecture seule : lier et retirer grisés avec la raison de Grist', async () => {
  const { app } = await appAvecGfs();
  app.port.lectureSeule = true;
  assert.equal(app.liens.raison('lier'), 'refus.lectureSeule');
  assert.equal(app.liens.raison('retirer'), 'refus.lectureSeule');
});

test('GFS demande d\'ouvrir un projet de Tuesday (raison « lien ») : le projet désigné s\'ouvre, rien d\'autre ; un identifiant inconnu ne fait rien', async () => {
  const { app } = await appAvecGfs();
  await app.enregistrerProjet('Lancement');
  const id = app.projets[0].id;
  app.projet = null;
  assert.equal(await app.liens.ouvrirDemande({ fichier: { id, type: 'projet' }, type: 'projet', raison: 'lien' }), true);
  assert.equal(app.projet.id, id);
  assert.equal(await app.liens.ouvrirDemande({ fichier: { id: '9999', type: 'projet' }, raison: 'lien' }), false);
  assert.equal(await app.liens.ouvrirDemande(null), false);
});
