// Les textes : français et anglais côte à côte, aucune clé utilisée dans le code qui manque, vouvoiement et vocabulaire de la charte.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { TEXTES, ROLES_TEXTES } from '../js/textes.js';
import { ROLES } from '../js/core/mapping.js';

const dossiers = ['js/ui', 'js/core', 'js'];
const fichiers = dossiers.flatMap(d => readdirSync(new URL(`../${d}/`, import.meta.url)).filter(f => f.endsWith('.js') && f !== 'textes.js').map(f => ({ f: `${d}/${f}`, s: readFileSync(new URL(`../${d}/${f}`, import.meta.url), 'utf8') })));

test('chaque clé a un français et un anglais non vides', () => {
  for (const [cle, v] of Object.entries(TEXTES)) {
    assert.ok(typeof v.fr === 'string' && v.fr.length > 0, `${cle} sans français`);
    assert.ok(typeof v.en === 'string' && v.en.length > 0, `${cle} sans anglais`);
  }
});

test('les variables {x} sont les mêmes en français et en anglais', () => {
  const vars = s => [...s.matchAll(/\{(\w+)(?:\|[^}]*)?\}/g)].map(m => m[1]).sort().join(',');
  for (const [cle, v] of Object.entries(TEXTES)) assert.equal(vars(v.fr), vars(v.en), cle);
});

test('toute clé écrite en dur dans le code existe', () => {
  const manquantes = [];
  for (const { f, s } of fichiers) {
    for (const m of s.matchAll(/\bt\(\s*'([a-zA-Z0-9_]+\.[a-zA-Z0-9_.]+)'/g)) if (!TEXTES[m[1]]) manquantes.push(`${f}: ${m[1]}`);
    for (const m of s.matchAll(/cle: '([a-zA-Z0-9_]+\.[a-zA-Z0-9_.]+)'/g)) if (!TEXTES[m[1]]) manquantes.push(`${f}: ${m[1]}`);
    for (const m of s.matchAll(/'((?:raison|refus|msg)\.[a-zA-Z]+)'/g)) if (!TEXTES[m[1]]) manquantes.push(`${f}: ${m[1]}`);
  }
  assert.deepEqual([...new Set(manquantes)], []);
});

test('les familles dynamiques sont complètes', () => {
  const doit = [];
  for (const r of ROLES) doit.push(`role.${r}`);
  for (const v of ['tableau', 'kanban', 'chronologie', 'calendrier']) doit.push(`vue.${v}`);
  for (const z of ['semaine', 'mois', 'trimestre', 'annee']) doit.push(`zoom.${z}`);
  for (const v of ['aucun', 'statut', 'responsable', 'priorite', 'groupe']) doit.push(`regroupement.${v}`);
  for (const v of ['manuel', 'echeance', 'priorite']) doit.push(`tri.${v}`);
  for (const v of ['statut', 'priorite', 'groupe', 'responsable']) doit.push(`colorier.${v}`);
  for (const v of ['manquant', 'absente', 'type', 'formule']) doit.push(`erreur.${v}`);
  for (const v of ['formule', 'droit', 'autre', 'lectureSeule']) doit.push(`refus.${v}`);
  assert.deepEqual(doit.filter(k => !TEXTES[k]), []);
  assert.equal(ROLES_TEXTES.length, ROLES.length);
});

test('vocabulaire de la charte : « modèle », jamais « template » ; pas de tutoiement', () => {
  for (const [cle, v] of Object.entries(TEXTES)) {
    assert.doesNotMatch(v.fr, /template/i, cle);
    assert.doesNotMatch(v.fr, /(?<![\p{L}])(tu|ton|ta|tes|toi)(?![\p{L}])/iu, `${cle} tutoie`);
  }
});
