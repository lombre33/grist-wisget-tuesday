// Le port de données vers Grist (API des widgets, accès complet) : un adaptateur MINCE, sans logique. Tout ce qui se calcule est dans core/. Ce que Grist envoie se mesure dans un vrai Grist
// (labo de test/grist/), jamais contre un faux Grist écrit ici. Mesuré : `onRecords` rend des dates en objets Date (ou en ['d', secondes] avec `keepEncoded`), pas les secondes de `fetchTable` ; il ne sert donc que de signal de changement, toute lecture passe par `fetchTable`.
import { lignes, modeleDocument } from '../core/colonnes.js';

const SONDE_MS = 20000;

export function creerPortGrist(grist, { lectureSeule = false } = {}) {
  const abonnes = new Set();
  const notifier = table => { for (const fn of [...abonnes]) fn(table); };

  grist.onRecords?.(() => notifier('*section*'), { includeColumns: 'all', keepEncoded: true });
  // Les autres tables ne préviennent pas : une relecture à intervalle tant que la page est visible.
  let minuteur = null;
  const sonder = () => {
    if (minuteur) return;
    minuteur = setInterval(() => { if (!document.hidden && abonnes.size) notifier('*sonde*'); }, SONDE_MS);
  };

  const port = {
    mode: 'grist', lectureSeule, document: 'document',
    async modele() {
      const [tables, colonnes] = await Promise.all([grist.docApi.fetchTable('_grist_Tables'), grist.docApi.fetchTable('_grist_Tables_column')]);
      return modeleDocument(tables, colonnes);
    },
    async lignes(table) { return lignes(await grist.docApi.fetchTable(table)); },
    async tableSection() {
      try { const id = grist.getSelectedTableIdSync?.() ?? (await grist.selectedTable?.getTableId?.()); return id ? String(id) : null; } catch (e) { return null; }
    },
    async listeTables() { return grist.docApi.listTables(); },
    async nomDocument() { try { return await grist.docApi.getDocName(); } catch (e) { return null; } },
    async appliquer(actions) {
      const reponse = await grist.docApi.applyUserActions(actions);
      return reponse?.retValues ?? [];
    },
    abonner(fn) { abonnes.add(fn); sonder(); return () => abonnes.delete(fn); },
  };
  return port;
}
