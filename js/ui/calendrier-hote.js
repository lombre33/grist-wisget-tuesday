// L'hôte du module Calendrier (Calendar+). Tuesday ne contient pas le calendrier : il monte le module quand il existe et lui parle par le contrat de `docs/integration-suite.md`, 1
// (lignes en jours civils, rappels `onOuvrir`, `onDeplacer` qui rend une promesse, `onAjouter`, `onEtat`). Tant que le module n'existe pas, la grille provisoire de `calendrier.js` reste.
// Le module ne parle jamais à Grist : l'hôte écrit, et garde Annuler / Rétablir. Le chemin est celui de la voie A (module du kit) ; la voie B ne le changerait pas dans l'app.
import { I18n } from '../../kit/js/i18n.js';
import { entrees, roleDeplacement } from '../core/calendrier.js';
import { selection } from '../core/vue.js';
import { couleurTache } from './couleurs.js';

export const CHEMIN_MODULE = '../../kit/js/calendrier/index.js';
const t = (cle, vars) => I18n.t(cle, vars);

// Le module est facultatif : son absence ou une erreur à son chargement ne casse rien (retour à la grille provisoire). Il doit offrir `creerCalendrier(rappels)`.
export async function chargerModule(importer = chemin => import(chemin)) {
  try {
    const m = await importer(CHEMIN_MODULE);
    return typeof m?.creerCalendrier === 'function' ? m : null;
  } catch (e) { return null; }
}

export function rappels(app, actions) {
  return {
    onOuvrir: id => actions.ouvrirFiche(id),
    onDeplacer: async ({ id, debut, fin }) => {
      const tache = app.tache(id);
      const parRole = tache ? roleDeplacement(tache, debut, fin) : null;
      if (!parRole) throw new Error('rien à écrire');
      if (!(await app.modifier(id, parRole, t('msg.deplacee')))) throw new Error('refusé'); // le module remet l'événement à sa place
    },
    // Une saisie rapide du module donne le titre : la tâche naît sur le jour avec ce titre, sans ouvrir la fiche ; sans titre, la fiche s'ouvre. Toujours une promesse (le module attend l'écriture).
    onAjouter: async ({ debut, titre } = {}) => {
      const nom = typeof titre === 'string' ? titre.trim() : '';
      await actions.nouvelleTache({ echeance: String(debut).slice(0, 10), ...(nom ? { titre: nom } : {}) }, { fiche: !nom });
    },
    onEtat: etat => { app.calEtat = etat; },
  };
}

export function lignesModule(app) {
  const sel = selection(app.taches, app.arbre, app.reglagesVue);
  const liste = entrees(app.taches.filter(x => sel.passants.has(x.id)), { modifiable: !app.lectureSeule });
  return liste.map(e => {
    const tache = app.tache(e.id);
    const c = tache ? couleurTache(app, tache) : null;
    return { ...e, couleur: c?.fond ? { fond: c.fond, texte: c.texte ?? null } : null };
  });
}

export function optionsModule(app) {
  return { debutSemaine: 1, langue: I18n.language, lectureSeule: app.lectureSeule, jourCourant: app.calEtat?.jourCourant ?? app.aujourdhui, vue: app.calEtat?.vue ?? 'mois', maintenant: () => app.aujourdhui };
}

// Rend l'élément du module, ou null (module absent ou en erreur : la grille provisoire prend la place).
export function vueCalendrierModule(app, actions) {
  const module = app.moduleCalendrier;
  if (!module) return null;
  try {
    app.calInstance ??= module.creerCalendrier(rappels(app, actions));
    app.calInstance.definir({ lignes: lignesModule(app), options: optionsModule(app) });
    return app.calInstance.element;
  } catch (e) {
    app.moduleCalendrier = null; app.calInstance = null;
    return null;
  }
}
