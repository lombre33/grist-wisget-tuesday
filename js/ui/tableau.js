// Vue Tableau : des groupes repliables, des lignes (case, titre, statut, responsables, échéance, priorité), sous-tâches repliables, ajout rapide en bas de chaque groupe.
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { icone } from './icones.js';
import { pastille, barreAvancement } from './pastille.js';
import { caseTermine, celluleStatut, celluleResponsables, celluleDate, cellulePriorite } from './champs.js';
import { lignesTableau } from '../core/vue.js';

const t = (cle, vars) => I18n.t(cle, vars);

function colonnesVisibles(app) {
  const m = app.mapping;
  return { statut: Boolean(m.statut), responsable: Boolean(m.responsable), echeance: Boolean(m.echeance || m.debut), priorite: Boolean(m.priorite), avancement: Boolean(m.avancement) };
}

function entete(cols) {
  const c = (cle, texte, classe = '') => h('div', { class: `tu-th ${classe}`.trim(), role: 'columnheader' }, texte);
  return h('div', { class: 'tu-ligne tu-entete', role: 'row' },
    c('case', '', 'tu-col-case'), c('titre', t('role.titre'), 'tu-col-titre'),
    cols.statut ? c('statut', t('role.statut'), 'tu-col-statut') : null, cols.responsable ? c('responsable', t('role.responsable'), 'tu-col-resp') : null,
    cols.echeance ? c('echeance', t('role.echeance'), 'tu-col-date') : null, cols.priorite ? c('priorite', t('role.priorite'), 'tu-col-prio') : null, cols.avancement ? c('avancement', '', 'tu-col-avance') : null);
}

function titreCellule(app, ligne, actions) {
  const { tache } = ligne;
  const twist = ligne.total > 0
    ? h('button', { type: 'button', class: `tu-twist${ligne.replie ? '' : ' est-ouvert'}`, 'aria-expanded': String(!ligne.replie), 'aria-label': ligne.replie ? t('champ.deplier') : t('champ.replier'),
      on: { click: e => { e.stopPropagation(); actions.basculerRepli(tache.id); } } }, icone('droite', 12))
    : h('span', { class: 'tu-twist-vide' });
  const sous = ligne.total ? h('span', { class: 'tu-sous', title: t('champ.sousTaches', { n: ligne.total }) }, `${ligne.faites}/${ligne.total}`) : null;
  const bloquee = tache.bloqueePar.length ? h('span', { class: 'tu-bloquee', title: t('champ.bloqueePar', { noms: tache.bloqueePar.map(id => app.tache(id)?.titre ?? id).join(', ') }) }, icone('cadenas', 12), t('champ.bloquee')) : null;
  return h('div', { class: 'tu-cell tu-col-titre', role: 'gridcell', vars: { '--niveau': ligne.profondeur } },
    twist, h('span', { class: `tu-titre${tache.termine ? ' est-termine' : ''}${tache.titre ? '' : ' est-vide'}` }, tache.titre || t('champ.sansTitre')), sous, bloquee);
}

function ligneTache(app, ligne, cols, actions) {
  const { tache } = ligne;
  return h('div', {
    class: `tu-ligne${app.selection === tache.id ? ' est-selectionnee' : ''}${ligne.contexte ? ' est-contexte' : ''}${ligne.profondeur ? ' est-sous' : ''}`, role: 'row', tabindex: '0', dataset: { id: tache.id },
    on: { click: () => actions.ouvrirFiche(tache.id), keydown: e => { if (e.key === 'Enter' && e.target === e.currentTarget) actions.ouvrirFiche(tache.id); } },
  },
  h('div', { class: 'tu-cell tu-col-case', role: 'gridcell' }, caseTermine(app, tache)),
  titreCellule(app, ligne, actions),
  cols.statut ? h('div', { class: 'tu-cell tu-col-statut', role: 'gridcell' }, celluleStatut(app, tache)) : null,
  cols.responsable ? h('div', { class: 'tu-cell tu-col-resp', role: 'gridcell' }, celluleResponsables(app, tache)) : null,
  cols.echeance ? h('div', { class: 'tu-cell tu-col-date', role: 'gridcell' }, celluleDate(app, tache, app.mapping.echeance ? 'echeance' : 'debut')) : null,
  cols.priorite ? h('div', { class: 'tu-cell tu-col-prio', role: 'gridcell' }, cellulePriorite(app, tache)) : null,
  cols.avancement ? h('div', { class: 'tu-cell tu-col-avance', role: 'gridcell' }, barreAvancement(tache.avancement)) : null);
}

// Le contexte qu'une tâche ajoutée dans ce groupe reçoit : le statut, la priorité, le responsable ou le groupe de la section.
function contexteGroupe(app, groupe) {
  const par = app.reglages.regroupement;
  if (groupe.sans || par === 'aucun' || groupe.cle === undefined) return {};
  if (par === 'statut' || par === 'priorite' || (par === 'groupe' && app.colonne('groupe') && app.colonne('groupe').type === 'Choice')) return { [par]: groupe.cle };
  if (par === 'responsable') return { responsable: app.colonne('responsable')?.type.startsWith('RefList') ? [groupe.cle] : groupe.cle };
  return {};
}

function ajoutRapide(app, groupe, actions) {
  const cle = `ajout:${groupe.cle ?? ''}`;
  const champ = h('input', { class: 'tu-ajout-champ', type: 'text', placeholder: t('champ.ajouter'), 'aria-label': t('champ.ajouter'), autocomplete: 'off', dataset: { ajout: cle },
    on: {
      keydown: async e => {
        if (e.key !== 'Enter' || !e.target.value.trim()) return;
        const titre = e.target.value.trim();
        e.target.value = '';
        actions.garderFocus(cle);
        await app.ajouter({ titre, ...contexteGroupe(app, groupe) }, t('msg.ajoutee'));
      },
      focus: () => { app.enSaisie = () => true; }, blur: () => { app.enSaisie = null; if (app.enAttente) app.rafraichir(); },
    } });
  return h('div', { class: 'tu-ligne tu-ligne-ajout', role: 'row' }, h('div', { class: 'tu-cell tu-col-case', role: 'gridcell' }, icone('plus', 14)), h('div', { class: 'tu-cell tu-col-titre', role: 'gridcell' }, champ));
}

function enteteGroupe(app, groupe, actions) {
  const ferme = app.reglages.replies.includes(`g:${groupe.cle}`);
  const neutre = groupe.sans || !groupe.label;
  return h('button', { type: 'button', class: 'tu-groupe-entete', 'aria-expanded': String(!ferme), on: { click: () => actions.basculerGroupe(groupe.cle) } },
    h('span', { class: `tu-twist${ferme ? '' : ' est-ouvert'}` }, icone('droite', 12)),
    neutre ? h('span', { class: 'tu-groupe-nom' }, groupe.label || t('groupe.toutes')) : pastille(groupe.label, { fond: groupe.fond, couleur: groupe.texte, inconnu: groupe.inconnu }),
    h('span', { class: 'tu-groupe-compte' }, String(groupe.nombre)));
}

function vide(app, actions) {
  const filtre = app.taches.length > 0;
  return h('div', { class: 'tu-vide-ecran' }, h('p', null, filtre ? t('vide.filtres') : t('vide.taches')),
    filtre ? h('button', { type: 'button', class: 'tu-btn', on: { click: () => actions.effacerFiltres() } }, t('filtre.effacer')) : h('button', { type: 'button', class: 'tu-btn tu-btn-principal', on: { click: () => actions.nouvelleTache() } }, icone('plus'), t('barre.nouvelle')));
}

export function vueTableau(app, actions) {
  const cols = colonnesVisibles(app);
  const groupes = lignesTableau({ taches: app.taches, arbre: app.arbre, reglages: app.reglagesVue, choix: { statut: app.choix('statut'), priorite: app.choix('priorite'), groupe: app.choix('groupe') }, sans: { statut: t('statut.sans'), priorite: t('priorite.sans'), responsable: t('responsable.sans'), groupe: t('groupe.sans') } });
  const total = groupes.reduce((n, g) => n + g.lignes.length, 0);
  const corps = [];
  const entete1 = entete(cols);
  for (const g of groupes) {
    const ferme = app.reglages.replies.includes(`g:${g.cle}`);
    if (app.reglages.regroupement !== 'aucun') corps.push(enteteGroupe(app, g, actions));
    if (!ferme) { corps.push(...g.lignes.map(l => ligneTache(app, l, cols, actions))); if (!app.lectureSeule) corps.push(ajoutRapide(app, g, actions)); }
  }
  if (!groupes.length && !app.lectureSeule) corps.push(ajoutRapide(app, { cle: '' }, actions));
  return h('div', { class: 'tu-tableau', dataset: { defile: 'tableau' }, role: 'grid', 'aria-label': t('vue.tableau'), 'aria-rowcount': String(total) }, entete1, total === 0 ? vide(app, actions) : null, corps);
}
