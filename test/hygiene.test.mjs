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

// L'ambiance de GFS (consigne 010, règle 15 du guide des apps) : les feuilles lisent les jetons. Les couleurs en dur n'en suivraient aucun ; les arrondis gardent leur valeur d'origine en repli ;
// le fond de la page est --bg sur l'élément qui la couvre, jamais --main-bg (celui de la carte de GFS).
test('feuilles : aucune couleur en dur, sous aucune forme (hsl, nom de couleur, mot-clé système)', () => {
  // Exceptions justifiées : le texte d'une pastille, d'une barre ou d'une puce dont le fond vient d'un choix coloré de Grist (une donnée, pastel dans les deux modes) se fonce vers le noir, quel que soit le mode.
  const permises = [/\.tu-pastille/, /\.tu-barre-tache \{/, /\.tu-cal-puce/];
  const noms = /(?:^|[\s:(,])(?:white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|navy|teal|maroon|olive|lime|aqua|fuchsia|brown|gold|cyan|magenta)(?=[\s;,)!]|$)/i;
  for (const { file, text } of feuilles) {
    const body = text.replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(body, /\bhsla?\(/, `${file} : couleur hsl en dur`);
    assert.doesNotMatch(body, /\b(?:oklch|oklab|lab|lch|hwb)\(/, `${file} : couleur en dur`);
    for (const ligne of body.split('\n').filter(l => !permises.some(r => r.test(l)))) if (/(?:color|background|border[a-z-]*|fill|stroke|outline[a-z-]*)\s*:/.test(ligne)) assert.doesNotMatch(ligne, noms, `${file} : nom de couleur en dur : ${ligne.trim().slice(0, 80)}`);
  }
});

test('feuilles : les arrondis passent par les jetons de forme, avec leur valeur d\'origine en repli ; jamais --main-bg', () => {
  for (const { file, text } of feuilles) {
    const body = text.replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(body, /--main-bg/, `${file} : --main-bg`);
    for (const m of body.matchAll(/border-radius:\s*(\d+)px/g)) assert.fail(`${file} : arrondi en dur (${m[0]}) : var(--radius-xs|sm|md|lg|pill, ${m[1]}px)`);
    for (const m of body.matchAll(/var\(--radius-(?:xs|md|lg|pill|btn|input|panel),\s*([^)]*)\)/g)) assert.ok(m[1].trim() !== '', `${file} : jeton de forme sans repli`);
    for (const m of body.matchAll(/var\(--(?:radius-(?:xs|md|lg|pill|btn|input|panel)|fill|fill-hover|fill-line|font-head|fs-head|fw-head|ls-head|tt-head|wash|wash-size|shadow-panel|shadow-ctl)\)/g)) assert.fail(`${file} : ${m[0]} sans valeur de repli (le kit ne le définit pas)`);
  }
});

test('feuilles : le fond de la page est --bg sur l\'élément qui couvre la page, avec le décor --wash', () => {
  const app = feuilles.find(f => f.file === 'css/app.css').text;
  const regle = /\.tu-app \{[^}]*min-height: 100vh;[^}]*\}/.exec(app)?.[0] ?? '';
  assert.match(regle, /background-color: var\(--bg\)/);
  assert.match(regle, /background-image: var\(--wash, none\)/);
  assert.match(regle, /background-size: var\(--wash-size, auto\)/);
});

test('toutes les feuilles du dépôt sont liées par index.html (une feuille oubliée laisse un pop-up sans style)', () => {
  const html = readFileSync(join(racine, 'index.html'), 'utf8');
  for (const { file } of feuilles) assert.ok(html.includes(`href="${file}?v=`), `${file} n'est pas liée par index.html`);
});

test('le module d\'entrée démarre l\'ambiance de GFS avant d\'afficher, une fois, avec le kit', () => {
  const main = readFileSync(join(racine, 'js/main.js'), 'utf8');
  assert.match(main, /import \{ Ambiance \} from '\.\.\/kit\/js\/ambiance\.js'/);
  assert.equal(main.match(/Ambiance\.start\(\)/g)?.length, 1);
  assert.ok(main.indexOf('Ambiance.start()') < main.indexOf('monter(racine'), 'l\'ambiance est posée avant le premier affichage');
  assert.doesNotMatch(main, /createAmbiance/, 'le lien du kit est celui de l\'app : pas de deuxième lien');
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

test('aucun élément `draggable` n\'est un <button> (Firefox avant la 147 ne le glisse pas : consigne 007 de GFS)', () => {
  let vus = 0;
  for (const { file, text } of sources) {
    for (const m of text.matchAll(/draggable:/g)) {
      vus++;
      const avant = text.slice(Math.max(0, m.index - 400), m.index);
      const balise = [...avant.matchAll(/\bh\('(\w+)'/g)].at(-1)?.[1];
      assert.notEqual(balise, 'button', `${file} : un bouton glissable`);
    }
  }
  assert.ok(vus >= 2, 'le kanban et le calendrier portent draggable');
});
