// Les schémas du pop-up de mise en place : de petites figures dessinées avec le DOM et les jetons du kit, qui montrent où cliquer dans Grist et ce que Tuesday va faire. Ce sont des schémas,
// pas des captures : ils le disent (légende), et une vraie capture de Grist les remplacera quand elle existera (voir docs/onboarding.md, 6).
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { icone } from './icones.js';
import { STATUTS_DEPART } from '../core/modele-depart.js';

const t = (cle, vars) => I18n.t(cle, vars);
const barre = (classe = '') => h('span', { class: `tu-fig-barre ${classe}` });
const repere = n => h('span', { class: 'tu-fig-repere', 'aria-hidden': 'true' }, String(n));

// Le panneau de droite de Grist : « Niveau d'accès » avec « Accès complet », puis « Accepter ». Les repères 1 et 2 suivent les deux consignes du texte.
function figureAcces() {
  return h('div', { class: 'tu-fig-panneau' },
    h('div', { class: 'tu-fig-ligne' }, h('span', { class: 'tu-fig-nom' }, t('fig.acces.widget')), barre('est-court')),
    h('div', { class: 'tu-fig-champ' }, h('span', { class: 'tu-fig-etiquette' }, t('fig.acces.niveau')),
      h('div', { class: 'tu-fig-liste est-vise' }, repere(1), h('span', null, t('fig.acces.complet')), icone('bas', 12))),
    h('div', { class: 'tu-fig-ligne est-droite' }, h('span', { class: 'tu-fig-bouton est-vise' }, repere(2), t('fig.acces.accepter'))));
}

// Une table de tâches : ce que Tuesday utilisera ou créera (titre, statut, échéance), trois lignes en grisé.
function figureTable() {
  const ligne = (long, statut) => h('div', { class: 'tu-fig-rangee' }, barre(long), h('span', { class: `tu-fig-pastille est-${statut}` }), barre('est-court'));
  return h('div', { class: 'tu-fig-grille' },
    h('div', { class: 'tu-fig-rangee est-tete' }, h('span', null, t('role.titre')), h('span', null, t('role.statut')), h('span', null, t('role.echeance'))),
    ligne('est-long', 'fait'), ligne('', 'cours'), ligne('est-long', 'afaire'),
    h('p', { class: 'tu-fig-note' }, t('fig.table.statuts', { n: STATUTS_DEPART.length })));
}

// La correspondance : les colonnes de la personne à gauche, leur rôle dans Tuesday à droite.
function figureColonnes() {
  const paire = (colonne, role) => h('div', { class: 'tu-fig-paire' }, h('span', { class: 'tu-fig-chip' }, colonne), icone('droite', 12), h('span', { class: 'tu-fig-chip est-role' }, role));
  return h('div', { class: 'tu-fig-liens' },
    h('div', { class: 'tu-fig-entete' }, h('span', null, t('fig.colonnes.vos')), h('span', null, t('fig.colonnes.tuesday'))),
    paire('A', t('role.titre')), paire('B', t('role.statut')), paire('C', t('role.echeance')));
}

const FIGURES = { acces: figureAcces, table: figureTable, colonnes: figureColonnes };

export function figure(etape) {
  return h('figure', { class: `tu-fig est-${etape}` }, FIGURES[etape](), h('figcaption', null, t('fig.legende')));
}
