// Un projet enregistré : une ligne de `Tuesday_Projets` (table source + une colonne de texte par rôle, lisible et corrigeable depuis Grist). Aller-retour ligne ↔ correspondance.
import { ROLES } from './mapping.js';

export const TABLE_PROJETS = 'Tuesday_Projets';
export const SCHEMA = 1;
const PREFIXE = { titre: 'ColTitre', statut: 'ColStatut', responsable: 'ColResponsable', predecesseurs: 'ColPredecesseurs', debut: 'ColDebut', echeance: 'ColEcheance', priorite: 'ColPriorite', etiquettes: 'ColEtiquettes', parent: 'ColParente', groupe: 'ColGroupe', avancement: 'ColAvancement', ordre: 'ColOrdre', description: 'ColDescription' };

export const colonneDuRole = role => PREFIXE[role];

// Les colonnes que Tuesday_Projets doit avoir (identifiant, type) : à créer une fois, avec l'accord de la personne.
export const COLONNES_PROJETS = [
  ['Nom', 'Text'], ['TypeProjet', 'Text'], ['Dossier', 'Text'], ['DateModif', 'DateTime:UTC'], ['Source', 'Text'],
  ...ROLES.map(r => [PREFIXE[r], 'Text']), ['Reglages', 'Text'], ['Schema', 'Int'],
];

export function depuisLigne(ligne) {
  if (!ligne || !ligne.Source) return null;
  const mapping = Object.fromEntries(ROLES.map(r => [r, ligne[PREFIXE[r]] ? String(ligne[PREFIXE[r]]) : null]));
  return { id: ligne.id, nom: String(ligne.Nom ?? ''), source: String(ligne.Source), mapping, reglages: typeof ligne.Reglages === 'string' ? ligne.Reglages : '', schema: ligne.Schema ?? 0 };
}

export function versLigne({ nom, source, mapping, reglages = '' }, maintenant = Date.now() / 1000) {
  const ligne = { Nom: nom, TypeProjet: 'projet', Dossier: '', DateModif: Math.floor(maintenant), Source: source, Reglages: reglages, Schema: SCHEMA };
  for (const r of ROLES) ligne[PREFIXE[r]] = mapping?.[r] ?? '';
  return ligne;
}

// Identifiant stable d'un projet pour la clé de stockage : la ligne enregistrée, sinon la table source.
export const idProjet = (projet, source) => (projet?.id ? `p${projet.id}` : `t_${source}`);
