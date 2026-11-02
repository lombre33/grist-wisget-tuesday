// Filtrer, trier, regrouper des tâches. Rien ne s'écrit : ce sont des choix d'affichage, mémorisés par projet. Les valeurs hors de la liste des choix restent visibles (grisées).
import { correspond } from './texte.js';

export const FILTRES_VIDES = Object.freeze({ recherche: '', statuts: [], responsables: [], priorites: [], retard: false, mesTaches: false });

export function filtresActifs(f) {
  return Boolean(f.recherche?.trim() || f.statuts?.length || f.responsables?.length || f.priorites?.length || f.retard || f.mesTaches);
}

// Renvoie l'ensemble des identifiants qui passent tous les filtres. `moi` : identifiant de responsable de la personne (ou null).
export function filtrer(taches, f = FILTRES_VIDES, moi = null) {
  const passants = new Set();
  for (const t of taches) {
    if (f.recherche && !correspond(f.recherche, [t.titre, t.description, t.statut, t.priorite, t.groupe, ...t.responsables.map(r => r.label), ...t.etiquettes])) continue;
    if (f.statuts?.length && !f.statuts.includes(t.statut)) continue;
    if (f.priorites?.length && !f.priorites.includes(t.priorite)) continue;
    if (f.responsables?.length && !t.responsables.some(r => f.responsables.includes(r.id))) continue;
    if (f.mesTaches && !(moi !== null && t.responsables.some(r => r.id === moi))) continue;
    if (f.retard && !t.enRetard) continue;
    passants.add(t.id);
  }
  return passants;
}

const rangPriorite = (t, priorites) => { const i = priorites.indexOf(t.priorite); return i < 0 ? Infinity : i; };

// Modes : 'manuel' (colonne Ordre, sinon l'ordre de la vue Grist), 'echeance', 'priorite'. Tri stable, sans date ou sans priorité en dernier.
export function trier(taches, mode = 'manuel', priorites = []) {
  const copie = [...taches];
  const sansNull = (a, b) => (a === null ? (b === null ? 0 : 1) : b === null ? -1 : a < b ? -1 : a > b ? 1 : 0);
  const base = (a, b) => a.pos - b.pos;
  if (mode === 'echeance') return copie.sort((a, b) => sansNull(a.finEff, b.finEff) || base(a, b));
  if (mode === 'priorite') return copie.sort((a, b) => rangPriorite(a, priorites) - rangPriorite(b, priorites) || sansNull(a.finEff, b.finEff) || base(a, b));
  return copie.sort((a, b) => sansNull(a.ordre, b.ordre) || base(a, b));
}

const couleurDe = (choix, valeur) => { const c = choix?.find(x => x.valeur === valeur); return c ? { fond: c.fond, texte: c.texte } : { fond: null, texte: null }; };

function groupesParChoix(taches, choix, valeurDe, { garderVides, sans }) {
  const groupes = choix.map(c => ({ cle: c.valeur, label: c.valeur, ...couleurDe(choix, c.valeur), inconnu: false, taches: [] }));
  const index = new Map(groupes.map(g => [g.cle, g]));
  const inconnus = [];
  const vide = { cle: '', label: sans, fond: null, texte: null, inconnu: false, taches: [], sans: true };
  for (const t of taches) {
    const v = valeurDe(t);
    if (!v) vide.taches.push(t);
    else if (index.has(v)) index.get(v).taches.push(t);
    else {
      let g = inconnus.find(x => x.cle === v);
      if (!g) { g = { cle: v, label: v, fond: null, texte: null, inconnu: true, taches: [] }; inconnus.push(g); }
      g.taches.push(t);
    }
  }
  const sortie = groupes.filter(g => garderVides || g.taches.length).concat(inconnus);
  if (vide.taches.length) sortie.push(vide);
  return sortie;
}

function groupesParPersonne(taches, sans) {
  const groupes = new Map();
  const vide = { cle: '', label: sans, fond: null, texte: null, inconnu: false, taches: [], sans: true };
  for (const t of taches) {
    if (!t.responsables.length) vide.taches.push(t);
    for (const r of t.responsables) {
      if (!groupes.has(r.id)) groupes.set(r.id, { cle: r.id, label: r.label, fond: null, texte: null, inconnu: false, taches: [] });
      groupes.get(r.id).taches.push(t);
    }
  }
  const sortie = [...groupes.values()].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  if (vide.taches.length) sortie.push(vide);
  return sortie;
}

// par : 'aucun' | 'statut' | 'responsable' | 'priorite' | 'groupe'. ctx : { choix: { statut, priorite, groupe }, sans: 'Sans statut' }.
export function grouper(taches, par, ctx = {}) {
  const sans = ctx.sans ?? '';
  if (par === 'statut') return groupesParChoix(taches, ctx.choix?.statut ?? [], t => t.statut, { garderVides: ctx.garderVides ?? false, sans });
  if (par === 'priorite') return groupesParChoix(taches, ctx.choix?.priorite ?? [], t => t.priorite, { garderVides: false, sans });
  if (par === 'groupe') {
    const choix = ctx.choix?.groupe ?? [];
    if (choix.length) return groupesParChoix(taches, choix, t => t.groupe, { garderVides: false, sans });
    const libres = [...new Set(taches.map(t => t.groupe).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')).map(v => ({ valeur: v, fond: null, texte: null }));
    return groupesParChoix(taches, libres, t => t.groupe, { garderVides: false, sans });
  }
  if (par === 'responsable') return groupesParPersonne(taches, sans);
  return [{ cle: '', label: '', fond: null, texte: null, inconnu: false, taches: [...taches] }];
}
