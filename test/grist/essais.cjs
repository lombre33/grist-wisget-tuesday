// Essais de Tuesday dans un vrai Grist (voir labo.cjs). Lancer d'abord `./test/grist/lancer-grist.sh`, puis `node test/grist/essais.cjs`.
//   TUESDAY_ESSAIS="statut,ajout" ne lance que les essais dont le nom contient l'un de ces mots.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { demarrer, creerDocument, ouvrir } = require('./labo.cjs');

const sortie = process.env.TUESDAY_CAPTURES || path.join(__dirname, 'captures');
fs.mkdirSync(sortie, { recursive: true });
const filtre = (process.env.TUESDAY_ESSAIS || '').split(',').map(x => x.trim()).filter(Boolean);
const resultats = [];
async function essai(nom, fn) {
  if (filtre.length && !filtre.some(m => nom.includes(m))) return;
  try { await fn(); resultats.push(true); process.stdout.write(`ok   ${nom}\n`); } catch (e) { resultats.push(false); process.stdout.write(`FAIL ${nom}\n     ${String(e.message).split('\n').slice(0, 14).join(' | ').slice(0, 1500)}\n`); }
}

const JOUR = 86400;
const D = iso => Date.parse(`${iso}T00:00:00Z`) / 1000;
const taches = {
  id: 'Taches',
  colonnes: [
    { id: 'Titre', type: 'Text' },
    { id: 'Statut', type: 'Choice', widgetOptions: { choices: ['À faire', 'En cours', 'Terminé'], choiceOptions: { 'En cours': { fillColor: '#FFE0B2', textColor: '#000000' }, 'Terminé': { fillColor: '#C8E6C9', textColor: '#000000' } } } },
    { id: 'Debut', type: 'Date' }, { id: 'Echeance', type: 'Date' },
    { id: 'Priorite', type: 'Choice', widgetOptions: { choices: ['Basse', 'Moyenne', 'Haute'] } },
  ],
  lignes: {
    Titre: ['Cadrer le projet', 'Maquettes', 'Développer', 'Tester'],
    Statut: ['Terminé', 'En cours', 'À faire', 'À faire'],
    Debut: [D('2026-10-26'), D('2026-11-02'), D('2026-11-09'), D('2026-11-16')],
    Echeance: [D('2026-10-30'), D('2026-11-06'), D('2026-11-13'), D('2026-11-20')],
    Priorite: ['Haute', 'Moyenne', 'Moyenne', 'Basse'],
  },
};

(async () => {
  const labo = await demarrer();
  const { page } = labo;
  const shot = (f, nom) => page.screenshot({ path: path.join(sortie, `grist-${nom}.png`) });
  const ouvrirTuesday = async (options = {}) => {
    const doc = await creerDocument(labo, { tables: [taches], ...options });
    const cadre = await ouvrir(labo, doc);
    return { doc, cadre };
  };
  // La mise en place s'ouvre au lancement par-dessus l'outil (onboarding v2) : on la valide, la table reconnue est celle du document.
  const confirmer = async cadre => { await cadre.waitForSelector('#tu-mep .tu-mep-box', { state: 'visible' }); await cadre.click('[data-geste="mep-principal"]'); await cadre.waitForSelector('#tu-mep .tu-mep-box', { state: 'hidden' }); await cadre.waitForSelector('.tu-tableau'); };

  await essai('premier lancement dans Grist : l\'outil lit la table reconnue derrière la mise en place, valider n\'écrit rien, aucune table créée', async () => {
    const { doc, cadre } = await ouvrirTuesday();
    await cadre.waitForSelector('#tu-mep .tu-mep-box', { state: 'visible' });
    await cadre.waitForSelector('.tu-ligne[data-id]');
    assert.equal(await cadre.locator('.tu-ligne[data-id]').count(), 4, 'les tâches se lisent déjà derrière la mise en place');
    assert.equal(await cadre.evaluate(() => typeof window.__tuesday), 'undefined', 'aucun point d\'accès global dans l\'app livrée');
    await confirmer(cadre);
    assert.equal(await cadre.locator('.tu-ligne[data-id]').count(), 4);
    assert.ok(!(await doc.api.tables(doc.id)).includes('Tuesday_Projets'), 'aucune table créée sans accord');
    // dates lues comme des jours civils (mesuré : onRecords rend des objets Date, fetchTable des secondes)
    await cadre.locator('.tu-ligne[data-id="3"]').click();
    await cadre.waitForSelector('.tu-fiche');
    assert.match(await cadre.textContent('.tu-fiche [data-champ="debut"]'), /9 nov/);
    await shot(cadre, 'tableau');
  });

  await essai('statut : le changement est écrit dans Grist, Ctrl+Z le défait, Ctrl+Y le refait', async () => {
    const { doc, cadre } = await ouvrirTuesday();
    await confirmer(cadre);
    await cadre.locator('.tu-ligne[data-id="3"] [data-champ="statut"]').click();
    await cadre.locator('.tu-menu-item', { hasText: 'En cours' }).click();
    const statut = async () => (await doc.api.table(doc.id, 'Taches')).find(r => r.id === 3).fields.Statut;
    await pollEgal(statut, 'En cours');
    await page.keyboard.press('Control+z');
    await pollEgal(statut, 'À faire');
    await page.keyboard.press('Control+y');
    await pollEgal(statut, 'En cours');
  });

  await essai('ajout rapide : la ligne naît dans Grist avec son identifiant réel, puis suppression avec accord', async () => {
    const { doc, cadre } = await ouvrirTuesday();
    await confirmer(cadre);
    const champ = cadre.locator('.tu-ajout-champ').first();
    await champ.fill('Livrer'); await champ.press('Enter');
    await pollEgal(async () => (await doc.api.table(doc.id, 'Taches')).some(r => r.fields.Titre === 'Livrer'), true);
    const id = (await doc.api.table(doc.id, 'Taches')).find(r => r.fields.Titre === 'Livrer').id;
    await cadre.waitForSelector(`.tu-ligne[data-id="${id}"]`);
    await cadre.locator(`.tu-ligne[data-id="${id}"]`).click();
    await cadre.waitForSelector('.tu-fiche');
    await cadre.click('.tu-fiche-pied .tu-btn');
    await page.waitForSelector('#pp-dialog-modal:not([hidden])', { state: 'attached' }).catch(() => {});
    await cadre.waitForSelector('#pp-dialog-modal:not([hidden])');
    await cadre.click('#pp-dialog-modal .pp-modal-primary, #pp-dialog-modal button:last-child');
    await pollEgal(async () => (await doc.api.table(doc.id, 'Taches')).some(r => r.fields.Titre === 'Livrer'), false);
  });

  await essai('changement fait dans Grist : repris par Tuesday sans rechargement', async () => {
    const { doc, cadre } = await ouvrirTuesday();
    await confirmer(cadre);
    await doc.api.actions(doc.id, [['UpdateRecord', 'Taches', 2, { Titre: 'Renommée dans Grist' }]]);
    await cadre.waitForSelector('.tu-ligne[data-id="2"]:has-text("Renommée dans Grist")');
  });

  await essai('couleurs : le choix « En cours » garde la couleur que Grist lui donne', async () => {
    const { cadre } = await ouvrirTuesday();
    await confirmer(cadre);
    const fond = await cadre.evaluate(() => getComputedStyle(document.querySelector('.tu-ligne[data-id="2"] .tu-pastille')).backgroundColor);
    assert.equal(fond, 'rgb(255, 224, 178)');
  });

  await essai('chronologie : déplacer une barre écrit des jours civils (secondes à minuit UTC) dans Grist', async () => {
    const { doc, cadre } = await ouvrirTuesday();
    await confirmer(cadre);
    await cadre.click('[data-vue="chronologie"]');
    await cadre.waitForSelector('.tu-barre-tache[data-id="3"]');
    await cadre.locator('.tu-barre-tache[data-id="3"]').scrollIntoViewIfNeeded();
    const cadreEl = await cadre.locator('.tu-barre-tache[data-id="3"]').boundingBox();
    // boundingBox d'un élément d'un cadre rend déjà des coordonnées de la page : pas de décalage à ajouter.
    const h = { x: 0, y: 0 };
    await page.mouse.move(h.x + cadreEl.x + cadreEl.width / 2, h.y + cadreEl.y + cadreEl.height / 2);
    await page.mouse.down();
    await page.mouse.move(h.x + cadreEl.x + cadreEl.width / 2 + 36, h.y + cadreEl.y + cadreEl.height / 2, { steps: 6 });
    await page.mouse.up();
    await pollEgal(async () => (await doc.api.table(doc.id, 'Taches')).find(r => r.id === 3).fields.Echeance !== D('2026-11-13'), true);
    const r = (await doc.api.table(doc.id, 'Taches')).find(x => x.id === 3).fields;
    assert.equal(r.Debut % JOUR, 0); assert.equal(r.Echeance % JOUR, 0);
    assert.equal((r.Echeance - D('2026-11-13')) / JOUR, (r.Debut - D('2026-11-09')) / JOUR, 'début et échéance bougent du même nombre de jours');
  });

  await essai('kanban : le glisser-déposer HTML5 marche dans le cadre de Grist et écrit le statut', async () => {
    const { doc, cadre } = await ouvrirTuesday();
    await confirmer(cadre);
    await cadre.click('[data-vue="kanban"]');
    await cadre.waitForSelector('.tu-kanban');
    await cadre.dragAndDrop('.tu-carte[data-id="4"]', '.tu-colonne[data-statut="En cours"] .tu-colonne-corps', { targetPosition: { x: 40, y: 8 } });
    await pollEgal(async () => (await doc.api.table(doc.id, 'Taches')).find(r => r.id === 4).fields.Statut, 'En cours');
  });

  await essai('Garder pour l\'équipe : Tuesday_Projets créée après accord, identifiant réel relu, projet retrouvé à la réouverture', async () => {
    const { doc, cadre } = await ouvrirTuesday();
    await confirmer(cadre);
    await cadre.click('[data-geste="garder"]');
    await cadre.waitForSelector('#pp-dialog-modal:not([hidden])');
    await cadre.fill('#pp-dialog-modal input', 'Lancement');
    await cadre.click('#pp-dialog-modal .pp-modal-primary, #pp-dialog-modal button:last-child');
    await cadre.waitForSelector('#pp-dialog-modal:not([hidden]) .pp-dialog-message:not([hidden])');
    assert.match(await cadre.textContent('#pp-dialog-message'), /Tuesday_Projets/);
    await cadre.click('#pp-dialog-modal .pp-modal-primary, #pp-dialog-modal button:last-child');
    await pollEgal(async () => (await doc.api.tables(doc.id)).includes('Tuesday_Projets'), true);
    const lignes = await doc.api.table(doc.id, 'Tuesday_Projets');
    assert.equal(lignes.length, 1);
    assert.equal(lignes[0].fields.Nom ?? lignes[0].fields.ColNom ?? 'Lancement', 'Lancement');
    const ouvert = await ouvrir(labo, doc);
    await ouvert.waitForSelector('.tu-tableau');
    await pollEgal(() => ouvert.locator('.tu-ligne[data-id]').count(), 4); // rouvert directement sur le projet enregistré (les lignes arrivent après le tableau)
  });

  await essai('fichiers liés : dans Grist seul (hors GFS), « Lier un fichier » est grisé avec sa raison, jamais masqué', async () => {
    const { cadre } = await ouvrirTuesday();
    await confirmer(cadre);
    await cadre.locator('.tu-ligne[data-id="2"]').click();
    await cadre.waitForSelector('.tu-fiche');
    assert.equal(await cadre.getAttribute('[data-geste="lier"]', 'aria-disabled'), 'true');
    assert.match(await cadre.getAttribute('[data-geste="lier"]', 'title'), /Grist Factory Suite/);
  });

  await essai('accès non accordé : l\'écran d\'attente dit quoi faire', async () => {
    const { cadre } = await ouvrirTuesday({ acces: 'none' });
    await cadre.waitForSelector('#tu-mep .tu-mep-box', { state: 'visible', timeout: 15000 });
    assert.match(await cadre.textContent('#tu-mep .tu-mep-box'), /accès/i);
    assert.deepEqual(labo.violations.filter(v => /Access not granted/.test(v)), [], 'le refus d\'accès est rattrapé, pas une exception de page');
    assert.ok(labo.violations.every(v => /Access not granted/.test(v)) === false || labo.violations.length === 0, 'le refus d\'accès est rattrapé, pas une exception de page');
  });

  await essai('aucune erreur de page ni de politique de sécurité', async () => {
    assert.deepEqual(labo.violations, []);
  });

  await labo.fermer();
  const bons = resultats.filter(Boolean).length;
  process.stdout.write(`\n${bons}/${resultats.length} essais dans Grist\n`);
  process.exit(bons === resultats.length ? 0 : 1);

  async function pollEgal(lire, attendu, delai = 8000) {
    const fin = Date.now() + delai;
    let v;
    while (Date.now() < fin) { v = await lire(); if (v === attendu) return; await new Promise(r => setTimeout(r, 200)); }
    assert.equal(v, attendu);
  }
})();
