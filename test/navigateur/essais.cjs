// Essais dans un vrai navigateur (Chromium, Playwright préinstallé) : le panneau de référence de Grist (700 × 400), clair et sombre, français et anglais, souris et clavier, sous la
// politique de sécurité de l'app (aucune violation). La page tourne en démonstration (notre port, pas Grist) : ce qui dépend de ce que Grist envoie se mesure dans un vrai Grist.
//   node test/navigateur/essais.cjs           (captures dans test/navigateur/captures/, ou TUESDAY_CAPTURES)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const racine = path.resolve(__dirname, '../..');
const sortie = process.env.TUESDAY_CAPTURES || path.join(__dirname, 'captures');
fs.mkdirSync(sortie, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' };

function serveur() {
  return new Promise(resolve => {
    const s = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://x');
      const f = path.join(racine, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname));
      if (!f.startsWith(racine) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    }).listen(0, () => resolve(s));
  });
}

const resultats = [];
async function essai(nom, fn) {
  try { await fn(); resultats.push([true, nom]); process.stdout.write(`ok   ${nom}\n`); } catch (e) { resultats.push([false, nom]); process.stdout.write(`FAIL ${nom}\n     ${String(e.message).split('\n')[0]}\n`); }
}

(async () => {
  const s = await serveur();
  const base = `http://localhost:${s.address().port}/index.html`;
  const b = await chromium.launch();
  const violations = [];
  async function page(options = {}) {
    const ctx = await b.newContext({ viewport: { width: options.largeur ?? 700, height: options.hauteur ?? 400 }, locale: options.locale ?? 'fr-FR', colorScheme: options.sombre ? 'dark' : 'light' });
    const p = await ctx.newPage();
    p.setDefaultTimeout(6000);
    p.on('console', m => { if (/Content Security Policy|violat/i.test(m.text())) violations.push(m.text()); if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_INTERNET|Failed to load resource/.test(m.text())) violations.push(m.text()); });
    p.on('pageerror', e => violations.push(`erreur de page : ${e.message}`));
    await p.goto(base);
    await p.waitForSelector('.tu-demarrage-carte');
    if (options.ouvrir !== false) { await p.click('[data-geste="ouvrir"]'); await p.waitForSelector('.tu-tableau'); }
    return p;
  }
  const tache = (p, id) => p.evaluate(i => { const t = window.__tuesday.tache(i); return t && { statut: t.statut, titre: t.titre, debut: t.debut, fin: t.fin, ordre: t.ordre, responsables: t.responsables.map(r => r.label) }; }, id);
  const shot = (p, nom) => p.screenshot({ path: path.join(sortie, `${nom}.png`) });

  await essai('premier lancement : confirmation déjà remplie, rien d\'écrit avant « Ouvrir »', async () => {
    const p = await page({ ouvrir: false });
    assert.equal(await p.inputValue('select[data-role="titre"]'), 'Titre');
    assert.equal(await p.inputValue('select[data-role="statut"]'), 'Statut');
    assert.equal(await p.evaluate(() => window.__tuesday.projets.length), 0);
    await shot(p, 'confirmation-clair');
    await p.click('[data-geste="ouvrir"]');
    await p.waitForSelector('.tu-tableau');
    assert.ok((await p.locator('.tu-ligne[data-id]').count()) >= 10);
    await shot(p, 'tableau-clair');
    await p.context().close();
  });

  await essai('confirmation : Ouvrir grisé tant qu\'il n\'y a pas de titre, avec sa raison', async () => {
    const p = await page({ ouvrir: false });
    await p.selectOption('select[data-role="titre"]', '');
    await p.waitForSelector('[data-geste="ouvrir"][aria-disabled="true"]');
    assert.match(await p.getAttribute('[data-geste="ouvrir"]', 'title'), /titre/i);
    await p.context().close();
  });

  await essai('tableau : changer un statut par le menu, « Annuler » dans le message, Ctrl+Z, Ctrl+Y', async () => {
    const p = await page();
    const ligne = p.locator('.tu-ligne[data-id="8"]');
    await ligne.locator('[data-champ="statut"]').click();
    await p.locator('.tu-menu-item', { hasText: 'En cours' }).click();
    assert.equal((await tache(p, 8)).statut, 'En cours');
    await p.waitForSelector('.tu-etat [data-geste="annuler-toast"]');
    await shot(p, 'message-annuler-clair');
    await p.click('[data-geste="annuler-toast"]');
    await p.waitForFunction(() => window.__tuesday.tache(8).statut === 'À faire');
    await p.keyboard.press('Control+y');
    await p.waitForFunction(() => window.__tuesday.tache(8).statut === 'En cours');
    await p.keyboard.press('Control+z');
    await p.waitForFunction(() => window.__tuesday.tache(8).statut === 'À faire');
    await p.context().close();
  });

  await essai('case à cocher : termine une tâche et la rouvre', async () => {
    const p = await page();
    await p.locator('.tu-ligne[data-id="8"] [data-champ="case"]').click();
    await p.waitForFunction(() => window.__tuesday.tache(8).statut === 'Terminé');
    await p.locator('.tu-ligne[data-id="8"] [data-champ="case"]').click();
    await p.waitForFunction(() => window.__tuesday.tache(8).statut === 'À faire');
    await p.context().close();
  });

  await essai('tableau : ajout rapide au clavier, le champ garde le focus pour la suivante', async () => {
    const p = await page();
    const champ = p.locator('.tu-ajout-champ').first();
    await champ.fill('Première ajoutée'); await champ.press('Enter');
    await p.waitForFunction(() => window.__tuesday.taches.some(t => t.titre === 'Première ajoutée'));
    assert.equal(await p.evaluate(() => document.activeElement?.className), 'tu-ajout-champ');
    await p.keyboard.type('Seconde ajoutée'); await p.keyboard.press('Enter');
    await p.waitForFunction(() => window.__tuesday.taches.some(t => t.titre === 'Seconde ajoutée'));
    // frappe immédiate après Entrée, pendant que la vue se redessine : aucun caractère perdu
    for (let i = 0; i < 8; i++) {
      await p.keyboard.type(`Rapide ${i}`); await p.keyboard.press('Enter');
      await p.waitForFunction(n => window.__tuesday.taches.some(t => t.titre === n), `Rapide ${i}`, { timeout: 2500 });
    }
    await p.context().close();
  });

  await essai('sous-tâches : repli et dépli', async () => {
    const p = await page();
    const avant = await p.locator('.tu-ligne[data-id]').count();
    await p.locator('.tu-ligne[data-id="6"] .tu-twist').click();
    await p.waitForFunction(n => document.querySelectorAll('.tu-ligne[data-id]').length < n, avant);
    await p.locator('.tu-ligne[data-id="6"] .tu-twist').click();
    await p.waitForFunction(n => document.querySelectorAll('.tu-ligne[data-id]').length === n, avant);
    await p.context().close();
  });

  await essai('recherche et filtres : étiquettes visibles qu\'on retire d\'un clic ; ils restent entre les vues', async () => {
    const p = await page();
    await p.click('.tu-recherche');
    await p.fill('.tu-recherche-champ', 'maquettes');
    await p.waitForFunction(() => document.querySelectorAll('.tu-ligne[data-id]').length <= 4);
    assert.ok(await p.locator('.tu-etiquette-filtre').count() >= 1);
    await p.click('[data-vue="kanban"]');
    await p.waitForSelector('.tu-kanban');
    assert.equal(await p.locator('.tu-carte').count(), 1);
    await p.locator('.tu-etiquette-filtre').first().click();
    await p.waitForFunction(() => document.querySelectorAll('.tu-carte').length >= 10);
    await p.context().close();
  });

  await essai('filtre « en retard » par le menu', async () => {
    const p = await page();
    await p.click('.tu-barre [title="Filtres"]');
    await p.locator('.tu-menu-item', { hasText: 'En retard' }).click();
    await p.waitForFunction(() => document.querySelectorAll('.tu-ligne[data-id]').length === 1);
    await p.context().close();
  });

  await essai('kanban : glisser une carte vers une autre colonne change le statut', async () => {
    const p = await page();
    await p.click('[data-vue="kanban"]');
    await p.waitForSelector('.tu-kanban');
    await shot(p, 'kanban-clair');
    await p.dragAndDrop('.tu-carte[data-id="8"]', '.tu-colonne[data-statut="En cours"] .tu-colonne-corps', { targetPosition: { x: 40, y: 8 } });
    await p.waitForFunction(() => window.__tuesday.tache(8).statut === 'En cours');
    await p.keyboard.press('Control+z');
    await p.waitForFunction(() => window.__tuesday.tache(8).statut === 'À faire');
    await p.context().close();
  });

  await essai('kanban : « + Statut » grisé avec sa raison, jamais masqué', async () => {
    const p = await page();
    await p.click('[data-vue="kanban"]');
    const bouton = p.locator('.tu-colonne-plus .tu-btn');
    assert.equal(await bouton.getAttribute('aria-disabled'), 'true');
    assert.match(await bouton.getAttribute('title'), /Grist/);
    await p.context().close();
  });

  await essai('chronologie : ouverture sur aujourd\'hui, barres et jalon ; zoom année', async () => {
    const p = await page();
    await p.click('[data-vue="chronologie"]');
    await p.waitForSelector('.tu-chrono');
    assert.ok((await p.locator('.tu-barre-tache').count()) >= 10);
    const dedans = await p.evaluate(() => { const l = document.querySelector('.tu-ch-auj').getBoundingClientRect(); return l.left >= 0 && l.left <= window.innerWidth; });
    assert.ok(dedans, 'la ligne du jour est dans le cadre à l\'ouverture');
    await shot(p, 'chronologie-clair');
    await p.click('[data-zoom="annee"]');
    await p.waitForSelector('.tu-ch-entete .tu-ch-cel');
    assert.ok((await p.locator('.tu-ch-cel.est-haut').count()) >= 1);
    await p.context().close();
  });

  await essai('chronologie : glisser une barre de deux jours déplace début et échéance ; Annuler les rend', async () => {
    const p = await page();
    await p.click('[data-vue="chronologie"]');
    await p.waitForSelector('.tu-barre-tache[data-id="8"]');
    await p.locator('.tu-barre-tache[data-id="8"]').scrollIntoViewIfNeeded();
    const avant = await tache(p, 8);
    const boite = await p.locator('.tu-barre-tache[data-id="8"]').boundingBox();
    await p.mouse.move(boite.x + boite.width / 2, boite.y + boite.height / 2);
    await p.mouse.down(); await p.mouse.move(boite.x + boite.width / 2 + 36, boite.y + boite.height / 2, { steps: 5 }); await p.mouse.up();
    await p.waitForFunction(([id, fin]) => window.__tuesday.tache(id).fin !== fin, [8, avant.fin]);
    const apres = await tache(p, 8);
    const ecart = (a, c) => (Date.parse(c) - Date.parse(a)) / 86400000;
    assert.equal(ecart(avant.debut, apres.debut), 2);
    assert.equal(ecart(avant.fin, apres.fin), 2);
    await p.keyboard.press('Control+z');
    await p.waitForFunction(([id, fin]) => window.__tuesday.tache(id).fin === fin, [8, avant.fin]);
    await p.context().close();
  });

  await essai('chronologie : un simple clic sur une barre ouvre la fiche, sans rien écrire', async () => {
    const p = await page();
    await p.click('[data-vue="chronologie"]');
    const avant = await p.evaluate(() => JSON.stringify(window.__tuesday.port._etat.donnees));
    await p.locator('.tu-barre-tache[data-id="8"]').click();
    await p.waitForSelector('.tu-fiche');
    assert.equal(await p.evaluate(() => JSON.stringify(window.__tuesday.port._etat.donnees)), avant);
    await p.context().close();
  });

  await essai('calendrier : mois, puces, déplacement par glisser, mois suivant', async () => {
    const p = await page();
    await p.click('[data-vue="calendrier"]');
    await p.waitForSelector('.tu-cal');
    assert.ok((await p.locator('.tu-cal-puce').count()) >= 5);
    await shot(p, 'calendrier-clair');
    const avant = await tache(p, 12 /* sans date */);
    assert.equal(avant.fin, null);
    const t10 = await tache(p, 10);
    await p.locator('.tu-cal-puce[data-id="10"]').first().dragTo(p.locator('.tu-cal-jour:not(.est-hors)').nth(25));
    await p.waitForFunction(([id, fin]) => window.__tuesday.tache(id).fin !== fin, [10, t10.fin]);
    await p.click('[aria-label="Mois suivant"]');
    await p.waitForSelector('.tu-cal-jour');
    await p.context().close();
  });

  await essai('fiche : modifier le titre, Échap, sous-tâche ajoutée, suppression avec accord', async () => {
    const p = await page();
    await p.locator('.tu-ligne[data-id="9"]').click();
    await p.waitForSelector('.tu-fiche');
    await shot(p, 'fiche-clair');
    await p.fill('[data-focus="fiche:titre"]', 'Former toute l\'équipe'); await p.keyboard.press('Enter');
    await p.waitForFunction(() => window.__tuesday.tache(9).titre === 'Former toute l\'équipe');
    await p.fill('[data-ajout="sous:9"]', 'Réserver la salle'); await p.keyboard.press('Enter');
    await p.waitForFunction(() => window.__tuesday.taches.some(t => t.titre === 'Réserver la salle' && t.parentId === 9));
    await p.click('.tu-fiche-pied .tu-btn');
    await p.waitForSelector('#pp-dialog-modal:not([hidden])');
    await p.click('.pp-modal-primary, #pp-dialog-modal button:last-child');
    await p.waitForFunction(() => window.__tuesday.tache(9) === null);
    await p.keyboard.press('Control+z');
    await p.waitForFunction(() => window.__tuesday.tache(9) !== null);
    await p.context().close();
  });

  await essai('fiche : Échap la ferme', async () => {
    const p = await page();
    await p.locator('.tu-ligne[data-id="9"]').click();
    await p.waitForSelector('.tu-fiche');
    await p.locator('.tu-fiche-tete input').click();
    await p.keyboard.press('Escape');
    assert.equal(await p.locator('.tu-fiche').count(), 1, 'Échap dans un champ annule seulement la saisie');
    await p.keyboard.press('Escape');
    await p.waitForSelector('.tu-fiche', { state: 'detached' });
    await p.context().close();
  });

  await essai('lecture seule : tout se voit, les gestes d\'écriture sont grisés avec leur raison', async () => {
    const p = await page();
    await p.evaluate(() => { window.__tuesday.port.lectureSeule = true; window.__tuesday.emettre(); });
    await p.waitForSelector('.tu-btn-principal[aria-disabled="true"]');
    assert.equal(await p.locator('.tu-ajout-champ').count(), 0);
    await p.locator('.tu-ligne[data-id="8"] [data-champ="statut"]').click({ force: true });
    await p.waitForSelector('.tu-etat');
    assert.match(await p.textContent('.tu-etat'), /lecture seule/i);
    assert.equal((await tache(p, 8)).statut, 'À faire');
    await shot(p, 'lecture-seule-clair');
    await p.context().close();
  });

  await essai('écriture refusée par Grist : retour arrière et raison affichée', async () => {
    const p = await page();
    await p.evaluate(() => { window.__tuesday.port.appliquer = async () => { throw new Error('access denied'); }; });
    await p.locator('.tu-ligne[data-id="8"] [data-champ="statut"]').click();
    await p.locator('.tu-menu-item', { hasText: 'Terminé' }).click();
    await p.waitForSelector('.tu-etat.est-erreur');
    assert.equal((await tache(p, 8)).statut, 'À faire');
    await p.context().close();
  });

  await essai('changement venu d\'ailleurs : repris sans rechargement', async () => {
    const p = await page();
    await p.evaluate(() => window.__tuesday.port._exterieur([['UpdateRecord', 'Taches', 8, { Titre: 'Renommée ailleurs' }]]));
    await p.waitForSelector('.tu-ligne[data-id="8"]:has-text("Renommée ailleurs")');
    await p.context().close();
  });

  await essai('Garder pour l\'équipe : accord nommant ce qui est créé, puis le projet est enregistré', async () => {
    const p = await page();
    await p.click('[data-geste="garder"]');
    await p.waitForSelector('#pp-dialog-modal:not([hidden])');
    await p.click('#pp-dialog-modal .pp-modal-primary, #pp-dialog-modal button:last-child');
    await p.waitForSelector('#pp-dialog-modal:not([hidden]) .pp-dialog-message:not([hidden])');
    assert.match(await p.textContent('#pp-dialog-message'), /Tuesday_Projets/);
    await p.click('#pp-dialog-modal .pp-modal-primary, #pp-dialog-modal button:last-child');
    await p.waitForFunction(() => window.__tuesday.projets.length === 1);
    await p.waitForSelector('[data-geste="garder"]', { state: 'detached' });
    await p.context().close();
  });

  await essai('attente d\'accès : l\'écran dit quoi faire dans Grist, et recharger est proposé', async () => {
    const p = await page({ ouvrir: false });
    await p.evaluate(() => { const a = window.__tuesday; a.ecran = 'chargement'; a.attenteAcces = true; a.emettre(); });
    await p.waitForSelector('[data-geste="recharger"]');
    assert.match(await p.textContent('.tu-demarrage-carte'), /accès complet/i);
    await shot(p, 'acces-clair');
    await p.context().close();
  });

  await essai('thème sombre et anglais : mêmes écrans, textes traduits', async () => {
    const p = await page({ sombre: true, locale: 'en-GB', ouvrir: false });
    assert.match(await p.textContent('h1'), /Confirm the columns/);
    await shot(p, 'confirmation-sombre');
    await p.click('[data-geste="ouvrir"]');
    await p.waitForSelector('.tu-tableau');
    await shot(p, 'tableau-sombre');
    assert.match(await p.textContent('.tu-btn-principal'), /New task/);
    await p.click('[data-vue="kanban"]'); await shot(p, 'kanban-sombre');
    await p.click('[data-vue="chronologie"]'); await shot(p, 'chronologie-sombre');
    await p.context().close();
  });

  await essai('largeur réelle d\'un grand cadre (1000 × 640) : fiche à côté de la vue', async () => {
    const p = await page({ largeur: 1000, hauteur: 640 });
    await p.locator('.tu-ligne[data-id="9"]').click();
    await p.waitForSelector('.tu-fiche');
    const [vue, fiche] = await p.evaluate(() => [document.querySelector('.tu-vue').getBoundingClientRect().right, document.querySelector('.tu-fiche').getBoundingClientRect().left]);
    assert.ok(vue <= fiche + 1, 'la vue ne passe pas sous la fiche');
    await shot(p, 'grand-cadre-clair');
    await p.context().close();
  });

  await essai('tout se fait au clavier : N crée une tâche et ouvre sa fiche sur le titre', async () => {
    const p = await page();
    await p.locator('body').click({ position: { x: 5, y: 5 } });
    await p.keyboard.press('n');
    await p.waitForSelector('.tu-fiche [data-focus="fiche:titre"]');
    assert.equal(await p.evaluate(() => document.activeElement?.dataset?.focus), 'fiche:titre');
    await p.context().close();
  });

  await essai('aucune violation de la politique de sécurité, aucune erreur de page', async () => {
    assert.deepEqual(violations, []);
  });

  await b.close();
  s.close();
  const ratees = resultats.filter(r => !r[0]);
  process.stdout.write(`\n${resultats.length - ratees.length}/${resultats.length} essais du navigateur\n`);
  process.exit(ratees.length ? 1 : 0);
})();
