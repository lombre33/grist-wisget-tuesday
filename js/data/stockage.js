// Les choix de la personne : chez GFS quand il héberge l'app (le cadre n'a pas de localStorage), dans le navigateur sinon ; tout accès dans un try/catch, l'app marche sans.
import { GfsLink } from '../../kit/js/gfs-link.js';

export function lireChoix(cle) {
  try {
    if (GfsLink.hosted) { const v = GfsLink.storageGet(cle); return typeof v === 'string' ? v : null; }
    return localStorage.getItem(cle);
  } catch (e) {
    return null;
  }
}

export function ecrireChoix(cle, valeur) {
  try {
    if (GfsLink.hosted) GfsLink.storageSet(cle, valeur);
    else if (valeur === null) localStorage.removeItem(cle);
    else localStorage.setItem(cle, valeur);
    return true;
  } catch (e) {
    return false;
  }
}
