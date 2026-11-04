// Quand GFS va laisser la place à une autre app ou à un autre fichier, il appelle `fermer { raison }` et ne détruit le cadre qu'après la réponse `{ ferme: true }` (consigne 013 de GFS ; contrats 5.4,
// point 3). Tuesday écrit chaque geste tout de suite : il n'a « en attente » qu'une saisie dont on n'est pas sorti, une écriture en cours, et un titre tapé dans un champ d'ajout sans Entrée.
// Ce module est la décision, sans DOM ni Grist : tout ce qu'il touche lui est donné.
//   validerSaisie()          sort du champ en cours (sa sortie enregistre la saisie) ;
//   attendreEcritures()      rend vrai quand plus aucune écriture n'est en cours, faux si elles n'ont pas fini à temps ;
//   brouillons()             les titres tapés et jamais ajoutés ;
//   demander(brouillons)     la question de Tuesday : 'enregistrer', 'abandonner' ou null (annulé) ;
//   enregistrer(brouillons)  ajoute ces tâches et rend vrai si tout est écrit.
export async function repondreFermer({ validerSaisie, attendreEcritures, brouillons, demander, enregistrer }) {
  validerSaisie();
  if (!(await attendreEcritures())) return { ferme: false }; // jamais « oui » avant d'avoir fini d'écrire
  const liste = brouillons();
  if (liste.length === 0) return { ferme: true };
  const choix = await demander(liste);
  if (choix === 'abandonner') return { ferme: true };
  if (choix !== 'enregistrer') return { ferme: false }; // Annuler ou Échap : tout reste en place
  if (!(await enregistrer(liste)) || !(await attendreEcritures())) return { ferme: false };
  return { ferme: true };
}
