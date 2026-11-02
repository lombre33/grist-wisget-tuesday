// Prend les captures de la maquette (700 × 400, clair et sombre) : node maquettes/outils/captures.cjs <port>
const { chromium } = require('playwright');
const path = require('path');
const port = process.argv[2] || '8765';
const out = path.join(__dirname, '..', 'captures');
const only = process.argv[3]; // 'onboarding' : ne refait que les écrans du premier lancement
const onboarding = [
  ['onboarding-acces', { screen: 'ob-acces' }], ['demarrage', { screen: 'demarrage' }], ['onboarding-colonnes', { screen: 'ob-colonnes' }],
  ['onboarding-question', { screen: 'ob-statut' }], ['onboarding-ouverture', { screen: 'ob-ouverture' }], ['onboarding-garder', { screen: 'ob-enregistrer' }],
  ['onboarding-garder-refus', { screen: 'ob-enregistrer', noschema: '1' }], ['onboarding-sans-table', { screen: 'ob-sans-table' }],
  ['onboarding-modele', { screen: 'ob-modele' }], ['onboarding-premiere-tache', { screen: 'ob-vide' }],
  ['onboarding-colonnes-barre-haut', { screen: 'ob-colonnes', bar: 'top' }],
];
const shots = only ? onboarding : [
  ['tableau', {}], ['kanban', {}], ['calendrier', {}], ['chronologie', {}], ['fiche', {}], ['correspondance', {}], ['demarrage', {}], ['explorateur', {}],
  ['tableau-lecture-seule', { screen: 'tableau', ro: '1' }], ['chronologie-sans-debut', { screen: 'chronologie', nostart: '1' }],
  ['tableau-barre-haut', { screen: 'tableau', bar: 'top' }], ['kanban-barre-droite', { screen: 'kanban', bar: 'right' }],
];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(String(e)));
  for (const theme of ['light', 'dark']) {
    for (const [name, opt] of shots) {
      const q = new URLSearchParams({ screen: name.split('-')[0], theme, size: '700x400', bar: 'left', ...opt });
      await p.goto(`http://localhost:${port}/maquettes/index.html?${q}`);
      await p.waitForTimeout(150);
      await p.locator('#frame').screenshot({ path: path.join(out, `${name}-${theme}.png`) });
    }
  }
  if (!only) for (const theme of ['light', 'dark']) {
    await p.goto(`http://localhost:${port}/maquettes/index.html?screen=fiche&theme=${theme}&size=700x400&bar=left`);
    await p.evaluate(() => { const b = document.querySelector('.dr-body'); b.scrollTop = 330; });
    await p.locator('#frame').screenshot({ path: path.join(out, `fiche-fichiers-${theme}.png`) });
  }
  const q = new URLSearchParams({ screen: 'tableau', theme: 'light', size: '1000x640', bar: 'left' });
  if (!only) for (const s of ['tableau', 'kanban', 'calendrier', 'chronologie']) {
    q.set('screen', s); await p.goto(`http://localhost:${port}/maquettes/index.html?${q}`);
    await p.locator('#frame').screenshot({ path: path.join(out, `large-${s}-light.png`) });
  }
  console.log(errors.length ? 'ERREURS:\n' + errors.join('\n') : 'aucune erreur de console');
  await b.close();
})();
