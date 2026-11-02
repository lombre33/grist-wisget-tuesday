// Génère la carte d'importation (adresses versionnées `?v=`) et la politique de sécurité de index.html. Ce qu'un outil génère est commité. À lancer après chaque changement de JS ou de CSS :
//   node outils/versionner.mjs            (la version vient de package.json)
// GitHub Pages met tout en cache 10 minutes : sans `?v=`, une correction n'arrive pas. Une seule adresse par module, la même partout (le kit le vérifie).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const racine = new URL('../', import.meta.url).pathname;
const version = JSON.parse(readFileSync(join(racine, 'package.json'), 'utf8')).version;

function modules(dossier, sortie = []) {
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) modules(chemin, sortie);
    else if (nom.endsWith('.js')) sortie.push(relative(racine, chemin));
  }
  return sortie;
}

export function carte(v) {
  const fichiers = [...modules(join(racine, 'js')), ...modules(join(racine, 'kit/js'))].sort();
  const imports = Object.fromEntries(fichiers.map(f => [`./${f}`, `./${f}?v=${v}`]));
  return JSON.stringify({ imports }, null, 2);
}

export const empreinte = texte => `'sha256-${createHash('sha256').update(texte).digest('base64')}'`;

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const chemin = join(racine, 'index.html');
  let html = readFileSync(chemin, 'utf8');
  const json = carte(version);
  const corps = `\n${json}\n`;
  html = html.replace(/(<script type="importmap">)[\s\S]*?(<\/script>)/, `$1${corps}$2`);
  html = html.replace(/('sha256-[A-Za-z0-9+/=]+')(?=[^>]*?;\s*\n\s*style-src|[^>]*?style-src)/, empreinte(corps));
  html = html.replace(/\?v=[0-9.]+(?=")/g, `?v=${version}`);
  writeFileSync(chemin, html);
  process.stdout.write(`index.html : version ${version}, ${Object.keys(JSON.parse(json).imports).length} modules\n`);
}
