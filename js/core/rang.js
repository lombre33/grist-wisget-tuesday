// Ordre manuel par rang fractionnaire : déplacer une carte n'écrit qu'une valeur (celle de la carte), entre ses deux voisines. Si les rangs manquent ou se touchent, on renumérote.

const PAS = 1024;

// items : tâches de la colonne, dans l'ordre affiché, sans la tâche déplacée. index : où elle se pose (0 = en tête).
// Renvoie la liste des { id, ordre } à écrire : une seule entrée dans le cas courant.
export function planDeplacement(items, idDeplacee, index) {
  const i = Math.max(0, Math.min(index, items.length));
  const avant = items[i - 1]?.ordre ?? null;
  const apres = items[i]?.ordre ?? null;
  if (items.length === 0) return [{ id: idDeplacee, ordre: PAS }];
  if (items[i - 1] && avant === null || items[i] && apres === null) return renumeroter(items, idDeplacee, i);
  if (avant !== null && apres !== null) {
    const milieu = (avant + apres) / 2;
    if (milieu > avant && milieu < apres && Number.isFinite(milieu)) return [{ id: idDeplacee, ordre: milieu }];
    return renumeroter(items, idDeplacee, i);
  }
  if (avant !== null) return [{ id: idDeplacee, ordre: avant + PAS }];
  return [{ id: idDeplacee, ordre: apres - PAS }];
}

function renumeroter(items, idDeplacee, index) {
  const ordre = [...items.slice(0, index).map(t => t.id), idDeplacee, ...items.slice(index).map(t => t.id)];
  const actuels = new Map(items.map(t => [t.id, t.ordre]));
  return ordre.map((id, k) => ({ id, ordre: (k + 1) * PAS })).filter(e => e.id === idDeplacee || actuels.get(e.id) !== e.ordre);
}

// Rang pour une nouvelle tâche en fin de liste.
export function rangFin(taches) {
  const max = taches.reduce((m, t) => (t.ordre !== null && t.ordre > m ? t.ordre : m), 0);
  return max + PAS;
}
