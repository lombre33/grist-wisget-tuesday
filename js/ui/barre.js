// La barre du haut : projet, vues, recherche, filtres, affichage, annuler / rétablir, nouvelle tâche. Au plus sept contrôles visibles ; ce qui manque est grisé avec sa raison, jamais masqué.
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { icone } from './icones.js';
import { ouvrirMenu } from './menu.js';
import { raisonGrise } from '../core/mapping.js';
import { filtresActifs } from '../core/regroupement.js';
import { VUES, REGROUPEMENTS, TRIS, COLORIER } from '../core/reglages.js';
import { menuFiltres } from './filtres.js';

const t = (cle, vars) => I18n.t(cle, vars);

function onglets(app) {
  return h('div', { class: 'tu-seg', role: 'tablist', 'aria-label': t('barre.vues') }, VUES.map(vue => {
    const raison = raisonGrise(vue, app.mapping);
    const actif = app.reglages.vue === vue;
    return h('button', {
      type: 'button', role: 'tab', class: `tu-onglet${actif ? ' est-actif' : ''}${raison ? ' est-grise' : ''}`, 'aria-selected': String(actif), 'aria-disabled': raison ? 'true' : null,
      title: raison ? t(raison) : t(`vue.${vue}`), dataset: { vue },
      on: { click: () => (raison ? app.notifier({ cle: raison, type: 'info' }) : app.regler({ vue })) },
    }, icone(vue), h('span', { class: 'tu-onglet-texte' }, t(`vue.${vue}`)));
  }));
}

function boutonProjet(app, actions) {
  const nom = app.estApercu ? t('mep.apercu') : app.projet?.nom || app.source;
  return h('button', { type: 'button', class: 'tu-btn tu-projet', 'aria-haspopup': 'menu', title: t('barre.projet'), on: { click: e => actions.menuProjet(e.currentTarget) } },
    h('span', { class: 'tu-projet-nom' }, nom), icone('bas', 14));
}

function boutonFiltres(app) {
  const n = ['statuts', 'responsables', 'priorites'].reduce((s, k) => s + app.reglages.filtres[k].length, 0) + (app.reglages.filtres.retard ? 1 : 0) + (app.reglages.filtres.mesTaches ? 1 : 0);
  return h('button', { type: 'button', class: `tu-btn${n ? ' est-actif' : ''}`, 'aria-haspopup': 'menu', title: t('barre.filtres'), on: { click: e => menuFiltres(e.currentTarget, app) } },
    icone('filtre'), h('span', { class: 'tu-btn-texte' }, t('barre.filtres')), n ? h('span', { class: 'tu-compte' }, String(n)) : null);
}

// Un choix dont le rôle n'est pas relié reste dans le menu, grisé avec sa raison (charte : grisé, jamais masqué).
function itemsAffichage(app) {
  const r = app.reglages;
  const role = (cle, v) => (v === 'aucun' || v === 'manuel' ? true : cle === 'tri' && v === 'echeance' ? Boolean(app.mapping.echeance || app.mapping.debut) : Boolean(app.mapping[v]));
  const groupe = (titre, liste, cle) => [{ titre }, ...liste.map(v => {
    const ok = role(cle, v);
    return { label: t(`${cle}.${v}`), valeur: [cle, v], actif: r[cle] === v, coche: r[cle] === v, grise: !ok, raison: ok ? null : t('raison.relier', { role: t(`role.${v === 'echeance' ? 'echeance' : v}`) }) };
  })];
  return [...groupe(t('affichage.regrouper'), REGROUPEMENTS, 'regroupement'), { separateur: true }, ...groupe(t('affichage.trier'), TRIS, 'tri'), { separateur: true }, ...groupe(t('affichage.colorier'), COLORIER, 'colorier')];
}

function boutonAffichage(app) {
  return h('button', { type: 'button', class: 'tu-btn', 'aria-haspopup': 'menu', title: t('barre.affichage'), on: { click: e => ouvrirMenu(e.currentTarget, () => itemsAffichage(app), it => it.valeur && app.regler({ [it.valeur[0]]: it.valeur[1] }), { gardeOuvert: true, etiquette: t('barre.affichage') }) } },
    icone('reglages'), h('span', { class: 'tu-btn-texte' }, t('barre.affichage')));
}

function annulerRetablir(app) {
  const bouton = (nom, ok, titre, fn) => h('button', { type: 'button', class: 'tu-btn tu-btn-icone', 'aria-disabled': ok ? null : 'true', title: titre, 'aria-label': titre, dataset: { geste: nom }, on: { click: () => (ok ? fn() : null) } }, icone(nom));
  return h('div', { class: 'tu-seg tu-annuler' },
    bouton('annuler', app.historique.peutAnnuler, `${t('barre.annuler')} (Ctrl+Z)${app.historique.libelleAnnuler ? ` : ${app.historique.libelleAnnuler}` : ''}`, () => app.annuler()),
    bouton('retablir', app.historique.peutRetablir, `${t('barre.retablir')} (Ctrl+Y)`, () => app.retablir()));
}

function recherche(app) {
  const champ = h('input', { class: 'tu-recherche-champ', type: 'search', value: app.reglages.filtres.recherche, placeholder: t('barre.rechercher'), 'aria-label': t('barre.rechercher'), autocomplete: 'off', spellcheck: 'false',
    on: { input: e => app.regler({ filtres: { ...app.reglages.filtres, recherche: e.target.value } }) } });
  champ.value = app.reglages.filtres.recherche;
  return h('label', { class: `tu-recherche${app.reglages.filtres.recherche ? ' est-remplie' : ''}` }, icone('recherche'), champ);
}

export function construireBarre(app, actions) {
  const ecriture = app.lectureSeule;
  return h('header', { class: 'tu-barre' },
    boutonProjet(app, actions), onglets(app), h('span', { class: 'tu-espace' }),
    recherche(app), boutonFiltres(app), boutonAffichage(app), annulerRetablir(app),
    h('button', { type: 'button', class: 'tu-btn tu-btn-principal', 'aria-disabled': ecriture ? 'true' : null, title: ecriture ? t('refus.lectureSeule') : t('barre.nouvelle'), dataset: { geste: 'nouvelle' }, on: { click: () => actions.nouvelleTache() } },
      icone('plus'), h('span', { class: 'tu-btn-texte' }, t('barre.nouvelle'))));
}

export const barreFiltresActifs = app => filtresActifs(app.reglages.filtres);
