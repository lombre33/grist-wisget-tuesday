// L'état de l'app contre le port de démonstration (notre propre port, pas Grist) : ouverture, écritures optimistes, retour arrière, annuler / rétablir, enregistrement du projet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { App } from '../js/app.js';
import { creerDemo } from './support/demo.js';
import { TABLE_PROJETS } from '../js/core/projet.js';

const MAINT = () => new Date(2026, 10, 2);
async function ouverte(options = {}) {
  const port = creerDemo({ maintenant: MAINT() });
  Object.assign(port, options);
  const app = new App(port, { document: `essai${Math.random()}`, maintenant: MAINT });
  await app.init();
  return app;
}

test('table reconnue : l\'outil s\'ouvre tout de suite sur ses données, en essai, et la mise en place s\'ouvre par-dessus (on confirme toujours d\'abord)', async () => {
  const app = await ouverte();
  assert.equal(app.ecran, 'projet');
  assert.equal(app.pret, false);
  assert.equal(app.taches.length, 12); // lire est libre
  assert.equal(app.miseEnPlace.ouverte, true);
  assert.equal(app.miseEnPlace.etape, 'table');
  assert.equal(app.miseEnPlace.choix, 'existante');
  assert.equal(app.miseEnPlace.table, 'Taches');
  assert.equal(app.miseEnPlace.mapping.titre, 'Titre');
  assert.equal(app.miseEnPlace.mapping.statut, 'Statut');
  assert.equal(app.miseEnPlace.mapping.parent, 'Parent');
});

test('avant la mise en place, rien n\'est écrit dans le document : l\'essai ne crée rien', async () => {
  const app = await ouverte();
  assert.equal(app.projets.length, 0);
  assert.equal(app.modele.tables[TABLE_PROJETS], undefined);
  assert.equal(app.port._etat.donnees.Taches.length, 12);
});

test('ouvrir avec la correspondance proposée : tâches calculées, rien d\'écrit dans le document', async () => {
  const app = await ouverte();
  const avant = JSON.stringify(app.port._etat.donnees);
  await app.ouvrir('Taches', app.miseEnPlace.mapping, null);
  assert.equal(app.ecran, 'projet');
  assert.equal(app.pret, true);
  assert.equal(app.taches.length, 12);
  assert.equal(JSON.stringify(app.port._etat.donnees), avant);
  assert.equal(app.tache(1).responsables[0].label, 'L. Bernard');
  assert.equal(app.tache(4).parentId, 3);
});

test('correspondance invalide : la mise en place s\'ouvre sur les colonnes avec les erreurs', async () => {
  const app = await ouverte();
  await app.ouvrir('Taches', { titre: 'Disparue' }, null);
  assert.equal(app.miseEnPlace.etape, 'colonnes');
  assert.equal(app.miseEnPlace.ouverte, true);
  assert.equal(app.miseEnPlace.erreurs[0].raison, 'absente');
  assert.equal(app.miseEnPlace.mapping.statut, 'Statut'); // le reste reste pré-rempli
});

async function projet() { const app = await ouverte(); await app.ouvrir('Taches', app.miseEnPlace.mapping, null); return app; }

test('changer un statut : affiché tout de suite, écrit, annulable puis rétablissable', async () => {
  const app = await projet();
  const vus = [];
  app.abonner(() => vus.push(app.tache(8).statut));
  const promesse = app.modifier(8, { statut: 'En cours' }, 'Statut changé');
  assert.equal(app.tache(8).statut, 'En cours'); // optimiste, avant la réponse
  assert.equal(await promesse, true);
  assert.equal(app.port.lire('Taches', 8).Statut, 'En cours');
  assert.equal(app.historique.peutAnnuler, true);
  await app.annuler();
  assert.equal(app.port.lire('Taches', 8).Statut, 'À faire');
  assert.equal(app.tache(8).statut, 'À faire');
  await app.retablir();
  assert.equal(app.port.lire('Taches', 8).Statut, 'En cours');
  assert.ok(vus.includes('En cours'));
});

test('écriture refusée : l\'affichage revient en arrière et la raison est dite', async () => {
  const app = await projet();
  app.port.appliquer = async () => { throw new Error('access denied'); };
  assert.equal(await app.modifier(8, { statut: 'Terminé' }, 'x'), false);
  assert.equal(app.tache(8).statut, 'À faire');
  assert.equal(app.message.cle, 'refus.droit');
  assert.equal(app.message.type, 'erreur');
  assert.equal(app.historique.peutAnnuler, false);
});

test('lecture seule : aucun geste d\'écriture, une raison claire', async () => {
  const app = await projet();
  app.port.lectureSeule = true;
  assert.equal(await app.modifier(8, { statut: 'Terminé' }, 'x'), false);
  assert.equal(await app.ajouter({ titre: 'x' }, 'x'), null);
  assert.equal(await app.supprimer(8, 'x'), false);
  assert.equal(app.message.cle, 'refus.lectureSeule');
  assert.equal(app.port.lire('Taches', 8).Statut, 'À faire');
});

test('un rôle non relié ne s\'écrit pas', async () => {
  const app = await projet();
  app.mapping = { ...app.mapping, priorite: null };
  assert.equal(await app.modifier(8, { priorite: 'Haute' }, 'x'), false);
  assert.equal(app.message.type, 'erreur');
});

test('glisser avec un changement de deux colonnes : un seul pas d\'historique', async () => {
  const app = await projet();
  await app.modifierLot([{ id: 8, parRole: { statut: 'En cours', ordre: 5 } }, { id: 9, parRole: { ordre: 6 } }], 'Déplacée');
  assert.equal(app.historique.passes.length, 1);
  await app.annuler();
  assert.equal(app.port.lire('Taches', 8).Statut, 'À faire');
  assert.equal(app.port.lire('Taches', 8).Ordre, 8 * 1024);
  assert.equal(app.port.lire('Taches', 9).Ordre, 9 * 1024);
});

test('ajouter : la ligne apparaît avec son rang, annuler la retire, rétablir la rend', async () => {
  const app = await projet();
  const id = await app.ajouter({ titre: 'Nouvelle', statut: 'À faire' }, 'Tâche ajoutée');
  assert.ok(id > 12);
  assert.equal(app.tache(id).titre, 'Nouvelle');
  assert.ok(app.tache(id).ordre > 12 * 1024);
  await app.annuler();
  assert.equal(app.tache(id), null);
  await app.retablir();
  assert.equal(app.tache(id).titre, 'Nouvelle');
});

test('supprimer puis annuler rend la ligne à son identifiant, sans réécrire une colonne à formule', async () => {
  const app = await projet();
  const avant = { ...app.port.lire('Taches', 11) };
  await app.supprimer(11, 'Supprimée');
  assert.equal(app.tache(11), null);
  await app.annuler();
  assert.deepEqual(app.port.lire('Taches', 11), avant);
});

test('annuler ne touche jamais ce qu\'une autre personne a changé depuis', async () => {
  const app = await projet();
  await app.modifier(8, { statut: 'En cours' }, 'Statut changé');
  app.port._exterieur([['UpdateRecord', 'Taches', 8, { Statut: 'Terminé' }]]);
  await app.rafraichir();
  assert.equal(await app.annuler(), false);
  assert.equal(app.port.lire('Taches', 8).Statut, 'Terminé');
  assert.equal(app.message.cle, 'msg.conflit');
  assert.equal(app.historique.peutAnnuler, false);
});

test('un changement extérieur est repris', async () => {
  const app = await projet();
  app.port._exterieur([['UpdateRecord', 'Taches', 8, { Titre: 'Renommée ailleurs' }]]);
  await new Promise(r => setTimeout(r, 5));
  assert.equal(app.tache(8).titre, 'Renommée ailleurs');
});

test('pendant une saisie, la relecture attend (le champ ne perd pas ce qu\'on tape)', async () => {
  const app = await projet();
  app.enSaisie = () => true;
  app.port._exterieur([['UpdateRecord', 'Taches', 8, { Titre: 'Ailleurs' }]]);
  await new Promise(r => setTimeout(r, 5));
  assert.notEqual(app.tache(8).titre, 'Ailleurs');
  assert.equal(app.enAttente, true);
  app.enSaisie = () => false;
  await app.rafraichir();
  assert.equal(app.tache(8).titre, 'Ailleurs');
});

test('enregistrer pour l\'équipe : crée Tuesday_Projets une fois, relit l\'identifiant réel, garde la correspondance', async () => {
  const app = await projet();
  assert.equal(app.modele.tables[TABLE_PROJETS], undefined);
  assert.equal(await app.enregistrerProjet('Site web'), true);
  assert.ok(app.modele.tables[TABLE_PROJETS]);
  assert.equal(app.projets.length, 1);
  assert.equal(app.projet.nom, 'Site web');
  assert.equal(app.projet.mapping.titre, 'Titre');
  const encore = await app.enregistrerProjet('Autre');
  assert.equal(encore, true);
  assert.equal(app.projets.length, 2);
});

test('au redémarrage, un projet enregistré s\'ouvre sans confirmation (cas G)', async () => {
  const app = await projet();
  await app.enregistrerProjet('Site web');
  const suivant = new App(app.port, { document: 'autre-personne', maintenant: MAINT });
  await suivant.init();
  assert.equal(suivant.ecran, 'projet');
  assert.equal(suivant.projet.nom, 'Site web');
});

test('les réglages d\'affichage changent sans rien écrire dans le document', async () => {
  const app = await projet();
  const avant = JSON.stringify(app.port._etat.donnees);
  app.regler({ vue: 'kanban', regroupement: 'statut' });
  assert.equal(app.reglages.vue, 'kanban');
  assert.equal(JSON.stringify(app.port._etat.donnees), avant);
});

test('statut « terminé » et premier statut utile', async () => {
  const app = await projet();
  assert.equal(app.estTermineChoix(), 'Terminé');
  assert.equal(app.premierStatut(), 'À faire');
});

async function videSansTable() {
  const port = creerDemo({ maintenant: MAINT() });
  port.modele = async () => ({ tables: {} });
  port.tableSection = async () => null;
  const app = new App(port, { document: `vide${Math.random()}`, maintenant: MAINT });
  return { app, port };
}

test('sans table : l\'outil est là, complet et vide (aperçu), la mise en place recommande de créer une table', async () => {
  const { app } = await videSansTable();
  assert.equal(app.ecran, 'projet'); // dès le constructeur : jamais un écran de réglage à la place de l'outil
  assert.equal(app.estApercu, true);
  assert.equal(app.taches.length, 0);
  assert.equal(app.mapping.statut, 'Statut');
  assert.equal(app.choix('statut').length, 5);
  await app.init();
  assert.equal(app.estApercu, true);
  assert.equal(app.miseEnPlace.ouverte, true);
  assert.equal(app.miseEnPlace.choix, 'creer');
});

test('table sans colonne reconnue (une table vide de Grist) : on recommande de créer, on ne bloque jamais', async () => {
  const port = creerDemo({ maintenant: MAINT() });
  const m = await port.modele();
  port.modele = async () => ({ tables: { Table1: { id: 'Table1', ref: 1, colonnes: ['A', 'B', 'C'].map((id, i) => ({ id, libelle: id, type: 'Any', formule: false, choix: [], table: null, voir: null, ordre: i })) } } });
  port.tableSection = async () => 'Table1';
  assert.ok(m.tables.Taches);
  const app = new App(port, { document: `t1${Math.random()}`, maintenant: MAINT });
  await app.init();
  assert.equal(app.estApercu, true);
  assert.equal(app.miseEnPlace.choix, 'creer');
  assert.equal(app.miseEnPlace.table, 'Table1');
});

test('écrire avant la mise en place l\'ouvre au lieu d\'échouer, et la tâche tapée est gardée puis rejouée à la fin', async () => {
  const { app } = await videSansTable();
  await app.init();
  app.fermerMiseEnPlace();
  assert.equal(app.miseEnPlace.ouverte, false);
  assert.equal(await app.ajouter({ titre: 'Appeler le client', statut: 'En cours' }, 'Ajoutée'), null);
  assert.equal(app.miseEnPlace.ouverte, true);
  assert.equal(app.tacheEnAttente.parRole.titre, 'Appeler le client');
  assert.equal(app.port._etat.donnees.Taches.length, 12); // rien n'a été écrit
});

test('« + Tâche », une modification ou une suppression avant la mise en place l\'ouvrent aussi', async () => {
  const app = await ouverte();
  app.fermerMiseEnPlace();
  assert.equal(await app.modifier(1, { statut: 'À faire' }, 'x'), false);
  assert.equal(app.miseEnPlace.ouverte, true);
  app.fermerMiseEnPlace();
  assert.equal(await app.supprimer(1, 'x'), false);
  assert.equal(app.miseEnPlace.ouverte, true);
});

test('fermer la mise en place sans la faire ne casse rien : l\'outil reste utilisable en lecture, et revient à la prochaine écriture', async () => {
  const app = await ouverte();
  app.fermerMiseEnPlace();
  assert.equal(app.pret, false);
  assert.equal(app.ecran, 'projet');
  assert.equal(app.taches.length, 12);
  app.regler({ vue: 'kanban' }); // changer de vue reste libre
  assert.equal(app.reglages.vue, 'kanban');
  assert.equal(app.miseEnPlace.ouverte, false);
});

test('lecture seule : la mise en place ne s\'ouvre jamais, chaque geste dit sa raison', async () => {
  const port = creerDemo({ maintenant: MAINT() });
  port.lectureSeule = true;
  const app = new App(port, { document: `ro${Math.random()}`, maintenant: MAINT });
  await app.init();
  assert.equal(app.miseEnPlace.ouverte, false);
  assert.equal(app.demanderMiseEnPlace(), false);
  assert.equal(await app.ajouter({ titre: 'x' }, 'x'), null);
  assert.equal(app.message.cle, 'refus.lectureSeule');
  assert.equal(app.tacheEnAttente, null);
});

test('terminer avec une table existante : elle est reliée, la tâche en attente est ajoutée', async () => {
  const app = await ouverte();
  await app.ajouter({ titre: 'Tapée avant', statut: 'À faire' }, 'Ajoutée');
  assert.equal(app.tacheEnAttente.parRole.titre, 'Tapée avant');
  assert.equal(await app.terminerMiseEnPlace(), true);
  assert.equal(app.pret, true);
  assert.equal(app.miseEnPlace.ouverte, false);
  assert.equal(app.tacheEnAttente, null);
  assert.equal(app.taches.length, 13);
  assert.equal(app.port._etat.donnees.Taches.at(-1).Titre, 'Tapée avant');
});

test('terminer sans titre relié : la mise en place reste ouverte et dit quoi faire, rien n\'est écrit', async () => {
  const app = await ouverte();
  app.roleMiseEnPlace('titre', null);
  assert.equal(await app.terminerMiseEnPlace(), false);
  assert.equal(app.miseEnPlace.erreurs[0].raison, 'manquant');
  assert.equal(app.pret, false);
});

test('terminer sans tâche en attente : un message dit que tout est prêt', async () => {
  const app = await ouverte();
  await app.terminerMiseEnPlace();
  assert.equal(app.message.cle, 'mep.pret');
});

test('choisir une autre table dans la mise en place refait la reconnaissance et passe à « table existante »', async () => {
  const app = await ouverte();
  app.majMiseEnPlace({ choix: 'creer' });
  app.choisirTableMiseEnPlace('Equipe');
  assert.equal(app.miseEnPlace.choix, 'existante');
  assert.equal(app.miseEnPlace.table, 'Equipe');
  assert.equal(app.miseEnPlace.mapping.titre, 'Nom');
});

test('modèle de départ : table de la personne, colonnes reconnues sans ambiguïté, vide par défaut', async () => {
  const port = creerDemo({ maintenant: MAINT() });
  const app = new App(port, { document: 'modele', maintenant: MAINT });
  await app.init();
  // le port de démonstration sait créer une table et la relire
  const surcharge = port.modele;
  const vraiAppliquer = port.appliquer.bind(port);
  const cree = {};
  port.appliquer = async actions => {
    const [a] = actions;
    if (a[0] === 'AddTable') { cree.colonnes = a[2]; cree.nom = a[1]; return [{ table_id: a[1] }]; }
    if (a[0] === 'BulkAddRecord') { cree.lignes = a[3]; return []; }
    return vraiAppliquer(actions);
  };
  port.modele = async () => {
    const m = await surcharge();
    if (cree.nom) m.tables[cree.nom] = { id: cree.nom, ref: 50, colonnes: cree.colonnes.map(c => ({ id: c.id, libelle: c.label ?? c.id, type: c.type, formule: false, choix: c.widgetOptions ? JSON.parse(c.widgetOptions).choices.map(v => ({ valeur: v, fond: null, texte: null })) : [], table: null, voir: null, ordre: 0 })) };
    return m;
  };
  assert.equal(await app.creerModele('MesTaches'), true);
  assert.equal(app.pret, true); // la table créée est reliée tout de suite : l'outil est prêt à recevoir une tâche
  assert.equal(app.source, 'MesTaches');
  assert.equal(app.mapping.titre, 'Titre');
  assert.equal(app.mapping.statut, 'Statut');
  assert.equal(app.mapping.echeance, 'Echeance');
  assert.equal(cree.lignes, undefined); // pas de tâches d'exemple par défaut : l'outil est vide, prêt à recevoir la première
  assert.equal(JSON.parse(cree.colonnes[1].widgetOptions).choices.length, 5);
});

test('attente d\'accès : sans réponse de Grist, la mise en place s\'ouvre sur l\'accès, l\'outil reste affiché ; jamais en démonstration ; plus rien une fois le projet ouvert', async () => {
  const port = { ...creerDemo(), mode: 'grist' };
  const app = new App(port, { document: 'doc' });
  assert.equal(app.ecran, 'projet'); // l'outil est là pendant l'attente
  assert.equal(app.attenteAcces, false);
  assert.equal(app.miseEnPlace.ouverte, false);
  let emis = 0; app.abonner(() => { emis++; });
  await new Promise(r => { app.attendreAcces(5); setTimeout(r, 30); });
  assert.equal(app.attenteAcces, true);
  assert.equal(app.miseEnPlace.ouverte, true);
  assert.equal(app.miseEnPlace.etape, 'acces');
  assert.ok(emis >= 1);
  // l'accès arrive : l'étape « accès » disparaît d'elle-même, la mise en place passe au choix de la table
  await app.init();
  assert.equal(app.attenteAcces, false);
  assert.equal(app.miseEnPlace.ouverte, true);
  assert.equal(app.miseEnPlace.etape, 'table');

  const demo = new App(creerDemo(), { document: 'doc' });
  assert.equal(demo.attendreAcces(1), null);
  assert.equal(demo.attenteAcces, false);

  const ouvert = new App({ ...creerDemo(), mode: 'grist' }, { document: 'doc' });
  await ouvert.init();
  await new Promise(r => { ouvert.attendreAcces(5); setTimeout(r, 30); });
  assert.equal(ouvert.attenteAcces, false);
  assert.notEqual(ouvert.miseEnPlace.etape, 'acces');
});

test('accès accordé trop tard pour rien : si le projet est déjà confirmé, le pop-up d\'accès se ferme', async () => {
  const port = { ...creerDemo({ maintenant: MAINT() }), mode: 'grist' };
  const premiere = new App(port, { document: 'meme-doc', maintenant: MAINT });
  await premiere.init();
  await premiere.terminerMiseEnPlace();
  await premiere.enregistrerProjet('Site'); // un projet enregistré s'ouvre sans confirmation
  const app = new App(port, { document: 'meme-doc', maintenant: MAINT });
  await new Promise(r => { app.attendreAcces(5); setTimeout(r, 30); });
  assert.equal(app.miseEnPlace.etape, 'acces');
  await app.init();
  assert.equal(app.pret, true);
  assert.equal(app.miseEnPlace.ouverte, false);
});

test('tâches d\'exemple : seulement si la personne les a cochées', async () => {
  const port = creerDemo({ maintenant: MAINT() });
  const cree = {};
  const vrai = port.appliquer.bind(port);
  const modele = port.modele;
  port.appliquer = async actions => { const [a] = actions; if (a[0] === 'AddTable') { cree.nom = a[1]; cree.colonnes = a[2]; return [{ table_id: a[1] }]; } if (a[0] === 'BulkAddRecord') { cree.lignes = a[3]; return []; } return vrai(actions); };
  port.modele = async () => { const m = await modele(); if (cree.nom) m.tables[cree.nom] = { id: cree.nom, ref: 50, colonnes: cree.colonnes.map(c => ({ id: c.id, libelle: c.label ?? c.id, type: c.type, formule: false, choix: c.widgetOptions ? JSON.parse(c.widgetOptions).choices.map(valeur => ({ valeur, fond: null, texte: null })) : [], table: null, voir: null, ordre: 0 })) }; return m; };
  const app = new App(port, { document: `ex${Math.random()}`, maintenant: MAINT });
  await app.init();
  assert.equal(await app.creerModele('Avec', { exemples: true }), true);
  assert.equal(cree.lignes.Titre.length, 3);
});

test('démarrer : un refus d\'accès de Grist ouvre la mise en place sur l\'accès, une autre erreur est dite, jamais d\'exception non rattrapée', async () => {
  const refus = { ...creerDemo(), mode: 'grist', modele: async () => { throw new Error('Access not granted. Current access level none'); } };
  const a = new App(refus, { document: 'doc' });
  await a.demarrer();
  assert.equal(a.attenteAcces, true);
  assert.equal(a.miseEnPlace.ouverte, true); assert.equal(a.miseEnPlace.etape, 'acces');

  const casse = { ...creerDemo(), mode: 'grist', modele: async () => { throw new Error('table introuvable'); } };
  const b = new App(casse, { document: 'doc' });
  await b.demarrer();
  assert.equal(b.attenteAcces, false);
  assert.equal(b.message.type, 'erreur'); assert.match(b.message.texte, /table introuvable/);

  const bon = new App(creerDemo(), { document: 'doc' });
  await bon.demarrer();
  assert.equal(bon.initTermine, true); assert.equal(bon.message, null);
});
