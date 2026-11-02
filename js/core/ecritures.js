// Écritures vers Grist : valeur codée selon le type de la colonne, actions UpdateRecord / AddRecord / RemoveRecord. On n'écrit jamais dans une colonne absente, à formule ou de type
// refusé ; un lot (un glisser qui change deux colonnes) est une seule action.
import { baseType, estListe } from './colonnes.js';
import { jourVersGrist } from './dates.js';

export function encoder(valeur, col, ancienne = null) {
  const base = baseType(col.type);
  if (base === 'Date' || base === 'DateTime') return valeur === null || valeur === '' ? null : jourVersGrist(valeur, col.type, ancienne);
  if (estListe(col.type)) return ['L', ...(Array.isArray(valeur) ? valeur : valeur === null || valeur === undefined || valeur === '' ? [] : [valeur])];
  if (base === 'Ref') return valeur ? Number(valeur) : 0;
  if (base === 'Numeric' || base === 'Int') return valeur === null || valeur === '' ? null : Number(valeur);
  if (base === 'Bool') return Boolean(valeur);
  return valeur === null || valeur === undefined ? '' : valeur;
}

export function peutEcrire(col) {
  if (!col) return { ok: false, raison: 'absente' };
  if (col.formule) return { ok: false, raison: 'formule' };
  return { ok: true };
}

// changements : { colId: valeur } déjà au vocabulaire du rôle (jour ISO, tableau d'identifiants, texte). `anciennes` : valeurs Grist avant, pour garder l'heure d'un DateTime.
export function actionMiseAJour(tableId, rowId, changements, colonnes, anciennes = {}) {
  const valeurs = {};
  for (const [colId, valeur] of Object.entries(changements)) {
    const col = colonnes.find(c => c.id === colId);
    const v = peutEcrire(col);
    if (!v.ok) throw new Error(`écriture refusée : ${colId} (${v.raison})`);
    valeurs[colId] = encoder(valeur, col, anciennes[colId]);
  }
  return ['UpdateRecord', tableId, rowId, valeurs];
}

export function actionAjout(tableId, valeursBrutes, colonnes) {
  const valeurs = {};
  for (const [colId, valeur] of Object.entries(valeursBrutes)) {
    const col = colonnes.find(c => c.id === colId);
    const v = peutEcrire(col);
    if (!v.ok) throw new Error(`écriture refusée : ${colId} (${v.raison})`);
    valeurs[colId] = encoder(valeur, col);
  }
  return ['AddRecord', tableId, null, valeurs];
}

export const actionSuppression = (tableId, rowId) => ['RemoveRecord', tableId, rowId];
// Rend la ligne à son identifiant d'avant (Annuler d'une suppression) : valeurs déjà au codage de Grist.
export const actionRestauration = (tableId, rowId, valeursGrist) => ['BulkAddRecord', tableId, [rowId], Object.fromEntries(Object.entries(valeursGrist).map(([k, v]) => [k, [v]]))];

// Traduction d'un refus de Grist en clé de message.
export function raisonRefus(erreur) {
  const texte = String(erreur?.message ?? erreur ?? '');
  if (/formula column/i.test(texte)) return 'refus.formule';
  if (/access|permission|denied|read-only|readonly/i.test(texte)) return 'refus.droit';
  return 'refus.autre';
}
