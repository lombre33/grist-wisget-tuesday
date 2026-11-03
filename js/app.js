// L'état de Tuesday et ses gestes : projet ouvert, tâches calculées, écritures optimistes avec retour arrière, historique. Aucun DOM ici : les vues écoutent `abonner` et appellent les méthodes.
import { aujourdhui } from './core/dates.js';
import { construire, arbre as faireArbre } from './core/taches.js';
import { reconnaitre, verifier, capacites } from './core/mapping.js';
import { actionMiseAJour, actionAjout, actionSuppression, raisonRefus } from './core/ecritures.js';
import { Historique } from './core/historique.js';
import { lire as lireReglages, ecrire as ecrireReglages, cle as cleReglages } from './core/reglages.js';
import { rangFin } from './core/rang.js';
import { depuisLigne, versLigne, idProjet, TABLE_PROJETS, COLONNES_PROJETS } from './core/projet.js';
import { etiquettesRefs } from './data/refs.js';
import { modeleDepart } from './core/modele-depart.js';
import { apercu, recommandation, etapeDepart, adapterTache, nomTable, ID_APERCU } from './core/miseenplace.js';
import { lireChoix, ecrireChoix } from './data/stockage.js';

export class App {
  constructor(port, { document: doc = 'seul', maintenant = () => new Date() } = {}) {
    this.port = port; this.document = doc; this.maintenant = maintenant;
    this.abonnes = new Set(); this.historique = new Historique();
    this.modele = { tables: {} }; this.projets = []; this.projet = null; this.source = null; this.mapping = null;
    this.rows = []; this.rowsParId = new Map(); this.refs = {}; this.taches = []; this.arbre = faireArbre([]);
    this.reglages = lireReglages(''); this.selection = null; this.ecran = 'projet'; this.attenteAcces = false; this.sectionTable = null;
    this.message = null; this.occupe = 0;
    // L'outil est complet dès le premier affichage : vide, sur l'aperçu du modèle, tant que la mise en place n'est pas faite (cahier de l'onboarding, 3).
    this.confirme = false; this.initTermine = false; this.tacheEnAttente = null; this.miseEnPlace = { ouverte: false, etape: 'table' };
    this.poserApercu();
    port.abonner?.(() => this.surChangementExterieur());
  }

  abonner(fn) { this.abonnes.add(fn); return () => this.abonnes.delete(fn); }
  // `init` échoue quand Grist refuse la lecture (accès pas encore accordé) ou répond mal (mesuré dans un vrai Grist : « Access not granted ») : on le dit au lieu de rester muet.
  async demarrer() {
    try { await this.init(); } catch (e) {
      if (/access/i.test(String(e?.message))) { this.attenteAcces = true; this.demanderMiseEnPlace({ etape: 'acces' }); } else this.notifier({ texte: String(e?.message ?? e), type: 'erreur' });
      this.emettre();
    }
  }

  // Après quelques secondes sans réponse de Grist, la mise en place s'ouvre sur l'accès : il n'est peut-être pas encore accordé.
  attendreAcces(delai = 3000) {
    if (this.port.mode === 'demo') return null;
    return setTimeout(() => { if (!this.initTermine) { this.attenteAcces = true; this.demanderMiseEnPlace({ etape: 'acces' }); } }, delai);
  }

  emettre(quoi = 'etat') { for (const fn of [...this.abonnes]) fn(quoi); }
  get lectureSeule() { return Boolean(this.port.lectureSeule); }
  get estApercu() { return this.source === ID_APERCU; }
  // Prêt à écrire : une table est reliée ET la personne l'a confirmée. Lire reste libre ; écrire demande la mise en place.
  get pret() { return !this.estApercu && this.confirme; }
  get colonnes() { return this.estApercu ? this.apercu.colonnes : (this.modele.tables[this.source]?.colonnes ?? []); }
  colonne(role) { return this.mapping?.[role] ? this.colonnes.find(c => c.id === this.mapping[role]) ?? null : null; }
  choix(role) { return this.colonne(role)?.choix ?? []; }
  get capacites() { return capacites(this.mapping); }
  get aujourdhui() { return aujourdhui(this.maintenant()); }

  // ---------- démarrage ----------
  // L'outil s'ouvre toujours. Projet enregistré ou déjà confirmé par cette personne : il s'ouvre dessus. Sinon, table reconnue : il l'ouvre en lecture (essai), les écritures demandent la mise en
  // place. Sinon : l'aperçu vide. Dans les deux derniers cas, la mise en place s'ouvre au lancement.
  async init() {
    this.modele = await this.port.modele();
    this.sectionTable = await this.port.tableSection();
    this.projets = await this.lireProjets();
    const memo = this.sectionTable ? this.mappingMemorise(this.sectionTable) : null;
    const enregistre = this.projets.find(p => p.source === this.sectionTable) ?? this.projets[0];
    if (enregistre && this.modele.tables[enregistre.source]) await this.ouvrirProjet(enregistre);
    else if (memo && this.modele.tables[this.sectionTable]) await this.ouvrir(this.sectionTable, memo, null);
    else await this.ouvrirEssai();
    this.initTermine = true; this.attenteAcces = false;
    if (!this.pret) this.demanderMiseEnPlace(this.miseEnPlace.ouverte && this.miseEnPlace.etape === 'acces' ? { etape: 'table' } : {});
    else if (this.miseEnPlace.ouverte && this.miseEnPlace.etape === 'acces') this.fermerMiseEnPlace();
    else this.emettre();
  }

  async ouvrirEssai() {
    const possibles = this.tablesPossibles();
    const cible = possibles.find(t => t.id === this.sectionTable && t.score > 0) ?? possibles.find(t => t.score > 0);
    if (!cible) return;
    const colonnes = this.modele.tables[cible.id].colonnes;
    const { mapping } = reconnaitre(colonnes, cible.id);
    if (verifier(mapping, colonnes, cible.id).ok) await this.ouvrir(cible.id, mapping, null, { confirme: false });
  }

  poserApercu() {
    this.apercu = apercu(this.aujourdhui);
    this.source = ID_APERCU; this.mapping = this.apercu.mapping; this.projet = null; this.confirme = false;
    this.rows = []; this.rowsParId = new Map(); this.refs = {}; this.recalculer();
  }

  tablesPossibles() {
    return Object.values(this.modele.tables).filter(t => !t.id.startsWith('Tuesday_') && t.colonnes.length)
      .map(t => ({ id: t.id, colonnes: t.colonnes.length, score: reconnaitre(t.colonnes, t.id).mapping.titre ? 1 + (reconnaitre(t.colonnes, t.id).mapping.statut ? 2 : 0) + (t.id === this.sectionTable ? 4 : 0) : 0 }))
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  }

  async lireProjets() {
    if (!this.modele.tables[TABLE_PROJETS]) return [];
    try { return (await this.port.lignes(TABLE_PROJETS)).map(depuisLigne).filter(Boolean); } catch (e) { return []; }
  }

  cleMemo(table) { return `tuesday.${this.document}.src.${table}`.slice(0, 64); }
  mappingMemorise(table) {
    try { const v = JSON.parse(lireChoix(this.cleMemo(table)) ?? 'null'); return v && v.titre ? v : null; } catch (e) { return null; }
  }

  async ouvrirProjet(projet) { await this.ouvrir(projet.source, projet.mapping, projet); }

  // `confirme: false` : l'essai, en lecture seulement (rien n'est mémorisé, les écritures demandent la mise en place).
  async ouvrir(tableId, mapping, projet, { confirme = true } = {}) {
    const colonnes = this.modele.tables[tableId]?.colonnes ?? [];
    const v = verifier(mapping, colonnes, tableId);
    if (!v.ok) { this.demanderMiseEnPlace({ etape: 'colonnes', choix: 'existante', table: tableId, mapping: { ...reconnaitre(colonnes, tableId).mapping, ...mapping }, erreurs: v.erreurs }); return; }
    this.source = tableId; this.mapping = mapping; this.projet = projet; this.historique = new Historique(); this.selection = null; this.confirme = confirme;
    if (confirme) ecrireChoix(this.cleMemo(tableId), JSON.stringify(mapping));
    this.reglages = lireReglages(lireChoix(this.cleReglages()) ?? projet?.reglages ?? '');
    await this.lire();
    this.ecran = 'projet';
    this.emettre();
  }

  cleReglages() { return cleReglages(this.document, idProjet(this.projet, this.source)); }

  // ---------- lecture ----------
  async lire() {
    const rows = await this.port.lignes(this.source);
    const liees = {};
    for (const c of this.colonnes) if (c.table && c.table !== this.source && !liees[c.table]) liees[c.table] = await this.port.lignes(c.table);
    liees[this.source] = rows;
    this.rows = rows; this.rowsParId = new Map(rows.map(r => [r.id, r]));
    this.refs = etiquettesRefs(this.modele, this.source, liees);
    this.recalculer();
  }

  recalculer() {
    this.taches = construire(this.rows, { mapping: this.mapping, colonnes: this.colonnes, refs: this.refs, aujourdhui: this.aujourdhui });
    this.arbre = faireArbre(this.taches);
  }

  tache(id) { return this.arbre.parId.get(id) ?? null; }
  lireLigne(table, id) { return table === this.source ? this.rowsParId.get(id) : this.port.lire?.(table, id); }

  async surChangementExterieur() {
    if (this.ecran !== 'projet' || this.occupe || this.estApercu) return;
    if (this.enSaisie?.()) { this.enAttente = true; return; }
    await this.lire();
    this.emettre();
  }

  async rafraichir() { this.enAttente = false; await this.lire(); this.emettre(); }

  // ---------- réglages d'affichage (par projet, jamais dans le document sans geste) ----------
  regler(partiel) {
    this.reglages = { ...this.reglages, ...partiel };
    if (!this.estApercu) ecrireChoix(this.cleReglages(), ecrireReglages(this.reglages));
    this.emettre();
  }

  // ---------- écritures ----------
  notifier(message) { this.message = { ...message, id: (this.message?.id ?? 0) + 1 }; this.emettre('message'); }

  // Un geste d'écriture est refusé en lecture seule (avec sa raison) ; avant la mise en place, il l'ouvre au lieu d'échouer (la tâche tapée est gardée par `ajouter`).
  verrou(raison = 'lectureSeule') {
    if (this.verrouLecture(raison)) return true;
    if (!this.pret) { this.demanderMiseEnPlace(); return true; }
    return false;
  }

  // Seulement la lecture seule : créer la table de la mise en place ou enregistrer le projet n'ont pas à attendre la mise en place, ils en font partie.
  verrouLecture(raison = 'lectureSeule') {
    if (!this.lectureSeule) return false;
    this.notifier({ cle: `refus.${raison}`, type: 'erreur' });
    return true;
  }

  colsDe(parRole) {
    const sortie = {};
    for (const [role, valeur] of Object.entries(parRole)) {
      if (!this.mapping[role]) throw new Error(`rôle non relié : ${role}`);
      sortie[this.mapping[role]] = valeur;
    }
    return sortie;
  }

  // lot : [{ id, parRole }] ; un seul pas d'historique, une seule demande à Grist.
  async modifierLot(lot, libelle) {
    if (this.verrou()) return false;
    const preparés = [];
    try {
      for (const { id, parRole, brut } of lot) {
        const ligne = this.rowsParId.get(id);
        const cols = brut ? parRole : this.colsDe(parRole);
        const action = actionMiseAJour(this.source, id, cols, this.colonnes, ligne);
        const avant = Object.fromEntries(Object.keys(cols).map(c => [c, ligne[c]]));
        preparés.push({ id, ligne, action, avant, apres: action[3] });
      }
    } catch (e) { this.notifier({ cle: raisonRefus(e), type: 'erreur', detail: e.message }); return false; }
    for (const p of preparés) Object.assign(p.ligne, p.apres);
    this.recalculer(); this.emettre();
    this.occupe++;
    try {
      await this.port.appliquer(preparés.map(p => p.action));
      this.historique.pousser({ libelle, ops: preparés.map(p => ({ type: 'maj', table: this.source, id: p.id, avant: p.avant, apres: p.apres })) });
      this.notifier({ texte: libelle, type: 'ok', annulable: true });
      return true;
    } catch (e) {
      for (const p of preparés) Object.assign(p.ligne, p.avant);
      this.recalculer();
      this.notifier({ cle: raisonRefus(e), type: 'erreur', detail: e.message });
      return false;
    } finally { this.occupe--; this.emettre(); }
  }

  modifier(id, parRole, libelle) { return this.modifierLot([{ id, parRole }], libelle); }
  // Une colonne non reliée à un rôle (« Autres champs » de la fiche) : les clés sont des identifiants de colonnes.
  modifierColonne(id, parColonne, libelle) { return this.modifierLot([{ id, parRole: parColonne, brut: true }], libelle); }

  async ajouter(parRole, libelle) {
    if (!this.pret && !this.lectureSeule) this.tacheEnAttente = { parRole, libelle };
    if (this.verrou()) return null;
    const valeurs = { ...parRole };
    if (this.mapping.ordre && valeurs.ordre === undefined) valeurs.ordre = rangFin(this.taches);
    let action;
    try { action = actionAjout(this.source, this.colsDe(valeurs), this.colonnes); } catch (e) { this.notifier({ cle: raisonRefus(e), type: 'erreur', detail: e.message }); return null; }
    this.occupe++;
    try {
      const retours = await this.port.appliquer([action]);
      const id = Array.isArray(retours) ? retours[0] : retours;
      this.historique.pousser({ libelle, ops: [{ type: 'ajout', table: this.source, id, valeurs: action[3] }] });
      await this.lire();
      this.notifier(this.rowsParId.has(id) ? { texte: libelle, type: 'ok', annulable: true } : { cle: 'msg.masquee', type: 'info' });
      return id;
    } catch (e) {
      this.notifier({ cle: raisonRefus(e), type: 'erreur', detail: e.message });
      return null;
    } finally { this.occupe--; this.emettre(); }
  }

  async supprimer(id, libelle) {
    if (this.verrou()) return false;
    const ligne = this.rowsParId.get(id);
    if (!ligne) return false;
    const valeurs = Object.fromEntries(this.colonnes.filter(c => !c.formule && c.id in ligne).map(c => [c.id, ligne[c.id]]));
    this.occupe++;
    try {
      await this.port.appliquer([actionSuppression(this.source, id)]);
      this.historique.pousser({ libelle, ops: [{ type: 'suppr', table: this.source, id, valeurs }] });
      if (this.selection === id) this.selection = null;
      await this.lire();
      this.notifier({ texte: libelle, type: 'ok', annulable: true });
      return true;
    } catch (e) {
      this.notifier({ cle: raisonRefus(e), type: 'erreur', detail: e.message });
      return false;
    } finally { this.occupe--; this.emettre(); }
  }

  async rejouer(sens) {
    if (this.verrou()) return false;
    const r = this.historique.preparer(sens, (t, id) => this.lireLigne(t, id));
    if (!r.ok) {
      if (r.raison === 'conflit') { this.historique.abandonner(sens); this.notifier({ cle: 'msg.conflit', type: 'erreur' }); }
      return false;
    }
    this.occupe++;
    try {
      await this.port.appliquer(r.actions);
      this.historique.valider(sens);
      await this.lire();
      this.notifier({ cle: sens === 'annuler' ? 'msg.annule' : 'msg.retabli', libelle: r.pas.libelle, type: 'ok', annulable: false });
      return true;
    } catch (e) {
      this.notifier({ cle: raisonRefus(e), type: 'erreur', detail: e.message });
      return false;
    } finally { this.occupe--; this.emettre(); }
  }

  annuler() { return this.rejouer('annuler'); }
  retablir() { return this.rejouer('retablir'); }

  // ---------- enregistrer le projet pour l'équipe (après accord de la personne) ----------
  async enregistrerProjet(nom) {
    if (!this.pret || this.verrouLecture('droit')) return false;
    this.occupe++;
    try {
      if (!this.modele.tables[TABLE_PROJETS]) {
        await this.port.appliquer([['AddTable', TABLE_PROJETS, COLONNES_PROJETS.map(([id, type]) => ({ id, type, isFormula: false }))]]);
        this.modele = await this.port.modele();
        if (!this.modele.tables[TABLE_PROJETS]) throw new Error('table des projets introuvable après création');
      }
      const ligne = versLigne({ nom, source: this.source, mapping: this.mapping, reglages: ecrireReglages(this.reglages) });
      const retours = await this.port.appliquer([['AddRecord', TABLE_PROJETS, null, ligne]]);
      this.projets = await this.lireProjets();
      this.projet = this.projets.find(p => p.id === (Array.isArray(retours) ? retours[0] : retours)) ?? this.projets.at(-1) ?? null;
      this.notifier({ cle: 'msg.enregistre', type: 'ok' });
      return true;
    } catch (e) {
      this.notifier({ cle: raisonRefus(e), type: 'erreur', detail: e.message });
      return false;
    } finally { this.occupe--; this.emettre(); }
  }


  // ---------- modèle de départ (facultatif, après accord : une table de la personne, pas une table Tuesday_) ----------
  async creerModele(nom, { exemples = false } = {}) {
    if (this.verrouLecture('droit')) return false;
    this.occupe++;
    try {
      const m = modeleDepart(this.aujourdhui);
      const retours = await this.port.appliquer([['AddTable', nom, m.colonnes]]);
      const reel = retours?.[0]?.table_id ?? nom;
      if (exemples) await this.port.appliquer([['BulkAddRecord', reel, m.lignes.map((_, i) => i + 1), Object.fromEntries(m.colonnes.map(c => [c.id, m.lignes.map(l => l[c.id] ?? null)]))]]);
      this.modele = await this.port.modele();
      if (!this.modele.tables[reel]) throw new Error('table du modèle introuvable après création');
      await this.ouvrir(reel, reconnaitre(this.modele.tables[reel].colonnes, reel).mapping, null);
      return this.pret;
    } catch (e) {
      this.notifier({ cle: raisonRefus(e), type: 'erreur', detail: e.message });
      return false;
    } finally { this.occupe--; this.emettre(); }
  }

  // ---------- la mise en place : le pop-up de premier lancement ----------
  // L'état du pop-up est ici, sans DOM : { ouverte, etape, choix: 'existante' | 'creer', table, nom, exemples, mapping, ambigus, erreurs }.
  demanderMiseEnPlace(options = {}) {
    if (this.lectureSeule) return false;
    if (this.miseEnPlace.ouverte && !options.etape) return true; // déjà ouverte : on ne remet pas à zéro ce que la personne a choisi
    const reco = recommandation(this.tablesPossibles());
    const avant = this.miseEnPlace;
    const table = options.table ?? avant.table ?? reco.table;
    const colonnes = this.modele.tables[table]?.colonnes ?? [];
    const propose = table && colonnes.length ? reconnaitre(colonnes, table) : { mapping: {}, ambigus: {} };
    this.miseEnPlace = {
      ouverte: true, etape: options.etape ?? etapeDepart({ attenteAcces: this.attenteAcces }), choix: options.choix ?? reco.choix, table,
      nom: avant.nom ?? nomTable('', Object.keys(this.modele.tables)), exemples: avant.exemples ?? false,
      mapping: options.mapping ?? propose.mapping, ambigus: options.mapping ? {} : propose.ambigus, erreurs: options.erreurs ?? [],
    };
    this.emettre('mep');
    return true;
  }

  majMiseEnPlace(partiel) { this.miseEnPlace = { ...this.miseEnPlace, ...partiel }; this.emettre('mep'); }
  fermerMiseEnPlace() { this.majMiseEnPlace({ ouverte: false }); }
  choisirTableMiseEnPlace(table) {
    const colonnes = this.modele.tables[table]?.colonnes ?? [];
    const propose = reconnaitre(colonnes, table);
    this.majMiseEnPlace({ table, choix: 'existante', mapping: propose.mapping, ambigus: propose.ambigus, erreurs: [] });
  }
  roleMiseEnPlace(role, colId) { this.majMiseEnPlace({ mapping: { ...this.miseEnPlace.mapping, [role]: colId }, erreurs: [] }); }

  // Le geste qui termine : crée la table (après l'accord que le bouton nomme) ou relie la table choisie, puis rejoue la tâche tapée en attendant.
  async terminerMiseEnPlace() {
    const m = this.miseEnPlace;
    if (m.choix === 'creer') await this.creerModele(nomTable(m.nom, Object.keys(this.modele.tables)), { exemples: m.exemples });
    else {
      const v = verifier(m.mapping, this.modele.tables[m.table]?.colonnes ?? [], m.table);
      if (!v.ok) { this.majMiseEnPlace({ erreurs: v.erreurs }); return false; }
      await this.ouvrir(m.table, { ...m.mapping }, null);
    }
    if (!this.pret) return false;
    this.fermerMiseEnPlace();
    const attente = this.tacheEnAttente;
    this.tacheEnAttente = null;
    if (attente) await this.ajouter(adapterTache(attente.parRole, this.mapping, this.choix('statut')), attente.libelle);
    else this.notifier({ cle: 'mep.pret', type: 'ok' });
    return true;
  }

  // ---------- aides pour les vues ----------
  estTermineChoix() { return this.choix('statut').find(c => /^(termin|fini|fait|done|complet|clos|closed|livr)/.test(c.valeur.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()))?.valeur ?? null; }
  premierStatut() { return this.choix('statut').find(c => c.valeur !== this.estTermineChoix())?.valeur ?? this.choix('statut')[0]?.valeur ?? ''; }
}
