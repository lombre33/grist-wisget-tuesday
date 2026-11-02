// Ce que les vues montrent : filtres, tri et regroupement appliqués aux tâches, sous-tâches rangées sous leur tâche, ancêtres gardés pour le contexte d'une sous-tâche trouvée.
import { filtrer, filtresActifs, trier, grouper } from './regroupement.js';
import { avecAncetres, compteSousTaches } from './taches.js';

// { passants, visibles, actif } : `visibles` ajoute les ancêtres des tâches trouvées (affichés grisés, `contexte`).
export function selection(taches, arbre, reglages, moi = null) {
  const actif = filtresActifs(reglages.filtres);
  const passants = actif ? filtrer(taches, reglages.filtres, moi ?? reglages.moi) : new Set(taches.map(t => t.id));
  return { passants, visibles: actif ? avecAncetres(arbre, passants) : passants, actif };
}

function aplatir(tache, arbre, sel, reglages, priorites, profondeur, sortie) {
  const enfants = trier((arbre.enfants.get(tache.id) ?? []).filter(e => sel.visibles.has(e.id)), reglages.tri, priorites);
  const { total, faites } = compteSousTaches(arbre, tache.id);
  const replie = reglages.replies.includes(String(tache.id));
  sortie.push({ tache, profondeur, enfants: enfants.length, total, faites, replie, contexte: !sel.passants.has(tache.id) });
  if (!replie) for (const e of enfants) aplatir(e, arbre, sel, reglages, priorites, profondeur + 1, sortie);
}

// Lignes du tableau : des groupes, chacun avec ses lignes (tâche + sous-tâches visibles). Le regroupement porte sur les tâches racines.
export function lignesTableau({ taches, arbre, reglages, choix, sans = {}, moi = null }) {
  const sel = selection(taches, arbre, reglages, moi);
  const priorites = (choix.priorite ?? []).map(c => c.valeur);
  const racines = trier(arbre.racines.filter(t => sel.visibles.has(t.id)), reglages.tri, priorites);
  const groupes = grouper(racines, reglages.regroupement, { choix, sans: sans[reglages.regroupement] ?? '' });
  return groupes.map(g => {
    const lignes = [];
    for (const t of g.taches) aplatir(t, arbre, sel, reglages, priorites, 0, lignes);
    return { ...g, taches: undefined, lignes, nombre: g.taches.length };
  });
}

// Cartes du kanban et couloirs : à plat (sous-tâches comprises), seules les tâches qui passent les filtres.
export function colonnesKanban({ taches, reglages, choix, sans = '' }) {
  const sel = { passants: reglages.filtres ? filtrer(taches, reglages.filtres, reglages.moi) : new Set(taches.map(t => t.id)) };
  const visibles = filtresActifs(reglages.filtres) ? taches.filter(t => sel.passants.has(t.id)) : taches;
  const triees = trier(visibles, reglages.tri, (choix.priorite ?? []).map(c => c.valeur));
  return grouper(triees, 'statut', { choix, sans, garderVides: true });
}
