// Le contrat du module Calendrier (integration-suite.md, 1) : des entrées { id, titre, debut, fin, statut, couleur, responsables, avecHeure, modifiable } en jours civils, fin incluse.

// Toutes les tâches : celles qui n'ont aucune date (`debut` et `fin` à null) vont dans le plateau « Sans date » du calendrier, d'où la personne les dépose sur un jour.
export function entrees(taches, { modifiable = true, couleurDe = () => null } = {}) {
  return taches.map(t => ({
    id: t.id, titre: t.titre, debut: t.debutEff || null, fin: t.finEff || null, statut: t.statut, couleur: couleurDe(t),
    responsables: t.responsables.map(r => r.label), avecHeure: false, modifiable,
  }));
}

// Ce qu'on écrit quand une entrée change de jour : seulement les dates que la tâche a déjà (jamais une date inventée). Une tâche sans date que la personne dépose sur un jour (plateau « Sans date »)
// reçoit l'échéance si la colonne est reliée, sinon le début ; rien à écrire si aucune des deux n'est reliée.
export function roleDeplacement(tache, debut, fin, mapping = null) {
  const parRole = {};
  if (tache.debut) parRole.debut = debut;
  if (tache.fin) parRole.echeance = fin;
  if (Object.keys(parRole).length === 0 && mapping) {
    if (mapping.echeance) parRole.echeance = fin; else if (mapping.debut) parRole.debut = debut;
  }
  return Object.keys(parRole).length ? parRole : null;
}
