// Texte : comparaison sans accents, casse ni ponctuation (charte, recherche) ; recherche par mots dans n'importe quel ordre.

export function normaliser(texte) {
  if (texte === null || texte === undefined) return '';
  return String(texte)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/gi, 'oe')
    .replace(/æ/gi, 'ae')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function correspond(requete, textes) {
  const mots = normaliser(requete).split(' ').filter(Boolean);
  if (!mots.length) return true;
  const botte = normaliser((Array.isArray(textes) ? textes : [textes]).join(' '));
  return mots.every(mot => botte.includes(mot));
}

export function tronquer(texte, max) {
  const t = String(texte ?? '');
  return t.length <= max ? t : `${t.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function initiales(nom) {
  const mots = normaliser(nom).split(' ').filter(Boolean);
  if (!mots.length) return '?';
  const brut = String(nom).trim().split(/[\s\-.]+/).filter(Boolean);
  const pris = (brut.length > 1 ? [brut[0], brut.at(-1)] : [brut[0]]).map(m => m[0].toUpperCase());
  return pris.join('');
}
