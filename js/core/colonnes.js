// Les tables et colonnes du document, lues dans `_grist_Tables` et `_grist_Tables_column` : type, choix colorés, colonne affichée d'une Référence, formule ou non.
// Les lignes arrivent en colonnes (`fetchTable` : { id: [...], colId: [...] }) ; `lignes` les remet en lignes.

export function lignes(table) {
  if (!table || typeof table !== 'object') return [];
  const noms = Object.keys(table);
  const n = Array.isArray(table.id) ? table.id.length : 0;
  return Array.from({ length: n }, (_, i) => Object.fromEntries(noms.map(nom => [nom, table[nom][i]])));
}

export function optionsDe(brut) {
  if (brut && typeof brut === 'object') return brut;
  if (typeof brut !== 'string' || !brut) return {};
  try {
    const v = JSON.parse(brut);
    return v && typeof v === 'object' ? v : {};
  } catch (e) {
    return {};
  }
}

export const estInterne = colId => colId === 'manualSort' || String(colId).startsWith('gristHelper_');
export const baseType = type => String(type || '').split(':')[0];
export const tableVisee = type => (String(type || '').includes(':') ? String(type).slice(String(type).indexOf(':') + 1) : null);
export const estReference = type => ['Ref', 'RefList'].includes(baseType(type));
export const estListe = type => ['RefList', 'ChoiceList'].includes(baseType(type));

function choixDe(options) {
  const liste = Array.isArray(options.choices) ? options.choices.map(String) : [];
  const couleurs = options.choiceOptions && typeof options.choiceOptions === 'object' ? options.choiceOptions : {};
  return liste.map(valeur => ({ valeur, fond: couleurs[valeur]?.fillColor ?? null, texte: couleurs[valeur]?.textColor ?? null }));
}

// Un modèle { tables: { [tableId]: { id, ref, colonnes: [...] } } } ; les tables de synthèse et les colonnes internes sont écartées.
export function modeleDocument(tablesMeta, colonnesMeta) {
  const tablesRows = Array.isArray(tablesMeta) ? tablesMeta : lignes(tablesMeta);
  const colRows = Array.isArray(colonnesMeta) ? colonnesMeta : lignes(colonnesMeta);
  const parRef = new Map();
  const tables = {};
  for (const t of tablesRows) {
    if (!t.tableId || t.summarySourceTable) continue;
    parRef.set(t.id, t.tableId);
    tables[t.tableId] = { id: t.tableId, ref: t.id, colonnes: [] };
  }
  const parId = new Map(colRows.map(c => [c.id, c]));
  for (const c of colRows) {
    const tableId = parRef.get(c.parentId);
    if (!tableId || estInterne(c.colId)) continue;
    const options = optionsDe(c.widgetOptions);
    const voir = c.visibleCol ? parId.get(c.visibleCol) : null;
    const formule = Boolean(c.isFormula) && Boolean(c.formula);
    tables[tableId].colonnes.push({
      id: c.colId, libelle: c.label || c.colId, type: c.type || 'Any', formule,
      choix: ['Choice', 'ChoiceList'].includes(baseType(c.type)) ? choixDe(options) : [],
      table: tableVisee(c.type), voir: voir ? voir.colId : null, ordre: c.parentPos ?? 0,
    });
  }
  for (const t of Object.values(tables)) t.colonnes.sort((a, b) => a.ordre - b.ordre);
  return { tables };
}

export function colonneDe(modele, tableId, colId) {
  return modele?.tables?.[tableId]?.colonnes.find(c => c.id === colId) ?? null;
}
