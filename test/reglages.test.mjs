import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cle, lire, ecrire, PAR_DEFAUT } from '../js/core/reglages.js';
import { depuisLigne, versLigne, idProjet, COLONNES_PROJETS, colonneDuRole } from '../js/core/projet.js';
import { entrees, duJour, grille, deplacee } from '../js/core/calendrier.js';
import { ROLES } from '../js/core/mapping.js';

test('clé de stockage : propre à chaque document et projet, valide pour GFS', () => {
  const a = cle('docA', 'p1');
  assert.notEqual(a, cle('docB', 'p1'));
  assert.notEqual(a, cle('docA', 'p2'));
  assert.match(a, /^[A-Za-z0-9_.:-]{1,64}$/);
  assert.match(cle('un document/avec des espaces & é', 'p 1'), /^[A-Za-z0-9_.:-]{1,64}$/);
  assert.ok(cle('x'.repeat(200), 'y'.repeat(200)).length <= 64);
  assert.notEqual(cle('x'.repeat(200), 'a'), cle('x'.repeat(200) + 'z', 'a'));
  assert.match(cle(null, null), /^tuesday\./);
});

test('lecture tolérante : texte vide, cassé, valeurs hors liste', () => {
  assert.deepEqual(lire(''), { ...PAR_DEFAUT, filtres: { ...PAR_DEFAUT.filtres } });
  assert.deepEqual(lire('{pas du json').vue, 'tableau');
  assert.equal(lire('[1,2]').vue, 'tableau');
  assert.equal(lire(JSON.stringify({ vue: 'inconnue', tri: 'x', zoom: 'siecle' })).vue, 'tableau');
  assert.equal(lire(JSON.stringify({ zoom: 'semaine' })).zoom, 'semaine');
  assert.equal(lire(JSON.stringify({ filtres: { retard: 'oui', statuts: 'x' } })).filtres.retard, false);
  assert.deepEqual(lire(JSON.stringify({ filtres: { statuts: ['A', 3] } })).filtres.statuts, ['A']);
});

test('aller-retour et inconnu préservé', () => {
  const r = lire(JSON.stringify({ vue: 'kanban', regroupement: 'responsable', tri: 'echeance', filtres: { recherche: 'abc', responsables: [1, 2], retard: true }, futur: { a: 1 } }));
  assert.equal(r.vue, 'kanban');
  assert.deepEqual(r.filtres.responsables, [1, 2]);
  assert.deepEqual(r.futur, { a: 1 });
  const encore = lire(ecrire(r));
  assert.deepEqual(encore, r);
});

test('projet : aller-retour ligne ↔ correspondance, colonnes lisibles', () => {
  const mapping = Object.fromEntries(ROLES.map(r => [r, null]));
  Object.assign(mapping, { titre: 'Titre', statut: 'Statut', echeance: 'Echeance' });
  const ligne = versLigne({ nom: 'Site web', source: 'Taches', mapping, reglages: '{}' }, 1793577600);
  assert.equal(ligne.ColTitre, 'Titre');
  assert.equal(ligne.ColDebut, '');
  assert.equal(ligne.Schema, 1);
  assert.equal(ligne.DateModif, 1793577600);
  const p = depuisLigne({ id: 4, ...ligne });
  assert.deepEqual(p.mapping, mapping);
  assert.equal(p.source, 'Taches');
  assert.equal(p.nom, 'Site web');
  assert.equal(idProjet(p, 'Taches'), 'p4');
  assert.equal(idProjet(null, 'Taches'), 't_Taches');
});

test('projet : ligne sans source = pas un projet ; chaque rôle a sa colonne', () => {
  assert.equal(depuisLigne({ id: 1, Nom: 'x' }), null);
  assert.equal(depuisLigne(null), null);
  assert.equal(new Set(ROLES.map(colonneDuRole)).size, ROLES.length);
  const ids = COLONNES_PROJETS.map(c => c[0]);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes('Source') && ids.includes('Reglages') && ids.includes('Schema'));
});

const tache = (id, debut, fin) => ({ id, titre: `T${id}`, debutEff: debut, finEff: fin, statut: 'A', responsables: [{ label: 'X' }] });

test('calendrier : entrées au contrat, seules les tâches datées', () => {
  const e = entrees([tache(1, '2026-11-03', '2026-11-05'), tache(2, null, null)], { couleurDe: () => '#fff' });
  assert.equal(e.length, 1);
  assert.deepEqual(Object.keys(e[0]).sort(), ['avecHeure', 'couleur', 'debut', 'fin', 'id', 'modifiable', 'responsables', 'statut', 'titre']);
  assert.equal(e[0].avecHeure, false);
  assert.deepEqual(e[0].responsables, ['X']);
  assert.equal(entrees([tache(1, '2026-11-03', '2026-11-05')], { modifiable: false })[0].modifiable, false);
});

test('calendrier : une entrée de plusieurs jours est dans chacun, fin incluse', () => {
  const e = entrees([tache(1, '2026-11-03', '2026-11-05')]);
  assert.equal(duJour(e, '2026-11-02').length, 0);
  assert.equal(duJour(e, '2026-11-03').length, 1);
  assert.equal(duJour(e, '2026-11-05').length, 1);
  assert.equal(duJour(e, '2026-11-06').length, 0);
  const g = grille(e, '2026-11-15');
  assert.equal(g.flat().filter(c => c.entrees.length).length, 3);
});

test('calendrier : déplacer garde la durée, y compris au passage d\'année', () => {
  assert.deepEqual(deplacee({ debut: '2026-12-30', fin: '2027-01-02' }, '2027-02-01'), { debut: '2027-02-01', fin: '2027-02-04' });
  assert.deepEqual(deplacee({ debut: '2026-11-03', fin: '2026-11-03' }, '2026-11-01'), { debut: '2026-11-01', fin: '2026-11-01' });
});
