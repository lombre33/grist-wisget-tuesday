// La réponse de Tuesday à `fermer` (consigne 013 de GFS) : le DOM et la fenêtre de question autour de la décision de core/fermeture.js.
import { I18n } from '../../kit/js/i18n.js';
import { Dialogs } from '../../kit/js/dialogs.js';
import { repondreFermer } from '../core/fermeture.js';

const t = (cle, vars) => I18n.t(cle, vars);
const CHAMPS = '.tu-ajout-champ';

// Les champs d'ajout (tableau, kanban, sous-tâche de la fiche) où un titre a été tapé sans Entrée.
export const champsEnAttente = racine => [...racine.querySelectorAll(CHAMPS)].filter(c => c.value.trim() !== '');

export function reponseFermer(app, racine = document) {
  const sortie = () => { const actif = racine.activeElement ?? document.activeElement; if (actif && actif !== racine.body && typeof actif.blur === 'function') actif.blur(); };
  return repondreFermer({
    validerSaisie: sortie,
    attendreEcritures: () => app.attendreEcritures(),
    brouillons: () => (app.lectureSeule ? [] : [...champsEnAttente(racine).map(c => c.value.trim()), ...(app.tacheEnAttente ? [app.tacheEnAttente.parRole?.titre ?? '…'] : [])]),
    demander: liste => Dialogs.choose({
      title: t('fermer.titre'), message: t('fermer.message', { n: liste.length, titres: liste.map(x => `« ${x} »`).join(', ') }), cancelLabel: t('fermer.annuler'),
      choices: [...(app.pret ? [{ value: 'enregistrer', label: t('fermer.enregistrer'), primary: true }] : []), { value: 'abandonner', label: t('fermer.abandonner') }],
    }),
    enregistrer: async () => {
      const avant = app.message?.id;
      for (const champ of champsEnAttente(racine)) champ.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); // la même voie que la touche Entrée : le groupe ou la tâche parente sont gardés
      await app.attendreEcritures();
      return !(app.message?.type === 'erreur' && app.message.id !== avant);
    },
  });
}

// Branche la réponse sur le lien de GFS (kit 0.9.0, consignes 013 et 014) : `onClose(fn)` rappelle `fn({ raison })` à chaque `fermer` ; le kit attend exactement `true` pour laisser partir l'app
// (il écrit lui-même l'enveloppe `{ ferme }`), tout autre retour garde la personne ici. Rend de quoi se désabonner, ou null quand le lien ne sait pas recevoir `fermer` (kit d'avant) : GFS
// prend alors l'app pour « elle part sans rien dire ».
export function brancherFermeture(lien, app, racine = document) {
  return typeof lien.onClose === 'function' ? lien.onClose(async () => (await reponseFermer(app, racine)).ferme === true) : null;
}
