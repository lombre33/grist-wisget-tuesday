// « Colorier par » : la couleur d'une tâche vient du document (couleurs des choix de Grist) ; pour un responsable ou un groupe sans couleur, une teinte déduite du nom (même nom, même couleur).
import { normaliser } from '../core/texte.js';

function teinte(texte) {
  let n = 0;
  for (const c of normaliser(texte)) n = (n * 31 + c.charCodeAt(0)) % 360;
  return n;
}

export const parNom = nom => { const h = teinte(nom); return { fond: `hsl(${h} 70% 88%)`, texte: `hsl(${h} 60% 22%)` }; };

function deChoix(app, role, valeur) {
  const c = app.choix(role).find(x => x.valeur === valeur);
  return c?.fond ? { fond: c.fond, texte: c.texte } : null;
}

export function couleurTache(app, tache) {
  const par = app.reglages.colorier;
  if (par === 'statut') return deChoix(app, 'statut', tache.statut);
  if (par === 'priorite') return deChoix(app, 'priorite', tache.priorite);
  if (par === 'groupe') return tache.groupe ? deChoix(app, 'groupe', tache.groupe) ?? parNom(tache.groupe) : null;
  return tache.responsables[0] ? parNom(tache.responsables[0].label) : null;
}
