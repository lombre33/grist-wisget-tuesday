import { test } from 'node:test';
import assert from 'node:assert/strict';
import { construire, arbre, descendants, compteSousTaches, avecAncetres, etendue, estTermine } from '../js/core/taches.js';
import { reconnaitre } from '../js/core/mapping.js';
import { colonnes } from './fixtures.mjs';

const { mapping } = reconnaitre(colonnes, 'Taches');
const jour = iso => Date.UTC(...iso.split('-').map((x, i) => (i === 1 ? Number(x) - 1 : Number(x)))) / 1000;
const refs = { Responsable: new Map([[1, 'L. Bernard'], [2, 'M. Dupont']]), Parent: new Map(), Predecesseurs: new Map() };
const ctx = (extra = {}) => ({ mapping, colonnes, refs, aujourdhui: '2026-11-02', ...extra });
const ligne = (id, extra = {}) => ({ id, Titre: `T${id}`, Statut: 'À faire', ...extra });

test('une ligne complète devient une tâche', () => {
  const [t] = construire([ligne(1, { Responsable: ['L', 1, 2], Debut: jour('2026-11-02'), Echeance: jour('2026-11-06'), Priorite: 'Haute', Etiquettes: ['L', 'Urgent'], Ordre: 3, Avancement: 0.5, Description: 'd' })], ctx());
  assert.equal(t.titre, 'T1');
  assert.deepEqual(t.responsables, [{ id: 1, label: 'L. Bernard' }, { id: 2, label: 'M. Dupont' }]);
  assert.equal(t.debut, '2026-11-02');
  assert.equal(t.fin, '2026-11-06');
  assert.equal(t.priorite, 'Haute');
  assert.deepEqual(t.etiquettes, ['Urgent']);
  assert.equal(t.ordre, 3);
  assert.equal(t.avancement, 0.5);
  assert.equal(t.jalon, false);
  assert.equal(t.enRetard, false);
});

test('une ligne presque vide ne casse rien : pas de titre, pas de date, pas de statut', () => {
  const [t] = construire([{ id: 7 }], ctx());
  assert.equal(t.titre, '');
  assert.equal(t.statut, '');
  assert.equal(t.debut, null);
  assert.equal(t.fin, null);
  assert.equal(t.debutEff, null);
  assert.deepEqual(t.responsables, []);
  assert.equal(t.avancement, null);
});

test('date 0 ou vide : aucune date (jamais 1970)', () => {
  const [t] = construire([ligne(1, { Debut: 0, Echeance: null })], ctx());
  assert.equal(t.debut, null);
  assert.equal(t.fin, null);
  assert.equal(t.jalon, false);
});

test('une seule date : la tâche est un jalon sur ce jour', () => {
  const [a] = construire([ligne(1, { Echeance: jour('2026-11-10') })], ctx());
  assert.equal(a.debutEff, '2026-11-10');
  assert.equal(a.finEff, '2026-11-10');
  assert.equal(a.jalon, true);
  const [b] = construire([ligne(1, { Debut: jour('2026-11-10'), Echeance: jour('2026-11-10') })], ctx());
  assert.equal(b.jalon, true);
  const [c] = construire([ligne(1, { Debut: jour('2026-11-10'), Echeance: jour('2026-11-11') })], ctx());
  assert.equal(c.jalon, false);
});

test('fin avant début : signalée, jamais effacée, affichée sur la fin', () => {
  const [t] = construire([ligne(1, { Debut: jour('2026-11-10'), Echeance: jour('2026-11-05') })], ctx());
  assert.equal(t.incoherente, true);
  assert.equal(t.debut, '2026-11-10');
  assert.equal(t.fin, '2026-11-05');
  assert.equal(t.debutEff, '2026-11-05');
  assert.equal(t.finEff, '2026-11-05');
});

test('retard : échéance passée et tâche non terminée seulement ; à minuit pile, le jour même n\'est pas en retard', () => {
  const [passee, jourMeme, terminee, sansDate] = construire([
    ligne(1, { Echeance: jour('2026-11-01') }), ligne(2, { Echeance: jour('2026-11-02') }),
    ligne(3, { Echeance: jour('2026-11-01'), Statut: 'Terminé' }), ligne(4),
  ], ctx());
  assert.equal(passee.enRetard, true);
  assert.equal(jourMeme.enRetard, false);
  assert.equal(terminee.enRetard, false);
  assert.equal(sansDate.enRetard, false);
});

test('statut terminé : mots usuels français et anglais, accents et casse ignorés', () => {
  for (const s of ['Terminé', 'terminee', 'FAIT', 'Done', 'Complete', 'Clôturé', 'Livrée']) assert.ok(estTermine(s), s);
  for (const s of ['En cours', 'À faire', '', 'Non terminé', 'Bloqué']) assert.ok(!estTermine(s), s);
});

test('responsable en texte : séparé par virgule ou point-virgule', () => {
  const colTexte = colonnes.map(c => (c.id === 'Responsable' ? { ...c, type: 'Text' } : c));
  const [t] = construire([ligne(1, { Responsable: 'Anne, Paul; Zoé' })], ctx({ colonnes: colTexte }));
  assert.deepEqual(t.responsables.map(r => r.label), ['Anne', 'Paul', 'Zoé']);
});

test('référence cassée : le nom est remplacé par #id, jamais un numéro nu qui casse les compteurs', () => {
  const [t] = construire([ligne(1, { Responsable: ['L', 99] })], ctx());
  assert.deepEqual(t.responsables, [{ id: 99, label: '#99' }]);
});

test('référence vide (0) : personne', () => {
  const colRef = colonnes.map(c => (c.id === 'Responsable' ? { ...c, type: 'Ref:Equipe' } : c));
  const [a, b] = construire([ligne(1, { Responsable: 0 }), ligne(2, { Responsable: 1 })], ctx({ colonnes: colRef }));
  assert.deepEqual(a.responsables, []);
  assert.deepEqual(b.responsables, [{ id: 1, label: 'L. Bernard' }]);
});

test('avancement : 0 à 1 ou 0 à 100, borné', () => {
  const r = construire([ligne(1, { Avancement: 0.4 }), ligne(2, { Avancement: 40 }), ligne(3, { Avancement: 250 }), ligne(4, { Avancement: -3 }), ligne(5, { Avancement: 'x' })], ctx());
  assert.deepEqual(r.map(t => t.avancement), [0.4, 0.4, 1, 0, null]);
});

test('parent : inconnu, soi-même ou cycle = tâche racine, aucune tâche perdue', () => {
  const r = construire([ligne(1, { Parent: 1 }), ligne(2, { Parent: 404 }), ligne(3, { Parent: 4 }), ligne(4, { Parent: 3 }), ligne(5, { Parent: 0 })], ctx());
  assert.equal(r[0].parentId, null);
  assert.equal(r[1].parentId, null);
  assert.ok(r[2].parentId === null || r[3].parentId === null);
  assert.ok(!(r[2].parentId && r[3].parentId));
  const a = arbre(r);
  const total = a.racines.length + [...a.enfants.values()].reduce((n, l) => n + l.length, 0);
  assert.equal(total, 5);
});

test('arbre, descendants et décompte des sous-tâches', () => {
  const r = construire([ligne(1), ligne(2, { Parent: 1 }), ligne(3, { Parent: 2, Statut: 'Terminé' }), ligne(4, { Parent: 1, Statut: 'Terminé' })], ctx());
  const a = arbre(r);
  assert.deepEqual(a.racines.map(t => t.id), [1]);
  assert.deepEqual(descendants(a, 1).map(t => t.id).sort(), [2, 3, 4]);
  assert.deepEqual(compteSousTaches(a, 1), { total: 3, faites: 2 });
  assert.deepEqual(compteSousTaches(a, 3), { total: 0, faites: 0 });
});

test('une sous-tâche trouvée garde ses ancêtres pour le contexte', () => {
  const a = arbre(construire([ligne(1), ligne(2, { Parent: 1 }), ligne(3, { Parent: 2 }), ligne(4)], ctx()));
  assert.deepEqual([...avecAncetres(a, new Set([3]))].sort(), [1, 2, 3]);
  assert.deepEqual([...avecAncetres(a, new Set())], []);
});

test('bloquée par : seulement les prédécesseurs existants et non terminés', () => {
  const r = construire([ligne(1), ligne(2, { Predecesseurs: ['L', 1, 3, 404, 2] }), ligne(3, { Statut: 'Terminé' })], ctx());
  assert.deepEqual(r[1].bloqueePar, [1]);
  assert.deepEqual(r[0].bloqueePar, []);
});

test('étendue des dates', () => {
  const r = construire([ligne(1, { Debut: jour('2026-11-03'), Echeance: jour('2026-11-09') }), ligne(2, { Echeance: jour('2026-12-31') }), ligne(3)], ctx());
  assert.deepEqual(etendue(r), { debut: '2026-11-03', fin: '2026-12-31' });
  assert.equal(etendue(construire([ligne(1)], ctx())), null);
});

test('correspondance sans responsable ni dates : tout reste vide sans erreur', () => {
  const m = { titre: 'Titre', statut: 'Statut' };
  const [t] = construire([ligne(1)], { mapping: m, colonnes, refs: {}, aujourdhui: '2026-11-02' });
  assert.deepEqual(t.responsables, []);
  assert.equal(t.fin, null);
  assert.equal(t.groupe, '');
});

test('l\'ordre de la source est gardé (pos)', () => {
  const r = construire([ligne(9), ligne(3), ligne(5)], ctx());
  assert.deepEqual(r.map(t => [t.id, t.pos]), [[9, 0], [3, 1], [5, 2]]);
});
