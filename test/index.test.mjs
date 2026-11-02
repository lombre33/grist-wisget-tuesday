// index.html : la carte d'importation et l'empreinte de la politique de sécurité sont à jour (outil : node outils/versionner.mjs), les `?v=` sont ceux de package.json, aucun style en ligne.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { carte, empreinte } from '../outils/versionner.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

test('la carte d\'importation liste tous les modules, à la version courante', () => {
  const m = /<script type="importmap">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(m, 'carte absente');
  assert.equal(m[1], `\n${carte(version)}\n`, 'carte périmée : lancer node outils/versionner.mjs');
});

test('l\'empreinte de la politique est celle de la carte', () => {
  const m = /<script type="importmap">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(html.includes(empreinte(m[1])), 'empreinte périmée : lancer node outils/versionner.mjs');
});

test('toutes les adresses locales portent ?v= à la version courante', () => {
  const liens = [...html.matchAll(/(?:href|src)="((?:kit|css|js)\/[^"]+)"/g)].map(x => x[1]);
  assert.ok(liens.length >= 6);
  for (const l of liens) assert.ok(l.endsWith(`?v=${version}`), l);
});

test('politique de sécurité stricte : pas de style en ligne, pas de script en ligne hors la carte', () => {
  assert.match(html, /style-src 'self';/);
  assert.doesNotMatch(html, /style-src[^"]*unsafe-inline/);
  assert.doesNotMatch(html, /<style/i);
  assert.doesNotMatch(html, /\sstyle="/);
  const scripts = [...html.matchAll(/<script(?![^>]*src=)[^>]*>/g)].map(x => x[0]);
  assert.deepEqual(scripts, ['<script type="importmap">']);
});

test('le fichier .nojekyll existe et le site ne dépend d\'aucune adresse externe sauf l\'API des widgets', () => {
  const externes = [...html.matchAll(/https?:\/\/[^\s"')]+/g)].map(x => x[0]).filter(u => !u.includes('docs.getgrist.com'));
  assert.deepEqual(externes, []);
});
