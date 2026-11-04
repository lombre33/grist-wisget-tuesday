// Vue Calendrier : le calendrier est un module du kit (kit/js/calendrier/, consigne 011) que l'hôte (calendrier-hote.js) monte et alimente ; ici, seulement la place qu'il prend dans la page.
// Si le module ne se charge pas, la vue le dit avec sa raison (grisée, jamais masquée) et le reste de Tuesday marche.
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { vueCalendrierModule } from './calendrier-hote.js';

const t = (cle, vars) => I18n.t(cle, vars);

export function vueCalendrier(app, actions) {
  const element = vueCalendrierModule(app, actions);
  if (element) return h('div', { class: 'tu-cal' }, element);
  return h('div', { class: 'tu-cal tu-cal-indisponible', role: 'status' }, h('p', { class: 'tu-vide' }, t('cal.indisponible')));
}
