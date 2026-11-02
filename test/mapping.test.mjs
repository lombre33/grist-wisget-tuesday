import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reconnaitre, verifier, accepte, capacites, raisonGrise, ROLES, ECRITS } from '../js/core/mapping.js';
import { colonnes } from './fixtures.mjs';

const c = (id, type, extra = {}) => ({ id, libelle: extra.libelle ?? id, type, formule: false, choix: [], table: null, voir: null, ...extra });

test('reconnaissance de la table typique : tout est trouvé, rien d\'ambigu', () => {
  const { mapping, ambigus } = reconnaitre(colonnes, 'Taches');
  assert.equal(mapping.titre, 'Titre');
  assert.equal(mapping.statut, 'Statut');
  assert.equal(mapping.responsable, 'Responsable');
  assert.equal(mapping.debut, 'Debut');
  assert.equal(mapping.echeance, 'Echeance');
  assert.equal(mapping.priorite, 'Priorite');
  assert.equal(mapping.parent, 'Parent');
  assert.equal(mapping.ordre, 'Ordre');
  assert.equal(mapping.etiquettes, 'Etiquettes');
  assert.equal(mapping.predecesseurs, 'Predecesseurs');
  assert.equal(mapping.avancement, 'Avancement');
  assert.deepEqual(ambigus, {});
});

test('une seule colonne Choice devient le statut, quel que soit son nom', () => {
  const { mapping } = reconnaitre([c('Titre', 'Text'), c('Phase', 'Choice')], 'T');
  assert.equal(mapping.statut, 'Phase');
});

test('deux colonnes Choice sans nom parlant : le statut est ambigu et reste vide', () => {
  const { mapping, ambigus } = reconnaitre([c('Titre', 'Text'), c('X', 'Choice'), c('Y', 'Choice')], 'T');
  assert.equal(mapping.statut, null);
  assert.deepEqual(ambigus.statut, ['X', 'Y']);
});

test('deux colonnes Choice dont une s\'appelle État : le nom tranche', () => {
  const { mapping, ambigus } = reconnaitre([c('Titre', 'Text'), c('Z', 'Choice'), c('État', 'Choice')], 'T');
  assert.equal(mapping.statut, 'État');
  assert.equal(ambigus.statut, undefined);
});

test('titre : par le nom, sinon seule colonne de texte, sinon ambigu', () => {
  assert.equal(reconnaitre([c('Intitulé', 'Text'), c('Notes', 'Text')], 'T').mapping.titre, 'Intitulé');
  assert.equal(reconnaitre([c('Truc', 'Text')], 'T').mapping.titre, 'Truc');
  const r = reconnaitre([c('A', 'Text'), c('B', 'Text')], 'T');
  assert.equal(r.mapping.titre, null);
  assert.deepEqual(r.ambigus.titre, ['A', 'B']);
});

test('une colonne n\'est reconnue que pour un seul rôle', () => {
  const { mapping } = reconnaitre([c('Nom', 'Text'), c('Description', 'Text')], 'T');
  assert.equal(mapping.titre, 'Nom');
  assert.equal(mapping.description, 'Description');
});

test('une seule date sans nom parlant : c\'est l\'échéance', () => {
  const { mapping } = reconnaitre([c('Titre', 'Text'), c('Quand', 'Date')], 'T');
  assert.equal(mapping.echeance, 'Quand');
  assert.equal(mapping.debut, null);
});

test('deux dates sans nom parlant : rien n\'est deviné', () => {
  const { mapping } = reconnaitre([c('Titre', 'Text'), c('D1', 'Date'), c('D2', 'Date')], 'T');
  assert.equal(mapping.debut, null);
  assert.equal(mapping.echeance, null);
});

test('noms anglais, avec accents et casse', () => {
  const { mapping } = reconnaitre([c('Task', 'Text'), c('Status', 'Choice'), c('Assignee', 'Ref:People', { table: 'People' }), c('Start', 'Date'), c('DEADLINE', 'Date')], 'T');
  assert.deepEqual([mapping.titre, mapping.statut, mapping.responsable, mapping.debut, mapping.echeance], ['Task', 'Status', 'Assignee', 'Start', 'DEADLINE']);
});

test('un parent doit viser la même table', () => {
  const autre = reconnaitre([c('Titre', 'Text'), c('Parent', 'Ref:Autre', { table: 'Autre' })], 'T');
  assert.equal(autre.mapping.parent, null);
  const meme = reconnaitre([c('Titre', 'Text'), c('Parent', 'Ref:T', { table: 'T' })], 'T');
  assert.equal(meme.mapping.parent, 'Parent');
});

test('les types acceptés par rôle', () => {
  assert.ok(accepte('debut', c('d', 'DateTime:Europe/Paris'), 'T'));
  assert.ok(!accepte('debut', c('d', 'Text'), 'T'));
  assert.ok(accepte('responsable', c('r', 'Text'), 'T'));
  assert.ok(accepte('responsable', c('r', 'RefList:P', { table: 'P' }), 'T'));
  assert.ok(!accepte('statut', c('s', 'ChoiceList'), 'T'));
  assert.ok(accepte('etiquettes', c('e', 'ChoiceList'), 'T'));
  assert.ok(accepte('groupe', c('g', 'Ref:G', { table: 'G' }), 'T'));
  assert.ok(accepte('ordre', c('o', 'Int'), 'T'));
  assert.ok(!accepte('titre', null, 'T'));
  assert.ok(!accepte('inconnu', c('x', 'Text'), 'T'));
});

test('vérification : le titre est obligatoire', () => {
  const v = verifier({ statut: 'Statut' }, colonnes, 'Taches');
  assert.equal(v.ok, false);
  assert.deepEqual(v.erreurs[0], { role: 'titre', colId: null, raison: 'manquant' });
});

test('vérification : colonne absente, type refusé, formule refusée', () => {
  const v = verifier({ titre: 'Titre', statut: 'Disparue', debut: 'Titre' }, colonnes, 'Taches');
  assert.deepEqual(v.erreurs.map(e => e.raison).sort(), ['absente', 'type']);
  const f = verifier({ titre: 'Titre', statut: 'Statut', echeance: 'Echeance' }, [...colonnes.map(x => (x.id === 'Echeance' ? { ...x, formule: true } : x))], 'Taches');
  assert.deepEqual(f.erreurs, [{ role: 'echeance', colId: 'Echeance', raison: 'formule' }]);
});

test('une formule est acceptée pour l\'avancement (lecture seule), refusée pour un rôle écrit', () => {
  assert.equal(verifier({ titre: 'Titre', avancement: 'Avancement' }, colonnes, 'Taches').ok, true);
  assert.ok(!ECRITS.includes('avancement'));
  assert.ok(!ECRITS.includes('predecesseurs'));
  assert.ok(ECRITS.includes('statut'));
});

test('vérification : correspondance valide', () => {
  const { mapping } = reconnaitre(colonnes, 'Taches');
  assert.deepEqual(verifier(mapping, colonnes, 'Taches'), { ok: true, erreurs: [] });
});

test('capacités et grisé : ce qui manque dit quoi relier', () => {
  const sans = capacites({ titre: 'T' });
  assert.deepEqual(sans, { tableau: true, kanban: false, chronologie: false, calendrier: false, reordonner: false, sousTaches: false });
  assert.equal(raisonGrise('kanban', { titre: 'T' }), 'raison.statut');
  assert.equal(raisonGrise('chronologie', { titre: 'T' }), 'raison.dates');
  assert.equal(raisonGrise('calendrier', { titre: 'T', debut: 'D' }), null);
  assert.equal(raisonGrise('reordonner', { titre: 'T' }), 'raison.ordre');
  assert.equal(raisonGrise('tableau', { titre: 'T' }), null);
  assert.equal(capacites(null).tableau, false);
  assert.equal(ROLES.length, 13);
});
