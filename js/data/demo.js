// Mode démonstration : la page ouverte hors de Grist (ou sans accès) montre un petit projet fictif et se comporte comme avec Grist, en mémoire, sans rien écrire nulle part. C'est NOTRE
// implémentation du port de données (jamais une mesure de Grist) : ce qui dépend de ce que Grist envoie se mesure dans un vrai Grist.
import { modeleDocument } from '../core/colonnes.js';
import { ajouterJours, aujourdhui as jourCourant } from '../core/dates.js';
import { COLONNES_PROJETS, TABLE_PROJETS } from '../core/projet.js';

const secondes = iso => Date.parse(`${iso}T00:00:00Z`) / 1000;
const choix = (liste, couleurs) => JSON.stringify({ choices: liste, choiceOptions: Object.fromEntries(Object.entries(couleurs).map(([k, [fond, texte]]) => [k, { fillColor: fond, textColor: texte }])) });
const col = (id, parentId, colId, type, extra = {}) => ({ id, parentId, colId, label: extra.label ?? colId, type, widgetOptions: extra.widgetOptions ?? '', isFormula: extra.isFormula ?? false, formula: extra.formula ?? '', visibleCol: extra.visibleCol ?? 0, parentPos: id });

function tablesDemo() {
  const statuts = choix(['À faire', 'En cours', 'En revue', 'Terminé'], { 'À faire': ['#E0E3EA', '#1B2430'], 'En cours': ['#CFE0FD', '#16367E'], 'En revue': ['#FBE3B0', '#5C3B00'], 'Terminé': ['#C9ECD9', '#0E4A31'] });
  const priorites = choix(['Haute', 'Moyenne', 'Basse'], { Haute: ['#F8D0D0', '#7A1F1F'], Moyenne: ['#FBE3B0', '#5C3B00'], Basse: ['#E0E3EA', '#1B2430'] });
  return {
    tablesMeta: [{ id: 1, tableId: 'Taches', summarySourceTable: 0 }, { id: 2, tableId: 'Equipe', summarySourceTable: 0 }],
    colonnesMeta: [
      col(1, 1, 'Titre', 'Text'), col(2, 1, 'Statut', 'Choice', { widgetOptions: statuts }), col(3, 1, 'Responsable', 'RefList:Equipe', { visibleCol: 21 }),
      col(4, 1, 'Debut', 'Date', { label: 'Début' }), col(5, 1, 'Echeance', 'Date', { label: 'Échéance' }), col(6, 1, 'Priorite', 'Choice', { label: 'Priorité', widgetOptions: priorites }),
      col(7, 1, 'Parent', 'Ref:Taches', { label: 'Tâche parente', visibleCol: 1 }), col(8, 1, 'Ordre', 'Numeric'),
      col(9, 1, 'Description', 'Text'), col(21, 2, 'Nom', 'Text'),
    ],
  };
}

// Un document Grist tout neuf : « Table1 » avec ses colonnes A, B et C, vide. C'est ce qu'on trouve en ajoutant Tuesday à un Grist vide.
function documentNeuf() {
  return { tablesMeta: [{ id: 1, tableId: 'Table1', summarySourceTable: 0 }], colonnesMeta: ['A', 'B', 'C'].map((c, i) => col(i + 1, 1, c, 'Any')) };
}

// `variante: 'vide'` : le document neuf ; sinon le petit projet fictif.
export function creerDemo({ maintenant = new Date(), variante = null } = {}) {
  const auj = jourCourant(maintenant);
  const jour = n => secondes(ajouterJours(auj, n));
  const neuf = variante === 'vide';
  const { tablesMeta, colonnesMeta } = neuf ? documentNeuf() : tablesDemo();
  const equipe = neuf ? [] : ['L. Bernard', 'M. Dupont', 'S. Martin', 'A. Petit'].map((Nom, i) => ({ id: i + 1, Nom }));
  const t = (id, Titre, Statut, resp, d, e, Priorite, Parent = 0, Description = '') => ({ id, Titre, Statut, Responsable: ['L', ...resp], Debut: d === null ? null : jour(d), Echeance: e === null ? null : jour(e), Priorite, Parent, Ordre: id * 1024, Description });
  const donnees = neuf ? { Table1: [] } : {
    Equipe: equipe,
    Taches: [
      t(1, 'Cadrer le projet', 'Terminé', [1], -12, -8, 'Haute'),
      t(2, 'Rédiger le cahier des charges', 'Terminé', [1, 2], -9, -3, 'Haute', 0, 'Besoins, périmètre, planning.'),
      t(3, 'Maquettes des écrans', 'En revue', [3], -4, 2, 'Moyenne'),
      t(4, 'Choisir les couleurs', 'Terminé', [3], -4, -2, 'Basse', 3),
      t(5, 'Écrans de connexion', 'En cours', [3], -1, 3, 'Moyenne', 3),
      t(6, 'Développer la version 1', 'En cours', [2, 4], 0, 14, 'Haute', 0, 'Tableau, kanban, chronologie.'),
      t(7, 'Mettre en place les tests', 'En cours', [4], 0, 5, 'Haute', 6),
      t(8, 'Brancher les données', 'À faire', [2], 3, 9, 'Moyenne', 6),
      t(9, 'Former l\'équipe', 'À faire', [1], 12, 13, 'Moyenne'),
      t(10, 'Livraison', 'À faire', [1], null, 16, 'Haute'),
      t(11, 'Relire le contrat', 'À faire', [2], -6, -1, 'Haute'),
      t(12, 'Préparer la démonstration', 'À faire', [], null, null, 'Basse'),
    ],
  };
  const projets = [];
  const etat = { donnees, projets, derniere: neuf ? { Table1: 0, [TABLE_PROJETS]: 0 } : { Taches: 12, Equipe: 4, [TABLE_PROJETS]: 0 }, tablesMeta: [...tablesMeta], colonnesMeta: [...colonnesMeta], abonnes: new Set(), creee: false, section: neuf ? 'Table1' : 'Taches' };
  return construirePort(etat);
}

function construirePort(etat) {
  const notifier = table => { for (const fn of etat.abonnes) fn(table); };
  const lignesDe = table => (table === TABLE_PROJETS ? etat.projets : etat.donnees[table] ?? []);
  const modele = () => modeleDocument(etat.tablesMeta, etat.colonnesMeta);
  function appliquerUne(action) {
    const [nom, table, ...reste] = action;
    const liste = table === TABLE_PROJETS ? etat.projets : (etat.donnees[table] ??= []);
    if (nom === 'UpdateRecord') {
      const ligne = liste.find(l => l.id === reste[0]);
      if (!ligne) throw new Error(`Row ${reste[0]} not found`);
      Object.assign(ligne, reste[1]);
      return null;
    }
    if (nom === 'AddRecord') {
      const id = reste[0] ?? ++etat.derniere[table];
      liste.push({ id, ...reste[1] });
      etat.derniere[table] = Math.max(etat.derniere[table] ?? 0, id);
      return id;
    }
    if (nom === 'BulkAddRecord') {
      const [ids, valeurs] = reste;
      ids.forEach((id, i) => liste.push({ id, ...Object.fromEntries(Object.entries(valeurs).map(([k, v]) => [k, v[i]])) }));
      etat.derniere[table] = Math.max(etat.derniere[table] ?? 0, ...ids);
      return ids;
    }
    if (nom === 'RemoveRecord') {
      const i = liste.findIndex(l => l.id === reste[0]);
      if (i < 0) throw new Error(`Row ${reste[0]} not found`);
      liste.splice(i, 1);
      return null;
    }
    if (nom === 'AddTable') {
      etat.derniere[table] = 0;
      if (table === TABLE_PROJETS) { etat.creee = true; return { table_id: table }; }
      const ref = Math.max(0, ...etat.tablesMeta.map(t => t.id)) + 1;
      let id = Math.max(0, ...etat.colonnesMeta.map(c => c.id)) + 1;
      etat.tablesMeta.push({ id: ref, tableId: table, summarySourceTable: 0 });
      for (const c of reste[0]) etat.colonnesMeta.push(col(id++, ref, c.id, c.type, { label: c.label, widgetOptions: c.widgetOptions }));
      etat.donnees[table] = [];
      return { table_id: table };
    }
    throw new Error(`Action non gérée en démonstration : ${nom}`);
  }
  return {
    mode: 'demo', lectureSeule: false, document: 'demonstration',
    async modele() {
      const m = modele();
      if (etat.creee) m.tables[TABLE_PROJETS] = { id: TABLE_PROJETS, ref: 99, colonnes: COLONNES_PROJETS.map(([id, type]) => ({ id, libelle: id, type, formule: false, choix: [], table: null, voir: null, ordre: 0 })) };
      return m;
    },
    async lignes(table) { return structuredClone(lignesDe(table)); },
    async tableSection() { return etat.section; },
    lire(table, id) { return lignesDe(table).find(l => l.id === id); },
    async appliquer(actions) {
      const copie = structuredClone({ donnees: etat.donnees, projets: etat.projets, derniere: etat.derniere });
      try {
        const retours = actions.map(appliquerUne);
        for (const table of new Set(actions.map(a => a[1]))) notifier(table);
        return retours;
      } catch (e) {
        etat.donnees = copie.donnees; etat.projets = copie.projets; etat.derniere = copie.derniere;
        throw e;
      }
    },
    abonner(fn) { etat.abonnes.add(fn); return () => etat.abonnes.delete(fn); },
    // Pour les essais : simuler le changement d'une autre personne.
    _exterieur(actions) { actions.forEach(appliquerUne); for (const table of new Set(actions.map(a => a[1]))) notifier(table); },
    _etat: etat,
  };
}
