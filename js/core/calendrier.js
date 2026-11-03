// Le contrat du module Calendrier (integration-suite.md, 1) : des entrées { id, titre, debut, fin, statut, couleur, responsables, avecHeure, modifiable } en jours civils, fin incluse.
import { grilleMois, ajouterJours, ecartJours } from './dates.js';

export function entrees(taches, { modifiable = true, couleurDe = () => null } = {}) {
  return taches.filter(t => t.debutEff).map(t => ({
    id: t.id, titre: t.titre, debut: t.debutEff, fin: t.finEff, statut: t.statut, couleur: couleurDe(t),
    responsables: t.responsables.map(r => r.label), avecHeure: false, modifiable,
  }));
}

// Les entrées d'un jour (une entrée sur plusieurs jours est dans chacun).
export const duJour = (liste, jour) => liste.filter(e => e.debut <= jour && jour <= e.fin);

export function grille(liste, mois) {
  return grilleMois(mois).map(semaine => semaine.map(jour => ({ jour, entrees: duJour(liste, jour) })));
}

// Déplacer une entrée sur un autre jour garde sa durée.
export function deplacee(entree, nouveauDebut) {
  const delta = ecartJours(entree.debut, nouveauDebut);
  return { debut: nouveauDebut, fin: ajouterJours(entree.fin, delta) };
}

// Ce qu'on écrit quand une entrée change de jour : seulement les dates que la tâche a déjà (jamais une date inventée). Rien à écrire si elle n'en a aucune.
export function roleDeplacement(tache, debut, fin) {
  const parRole = {};
  if (tache.debut) parRole.debut = debut;
  if (tache.fin) parRole.echeance = fin;
  return Object.keys(parRole).length ? parRole : null;
}
