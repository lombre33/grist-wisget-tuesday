// Les bandeaux fins sous la barre : « Terminer la mise en place » tant que l'outil n'est pas relié, puis « Garder pour l'équipe ». Jamais bloquants, jamais masqués par un minuteur.
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { icone } from './icones.js';

const t = (cle, vars) => I18n.t(cle, vars);

// Après avoir fermé le pop-up sans le faire : un rappel discret, et le seul chemin pour le rouvrir sans écrire.
export function bandeauMiseEnPlace(app) {
  if (app.pret || app.lectureSeule || !app.initTermine || app.miseEnPlace.ouverte) return null;
  return h('div', { class: 'tu-bandeau', role: 'status', dataset: { bandeau: 'mise-en-place' } }, icone('info', 14), h('span', { class: 'tu-bandeau-texte' }, app.port.mode === 'demo' ? `${t('demo.titre')} · ${t('demo.explique')}` : t('mep.bandeau')),
    h('button', { type: 'button', class: 'tu-btn tu-btn-principal', dataset: { geste: 'mise-en-place' }, on: { click: () => app.demanderMiseEnPlace() } }, t('mep.bandeau.bouton')));
}

export function bandeauGarder(app, actions) {
  if (!app.pret || app.projet || app.lectureSeule || app.bandeauFerme) return null;
  return h('div', { class: 'tu-bandeau', role: 'status' }, icone('info', 14), h('span', { class: 'tu-bandeau-texte' }, app.port.mode === 'demo' ? `${t('demo.titre')} · ${t('demo.explique')}` : t('garder.texte')),
    h('button', { type: 'button', class: 'tu-btn tu-btn-principal', dataset: { geste: 'garder' }, on: { click: () => actions.garder() } }, t('garder.bouton')),
    h('button', { type: 'button', class: 'tu-btn', on: { click: () => { app.bandeauFerme = true; app.emettre(); } } }, t('garder.plusTard')));
}
