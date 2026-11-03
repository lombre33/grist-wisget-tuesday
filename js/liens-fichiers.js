// Les liens vers les fichiers d'autres apps, côté app (DOM-free) : lire `Tuesday_Liens`, lier par `GfsLink.choose`, ouvrir par `GfsLink.openFile`, retirer. Seule (pas dans GFS), l'app n'appelle personne :
// « Lier un fichier » et « Ouvrir » restent grisés avec leur raison. La table n'est créée qu'après l'accord de la personne (le dialogue est dans l'interface, `creerTable`).
import { TABLE_LIENS, COLONNES_LIENS, TYPES_LIENS, lienDepuisLigne, liensDe, cleLien, versLigneLien, suiteRefus } from './core/liens.js';
import { actionSuppression, actionRestauration } from './core/ecritures.js';
import { jourVersGrist } from './core/dates.js';

export class LiensFichiers {
  constructor(app, lien) { this.app = app; this.lien = lien; this.liens = []; this.parId = new Map(); this.introuvables = new Set(); }

  get actifs() { return Boolean(this.lien?.hosted); }
  get tableExiste() { return Boolean(this.app.modele.tables[TABLE_LIENS]); }
  de(tacheId) { return liensDe(this.liens, this.app.source, tacheId); }
  ligne(id) { return this.parId.get(id); }
  estIntrouvable(lien) { return this.introuvables.has(cleLien(lien)); }

  // La raison d'un grisé (texte à traduire) ou null.
  raison(geste, lien = null) {
    if (!this.actifs) return 'liens.seule';
    if ((geste === 'lier' || geste === 'retirer') && this.app.lectureSeule) return 'refus.lectureSeule';
    if (geste === 'ouvrir' && lien && this.estIntrouvable(lien)) return 'liens.introuvable';
    return null;
  }

  async lire() {
    if (!this.tableExiste) { this.liens = []; this.parId = new Map(); return; }
    try {
      const rows = await this.app.port.lignes(TABLE_LIENS);
      this.liens = rows.map(lienDepuisLigne).filter(Boolean);
      this.parId = new Map(this.liens.map(l => [l.id, rows.find(r => r.id === l.id)]));
    } catch (e) { this.liens = []; this.parId = new Map(); }
  }

  // La personne désigne un fichier dans l'explorateur de GFS : { app, id, nom, type }, null si elle annule ou si GFS refuse (la raison est dite).
  async choisir(titre) {
    try { return await this.lien.choose({ types: TYPES_LIENS, titre }); } catch (e) { this.dire(e); return null; }
  }

  dire(e) {
    const s = suiteRefus(e?.code);
    if (s.avertir && typeof console !== 'undefined') console.warn('Tuesday : GFS a refusé la demande de lien', e?.code, e?.message);
    if (s.dire) this.app.notifier({ texte: String(e?.message ?? e), type: 'erreur' });
  }

  // Écrit le lien (crée la table au besoin : l'accord est déjà donné). Annuler le retire.
  async lier(tacheId, choix, libelle) {
    const app = this.app;
    if (app.verrou()) return false;
    const valeurs = versLigneLien({ table: app.source, ligne: tacheId, choix, jour: jourVersGrist(app.aujourdhui) });
    if (!valeurs) { app.notifier({ cle: 'liens.invalide', type: 'erreur' }); return false; }
    app.occupe++;
    try {
      if (!this.tableExiste) {
        await app.port.appliquer([['AddTable', TABLE_LIENS, COLONNES_LIENS.map(([id, type]) => ({ id, type, isFormula: false }))]]);
        app.modele = await app.port.modele();
        if (!this.tableExiste) throw new Error('table des liens introuvable après création');
      }
      const retours = await app.port.appliquer([['AddRecord', TABLE_LIENS, null, valeurs]]);
      const id = Array.isArray(retours) ? retours[0] : retours;
      app.historique.pousser({ libelle, ops: [{ type: 'ajout', table: TABLE_LIENS, id, valeurs }] });
      await app.lire();
      app.notifier({ texte: libelle, type: 'ok', annulable: true });
      return true;
    } catch (e) { app.notifier({ cle: 'refus.autre', type: 'erreur', detail: e.message }); return false; } finally { app.occupe--; app.emettre(); }
  }

  async retirer(lienId, libelle) {
    const app = this.app;
    const ligne = this.parId.get(lienId);
    if (!ligne || app.verrou()) return false;
    const { id, ...valeurs } = ligne;
    app.occupe++;
    try {
      await app.port.appliquer([actionSuppression(TABLE_LIENS, lienId)]);
      app.historique.pousser({ libelle, ops: [{ type: 'suppr', table: TABLE_LIENS, id: lienId, valeurs }] });
      await app.lire();
      app.notifier({ texte: libelle, type: 'ok', annulable: true });
      return true;
    } catch (e) { app.notifier({ cle: 'refus.autre', type: 'erreur', detail: e.message }); return false; } finally { app.occupe--; app.emettre(); }
  }

  // Vers une autre app, la nôtre s'en va et la promesse ne se règle pas : on finit donc d'abord nos écritures.
  async ouvrir(lien) {
    const app = this.app;
    if (!this.actifs || this.estIntrouvable(lien)) return false;
    while (app.occupe) await new Promise(r => setTimeout(r, 20));
    try { return await this.lien.openFile({ app: lien.app, id: lien.fichier, type: lien.type }); } catch (e) {
      if (suiteRefus(e?.code).introuvable) { this.introuvables.add(cleLien(lien)); app.emettre(); } else this.dire(e);
      return false;
    }
  }

  // GFS demande d'ouvrir un projet de Tuesday (un autre l'a lié, ou l'explorateur) : on ouvre le projet désigné, rien d'autre.
  async ouvrirDemande(requete) {
    const id = String(requete?.fichier?.id ?? '');
    const projet = id ? this.app.projets.find(p => String(p.id) === id) : null;
    if (!projet) return false;
    await this.app.ouvrirProjet(projet);
    return true;
  }
}
