// Qui est là. GFS donne l'adresse e-mail de la personne (`GfsLink.identity()`), à l'app qui l'a déclarée ; elle reconnaît la personne parmi les responsables en la comparant,
// en minuscules, à l'adresse que la table des personnes garde. Sans adresse reconnue, c'est le choix « Je suis… » qui sert.

const COURRIEL = /mail|courriel/i;

export const minuscules = texte => (typeof texte === 'string' ? texte.trim().toLowerCase() : '');

// La colonne qui garde l'adresse dans une table de personnes : une colonne de texte dont l'identifiant ou le libellé parle de courriel, ou null. La première dans l'ordre de la table.
export function colonneCourriel(colonnes) {
  const texte = (colonnes ?? []).filter(c => String(c.type || '').split(':')[0] === 'Text');
  return texte.find(c => COURRIEL.test(c.id) || COURRIEL.test(c.libelle ?? ''))?.id ?? null;
}

// L'adresse de chaque ligne d'une table de personnes : Map(identifiant → adresse en minuscules), les lignes sans adresse écartées.
export function courriels(lignes, colId) {
  const m = new Map();
  if (!colId) return m;
  for (const l of lignes ?? []) {
    const a = minuscules(l[colId]);
    if (a.includes('@')) m.set(l.id, a);
  }
  return m;
}

// L'identifiant du responsable qui a cette adresse, ou null. `parId` : Map(identifiant → adresse) ; `libelles` (colonne de texte) : [{ id, label }] dont l'étiquette est elle-même l'adresse.
export function reconnaitre({ email, parId = null, libelles = [] }) {
  const a = minuscules(email);
  if (!a.includes('@')) return null;
  if (parId) for (const [id, adresse] of parId) if (adresse === a) return id;
  return libelles.find(p => minuscules(p.label) === a)?.id ?? null;
}

// La personne qui est là : celle que reconnaît son adresse, sinon le choix « Je suis… », sinon personne.
export function moiEffectif({ reconnue, choisie }) {
  return reconnue ?? choisie ?? null;
}
