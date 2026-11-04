// L'écran : barre, vue active, fiche, messages (avec « Annuler »), raccourcis clavier. Chaque changement d'état redessine la vue en gardant le défilement et le champ actif ; un redessin demandé
// pendant un clic attend la fin du clic (sinon la cible disparaîtrait entre l'appui et le relâchement).
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { Theme } from '../../kit/js/theme.js';
import { Dialogs } from '../../kit/js/dialogs.js';
import { construireBarre } from './barre.js';
import { etiquettesFiltres } from './filtres.js';
import { vueTableau } from './tableau.js';
import { vueKanban } from './kanban.js';
import { vueChronologie } from './chronologie.js';
import { vueCalendrier } from './calendrier.js';
import { vueFiche } from './fiche.js';
import { bandeauGarder, bandeauMiseEnPlace } from './bandeaux.js';
import { monterMiseEnPlace } from './miseenplace.js';
import { ouvrirMenu, fermerMenu } from './menu.js';
import { icone } from './icones.js';
import { TABLE_LIENS, COLONNES_LIENS } from '../core/liens.js';
import { FILTRES_VIDES } from '../core/regroupement.js';
import { COLONNES_PROJETS, TABLE_PROJETS } from '../core/projet.js';
import { personnesPossibles } from './champs.js';
import { GfsLink } from '../../kit/js/gfs-link.js';

export const VERSION = '0.1.1';
const t = (cle, vars) => I18n.t(cle, vars);
const VUES = { tableau: vueTableau, kanban: vueKanban, chronologie: vueChronologie, calendrier: vueCalendrier };

export function texteMessage(m) {
  const base = m.texte ?? t(m.cle, m.vars);
  return m.libelle ? t(m.cle, { libelle: m.libelle }) : base;
}

function toast(app) {
  const m = app.message;
  if (!m) return null;
  return h('div', { class: `tu-etat est-${m.type}`, role: m.type === 'erreur' ? 'alert' : 'status', dataset: { message: m.id } },
    h('span', { class: 'tu-etat-texte' }, texteMessage(m), m.detail && m.type === 'erreur' ? h('small', null, ` (${m.detail})`) : null),
    m.annulable && app.historique.peutAnnuler ? h('button', { type: 'button', class: 'tu-btn tu-etat-annuler', dataset: { geste: 'annuler-toast' }, on: { click: () => app.annuler() } }, t('barre.annuler')) : null,
    h('button', { type: 'button', class: 'tu-btn tu-btn-icone', 'aria-label': t('fiche.fermer'), on: { click: () => { app.message = null; app.emettre('message'); } } }, icone('croix', 14)));
}

function corps(app, actions) {
  const vue = VUES[app.reglages.vue] ?? vueTableau;
  return h('main', { class: 'tu-vue', dataset: { vue: app.reglages.vue } }, vue(app, actions));
}

function sauverEtat(racine) {
  const defile = {};
  racine.querySelectorAll('[data-defile]').forEach(el => { defile[el.dataset.defile] = [el.scrollLeft, el.scrollTop]; });
  const a = document.activeElement;
  const focus = a && racine.contains(a) ? { cle: a.dataset?.ajout ?? a.dataset?.focus ?? null, debut: a.selectionStart ?? null, fin: a.selectionEnd ?? null, valeur: a.dataset?.ajout ? a.value : null } : null;
  return { defile, focus };
}

function rendreEtat(racine, { defile, focus: focusAvant }, pending) {
  let focus = focusAvant;
  racine.querySelectorAll('[data-defile]').forEach(el => { const v = defile[el.dataset.defile]; if (v) { el.scrollLeft = v[0]; el.scrollTop = v[1]; } });
  const cible = pending ?? focus?.cle;
  if (!cible) return;
  const el = [...racine.querySelectorAll('[data-ajout],[data-focus]')].find(x => (x.dataset.ajout ?? x.dataset.focus) === cible);
  if (!el) return;
  // Un rendu peut arriver entre deux frappes : le texte déjà tapé dans le champ d'ajout rapide passe au nouveau champ, il ne se perd pas.
  if (focus?.valeur && el.dataset.ajout === focus.cle && !el.value) { el.value = focus.valeur; focus = { ...focus, debut: focus.valeur.length, fin: focus.valeur.length }; }
  el.focus({ preventScroll: true });
  if (!pending && focus?.debut !== null && el.setSelectionRange) { try { el.setSelectionRange(focus.debut, focus.fin); } catch (e) { /* type de champ sans sélection */ } }
}

export function monter(racine, app) {
  let planifie = false;
  let appuye = false;
  let focusPending = null;
  const actions = {
    ouvrirFiche: id => { app.selection = id; app.emettre(); },
    fermerFiche: () => { app.selection = null; app.emettre(); },
    garderFocus: cle => { focusPending = cle; },
    basculerRepli: id => basculer(`${id}`),
    basculerGroupe: cle => basculer(`g:${cle}`),
    basculerReplie: cle => basculer(cle),
    effacerFiltres: () => app.regler({ filtres: { ...FILTRES_VIDES } }),
    versAujourdhui: () => { const g = racine.querySelector('.tu-ch-grille'); const d = racine.querySelector('.tu-ch-defile'); if (g && d) d.scrollLeft = Math.max(0, Number(g.dataset.auj) - 60); },
    nouvelleTache, supprimer, garder, menuProjet, lierFichier, ouvrirLien, retirerLien,
  };
  function basculer(cle) { const r = app.reglages.replies; app.regler({ replies: r.includes(cle) ? r.filter(x => x !== cle) : [...r, cle] }); }
  async function nouvelleTache(contexte = {}) {
    const valeurs = { titre: t('champ.nouvelle'), ...(app.mapping.statut ? { statut: app.premierStatut() } : {}), ...contexte };
    const id = await app.ajouter(valeurs, t('msg.ajoutee'));
    if (id) { app.selection = id; focusPending = 'fiche:titre'; app.emettre(); }
  }
  async function lierFichier(tacheId) {
    const choix = await app.liens.choisir(t('liens.choisir'));
    if (!choix) return;
    if (!app.liens.tableExiste && !(await Dialogs.confirm({ title: t('liens.accordTitre'), message: t('liens.accordMessage', { table: TABLE_LIENS, colonnes: COLONNES_LIENS.length }), confirmLabel: t('liens.creer') }))) return;
    await app.liens.lier(tacheId, choix, t('msg.lie'));
  }
  function ouvrirLien(lien) { return app.liens.ouvrir(lien); }
  function retirerLien(id) { return app.liens.retirer(id, t('msg.delie')); }
  async function supprimer(id) {
    const tache = app.tache(id);
    const ok = await Dialogs.confirm({ title: t('fiche.supprimerTitre', { nom: tache?.titre || t('champ.sansTitre') }), message: t('fiche.supprimerMessage'), confirmLabel: t('fiche.supprimer'), danger: true });
    if (ok) await app.supprimer(id, t('msg.supprimee'));
  }
  async function garder() {
    const nom = await Dialogs.prompt({ title: t('garder.titre'), label: t('garder.nom'), value: app.projet?.nom ?? app.source, confirmLabel: t('demarrage.suivant') });
    if (!nom?.trim()) return;
    const cree = app.modele.tables[TABLE_PROJETS] ? t('garder.ajout') : t('garder.creation', { table: TABLE_PROJETS, colonnes: COLONNES_PROJETS.length });
    if (await Dialogs.confirm({ title: t('demarrage.accordTitre'), message: cree, confirmLabel: t('garder.bouton') })) await app.enregistrerProjet(nom.trim());
  }
  function menuProjet(ancre) {
    const hebergee = GfsLink.hosted;
    const reconnue = app.moiReconnu !== null;
    const items = [
      ...(app.projets.length ? [{ titre: t('projet.projets') }, ...app.projets.map(p => ({ label: p.nom || p.source, valeur: ['projet', p], actif: p === app.projet || p.id === app.projet?.id }))] : []),
      { label: t('projet.autreTable'), valeur: ['tables'] },
      { separateur: true }, { titre: t('projet.jeSuis') }, ...personnesPossibles(app).slice(0, 30).map(p => ({ label: p.label, valeur: ['moi', p.id], actif: app.moi === p.id, grise: reconnue, raison: reconnue ? t('projet.reconnue') : null })),
      ...(app.reglages.moi !== null || reconnue ? [{ label: t('projet.personne'), valeur: ['moi', null], grise: reconnue, raison: reconnue ? t('projet.reconnue') : null }] : []),
      { separateur: true }, { titre: t('projet.apparence') },
      { label: 'Français', valeur: ['langue', 'fr'], actif: I18n.language === 'fr', grise: hebergee, raison: hebergee ? t('projet.langueGfs') : null },
      { label: 'English', valeur: ['langue', 'en'], actif: I18n.language === 'en', grise: hebergee, raison: hebergee ? t('projet.langueGfs') : null },
      { label: t('projet.clair'), valeur: ['theme', 'light'], actif: Theme.choice === 'light' }, { label: t('projet.sombre'), valeur: ['theme', 'dark'], actif: Theme.choice === 'dark' }, { label: t('projet.systeme'), valeur: ['theme', 'system'], actif: Theme.choice === 'system' },
      { separateur: true }, { label: t('projet.automatiser'), valeur: ['automatiser'], grise: true, raison: t('projet.automatiserRaison') },
      { label: t('projet.aPropos'), valeur: ['apropos'] },
    ];
    ouvrirMenu(ancre, items, async it => {
      const [type, v] = it.valeur;
      if (type === 'projet') await app.ouvrirProjet(v);
      else if (type === 'tables') app.demanderMiseEnPlace({ etape: 'table' });
      else if (type === 'moi') app.regler({ moi: v });
      else if (type === 'langue') { I18n.setLanguage(v); I18n.store(v); }
      else if (type === 'theme') { Theme.set(v); app.emettre(); }
      else if (type === 'apropos') await Dialogs.notice({ title: 'Tuesday', message: t('projet.version', { version: VERSION, mode: app.port.mode === 'demo' ? t('demo.titre') : 'Grist' }) });
    }, { large: true, etiquette: t('barre.projet') });
  }

  function rendre() {
    planifie = false;
    const etat = sauverEtat(racine);
    const enfants = [construireBarre(app, actions), etiquettesFiltres(app), bandeauMiseEnPlace(app), bandeauGarder(app, actions), corps(app, actions), vueFiche(app, actions), toast(app)];
    racine.replaceChildren(...enfants.filter(Boolean));
    racine.dataset.vue = app.reglages.vue;
    racine.classList.toggle('a-fiche', app.selection !== null && Boolean(app.tache(app.selection)));
    const pending = focusPending; focusPending = null;
    rendreEtat(racine, etat, pending);
    if (app.reglages.vue === 'chronologie' && app.chronoVu !== app.reglages.zoom) { app.chronoVu = app.reglages.zoom; actions.versAujourdhui(); }
    else if (app.reglages.vue !== 'chronologie') app.chronoVu = null;
    if (pending === 'fiche:titre') racine.querySelector('[data-focus="fiche:titre"]')?.select?.();
  }
  function planifier() {
    if (planifie) return;
    planifie = true;
    requestAnimationFrame(() => { if (appuye) { planifie = false; planifier.apres = true; return; } rendre(); });
  }
  racine.addEventListener('pointerdown', () => { appuye = true; });
  const relacher = () => { if (!appuye) return; appuye = false; setTimeout(() => { if (planifier.apres) { planifier.apres = false; planifier(); } }, 0); };
  document.addEventListener('pointerup', relacher);
  document.addEventListener('pointercancel', relacher);
  document.addEventListener('keydown', e => clavier(e, app, actions, racine));
  app.abonner(quoi => { if (quoi === 'message') { planifier(); armerToast(app); } else planifier(); });
  I18n.onChange(() => planifier());
  monterMiseEnPlace(app, { texteMessage });
  GfsLink.onBar(bar => poserBarre(racine, bar));
  poserBarre(racine, GfsLink.bar());
  rendre();
  return { rendre, actions };
}

// Ce que la barre de GFS recouvre : on écarte l'interface de ce bord, sans réserver de bande ailleurs.
export function poserBarre(racine, bar) {
  const bords = { gauche: '--bar-g', haut: '--bar-h', droite: '--bar-d', bas: '--bar-b' };
  for (const v of Object.values(bords)) racine.style.setProperty(v, '0px');
  if (bar && bords[bar.bord]) racine.style.setProperty(bords[bar.bord], `${bar.epaisseur + 8}px`);
}

let minuteur = null;
function armerToast(app) {
  clearTimeout(minuteur);
  const m = app.message;
  if (!m) return;
  minuteur = setTimeout(() => { if (app.message?.id === m.id) { app.message = null; app.emettre('message'); } }, m.type === 'erreur' ? 12000 : 6000);
}

function clavier(e, app, actions, racine) {
  const champ = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '') || document.activeElement?.isContentEditable;
  const mod = e.ctrlKey || e.metaKey;
  if (mod && !champ && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) { e.preventDefault(); app.annuler(); }
  else if (mod && !champ && (e.key === 'y' || e.key === 'Y' || ((e.key === 'z' || e.key === 'Z') && e.shiftKey))) { e.preventDefault(); app.retablir(); }
  else if (!mod && !champ && e.key === 'n') { e.preventDefault(); actions.nouvelleTache(); }
  else if (!mod && !champ && e.key === '/') { e.preventDefault(); racine.querySelector('.tu-recherche-champ')?.focus(); }
  else if (e.key === 'Escape' && !champ && app.selection !== null) { fermerMenu(); actions.fermerFiche(); }
}
