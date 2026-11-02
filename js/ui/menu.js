// Menu flottant ancré à un bouton : liste d'éléments (choix simple, cases à cocher, séparateurs), clavier (flèches, Entrée, Échap), fermeture au clic ailleurs. Un seul menu à la fois.
import { h } from '../../kit/js/dom.js';
import { Layers } from '../../kit/js/layers.js';

let ouvert = null;

export function fermerMenu() {
  if (!ouvert) return;
  const { el, retour, ecoute } = ouvert;
  ouvert = null;
  document.removeEventListener('pointerdown', ecoute, true);
  el.remove();
  retour?.focus?.();
}

function placer(el, ancre) {
  const r = ancre.getBoundingClientRect();
  const largeur = el.offsetWidth;
  const hauteur = el.offsetHeight;
  const gauche = Math.max(4, Math.min(r.left, window.innerWidth - largeur - 4));
  const bas = r.bottom + 4 + hauteur > window.innerHeight && r.top - 4 - hauteur > 0;
  el.style.setProperty('left', `${gauche}px`);
  el.style.setProperty('top', `${Math.max(4, bas ? r.top - 4 - hauteur : r.bottom + 4)}px`);
}

function ligne(item, choisir) {
  if (item.separateur) return h('div', { class: 'tu-menu-sep', role: 'separator' });
  if (item.titre) return h('div', { class: 'tu-menu-titre' }, item.titre);
  const role = item.coche !== undefined ? 'menuitemcheckbox' : 'menuitem';
  return h('button', {
    type: 'button', class: `tu-menu-item${item.actif ? ' est-actif' : ''}${item.danger ? ' est-danger' : ''}`, role, tabindex: '-1',
    'aria-checked': item.coche === undefined ? null : String(Boolean(item.coche)), 'aria-disabled': item.grise ? 'true' : null, title: item.raison ?? null,
    on: { click: () => (item.grise ? null : choisir(item)) },
  },
  item.coche === undefined ? null : h('span', { class: `tu-menu-case${item.coche ? ' est-coche' : ''}`, 'aria-hidden': 'true' }),
  item.pastille ? h('span', { class: 'tu-menu-pastille', vars: item.pastille }) : null,
  h('span', { class: 'tu-menu-texte' }, item.label),
  item.aide ? h('span', { class: 'tu-menu-aide' }, item.aide) : null);
}

// items (ou une fonction qui les rend, pour un menu de cases qui se redessine) : [{ label, valeur, coche?, actif?, grise?, raison?, danger?, pastille?, aide? } | { separateur: true } | { titre }]. onChoix(item) ; gardeOuvert : un menu de cases reste ouvert.
export function ouvrirMenu(ancre, items, onChoix, { gardeOuvert = false, large = false, etiquette = '' } = {}) {
  const dejaCeluiLa = ouvert?.ancre === ancre;
  fermerMenu();
  if (dejaCeluiLa) return;
  const liste = () => (typeof items === 'function' ? items() : items);
  const el = h('div', { class: `tu-menu${large ? ' est-large' : ''}`, role: 'menu', 'aria-label': etiquette || null });
  const remplir = () => el.replaceChildren(...liste().map(i => ligne(i, choisir)));
  function choisir(item) {
    onChoix(item);
    if (!gardeOuvert) { fermerMenu(); return; }
    const indice = [...el.querySelectorAll('[role^="menuitem"]')].indexOf(document.activeElement);
    remplir();
    el.querySelectorAll('[role^="menuitem"]')[Math.max(0, indice)]?.focus();
  }
  remplir();
  const ecoute = e => { if (!el.contains(e.target) && !ancre.contains(e.target)) fermerMenu(); };
  el.addEventListener('keydown', e => clavier(e, el));
  document.body.append(el);
  placer(el, ancre);
  Layers.raise(el);
  document.addEventListener('pointerdown', ecoute, true);
  ouvert = { el, ancre, retour: ancre, ecoute };
  const premier = el.querySelector('.est-actif') ?? el.querySelector('[role^="menuitem"]');
  premier?.focus();
}

function clavier(e, el) {
  const liste = [...el.querySelectorAll('[role^="menuitem"]')];
  const i = liste.indexOf(document.activeElement);
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fermerMenu(); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); liste[(i + 1) % liste.length]?.focus(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); liste[(i - 1 + liste.length) % liste.length]?.focus(); }
}

export const menuOuvert = () => ouvert !== null;
