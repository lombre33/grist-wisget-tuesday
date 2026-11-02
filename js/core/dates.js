// Dates civiles : un jour est un texte « AAAA-MM-JJ », sans fuseau, sans heure. Tout le calcul passe par l'UTC (jamais l'heure locale), ce qui évite le jour de moins du forum
// (échéance à J-1), le 31/12 qui passe en janvier et le 01/01/1970 d'une date vide. Grist donne une date en secondes (minuit UTC) ; un « DateTime » est lu dans son fuseau.

const JOUR = 86400;
const MOTIF = /^(\d{4})-(\d{2})-(\d{2})$/;

export function estValide(iso) {
  if (typeof iso !== 'string') return false;
  const m = MOTIF.exec(iso);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

function enJours(iso) {
  const m = MOTIF.exec(iso);
  return Math.round(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / (JOUR * 1000));
}

function depuisJours(jours) {
  const d = new Date(jours * JOUR * 1000);
  return `${String(d.getUTCFullYear()).padStart(4, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export const ajouterJours = (iso, n) => depuisJours(enJours(iso) + n);
export const ecartJours = (a, b) => enJours(b) - enJours(a);
export const comparer = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
export const minIso = (a, b) => (a && b ? (a <= b ? a : b) : a || b || null);
export const maxIso = (a, b) => (a && b ? (a >= b ? a : b) : a || b || null);

// Jour de la semaine, lundi = 0 … dimanche = 6.
export const jourSemaine = iso => (((enJours(iso) + 3) % 7) + 7) % 7;
export const debutSemaine = iso => ajouterJours(iso, -jourSemaine(iso));
export const debutMois = iso => `${iso.slice(0, 7)}-01`;
export function finMois(iso) {
  const [y, m] = [Number(iso.slice(0, 4)), Number(iso.slice(5, 7))];
  return depuisJours(Math.round(Date.UTC(y, m, 1) / (JOUR * 1000)) - 1);
}
export const ajouterMois = (iso, n) => {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7)) - 1 + n;
  const d = new Date(Date.UTC(y + Math.floor(m / 12), ((m % 12) + 12) % 12, 1));
  return depuisJours(Math.round(d.getTime() / (JOUR * 1000)));
};

// Numéro de semaine ISO 8601 : la semaine 1 contient le premier jeudi de l'année.
export function semaineIso(iso) {
  const jeudi = ajouterJours(iso, 3 - jourSemaine(iso));
  const annee = Number(jeudi.slice(0, 4));
  const premier = enJours(`${annee}-01-01`);
  return { annee, semaine: Math.floor((enJours(jeudi) - premier) / 7) + 1 };
}

// Aujourd'hui est la seule valeur lue en heure locale : le jour que la personne voit sur son calendrier.
export function aujourdhui(maintenant = new Date()) {
  return `${String(maintenant.getFullYear()).padStart(4, '0')}-${String(maintenant.getMonth() + 1).padStart(2, '0')}-${String(maintenant.getDate()).padStart(2, '0')}`;
}

// Date de Grist (secondes) vers un jour. Vide, non numérique ou 0 : « pas de date » (jamais 01/01/1970).
export function jourDepuisGrist(valeur, type = 'Date') {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur) || valeur === 0) return null;
  const fuseau = /^DateTime:(.+)$/.exec(type || '');
  if (!fuseau) return depuisJours(Math.floor(valeur / JOUR));
  return depuisParties(partiesDansFuseau(valeur, fuseau[1]));
}

const depuisParties = p => `${String(p.annee).padStart(4, '0')}-${String(p.mois).padStart(2, '0')}-${String(p.jour).padStart(2, '0')}`;

export function partiesDansFuseau(secondes, fuseau) {
  let format;
  try {
    format = new Intl.DateTimeFormat('en-GB', { timeZone: fuseau, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    format = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  const p = Object.fromEntries(format.formatToParts(new Date(secondes * 1000)).map(x => [x.type, x.value]));
  return { annee: Number(p.year), mois: Number(p.month), jour: Number(p.day), heure: Number(p.hour), minute: Number(p.minute), seconde: Number(p.second) };
}

function decalage(secondes, fuseau) {
  const p = partiesDansFuseau(secondes, fuseau);
  return Date.UTC(p.annee, p.mois - 1, p.jour, p.heure, p.minute, p.seconde) / 1000 - secondes;
}

// Jour vers la valeur à écrire. Date : minuit UTC. DateTime : la même heure dans le fuseau que l'ancienne valeur (midi si elle n'en avait pas).
export function jourVersGrist(iso, type = 'Date', ancienne = null) {
  if (!estValide(iso)) return null;
  const fuseau = /^DateTime:(.+)$/.exec(type || '');
  if (!fuseau) return enJours(iso) * JOUR;
  const heure = typeof ancienne === 'number' && ancienne !== 0 ? partiesDansFuseau(ancienne, fuseau[1]) : { heure: 12, minute: 0, seconde: 0 };
  const [y, m, d] = iso.split('-').map(Number);
  const local = Date.UTC(y, m - 1, d, heure.heure, heure.minute, heure.seconde) / 1000;
  return local - decalage(local, fuseau[1]);
}

// Les semaines (lundi à dimanche) qui couvrent un mois, pour la grille d'un calendrier.
export function grilleMois(iso) {
  const debut = debutSemaine(debutMois(iso));
  const fin = finMois(iso);
  const semaines = [];
  for (let jour = debut; jour <= fin; jour = ajouterJours(jour, 7)) semaines.push(Array.from({ length: 7 }, (_, i) => ajouterJours(jour, i)));
  return semaines;
}

// Étiquettes courtes, locales : « 3 nov. » ; la langue vient de l'appelant.
export function etiquette(iso, langue = 'fr', options = { day: 'numeric', month: 'short' }) {
  if (!estValide(iso)) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(langue, { ...options, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
}
