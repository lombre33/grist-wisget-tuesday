// La correspondance : quel rôle de tâche (titre, statut, échéance…) lit quelle colonne de la table. Reconnaissance par le type puis par le nom, toujours proposée et jamais appliquée
// en silence ; vérification (type, colonne absente, formule) avant d'écrire quoi que ce soit.
import { normaliser } from './texte.js';
import { baseType, tableVisee } from './colonnes.js';

export const ROLES = ['titre', 'statut', 'responsable', 'predecesseurs', 'debut', 'echeance', 'priorite', 'etiquettes', 'parent', 'groupe', 'avancement', 'ordre', 'description'];
export const OBLIGATOIRES = ['titre'];
// Les rôles qu'on écrit : une colonne à formule n'y est pas acceptée. Avancement et Prédécesseurs se lisent seulement.
export const ECRITS = ['titre', 'statut', 'responsable', 'debut', 'echeance', 'priorite', 'etiquettes', 'parent', 'groupe', 'ordre', 'description'];

const NOMS = {
  titre: ['titre', 'nom', 'tache', 'taches', 'task', 'title', 'name', 'sujet', 'libelle', 'intitule', 'objet'],
  statut: ['statut', 'etat', 'status', 'state', 'avancement etat', 'etape'],
  responsable: ['responsable', 'assigne', 'assignee', 'owner', 'assigne a', 'porteur', 'pilote', 'attribue a', 'personne'],
  predecesseurs: ['predecesseurs', 'predecesseur', 'bloque par', 'depend de', 'dependances', 'predecessors', 'blocked by'],
  debut: ['debut', 'date de debut', 'start', 'start date', 'date debut', 'demarrage'],
  echeance: ['echeance', 'deadline', 'due', 'due date', 'date de fin', 'fin', 'end', 'date limite', 'date echeance', 'livraison'],
  priorite: ['priorite', 'priority', 'urgence'],
  etiquettes: ['etiquettes', 'etiquette', 'tags', 'labels', 'mots cles', 'categories'],
  parent: ['tache parente', 'parent', 'parente', 'tache mere', 'parent task'],
  groupe: ['groupe', 'projet', 'group', 'section', 'categorie', 'phase', 'lot'],
  avancement: ['avancement', 'progression', 'progress', 'pourcentage', 'achevement', 'percent'],
  ordre: ['ordre', 'rang', 'order', 'position', 'tri manuel'],
  description: ['description', 'details', 'detail', 'notes', 'note', 'commentaire', 'commentaires'],
};

export function accepte(role, col, tableId) {
  if (!col) return false;
  const base = baseType(col.type);
  const vise = tableVisee(col.type);
  switch (role) {
    case 'titre': case 'description': return base === 'Text';
    case 'statut': case 'priorite': return base === 'Choice';
    case 'responsable': return ['Ref', 'RefList', 'Text'].includes(base);
    case 'predecesseurs': return base === 'RefList' && vise === tableId;
    case 'debut': case 'echeance': return base === 'Date' || base === 'DateTime';
    case 'etiquettes': return base === 'ChoiceList';
    case 'parent': return base === 'Ref' && vise === tableId;
    case 'groupe': return base === 'Choice' || base === 'Ref';
    case 'avancement': case 'ordre': return base === 'Numeric' || base === 'Int';
    default: return false;
  }
}

const parNom = (role, col) => NOMS[role].includes(normaliser(col.libelle)) || NOMS[role].includes(normaliser(col.id));

// Renvoie { mapping: {role: colId|null}, ambigus: {role: [colId…]} }. Un rôle ambigu reste vide jusqu'à la réponse de la personne.
export function reconnaitre(colonnes, tableId) {
  const mapping = Object.fromEntries(ROLES.map(r => [r, null]));
  const ambigus = {};
  const prises = new Set();
  const candidats = role => colonnes.filter(c => accepte(role, c, tableId) && !prises.has(c.id));
  const poser = (role, col) => { mapping[role] = col.id; prises.add(col.id); };
  const resoudre = (role, parType) => {
    const liste = candidats(role);
    const noms = liste.filter(c => parNom(role, c));
    if (noms.length === 1) return poser(role, noms[0]);
    if (noms.length > 1) { ambigus[role] = noms.map(c => c.id); return null; }
    if (parType && liste.length === 1) return poser(role, liste[0]);
    if (parType && liste.length > 1) ambigus[role] = liste.map(c => c.id);
    return null;
  };
  resoudre('statut', true);
  resoudre('titre', true);
  for (const role of ['parent', 'predecesseurs', 'debut', 'echeance', 'priorite', 'etiquettes', 'responsable', 'avancement', 'ordre', 'description', 'groupe']) resoudre(role, false);
  if (!mapping.echeance && !mapping.debut) {
    const dates = candidats('echeance');
    if (dates.length === 1) poser('echeance', dates[0]);
  }
  return { mapping, ambigus };
}

// Vérifie une correspondance : { ok, erreurs: [{ role, colId, raison }] } ; raison = 'manquant' | 'absente' | 'type' | 'formule'.
export function verifier(mapping, colonnes, tableId) {
  const erreurs = [];
  for (const role of OBLIGATOIRES) if (!mapping?.[role]) erreurs.push({ role, colId: null, raison: 'manquant' });
  for (const role of ROLES) {
    const colId = mapping?.[role];
    if (!colId) continue;
    const col = colonnes.find(c => c.id === colId);
    if (!col) erreurs.push({ role, colId, raison: 'absente' });
    else if (!accepte(role, col, tableId)) erreurs.push({ role, colId, raison: 'type' });
    else if (col.formule && ECRITS.includes(role)) erreurs.push({ role, colId, raison: 'formule' });
  }
  return { ok: erreurs.length === 0, erreurs };
}

// Ce qui peut s'afficher ou se faire avec cette correspondance (le grisé dit pourquoi).
export function capacites(mapping) {
  return {
    tableau: Boolean(mapping?.titre),
    kanban: Boolean(mapping?.titre && mapping?.statut),
    chronologie: Boolean(mapping?.titre && (mapping?.debut || mapping?.echeance)),
    calendrier: Boolean(mapping?.titre && (mapping?.debut || mapping?.echeance)),
    reordonner: Boolean(mapping?.ordre),
    sousTaches: Boolean(mapping?.parent),
  };
}

// Raison du grisé, clé de traduction.
export function raisonGrise(vue, mapping) {
  if (vue === 'kanban' && !mapping?.statut) return 'raison.statut';
  if ((vue === 'chronologie' || vue === 'calendrier') && !(mapping?.debut || mapping?.echeance)) return 'raison.dates';
  if (vue === 'reordonner' && !mapping?.ordre) return 'raison.ordre';
  return null;
}
