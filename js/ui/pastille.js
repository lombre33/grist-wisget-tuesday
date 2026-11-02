// Petites pièces d'affichage : pastille de statut aux couleurs de Grist, avatar à initiales, repère de priorité, puce d'étiquette. Les couleurs du document passent par le CSSOM (variables),
// jamais par un attribut style ni une couleur écrite ici.
import { h } from '../../kit/js/dom.js';
import { initiales } from '../core/texte.js';

const sansCouleur = c => !c || c === 'null';

export function pastille(texte, { fond = null, couleur = null, inconnu = false, bouton = false, classe = '' } = {}, props = {}) {
  const vars = {};
  if (!sansCouleur(fond)) vars['--st-fond'] = fond;
  if (!sansCouleur(couleur)) vars['--st-texte'] = couleur;
  return h(bouton ? 'button' : 'span', { class: `tu-pastille${sansCouleur(fond) ? ' est-neutre' : ''}${inconnu ? ' est-inconnu' : ''} ${classe}`.trim(), type: bouton ? 'button' : null, vars, ...props }, h('span', { class: 'tu-pastille-texte' }, texte));
}

export function avatar(nom, taille = '') {
  return h('span', { class: `tu-avatar ${taille}`.trim(), title: nom, 'aria-label': nom }, initiales(nom));
}

export function avatars(responsables, max = 3) {
  if (!responsables.length) return h('span', { class: 'tu-vide' }, '—');
  const vus = responsables.slice(0, max);
  return h('span', { class: 'tu-avatars' }, vus.map(r => avatar(r.label)), responsables.length > max ? h('span', { class: 'tu-avatar est-reste' }, `+${responsables.length - max}`) : null);
}

export function priorite(texte, rang) {
  if (!texte) return h('span', { class: 'tu-vide' }, '—');
  return h('span', { class: `tu-prio est-rang-${Math.min(rang, 3)}` }, h('span', { class: 'tu-prio-point', 'aria-hidden': 'true' }), texte);
}

export const puce = texte => h('span', { class: 'tu-puce' }, texte);

export function barreAvancement(valeur) {
  if (valeur === null) return null;
  return h('span', { class: 'tu-avance', role: 'img', 'aria-label': `${Math.round(valeur * 100)} %`, title: `${Math.round(valeur * 100)} %` }, h('span', { class: 'tu-avance-rempli', vars: { '--p': `${Math.round(valeur * 100)}%` } }));
}
