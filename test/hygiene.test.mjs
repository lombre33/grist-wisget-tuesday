// Les règles du dépôt qui se lisent dans le code (CLAUDE.md, guide des apps de GFS) : pas de HTML par chaîne, pas d'eval, pas de console.log, pas de style en ligne,
// écoute des messages par addEventListener, stockage du navigateur dans un try/catch, pas de couleur ni de z-index en dur, fichiers de moins de 600 lignes, noms sans « _ » ni « . » en tête.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const racine = new URL('../', import.meta.url).pathname;
function parcourir(dossier, filtre, sortie = []) {
  for (const nom of readdirSync(dossier)) {
    if (['node_modules', 'kit', '.git', 'maquettes', 'captures'].includes(nom)) continue;
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) parcourir(chemin, filtre, sortie);
    else if (filtre.test(nom)) sortie.push({ file: relative(racine, chemin), text: readFileSync(chemin, 'utf8') });
  }
  return sortie;
}
const sources = parcourir(join(racine, 'js'), /\.js$/);
const feuilles = parcourir(join(racine, 'css'), /\.css$/);

function code(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')
    .replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

test('il y a du code et des feuilles à contrôler', () => {
  assert.ok(sources.length >= 5);
  assert.ok(feuilles.length >= 1);
});

test('aucun HTML par chaîne, aucun eval, aucune boîte du navigateur, aucun style en ligne', () => {
  for (const { file, text } of sources) {
    const body = code(text);
    assert.doesNotMatch(body, /\.innerHTML\b|\.outerHTML\b|insertAdjacentHTML|document\.write/, `${file} construit du HTML par chaîne`);
    assert.doesNotMatch(body, /\beval\s*\(|new Function\s*\(/, `${file} : eval`);
    assert.doesNotMatch(body, /(^|[^.\w])(prompt|confirm|alert)\s*\(/, `${file} : boîte du navigateur`);
    assert.doesNotMatch(body, /\.setAttribute\(\s*'style'|\.style\.cssText|\.style\s*=\s/, `${file} : attribut style`);
  }
});

test('l\'écoute des messages passe par addEventListener, jamais par window.onmessage', () => {
  for (const { file, text } of sources) assert.doesNotMatch(code(text), /\bonmessage\s*=/, file);
});

test('aucun console.log publié', () => {
  for (const { file, text } of sources) assert.doesNotMatch(code(text), /console\.(log|debug|info|trace|dir)\b/, file);
});

test('chaque accès au stockage du navigateur est dans un try/catch', () => {
  for (const { file, text } of sources) {
    const body = code(text);
    for (const match of body.matchAll(/\b(localStorage|sessionStorage|indexedDB)\b/g)) {
      const before = body.slice(Math.max(0, match.index - 400), match.index);
      assert.ok(before.lastIndexOf('try {') >= 0 && before.lastIndexOf('try {') > before.lastIndexOf('} catch'), `${file} : ${match[0]} hors d'un try/catch`);
    }
  }
});

test('aucune couleur ni z-index en dur dans les feuilles', () => {
  for (const { file, text } of feuilles) {
    const body = text.replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(body, /#[0-9a-fA-F]{3,8}\b/, `${file} : couleur en dur`);
    assert.doesNotMatch(body, /\brgba?\(/, `${file} : couleur rgb en dur`);
    assert.doesNotMatch(body, /z-index\s*:\s*-?\d/, `${file} : z-index en dur`);
  }
});

test('aucun fichier ne dépasse 600 lignes', () => {
  for (const { file, text } of [...sources, ...feuilles]) assert.ok(text.split('\n').length <= 600, `${file} : ${text.split('\n').length} lignes`);
});

test('chaque module dit en tête à quoi il sert', () => {
  for (const { file, text } of sources) assert.match(text, /^\/\/ \S/, `${file} sans commentaire de tête`);
});

test('aucun fichier ni dossier du site ne commence par « _ » ou « . » (GitHub Pages) et .nojekyll existe', () => {
  const noms = [];
  (function lire(dossier) {
    for (const nom of readdirSync(dossier)) {
      if (['node_modules', '.git', 'kit'].includes(nom)) continue;
      if (/^[_.]/.test(nom) && !['.nojekyll', '.gitignore', '.gitmodules', '.github'].includes(nom)) noms.push(join(dossier, nom));
      const chemin = join(dossier, nom);
      if (statSync(chemin).isDirectory() && !nom.startsWith('.')) lire(chemin);
    }
  })(racine);
  assert.deepEqual(noms, []);
  assert.ok(statSync(join(racine, '.nojekyll')).isFile());
});

test('le manifeste est un JSON dont le préfixe de tables finit par « _ »', () => {
  const manifeste = JSON.parse(readFileSync(join(racine, 'gfs.json'), 'utf8'));
  assert.equal(manifeste.id, 'tuesday');
  assert.match(manifeste.tables.prefixe, /_$/);
  assert.ok(manifeste.fichiers.every(f => f.table.startsWith(manifeste.tables.prefixe)));
});
