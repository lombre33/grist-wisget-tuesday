// L'état de l'app contre le port de démonstration (notre propre port, pas Grist) : ouverture, écritures optimistes, retour arrière, annuler / rétablir, enregistrement du projet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { App } from '../js/app.js';
import { creerDemo } from '../js/data/demo.js';
import { TABLE_PROJETS } from '../js/core/projet.js';

const MAINT = () => new Date(2026, 10, 2);
async function ouverte(options = {}) {
  const port = creerDemo({ maintenant: MAINT() });
  Object.assign(port, options);
  const app = new App(port, { document: `essai${Math.random()}`, maintenant: MAINT });
  await app.init();
  return app;
}

test('table unique et reconnue : l\'écran de confirmation, déjà rempli (on confirme toujours d\'abord)', async () => {
  const app = await ouverte();
  assert.equal(app.ecran, 'colonnes');
  assert.equal(app.proposition.mapping.titre, 'Titre');
  assert.equal(app.proposition.mapping.statut, 'Statut');
  assert.equal(app.proposition.mapping.parent, 'Parent');
});

test('ouvrir avec la correspondance proposée : tâches calculées, rien d\'écrit dans le document', async () => {
  const app = await ouverte();
  const avant = JSON.stringify(app.port._etat.donnees);
  await app.ouvrir('Taches', app.proposition.mapping, null);
  assert.equal(app.ecran, 'projet');
  assert.equal(app.taches.length, 12);
  assert.equal(JSON.stringify(app.port._etat.donnees), avant);
  assert.equal(app.tache(1).responsables[0].label, 'L. Bernard');
  assert.equal(app.tache(4).parentId, 3);
});

test('correspondance invalide : on revient à la confirmation avec les erreurs', async () => {
  const app = await ouverte();
  await app.ouvrir('Taches', { titre: 'Disparue' }, null);
  assert.equal(app.ecran, 'colonnes');
  assert.equal(app.proposition.erreurs[0].raison, 'absente');
});

async function projet() { const app = await ouverte(); await app.ouvrir('Taches', app.proposition.mapping, null); return app; }

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

test('sans table utilisable : l\'écran « sans table »', async () => {
  const port = creerDemo({ maintenant: MAINT() });
  const modele = port.modele;
  port.modele = async () => ({ tables: {} });
  const app = new App(port, { document: 'vide', maintenant: MAINT });
  await app.init();
  assert.equal(app.ecran, 'sans-table');
  port.modele = modele;
});

test('modèle de départ : table de la personne, colonnes reconnues sans ambiguïté, trois lignes', async () => {
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
  assert.equal(app.ecran, 'colonnes');
  assert.equal(app.source, 'MesTaches');
  assert.equal(app.proposition.mapping.titre, 'Titre');
  assert.equal(app.proposition.mapping.statut, 'Statut');
  assert.equal(app.proposition.mapping.echeance, 'Echeance');
  assert.equal(cree.lignes.Titre.length, 3);
  assert.equal(JSON.parse(cree.colonnes[1].widgetOptions).choices.length, 5);
});
