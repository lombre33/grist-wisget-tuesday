// De lignes de Grist à des tâches : valeurs lues selon la correspondance, jours civils, responsables avec leur nom, sous-tâches en arbre, retard, jalon. Aucune écriture ici.
import { jourDepuisGrist, maxIso, minIso } from './dates.js';
import { baseType } from './colonnes.js';
import { normaliser } from './texte.js';

const TERMINE = /^(termine|terminee|fini|finie|fait|faite|done|complete|completed|closed|clos|cloture|cloturee|livre|livree|archive|archivee|resolu|resolue)$/;
export const estTermine = statut => TERMINE.test(normaliser(statut));

const listeDe = valeur => (Array.isArray(valeur) ? (valeur[0] === 'L' ? valeur.slice(1) : valeur) : valeur === null || valeur === undefined || valeur === '' || valeur === 0 ? [] : [valeur]);
const texteDe = valeur => (valeur === null || valeur === undefined ? '' : String(valeur));
const nombreDe = valeur => (typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : null);

function personnes(valeur, col, refs) {
  if (!col) return [];
  if (baseType(col.type) === 'Text') return texteDe(valeur).split(/[,;]/).map(s => s.trim()).filter(Boolean).map(nom => ({ id: nom, label: nom }));
  return listeDe(valeur).filter(id => typeof id === 'number' && id > 0).map(id => ({ id, label: refs?.[col.id]?.get(id) ?? `#${id}` }));
}

function groupeDe(valeur, col, refs) {
  if (!col) return '';
  if (baseType(col.type) === 'Ref') return typeof valeur === 'number' && valeur > 0 ? (refs?.[col.id]?.get(valeur) ?? `#${valeur}`) : '';
  return texteDe(valeur);
}

function avancementDe(valeur) {
  const n = nombreDe(valeur);
  if (n === null) return null;
  return Math.max(0, Math.min(1, n > 1 ? n / 100 : n));
}

// ctx : { mapping, colonnes, refs: { colId: Map(id → texte) }, aujourdhui }
export function construire(rows, ctx) {
  const { mapping, colonnes, refs, aujourdhui } = ctx;
  const col = role => (mapping[role] ? colonnes.find(c => c.id === mapping[role]) : null);
  const valeur = (row, role) => (mapping[role] ? row[mapping[role]] : undefined);
  const taches = rows.map((row, pos) => {
    const statut = texteDe(valeur(row, 'statut'));
    const debut = jourDepuisGrist(valeur(row, 'debut'), col('debut')?.type);
    const fin = jourDepuisGrist(valeur(row, 'echeance'), col('echeance')?.type);
    const parent = nombreDe(valeur(row, 'parent'));
    const incoherente = Boolean(debut && fin && debut > fin);
    const termine = estTermine(statut);
    return {
      id: row.id, pos, titre: texteDe(valeur(row, 'titre')), statut, termine,
      responsables: personnes(valeur(row, 'responsable'), col('responsable'), refs),
      debut, fin, incoherente,
      debutEff: incoherente ? fin : debut ?? fin, finEff: incoherente ? fin : fin ?? debut,
      priorite: texteDe(valeur(row, 'priorite')), etiquettes: listeDe(valeur(row, 'etiquettes')).map(String),
      parentId: parent && parent > 0 && parent !== row.id ? parent : null,
      groupe: groupeDe(valeur(row, 'groupe'), col('groupe'), refs),
      avancement: avancementDe(valeur(row, 'avancement')), ordre: nombreDe(valeur(row, 'ordre')),
      description: texteDe(valeur(row, 'description')),
      predecesseurs: listeDe(valeur(row, 'predecesseurs')).filter(id => typeof id === 'number' && id > 0 && id !== row.id),
      brut: row,
    };
  });
  const parId = new Map(taches.map(t => [t.id, t]));
  for (const t of taches) {
    t.jalon = Boolean(t.debutEff) && t.debutEff === t.finEff && (!t.debut || !t.fin || t.debut === t.fin);
    t.enRetard = Boolean(t.fin) && !t.termine && t.fin < aujourdhui;
    t.bloqueePar = t.predecesseurs.filter(id => parId.has(id) && !parId.get(id).termine);
    if (t.parentId && !parId.has(t.parentId)) t.parentId = null;
  }
  casserCycles(taches, parId);
  return taches;
}

// Un cycle de parents (A parent de B parent de A) ferait disparaître les deux : on détache la tâche qui referme la boucle.
function casserCycles(taches, parId) {
  for (const t of taches) {
    const vus = new Set([t.id]);
    let cur = t;
    while (cur.parentId) {
      if (vus.has(cur.parentId)) { cur.parentId = null; break; }
      vus.add(cur.parentId);
      cur = parId.get(cur.parentId);
    }
  }
}

// Arbre : { racines, enfants: Map(id → [tâches]), parId }. Aucune tâche n'est perdue.
export function arbre(taches) {
  const enfants = new Map();
  const racines = [];
  for (const t of taches) {
    if (t.parentId) {
      if (!enfants.has(t.parentId)) enfants.set(t.parentId, []);
      enfants.get(t.parentId).push(t);
    } else racines.push(t);
  }
  return { racines, enfants, parId: new Map(taches.map(t => [t.id, t])) };
}

export function descendants(a, id) {
  const sortie = [];
  const pile = [...(a.enfants.get(id) ?? [])];
  while (pile.length) {
    const t = pile.shift();
    sortie.push(t);
    pile.push(...(a.enfants.get(t.id) ?? []));
  }
  return sortie;
}

export function compteSousTaches(a, id) {
  const liste = descendants(a, id);
  return { total: liste.length, faites: liste.filter(t => t.termine).length };
}

// Tâches visibles : celles qui passent le filtre, et leurs ancêtres (pour garder le contexte d'une sous-tâche trouvée).
export function avecAncetres(a, passants) {
  const gardes = new Set(passants);
  for (const id of passants) {
    let cur = a.parId.get(id);
    while (cur?.parentId) { gardes.add(cur.parentId); cur = a.parId.get(cur.parentId); }
  }
  return gardes;
}

// Étendue des dates des tâches (pour la chronologie), ou null.
export function etendue(taches) {
  let debut = null;
  let fin = null;
  for (const t of taches) { debut = minIso(debut, t.debutEff); fin = maxIso(fin, t.finEff); }
  return debut ? { debut, fin } : null;
}
