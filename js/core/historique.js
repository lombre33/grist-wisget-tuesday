// Annuler / Rétablir à 100 % : chaque pas garde l'inverse de ses écritures (anciennes valeurs par colonne) et n'écrase jamais ce qu'une autre personne a changé depuis.
// Trois sortes d'opérations : « maj » (UpdateRecord), « ajout » (AddRecord, id connu une fois créé), « suppr » (RemoveRecord, valeurs gardées pour rendre la ligne).
import { actionRestauration, actionSuppression } from './ecritures.js';

const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function actionsPour(op, sens) {
  const annule = sens === 'annuler';
  if (op.type === 'maj') return [['UpdateRecord', op.table, op.id, annule ? op.avant : op.apres]];
  if (op.type === 'ajout') return [annule ? actionSuppression(op.table, op.id) : actionRestauration(op.table, op.id, op.valeurs)];
  return [annule ? actionRestauration(op.table, op.id, op.valeurs) : actionSuppression(op.table, op.id)];
}

// Vrai si la ligne est encore dans l'état que ce pas avait laissé (pour annuler) ou dans celui d'avant (pour rétablir).
function coherent(op, sens, lire) {
  const ligne = lire(op.table, op.id);
  const annule = sens === 'annuler';
  if (op.type === 'maj') {
    if (!ligne) return false;
    const attendu = annule ? op.apres : op.avant;
    return Object.keys(attendu).every(col => egal(ligne[col], attendu[col]));
  }
  const doitExister = (op.type === 'ajout') === annule;
  return doitExister ? Boolean(ligne) : !ligne;
}

export class Historique {
  constructor(max = 200) { this.max = max; this.passes = []; this.refaits = []; }

  pousser(pas) {
    if (!pas?.ops?.length) return;
    this.passes.push(pas);
    if (this.passes.length > this.max) this.passes.shift();
    this.refaits = [];
  }

  get peutAnnuler() { return this.passes.length > 0; }
  get peutRetablir() { return this.refaits.length > 0; }
  get libelleAnnuler() { return this.passes.at(-1)?.libelle ?? ''; }
  get libelleRetablir() { return this.refaits.at(-1)?.libelle ?? ''; }

  // Prépare sans rien changer : { ok, actions, pas } ou { ok: false, raison: 'vide' | 'conflit' }.
  preparer(sens, lire) {
    const pile = sens === 'annuler' ? this.passes : this.refaits;
    const pas = pile.at(-1);
    if (!pas) return { ok: false, raison: 'vide' };
    const ops = sens === 'annuler' ? [...pas.ops].reverse() : pas.ops;
    if (!ops.every(op => coherent(op, sens, lire))) return { ok: false, raison: 'conflit', pas };
    return { ok: true, pas, actions: ops.flatMap(op => actionsPour(op, sens)) };
  }

  // À appeler une fois l'écriture réussie.
  valider(sens) {
    if (sens === 'annuler') { const p = this.passes.pop(); if (p) this.refaits.push(p); } else { const p = this.refaits.pop(); if (p) this.passes.push(p); }
  }

  // Un pas qui ne peut plus s'annuler (conflit) est retiré pour ne pas bloquer les suivants.
  abandonner(sens) { (sens === 'annuler' ? this.passes : this.refaits).pop(); }

  // Quand le pas contient un ajout, l'identifiant n'est connu qu'après Grist.
  renseignerId(pas, indexOp, id) { pas.ops[indexOp].id = id; }
}
