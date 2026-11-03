// Ce que montre la page livrée quand elle est ouverte hors de Grist : comment l'ouvrir. Rien d'autre n'est lancé (Tuesday ne tourne que dans Grist).
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { icone } from './icones.js';

const t = cle => I18n.t(cle);

export function ecranHorsGrist() {
  return h('div', { class: 'tu-demarrage' }, h('div', { class: 'tu-demarrage-carte' },
    h('h1', null, t('horsgrist.titre')), h('p', { class: 'tu-demarrage-sous' }, t('horsgrist.sous')),
    h('p', { class: 'tu-rassurance' }, icone('info', 14), t('horsgrist.etape'))));
}
