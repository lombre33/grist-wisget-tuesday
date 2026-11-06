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
      if (url.pathname === '/' || url.pathname === '/index.html') {
        // La page de l'app, avec l'entrée de la suite rapide (port de test en mémoire) à la place de js/main.js.
        const page = fs.readFileSync(path.join(racine, 'index.html'), 'utf8').replace(/src="js\/main\.js[^"]*"/, 'src="test/navigateur/demo-main.js"');
        res.writeHead(200, { 'Content-Type': TYPES['.html'] }); res.end(page); return;
      }
      const f = path.join(racine, url.pathname === '/livre.html' ? 'index.html' : decodeURIComponent(url.pathname)); // /livre.html : la page telle qu'elle est livrée
      if (!f.startsWith(racine) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    }).listen(0, () => resolve(s));
  });
}

const resultats = [];
async function essai(nom, fn) {
  try { await fn(); resultats.push([true, nom]); process.stdout.write(`ok   ${nom}\n`); } catch (e) { resultats.push([false, nom]); process.stdout.write(`FAIL ${nom}\n     ${String(e.message).split('\n').slice(0, process.env.TUESDAY_DETAIL ? 40 : 1).join(' | ')}\n`); }
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
    await p.goto(options.demo ? `${base}?demo=${options.demo}` : base);
    await p.waitForSelector('#tu-mep .tu-mep-box', { state: 'visible' }); // la mise en place s'ouvre au lancement, par-dessus l'outil
    if (options.ouvrir !== false) { await p.click('[data-geste="mep-principal"]'); await passerMemoire(p); await p.waitForFunction(() => window.__tuesday.pret); await p.waitForSelector('.tu-tableau'); }
    return p;
  }
  // Après une mise en place réussie, Tuesday propose de se souvenir de la table dans le document (une table de plus : accord demandé) ; ici on dit « Plus tard » (Échap).
  const passerMemoire = async p => { try { await p.waitForSelector('#pp-dialog-modal:not([hidden])', { timeout: 2000 }); await p.keyboard.press('Escape'); await p.waitForSelector('#pp-dialog-modal', { state: 'hidden' }); } catch (e) { /* pas de proposition : projet déjà gardé */ } };
  const tache = (p, id) => p.evaluate(i => { const t = window.__tuesday.tache(i); return t && { statut: t.statut, titre: t.titre, debut: t.debut, fin: t.fin, ordre: t.ordre, responsables: t.responsables.map(r => r.label) }; }, id);
  const shot = (p, nom) => p.screenshot({ path: path.join(sortie, `${nom}.png`) });

  await essai('Grist vide : l\'outil est là, complet et vide ; le pop-up propose de créer une table ; « Plus tard » ne bloque rien', async () => {
    const p = await page({ demo: 'vide', ouvrir: false });
    assert.equal(await p.locator('.tu-onglet').count(), 4);
    assert.equal(await p.locator('.tu-onglet[aria-disabled="true"]').count(), 0); // les quatre vues sont là, rien de grisé
    assert.equal(await p.isChecked('[data-mep="choix-creer"]'), true); // la recommandation : créer, la table du document est vide
    assert.equal(await p.locator('.tu-mep-etapes li').count(), 1);
    await shot(p, 'mise-en-place-vide-clair');
    await p.click('[data-geste="mep-plus-tard"]');
    await p.waitForSelector('#tu-mep .tu-mep-box', { state: 'hidden' });
    await p.waitForSelector('[data-bandeau="mise-en-place"]');
    await p.click('[data-vue="kanban"]'); await p.waitForSelector('.tu-vue[data-vue="kanban"]');
    await p.click('[data-vue="chronologie"]'); await p.waitForSelector('.tu-vue[data-vue="chronologie"]');
    await p.click('[data-vue="tableau"]'); await p.waitForSelector('.tu-ligne-ajout');
    await shot(p, 'outil-vide-clair');
    assert.equal(await p.evaluate(() => window.__tuesday.port._etat.tablesMeta.length), 1); // rien n'a été créé
    await p.context().close();
  });

  await essai('ajouter une tâche avant la mise en place : le pop-up revient avec la tâche tapée, puis la table est créée et la tâche y est', async () => {
    const p = await page({ demo: 'vide', ouvrir: false });
    await p.click('[data-geste="mep-plus-tard"]');
    await p.fill('[data-ajout]', 'Appeler le client'); await p.press('[data-ajout]', 'Enter');
    await p.waitForSelector('#tu-mep .tu-mep-box', { state: 'visible' });
    assert.match(await p.textContent('.tu-mep-attente'), /Appeler le client/);
    await shot(p, 'mise-en-place-reprise-clair');
    await p.fill('[data-mep="nom"]', 'Mes tâches');
    assert.match(await p.textContent('[data-geste="mep-principal"]'), /Mes tâches/); // le bouton nomme ce qui sera créé
    await p.click('[data-geste="mep-principal"]');
    await passerMemoire(p);
    await p.waitForFunction(() => window.__tuesday.pret);
    await p.waitForSelector('.tu-ligne[data-id]');
    assert.equal(await p.evaluate(() => window.__tuesday.source), 'Mes_tâches');
    assert.match(await p.textContent('.tu-tableau'), /Appeler le client/);
    assert.equal(await p.evaluate(() => window.__tuesday.port._etat.donnees['Mes_tâches'].length), 1);
    await p.context().close();
  });

  await essai('« + Tâche » et la touche N rouvrent aussi la mise en place, sans rien écrire', async () => {
    const p = await page({ demo: 'vide', ouvrir: false });
    await p.click('[data-geste="mep-plus-tard"]');
    await p.click('[data-geste="nouvelle"]');
    await p.waitForSelector('#tu-mep .tu-mep-box', { state: 'visible' });
    await p.click('[data-geste="mep-plus-tard"]');
    await p.keyboard.press('n');
    await p.waitForSelector('#tu-mep .tu-mep-box', { state: 'visible' });
    assert.equal(await p.evaluate(() => window.__tuesday.pret), false);
    await p.keyboard.press('Escape'); // Échap = Plus tard
    await p.waitForSelector('#tu-mep .tu-mep-box', { state: 'hidden' });
    await p.context().close();
  });

  await essai('table reconnue : l\'outil montre déjà les tâches derrière le pop-up, « Utiliser cette table » en un clic, rien d\'écrit', async () => {
    const p = await page({ ouvrir: false });
    assert.ok((await p.locator('.tu-ligne[data-id]').count()) >= 10); // lire est libre
    assert.equal(await p.isChecked('[data-mep="choix-existante"]'), true);
    assert.equal(await p.evaluate(() => window.__tuesday.projets.length), 0);
    await shot(p, 'mise-en-place-table-clair');
    await p.click('[data-geste="mep-principal"]');
    await passerMemoire(p);
    await p.waitForSelector('#tu-mep .tu-mep-box', { state: 'hidden' });
    assert.equal(await p.evaluate(() => window.__tuesday.pret), true);
    await shot(p, 'tableau-clair');
    await p.context().close();
  });

  await essai('colonnes : « Vérifier » ouvre l\'étape, Terminer sans titre reste ouvert avec sa raison', async () => {
    const p = await page({ ouvrir: false });
    await p.click('[data-mep="verifier"]');
    await p.waitForSelector('select[data-role="titre"]');
    assert.equal(await p.inputValue('select[data-role="titre"]'), 'Titre');
    assert.equal(await p.inputValue('select[data-role="statut"]'), 'Statut');
    assert.equal(await p.locator('.tu-mep-etapes li').count(), 2);
    await shot(p, 'mise-en-place-colonnes-clair');
    await p.selectOption('select[data-role="titre"]', '');
    await p.click('[data-geste="mep-principal"]');
    await p.waitForSelector('.tu-role.est-a-voir .tu-role-aide');
    assert.match(await p.textContent('.tu-role.est-a-voir .tu-role-aide'), /titre/i);
    assert.equal(await p.evaluate(() => window.__tuesday.pret), false);
    await p.click('[data-geste="mep-precedent"]');
    await p.waitForSelector('[data-mep="choix-existante"]');
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

  await essai('un clic sur une cellule (statut) ouvre son menu sans ouvrir la fiche, et le menu passe devant la fiche ouverte', async () => {
    const p = await page({ largeur: 1000, hauteur: 640 });
    await p.locator('.tu-ligne[data-id="8"] [data-champ="statut"]').click();
    await p.waitForSelector('.tu-menu-item');
    assert.equal(await p.locator('.tu-fiche').count(), 0, 'la fiche reste fermée');
    await p.keyboard.press('Escape');
    await p.locator('.tu-ligne[data-id="9"]').click();
    await p.waitForSelector('.tu-fiche');
    await p.locator('.tu-fiche [data-champ="statut"] button, .tu-fiche button[data-champ="statut"]').first().click();
    await p.locator('.tu-menu-item', { hasText: 'En cours' }).click({ timeout: 3000 });
    await p.waitForFunction(() => window.__tuesday.tache(9).statut === 'En cours');
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

  // Un jour du mois affiché (novembre 2026) à au moins quatre jours de l'événement de la tâche : le déposer ailleurs que sur lui-même.
  const jourLoin = t => ['2026-11-22', '2026-11-12'].find(j => Math.abs(Date.parse(j) - Date.parse(String(t.fin || t.debut).slice(0, 10))) >= 4 * 86400000);
  await essai('calendrier du kit : le module se monte à la place de la grille provisoire, un clic ouvre la tâche, un glisser change le jour, le plateau « Sans date » date une tâche', async () => {
    const p = await page();
    await p.click('[data-vue="calendrier"]');
    await p.waitForSelector('.tu-cal .cal-evt');
    assert.equal(await p.locator('.tu-cal-jour, .tu-cal-grille').count(), 0, 'la grille provisoire est partie');
    assert.ok((await p.locator('.cal-evt').count()) >= 5);
    await shot(p, 'calendrier-clair');
    const t10 = await tache(p, 10);
    
    const cible = p.locator(`.cal-num[data-jour="${jourLoin(t10)}"]`); // les dates de la démonstration suivent l'horloge : la cible est choisie loin de l'événement, sur le numéro du jour que les longues barres ne recouvrent pas
    await p.locator('.cal-evt[data-id="10"]').first().dragTo(cible);
    await p.waitForFunction(([id, fin]) => window.__tuesday.tache(id).fin !== fin, [10, t10.fin]);
    // le plateau « Sans date » : la tâche 12 n'a pas de date, la déposer sur un jour lui donne une échéance
    assert.equal((await tache(p, 12)).fin, null);
    await p.click('.tu-etat .tu-btn-icone'); // le message « Tâche déplacée » recouvre le bas du mois
    await p.click('.cal-plateau-bouton');
    await p.waitForSelector('.cal-plateau .cal-puces [data-id="12"]');
    await p.locator('.cal-plateau [data-id="12"]').dragTo(p.locator('.cal-num[data-jour="2026-11-18"]'));
    await p.waitForFunction(() => window.__tuesday.tache(12).fin !== null);
    await p.context().close();
  });

  await essai('calendrier du kit : un déplacement refusé revient à sa place (lecture seule d\'une colonne), Annuler défait le déplacement', async () => {
    const p = await page();
    await p.click('[data-vue="calendrier"]');
    await p.waitForSelector('.cal-evt[data-id="10"]');
    const avant = await tache(p, 10);
    await p.locator('.cal-evt[data-id="10"]').first().dragTo(p.locator(`.cal-num[data-jour="${jourLoin(avant)}"]`));
    await p.waitForFunction(([id, fin]) => window.__tuesday.tache(id).fin !== fin, [10, avant.fin]);
    await p.keyboard.press('Control+z');
    await p.waitForFunction(([id, fin]) => window.__tuesday.tache(id).fin === fin, [10, avant.fin]);
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
    await p.click('#pp-dialog-modal .pp-modal-primary');
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
    await p.waitForFunction(() => /lecture seule/i.test(document.querySelector('.tu-etat')?.textContent ?? '')); // le message « Tout est prêt » de la mise en place est remplacé
    assert.equal(await p.locator('#tu-mep .tu-mep-box').isVisible(), false); // lecture seule : jamais de mise en place
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

  await essai('attente d\'accès : le pop-up dit quoi faire dans Grist, l\'outil reste affiché derrière', async () => {
    const p = await page({ ouvrir: false });
    await p.evaluate(() => { const a = window.__tuesday; a.attenteAcces = true; a.demanderMiseEnPlace({ etape: 'acces' }); });
    await p.waitForSelector('.tu-mep-pas');
    assert.match(await p.textContent('.tu-mep-box'), /accès complet/i);
    assert.equal(await p.locator('.tu-mep-etapes li').count(), 3);
    await shot(p, 'mise-en-place-acces-clair');
    assert.equal(await p.locator('.tu-barre').count(), 1);
    await p.context().close();
  });

  await essai('entrées en attente de la suite : « Lier un fichier » (fiche) et « Automatiser… » (menu) grisées avec leur raison, jamais masquées', async () => {
    const p = await page();
    await p.locator('.tu-ligne[data-id="9"]').click();
    await p.waitForSelector('.tu-fiche');
    assert.equal(await p.getAttribute('[data-geste="lier"]', 'aria-disabled'), 'true');
    assert.ok((await p.getAttribute('[data-geste="lier"]', 'title')).length > 10);
    await p.click('[data-geste="reglages"]');
    const auto = p.locator('.tu-menu-item', { hasText: 'Automatiser' });
    assert.equal(await auto.getAttribute('aria-disabled'), 'true');
    assert.ok((await auto.getAttribute('title')).length > 10);
    await p.context().close();
  });

  await essai('barre de GFS : l\'interface s\'écarte du bord choisi, aux quatre bords, et la zone se libère quand la barre part', async () => {
    const p = await page();
    const marges = bar => p.evaluate(async b => {
      const { poserBarre } = await import('/js/ui/rendu.js');
      const r = document.getElementById('tuesday'); poserBarre(r, b);
      const cs = getComputedStyle(r.querySelector('.tu-app') ?? r);
      return ['--bar-g', '--bar-h', '--bar-d', '--bar-b'].map(v => r.style.getPropertyValue(v));
    }, bar);
    assert.deepEqual(await marges({ bord: 'gauche', epaisseur: 42 }), ['50px', '0px', '0px', '0px']);
    assert.deepEqual(await marges({ bord: 'bas', epaisseur: 42 }), ['0px', '0px', '0px', '50px']);
    assert.deepEqual(await marges({ bord: 'droite', epaisseur: 30 }), ['0px', '0px', '38px', '0px']);
    assert.deepEqual(await marges({ bord: 'haut', epaisseur: 30 }), ['0px', '38px', '0px', '0px']);
    assert.deepEqual(await marges(null), ['0px', '0px', '0px', '0px']);
    await p.evaluate(async () => { const { poserBarre } = await import('/js/ui/rendu.js'); poserBarre(document.getElementById('tuesday'), { bord: 'gauche', epaisseur: 42 }); });
    const x = await p.evaluate(() => document.querySelector('.tu-barre').getBoundingClientRect().left);
    assert.ok(x >= 42, 'la barre d\'outils de Tuesday est à droite de la zone de GFS');
    await shot(p, 'barre-gfs-gauche');
    await p.context().close();
  });

  await essai('page livrée ouverte hors de Grist : un écran dit comment l\'ouvrir, aucun point d\'accès global, aucune donnée', async () => {
    const ctx = await b.newContext({ viewport: { width: 700, height: 400 }, locale: 'fr-FR' });
    const p = await ctx.newPage();
    p.setDefaultTimeout(6000);
    await p.goto(base.replace('index.html', 'livre.html'));
    await p.waitForSelector('.tu-demarrage-carte');
    assert.match(await p.textContent('.tu-demarrage-carte'), /s'ouvre dans Grist/);
    assert.equal(await p.evaluate(() => typeof window.__tuesday), 'undefined');
    assert.equal(await p.locator('.tu-tableau').count(), 0);
    await ctx.close();
  });

  await essai('calendrier du kit : l\'événement est un élément glissable qui n\'est pas un bouton, et s\'ouvre au clavier (Entrée)', async () => {
    const p = await page();
    await p.click('[data-vue="calendrier"]');
    await p.waitForSelector('.cal-evt');
    assert.equal(await p.locator('button.cal-evt').count(), 0);
    assert.equal(await p.locator('.cal-evt').first().getAttribute('role'), 'button');
    assert.equal(await p.locator('.cal-evt').first().getAttribute('tabindex'), '0');
    await p.locator('.cal-evt').first().focus();
    await p.keyboard.press('Enter');
    await p.waitForSelector('.tu-fiche');
    await p.context().close();
  });

  await essai('fichiers liés : seule, la fiche montre « Aucun fichier lié » et « Lier un fichier » grisé avec sa raison', async () => {
    const p = await page();
    await p.locator('.tu-ligne[data-id="9"]').click();
    await p.waitForSelector('.tu-fiche');
    assert.match(await p.textContent('.tu-fiche-section:has([data-geste="lier"])'), /Aucun fichier lié/);
    assert.equal(await p.getAttribute('[data-geste="lier"]', 'aria-disabled'), 'true');
    assert.match(await p.getAttribute('[data-geste="lier"]', 'title'), /Grist Factory Suite/);
    await p.context().close();
  });

  await essai('thème sombre et anglais : mêmes écrans, textes traduits', async () => {
    const p = await page({ sombre: true, locale: 'en-GB', ouvrir: false });
    assert.match(await p.textContent('#tu-mep h3'), /Where should your tasks go\?/);
    await shot(p, 'mise-en-place-sombre');
    await p.click('[data-geste="mep-principal"]');
    await passerMemoire(p);
    await p.waitForFunction(() => window.__tuesday.pret);
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

  // L'ambiance de GFS (consigne 010) : le message d'exemple du kit (kit/test/ambiance-exemple.json, « Pop ») posé comme le fait `Ambiance.start()` (même pose, lien joué par l'essai) ; la page doit le montrer.
  const rgb = hex => { const n = parseInt(hex.slice(1), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; };
  const lireAmbiance = p => p.evaluate(() => {
    const css = (sel, prop) => getComputedStyle(document.querySelector(sel))[prop];
    return { fond: css('.tu-app', 'backgroundColor'), barre: css('.tu-barre', 'backgroundColor'), bouton: `${css('.tu-btn-principal', 'backgroundColor')} ${css('.tu-btn-principal', 'backgroundImage')}`, rondBouton: css('.tu-btn-principal', 'borderTopLeftRadius'), texte: css('.tu-app', 'color'), image: css('.tu-app', 'backgroundImage') };
  });
  async function poserAmbiance(p, message) {
    await p.evaluate(async cadeau => {
      const { createAmbiance } = await import('/kit/js/ambiance-pose.js');
      const { normalizeAmbiance } = await import('/kit/js/ambiance-message.js');
      const abonnes = new Set();
      let courant = normalizeAmbiance(cadeau);
      const lien = { ambiance: () => courant, onAmbiance: fn => { abonnes.add(fn); return () => abonnes.delete(fn); }, ready: Promise.resolve() };
      window.__ambiance = { demarre: createAmbiance({ link: lien, isDark: () => document.documentElement.getAttribute('data-theme') === 'dark' }).start(), dire: m => { courant = normalizeAmbiance(m); abonnes.forEach(fn => fn(courant)); } };
      await window.__ambiance.demarre.ready;
    }, message);
  }
  const exemple = JSON.parse(fs.readFileSync(path.join(racine, 'kit/test/ambiance-exemple.json'), 'utf8'));
  await essai('ambiance de GFS, clair : le fond de la page, la barre, le bouton plein, le texte, l\'arrondi du bouton et le décor suivent les jetons ; sans ambiance, la page reprend les siens', async () => {
    const p = await page();
    const avant = await lireAmbiance(p);
    await poserAmbiance(p, exemple);
    const apres = await lireAmbiance(p);
    assert.equal(apres.fond, rgb(exemple.clair['--bg']));
    assert.equal(apres.barre, rgb(exemple.clair['--surface']));
    assert.ok(apres.bouton.includes(rgb(exemple.clair['--accent-solid'])), `bouton plein : ${apres.bouton}`); // --fill est un dégradé de --accent-solid à --accent-end chez Pop
    assert.equal(apres.texte, rgb(exemple.clair['--text']));
    assert.notEqual(apres.fond, avant.fond);
    assert.notEqual(apres.bouton, avant.bouton);
    assert.equal(apres.rondBouton, '999px', 'jeton de forme --radius-btn');
    assert.match(apres.image, /gradient/, 'le décor --wash est posé en image de fond');
    await p.evaluate(() => window.__ambiance.dire(null));
    assert.deepEqual(await lireAmbiance(p), avant, 'GFS dit null : la page reprend ses couleurs et sa forme');
    await p.context().close();
  });
  await essai('ambiance de GFS, sombre : les jetons du mode sombre ; le texte reste lisible (contraste 4,5 au moins) sur le fond et sur la barre', async () => {
    const p = await page({ sombre: true });
    await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await poserAmbiance(p, exemple);
    const a = await lireAmbiance(p);
    assert.equal(a.fond, rgb(exemple.sombre['--bg']));
    assert.equal(a.barre, rgb(exemple.sombre['--surface']));
    assert.equal(a.texte, rgb(exemple.sombre['--text']));
    const lum = c => { const [r, g, bl] = c.match(/\d+/g).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
    const contraste = (x, y) => (Math.max(lum(x), lum(y)) + 0.05) / (Math.min(lum(x), lum(y)) + 0.05);
    assert.ok(contraste(a.texte, a.fond) >= 4.5, `texte sur fond : ${contraste(a.texte, a.fond)}`);
    assert.ok(contraste(a.texte, a.barre) >= 4.5, `texte sur barre : ${contraste(a.texte, a.barre)}`);
    await p.context().close();
  });
  await essai('ambiance de GFS : le calendrier du kit lit aussi les jetons', async () => {
    const p = await page();
    await poserAmbiance(p, exemple);
    await p.click('[data-vue="calendrier"]');
    await p.waitForSelector('.cal-fond');
    const grille = await p.evaluate(() => [...document.querySelectorAll('.cal-fond')].map(el => getComputedStyle(el).backgroundColor));
    const permis = [rgb(exemple.clair['--surface']), rgb(exemple.clair['--surface-sunken']), rgb(exemple.clair['--bg']), 'rgba(0, 0, 0, 0)'];
    assert.ok(grille.every(c => permis.includes(c) || /^rgba?\(/.test(c)) && grille.some(c => c !== 'rgba(0, 0, 0, 0)'), `jours du calendrier : ${[...new Set(grille)]}`);
    assert.ok(!grille.includes('rgb(255, 255, 255)') || exemple.clair['--surface'] === '#ffffff', 'aucune couleur du kit écrite en dur');
    await p.context().close();
  });

  await essai('en-tête Grist Factory : la roue des Réglages puis le logo tout à droite de la barre, rien ne déborde à 700 × 400 ; la roue ouvre qui je suis, la langue, le thème, Automatiser grisé et Crédits', async () => {
    for (const largeur of [700, 560]) {
      const p = await page({ largeur });
      const m = await p.evaluate(() => {
        const r = sel => document.querySelector(sel).getBoundingClientRect();
        const barre = r('.tu-barre'); const roue = r('.tu-roue'); const logo = r('.tu-logo'); const image = document.querySelector('.tu-logo');
        return { barreDroite: barre.right, roueDroite: roue.right, logoGauche: logo.left, logoDroite: logo.right, logoLarg: logo.width, ok: image.complete && image.naturalWidth > 0, defile: document.documentElement.scrollWidth > window.innerWidth, opacite: getComputedStyle(image).opacity, rond: getComputedStyle(image).borderTopLeftRadius, bouton: image.closest('button') !== null, nouvelle: r('[data-geste="nouvelle"]').right };
      });
      assert.ok(m.ok, 'le logo est chargé'); assert.equal(m.logoLarg, 20); assert.equal(m.opacite, '0.85'); assert.equal(m.rond, '50%'); assert.equal(m.bouton, false, 'le logo n\'est pas un bouton');
      assert.ok(m.logoGauche >= m.roueDroite && m.logoGauche >= m.nouvelle, 'ordre : nouvelle tâche, roue, logo');
      assert.ok(m.logoDroite <= m.barreDroite + 0.5, `le logo reste dans la barre à ${largeur} px`);
      assert.equal(m.defile, false, `aucun défilement horizontal à ${largeur} px`);
      await p.context().close();
    }
    const p = await page();
    await p.click('[data-geste="reglages"]');
    const textes = await p.locator('.tu-menu-item, .tu-menu-titre').allTextContents();
    for (const attendu of ['Je suis', 'Français', 'English', 'Automatiser', 'Crédits']) assert.ok(textes.some(x => x.includes(attendu)), attendu);
    assert.equal(await p.locator('.tu-menu-item').filter({ hasText: 'Automatiser' }).getAttribute('aria-disabled'), 'true');
    await p.locator('.tu-menu-item').filter({ hasText: 'Crédits' }).click();
    const credits = await p.textContent('#pp-dialog-message');
    assert.match(credits, /Grist Factory/); assert.match(credits, /grist-factory\.fr/); assert.match(credits, /GPL v3\.0/); assert.match(credits, /Version : 0\./);
    await p.keyboard.press('Escape');
    await p.click('.tu-barre .tu-projet');
    const menuProjet = await p.locator('.tu-menu-item, .tu-menu-titre').allTextContents();
    assert.ok(menuProjet.some(x => x.includes('autre table')), 'le menu du projet garde les projets et « Ouvrir une autre table »');
    assert.ok(!menuProjet.some(x => x.includes('Je suis')), 'les réglages ont quitté le menu du projet');
    await p.context().close();
  });
  await essai('en-tête Grist Factory, anglais et sombre : « Settings » et « Credits », roue et logo visibles', async () => {
    const p = await page({ locale: 'en-US', sombre: true });
    assert.equal(await p.getAttribute('[data-geste="reglages"]', 'aria-label'), 'Settings');
    await p.click('[data-geste="reglages"]');
    assert.ok((await p.locator('.tu-menu-item').allTextContents()).some(x => x.includes('Credits')));
    await p.context().close();
  });

  await essai('mise en place réussie : Tuesday propose de se souvenir de la table dans le document (accord demandé), « Plus tard » ne crée rien, « Se souvenir » crée Tuesday_Projets et garde le projet', async () => {
    const refus = await page({ ouvrir: false });
    await refus.click('[data-geste="mep-principal"]');
    await refus.waitForSelector('#pp-dialog-modal:not([hidden])');
    const texte = await refus.textContent('#pp-dialog-message');
    assert.match(texte, /cache/); assert.match(texte, /Tuesday_Projets/); assert.match(texte, /Vos données ne sont pas modifiées/);
    await refus.keyboard.press('Escape');
    await refus.waitForFunction(() => window.__tuesday.pret);
    assert.equal(await refus.evaluate(() => Boolean(window.__tuesday.modele.tables.Tuesday_Projets)), false, 'rien n\'est créé sans accord');
    assert.equal(await refus.evaluate(() => window.__tuesday.projet), null);
    await refus.context().close();
    const p = await page({ ouvrir: false });
    await p.click('[data-geste="mep-principal"]');
    await p.waitForSelector('#pp-dialog-modal:not([hidden])');
    await p.click('#pp-dialog-modal .pp-modal-primary');
    await p.waitForFunction(() => window.__tuesday.projet !== null);
    assert.equal(await p.evaluate(() => Boolean(window.__tuesday.modele.tables.Tuesday_Projets)), true);
    assert.equal(await p.evaluate(() => window.__tuesday.projet.source), 'Taches');
    await p.context().close();
  });

  // `fermer` de GFS (consigne 013) : la réponse de Tuesday, appelée comme le ferait le kit quand GFS veut laisser la place à une autre app.
  const fermer = p => p.evaluate(async () => (await import('/js/ui/fermeture.js')).reponseFermer(window.__tuesday));
  await essai('fermer : rien n\'attend → oui tout de suite ; une saisie dont on n\'est pas sorti est enregistrée par sa sortie, sans question', async () => {
    const p = await page();
    assert.deepEqual(await fermer(p), { ferme: true });
    await p.locator('.tu-ligne[data-id="1"]').click();
    await p.waitForSelector('.tu-fiche [data-focus="fiche:titre"]');
    await p.fill('.tu-fiche [data-focus="fiche:titre"]', 'Titre changé avant de partir');
    assert.deepEqual(await fermer(p), { ferme: true }, 'la saisie en cours est enregistrée, aucune question');
    assert.equal((await tache(p, 1)).titre, 'Titre changé avant de partir');
    assert.equal(await p.locator('#pp-dialog-modal').isVisible(), false, 'aucune question');
    await p.context().close();
  });
  await essai('fermer : un titre tapé sans Entrée → la question ; Annuler garde tout, Abandonner dit oui sans rien ajouter, Ajouter écrit puis dit oui', async () => {
    const p = await page();
    const avant = await p.evaluate(() => window.__tuesday.taches.length);
    await p.fill('.tu-ajout-champ', 'Appeler le client');
    let reponse = fermer(p);
    await p.waitForSelector('#pp-dialog-modal:not([hidden])');
    assert.match(await p.textContent('#pp-dialog-message'), /Appeler le client/);
    await p.keyboard.press('Escape'); // Annuler
    assert.deepEqual(await reponse, { ferme: false });
    assert.equal(await p.inputValue('.tu-ajout-champ'), 'Appeler le client', 'tout reste en place');
    reponse = fermer(p);
    await p.waitForSelector('#pp-dialog-modal:not([hidden])');
    await p.click('#pp-dialog-modal button:has-text("Abandonner")');
    assert.deepEqual(await reponse, { ferme: true });
    assert.equal(await p.evaluate(() => window.__tuesday.taches.length), avant, 'rien n\'a été ajouté');
    reponse = fermer(p);
    await p.waitForSelector('#pp-dialog-modal:not([hidden])');
    await p.click('#pp-dialog-modal button:has-text("Ajouter")');
    assert.deepEqual(await reponse, { ferme: true });
    assert.equal(await p.evaluate(() => window.__tuesday.taches.length), avant + 1, 'la tâche est écrite avant le oui');
    assert.ok(await p.evaluate(() => window.__tuesday.taches.some(t => t.titre === 'Appeler le client')));
    await p.context().close();
  });
  await essai('fermer : une tâche tapée avant la mise en place (rien ne peut l\'écrire) → seulement Abandonner ou Annuler', async () => {
    const p = await page({ ouvrir: false });
    await p.evaluate(() => { window.__tuesday.tacheEnAttente = { parRole: { titre: 'Brouillon' }, libelle: 'x' }; });
    const reponse = fermer(p);
    await p.waitForSelector('#pp-dialog-modal:not([hidden])');
    assert.equal(await p.locator('#pp-dialog-modal button:has-text("Ajouter")').count(), 0);
    await p.click('#pp-dialog-modal button:has-text("Abandonner")');
    assert.deepEqual(await reponse, { ferme: true });
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
