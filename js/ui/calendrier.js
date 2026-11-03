// Vue Calendrier (grille du mois). Provisoire : elle respecte le contrat du module Calendrier (core/calendrier.js : des entrées en jours civils, `ouvrir`, `ajouter`, `deplacer`) pour être
// remplacée par le module de Calendrier+ sans toucher au reste. L'hôte (Tuesday) écrit dans Grist et garde l'annuler / rétablir.
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { icone } from './icones.js';
import { couleurTache } from './couleurs.js';
import { entrees, grille, deplacee, roleDeplacement } from '../core/calendrier.js';
import { vueCalendrierModule } from './calendrier-hote.js';
import { selection } from '../core/vue.js';
import { debutMois, ajouterMois, etiquette, ajouterJours } from '../core/dates.js';

const t = (cle, vars) => I18n.t(cle, vars);
let glissee = null;

function puceTache(app, entree, actions) {
  const tache = app.tache(entree.id);
  const c = tache ? couleurTache(app, tache) : null;
  // Pas un <button> : sous Firefox avant la 147, un bouton `draggable` ne démarre pas de glissement (consigne 007 de GFS). Un div à rôle et à tabindex, comme la carte du kanban.
  return h('div', {
    role: 'button', tabindex: '0', class: `tu-cal-puce${tache?.termine ? ' est-terminee' : ''}${tache?.enRetard ? ' est-retard' : ''}`, draggable: entree.modifiable ? 'true' : null, vars: c?.fond ? { '--c-fond': c.fond } : {}, title: entree.titre, dataset: { id: entree.id },
    on: { click: e => { e.stopPropagation(); actions.ouvrirFiche(entree.id); }, keydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); actions.ouvrirFiche(entree.id); } }, dragstart: e => { glissee = entree; e.dataTransfer?.setData('text/plain', String(entree.id)); }, dragend: () => { glissee = null; } },
  }, entree.titre || t('champ.sansTitre'));
}

async function deposerSur(app, jour) {
  const entree = glissee;
  glissee = null;
  if (!entree) return;
  const tache = app.tache(entree.id);
  if (!tache) return;
  const { debut, fin } = deplacee(entree, jour);
  const parRole = roleDeplacement(tache, debut, fin);
  if (parRole) await app.modifier(entree.id, parRole, t('msg.deplacee'));
}

function cellule(app, jour, liste, mois, actions) {
  const hors = jour.slice(0, 7) !== mois.slice(0, 7);
  const auj = jour === app.aujourdhui;
  const el = h('div', { class: `tu-cal-jour${hors ? ' est-hors' : ''}${auj ? ' est-auj' : ''}`, role: 'gridcell', dataset: { jour },
    on: { dragover: e => { if (glissee) { e.preventDefault(); el.classList.add('est-cible'); } }, dragleave: () => el.classList.remove('est-cible'), drop: e => { e.preventDefault(); el.classList.remove('est-cible'); deposerSur(app, jour); } } },
  h('div', { class: 'tu-cal-tete' }, h('span', { class: 'tu-cal-numero' }, String(Number(jour.slice(8)))),
    app.lectureSeule ? null : h('button', { type: 'button', class: 'tu-cal-ajout', 'aria-label': t('cal.ajouterLe', { jour: etiquette(jour, I18n.language) }), title: t('cal.ajouterLe', { jour: etiquette(jour, I18n.language) }), on: { click: e => { e.stopPropagation(); actions.nouvelleTache({ echeance: jour }); } } }, icone('plus', 12))),
  h('div', { class: 'tu-cal-liste' }, liste.slice(0, 3).map(e => puceTache(app, e, actions)), liste.length > 3 ? h('span', { class: 'tu-cal-reste' }, t('cal.autres', { n: liste.length - 3 })) : null));
  return el;
}

export function vueCalendrier(app, actions) {
  const duModule = vueCalendrierModule(app, actions);
  if (duModule) return duModule;
  const mois = app.calMois ?? debutMois(app.aujourdhui);
  const sel = selection(app.taches, app.arbre, app.reglages);
  const liste = entrees(app.taches.filter(x => sel.passants.has(x.id)), { modifiable: !app.lectureSeule });
  const semaines = grille(liste, mois);
  const nav = d => { app.calMois = ajouterMois(mois, d); app.emettre(); };
  const titre = etiquette(mois, I18n.language, { month: 'long', year: 'numeric' });
  const noms = Array.from({ length: 7 }, (_, i) => etiquette(ajouterJours('2026-11-02', i), I18n.language, { weekday: 'short' }));
  return h('div', { class: 'tu-cal' },
    h('div', { class: 'tu-chrono-tete' },
      h('div', { class: 'tu-seg' }, h('button', { type: 'button', class: 'tu-btn tu-btn-icone', 'aria-label': t('cal.precedent'), title: t('cal.precedent'), on: { click: () => nav(-1) } }, icone('gauche')), h('button', { type: 'button', class: 'tu-btn tu-btn-icone', 'aria-label': t('cal.suivant'), title: t('cal.suivant'), on: { click: () => nav(1) } }, icone('droite'))),
      h('strong', { class: 'tu-cal-titre', 'aria-live': 'polite' }, titre),
      h('button', { type: 'button', class: 'tu-btn', on: { click: () => { app.calMois = debutMois(app.aujourdhui); app.emettre(); } } }, t('chrono.aujourdhui'))),
    h('div', { class: 'tu-cal-grille', dataset: { defile: 'cal' }, role: 'grid', 'aria-label': titre },
      h('div', { class: 'tu-cal-semaine tu-cal-noms', role: 'row' }, noms.map(n => h('div', { class: 'tu-cal-nom', role: 'columnheader' }, n))),
      semaines.map(s => h('div', { class: 'tu-cal-semaine', role: 'row' }, s.map(c => cellule(app, c.jour, c.entrees, mois, actions))))));
}

