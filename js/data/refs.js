// Le nom affiché d'une Référence : Grist donne un numéro, la personne veut lire un nom. Pour chaque colonne Ref / RefList, la table visée et sa colonne affichée donnent « identifiant → texte ».
import { baseType, estReference } from '../core/colonnes.js';

function colonneAffichee(table, voir) {
  if (voir && table?.colonnes.some(c => c.id === voir)) return voir;
  return table?.colonnes.find(c => baseType(c.type) === 'Text')?.id ?? null;
}

// Les tables à lire pour les références d'une table : [{ colId, table, voir }].
export function referencesDe(modele, tableId) {
  const t = modele.tables[tableId];
  if (!t) return [];
  return t.colonnes.filter(c => estReference(c.type) && c.table && modele.tables[c.table]).map(c => ({ colId: c.id, table: c.table, voir: colonneAffichee(modele.tables[c.table], c.voir) }));
}

// lignesParTable : { [tableId]: rows[] }. Renvoie { [colId]: Map(id → texte) }.
export function etiquettesRefs(modele, tableId, lignesParTable) {
  const sortie = {};
  for (const { colId, table, voir } of referencesDe(modele, tableId)) {
    const m = new Map();
    for (const row of lignesParTable[table] ?? []) {
      const v = voir ? row[voir] : null;
      m.set(row.id, v === null || v === undefined || v === '' ? `#${row.id}` : String(v));
    }
    sortie[colId] = m;
  }
  return sortie;
}
