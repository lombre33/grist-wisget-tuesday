// La mise en place (cahier de l'onboarding, 3) : l'aperçu vide mais complet, la recommandation, les étapes, la tâche tapée avant la fin, le nom de la table à créer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apercu, recommandation, etapesVisibles, etapeDepart, adapterTache, nomTable, ID_APERCU, NOM_TABLE_DEFAUT } from '../js/core/miseenplace.js';
import { capacites, verifier } from '../js/core/mapping.js';
import { STATUTS_DEPART } from '../js/core/modele-depart.js';

test('l\'aperçu a toutes les colonnes du modèle, reconnues, et aucun problème de correspondance', () => {
  const a = apercu('2026-11-03');
  assert.equal(a.id, ID_APERCU);
  assert.deepEqual(a.colonnes.map(c => c.id), ['Titre', 'Statut', 'Responsable', 'Debut', 'Echeance', 'Priorite']);
  for (const role of ['titre', 'statut', 'responsable', 'debut', 'echeance', 'priorite']) assert.ok(a.mapping[role], role);
  assert.equal(verifier(a.mapping, a.colonnes, a.id).ok, true);
});

test('l\'aperçu active les quatre vues : l\'outil est complet même avant d\'être relié', () => {
  const a = apercu('2026-11-03');
  const c = capacites(a.mapping);
  assert.equal(c.tableau && c.kanban && c.chronologie && c.calendrier, true);
});

test('l\'aperçu garde les cinq statuts du modèle, avec leurs couleurs, pour que le kanban ait ses colonnes', () => {
  const statut = apercu('2026-11-03').colonnes.find(c => c.id === 'Statut');
  assert.deepEqual(statut.choix.map(c => c.valeur), STATUTS_DEPART);
  assert.ok(statut.choix.every(c => c.fond && c.texte));
});

test('recommandation : la table dont le titre est reconnu ; sinon créer une table', () => {
  assert.deepEqual(recommandation([{ id: 'Taches', score: 3 }, { id: 'Equipe', score: 0 }]), { choix: 'existante', table: 'Taches' });
  assert.deepEqual(recommandation([{ id: 'Table1', score: 0 }]), { choix: 'creer', table: 'Table1' });
  assert.deepEqual(recommandation([]), { choix: 'creer', table: null });
});

test('étapes : l\'accès seulement s\'il est attendu, les colonnes seulement pour une table existante', () => {
  assert.deepEqual(etapesVisibles({ attenteAcces: false, choix: 'creer' }), ['table']);
  assert.deepEqual(etapesVisibles({ attenteAcces: false, choix: 'existante' }), ['table', 'colonnes']);
  assert.deepEqual(etapesVisibles({ attenteAcces: true, choix: 'creer' }), ['acces', 'table']);
  assert.deepEqual(etapesVisibles({ attenteAcces: true, choix: 'existante' }), ['acces', 'table', 'colonnes']);
});

test('étape de départ : l\'accès tant que Grist n\'a pas répondu, sinon le choix de la table', () => {
  assert.equal(etapeDepart({ attenteAcces: true }), 'acces');
  assert.equal(etapeDepart({ attenteAcces: false }), 'table');
});

test('la tâche tapée avant la fin est rejouée : titre gardé, statut gardé seulement si la table le connaît', () => {
  const choix = [{ valeur: 'À faire' }, { valeur: 'Fini' }];
  assert.deepEqual(adapterTache({ titre: 'Appeler', statut: 'À faire', priorite: 'Haute', responsable: 'L' }, { statut: 'Etat' }, choix), { titre: 'Appeler', statut: 'À faire' });
  assert.deepEqual(adapterTache({ titre: 'Appeler', statut: 'Bloqué' }, { statut: 'Etat' }, choix), { titre: 'Appeler' });
  assert.deepEqual(adapterTache({ titre: 'Appeler', statut: 'À faire' }, { statut: null }, choix), { titre: 'Appeler' });
  assert.deepEqual(adapterTache(undefined, {}, []), { titre: '' });
});

test('nom de table : nettoyé comme Grist le ferait, par défaut « Tâches », numéroté s\'il existe déjà', () => {
  assert.equal(nomTable('  Mes tâches 2026 ! '), 'Mes_tâches_2026');
  assert.equal(nomTable(''), NOM_TABLE_DEFAUT);
  assert.equal(nomTable('***'), NOM_TABLE_DEFAUT);
  assert.equal(nomTable('Tâches', ['tâches']), 'Tâches_2');
  assert.equal(nomTable('Tâches', ['Tâches', 'Tâches_2']), 'Tâches_3');
  assert.equal(nomTable(undefined), NOM_TABLE_DEFAUT);
});
