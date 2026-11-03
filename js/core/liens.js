// Les liens d'une tâche vers des fichiers d'autres apps de GFS (integration-suite.md, 3.1). Une ligne de `Tuesday_Liens` par lien, en colonnes lisibles ; la clé d'un lien est { app, fichier, type } (le nom
// n'est qu'une étiquette, relue par GFS à l'ouverture). Un lien n'est jamais supprimé tout seul : un fichier introuvable le grise, la personne le retire ou le refait.
export const TABLE_LIENS = 'Tuesday_Liens';
export const TYPES_LIENS = ['document', 'grille', 'presentation'];
export const COLONNES_LIENS = [['Table', 'Text'], ['Ligne', 'Int'], ['App', 'Text'], ['Fichier', 'Text'], ['Type', 'Text'], ['Nom', 'Text'], ['Cree', 'Date']];

const texte = v => (typeof v === 'string' ? v.trim() : typeof v === 'number' && Number.isFinite(v) ? String(v) : '');

export function lienDepuisLigne(row) {
  if (!row || typeof row !== 'object') return null;
  const ligne = Number(row.Ligne);
  const [table, app, fichier, type] = [texte(row.Table), texte(row.App), texte(row.Fichier), texte(row.Type)];
  if (!table || !app || !fichier || !type || !Number.isInteger(ligne) || ligne <= 0) return null;
  return { id: row.id, table, ligne, app, fichier, type, nom: texte(row.Nom) };
}

export const cleLien = l => `${l.app}/${l.type}/${l.fichier}`;
export const liensDe = (liens, table, ligne) => liens.filter(l => l.table === table && l.ligne === ligne);

// Ce que rend `GfsLink.choose` ({ app, id, nom, type }) devient les valeurs d'une ligne ; null si ce n'est pas une clé.
export function versLigneLien({ table, ligne, choix, jour }) {
  const [app, fichier, type] = [texte(choix?.app), texte(choix?.id), texte(choix?.type)];
  if (!table || !Number.isInteger(ligne) || !app || !fichier || !type) return null;
  const valeurs = { Table: table, Ligne: ligne, App: app, Fichier: fichier, Type: type, Nom: texte(choix.nom) };
  if (typeof jour === 'number') valeurs.Cree = jour;
  return valeurs;
}

// Les refus de `GfsLink.openFile` (consigne 005, point 3) : ce que l'app fait. Jamais de suppression du lien.
export function suiteRefus(code) {
  switch (code) {
    case 'GFS_INTROUVABLE': return { introuvable: true, dire: false, avertir: false };
    case 'GFS_ANNULE': return { introuvable: false, dire: false, avertir: false };
    case 'GFS_REFUSE': return { introuvable: false, dire: false, avertir: true };
    case 'GFS_ACCES': return { introuvable: false, dire: true, avertir: false };
    default: return { introuvable: false, dire: true, avertir: false };
  }
}
