// Les choix de la personne pour un projet (vue, regroupement, tri, zoom, filtres) : une clé par document et projet, lecture tolérante, inconnu préservé. Rien n'est écrit dans le document.
import { FILTRES_VIDES } from './regroupement.js';

export const VUES = ['tableau', 'kanban', 'chronologie', 'calendrier'];
export const REGROUPEMENTS = ['aucun', 'statut', 'responsable', 'priorite', 'groupe'];
export const TRIS = ['manuel', 'echeance', 'priorite'];
export const COLORIER = ['statut', 'priorite', 'groupe', 'responsable'];
export const ZOOMS = ['semaine', 'mois', 'trimestre', 'annee'];

export const PAR_DEFAUT = Object.freeze({ vue: 'tableau', regroupement: 'aucun', tri: 'manuel', zoom: 'mois', colorier: 'statut', replies: [], filtres: FILTRES_VIDES, moi: null });

function condenser(texte) {
  let h = 5381;
  for (const c of texte) h = ((h * 33) ^ c.codePointAt(0)) >>> 0;
  return h.toString(36);
}

// Clé de stockage : lettres, chiffres et « _ . : - », 64 signes au plus.
export function cle(document, projet) {
  const brut = `tuesday.${document ?? 'seul'}.${projet ?? 'projet'}`.replace(/[^A-Za-z0-9_.:-]/g, '_');
  return brut.length <= 64 ? brut : `tuesday.${condenser(String(document))}.${condenser(String(projet))}`;
}

const dans = (liste, valeur, defaut) => (liste.includes(valeur) ? valeur : defaut);
const textes = valeur => (Array.isArray(valeur) ? valeur.filter(v => typeof v === 'string') : []);
const nombres = valeur => (Array.isArray(valeur) ? valeur.filter(v => typeof v === 'number' || typeof v === 'string') : []);

export function lire(texte) {
  let brut = {};
  try { const v = JSON.parse(texte); if (v && typeof v === 'object' && !Array.isArray(v)) brut = v; } catch (e) { brut = {}; }
  const f = brut.filtres && typeof brut.filtres === 'object' ? brut.filtres : {};
  const connus = Object.keys(PAR_DEFAUT);
  return {
    ...Object.fromEntries(Object.entries(brut).filter(([k]) => !connus.includes(k))),
    vue: dans(VUES, brut.vue, PAR_DEFAUT.vue), regroupement: dans(REGROUPEMENTS, brut.regroupement, PAR_DEFAUT.regroupement),
    tri: dans(TRIS, brut.tri, PAR_DEFAUT.tri), zoom: dans(ZOOMS, brut.zoom, PAR_DEFAUT.zoom), colorier: dans(COLORIER, brut.colorier, PAR_DEFAUT.colorier),
    replies: textes(brut.replies), moi: typeof brut.moi === 'string' || typeof brut.moi === 'number' ? brut.moi : null,
    filtres: {
      recherche: typeof f.recherche === 'string' ? f.recherche : '', statuts: textes(f.statuts), priorites: textes(f.priorites), responsables: nombres(f.responsables),
      retard: f.retard === true, mesTaches: f.mesTaches === true,
    },
  };
}

export const ecrire = reglages => JSON.stringify(reglages);
