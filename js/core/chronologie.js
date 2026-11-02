// Chronologie : échelle (jours → pixels), barres, jalons, en-têtes, déplacement et redimensionnement. Des nombres seulement : le dessin est dans ui/.
import { ajouterJours, debutMois, debutSemaine, ecartJours, finMois, ajouterMois, estValide, etiquette, jourSemaine, maxIso, minIso, semaineIso } from './dates.js';
import { etendue } from './taches.js';

export const ZOOMS = ['semaine', 'mois', 'trimestre', 'annee'];
const PX = { semaine: 44, mois: 18, trimestre: 6, annee: 2 };
const MARGE = { semaine: 7, mois: 21, trimestre: 45, annee: 90 };

export function echelle(taches, zoom, aujourdhui) {
  const z = ZOOMS.includes(zoom) ? zoom : 'mois';
  const d = etendue(taches);
  let debut = minIso(d?.debut ?? aujourdhui, aujourdhui);
  let fin = maxIso(d?.fin ?? aujourdhui, aujourdhui);
  debut = ajouterJours(debut, -MARGE[z]);
  fin = ajouterJours(fin, MARGE[z]);
  debut = z === 'trimestre' || z === 'annee' ? debutMois(debut) : debutSemaine(debut);
  fin = z === 'trimestre' || z === 'annee' ? finMois(fin) : ajouterJours(debutSemaine(fin), 6);
  return { zoom: z, debut, fin, jours: ecartJours(debut, fin) + 1, px: PX[z], aujourdhui };
}

export const xDe = (iso, ech) => ecartJours(ech.debut, iso) * ech.px;
export const jourDe = (x, ech) => ajouterJours(ech.debut, Math.floor(x / ech.px));

// Une barre couvre ses jours entiers (la fin est incluse). Un jalon est un losange sur un jour.
export function barre(t, ech) {
  if (!t.debutEff) return null;
  const x = xDe(t.debutEff, ech);
  const jours = ecartJours(t.debutEff, t.finEff) + 1;
  return { id: t.id, x, largeur: Math.max(jours * ech.px, t.jalon ? ech.px : 4), jours, jalon: t.jalon };
}

export function entetes(ech, langue = 'fr') {
  const haut = [];
  const bas = [];
  if (ech.zoom === 'semaine' || ech.zoom === 'mois') {
    for (let m = debutMois(ech.debut); m <= ech.fin; m = ajouterMois(m, 1)) {
      const a = m < ech.debut ? ech.debut : m;
      const b = finMois(m) > ech.fin ? ech.fin : finMois(m);
      haut.push({ x: xDe(a, ech), largeur: (ecartJours(a, b) + 1) * ech.px, label: etiquette(m, langue, { month: 'long', year: 'numeric' }) });
    }
  } else {
    for (let a = ech.debut; a <= ech.fin; a = `${Number(a.slice(0, 4)) + 1}-01-01`) {
      const fin = `${a.slice(0, 4)}-12-31` > ech.fin ? ech.fin : `${a.slice(0, 4)}-12-31`;
      haut.push({ x: xDe(a, ech), largeur: (ecartJours(a, fin) + 1) * ech.px, label: a.slice(0, 4) });
    }
  }
  if (ech.zoom === 'semaine') {
    for (let j = ech.debut; j <= ech.fin; j = ajouterJours(j, 1)) bas.push({ x: xDe(j, ech), largeur: ech.px, label: String(Number(j.slice(8))), weekend: jourSemaine(j) >= 5 });
  } else if (ech.zoom === 'mois') {
    for (let j = ech.debut; j <= ech.fin; j = ajouterJours(j, 7)) bas.push({ x: xDe(j, ech), largeur: 7 * ech.px, label: `S${semaineIso(j).semaine}`, weekend: false });
  } else {
    for (let m = ech.debut; m <= ech.fin; m = ajouterMois(m, 1)) bas.push({ x: xDe(m, ech), largeur: (ecartJours(m, finMois(m)) + 1) * ech.px, label: etiquette(m, langue, { month: ech.zoom === 'trimestre' ? 'short' : 'narrow' }), weekend: false });
  }
  return { haut, bas };
}

// Nouvelles dates en déplaçant la tâche de `delta` jours. Une seule date : celle-là bouge. Renvoie les seuls champs à écrire.
export function deplacer(t, delta) {
  const sortie = {};
  if (t.debut) sortie.debut = ajouterJours(t.debut, delta);
  if (t.fin) sortie.echeance = ajouterJours(t.fin, delta);
  return sortie;
}

// Redimensionner par un bord ; la fin ne passe jamais avant le début.
export function redimensionner(t, bord, delta) {
  if (bord === 'debut') {
    const debut = ajouterJours(t.debutEff, delta);
    return { debut: debut > t.finEff ? t.finEff : debut };
  }
  const fin = ajouterJours(t.finEff, delta);
  return { echeance: fin < t.debutEff ? t.debutEff : fin };
}

export const valide = jour => estValide(jour);
