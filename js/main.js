// Point d'entrée : thème et langue d'abord (sinon la page s'affiche en clair, en français, puis bascule), puis le lien avec GFS, puis le port de données (Grist, ou la démonstration hors de Grist).
import { Theme } from '../kit/js/theme.js';
import { I18n } from '../kit/js/i18n.js';
import { GfsLink } from '../kit/js/gfs-link.js';
import { Ambiance } from '../kit/js/ambiance.js';
import { TEXTES } from './textes.js';
import { App } from './app.js';
import { monter } from './ui/rendu.js';
import { creerPortGrist } from './data/grist.js';
import { ecranHorsGrist } from './ui/horsgrist.js';
import { chargerModule } from './ui/calendrier-hote.js';
import { brancherFermeture } from './ui/fermeture.js';

Theme.init({ storageKey: 'tuesday_theme' });
I18n.add(TEXTES);
I18n.init({ storageKey: 'tuesday_lang' });
I18n.translateDom();
GfsLink.onLanguage(langue => I18n.setLanguage(langue));
// L'ambiance que la personne a choisie dans GFS pour ses apps (couleurs et forme, par les jetons que lisent nos feuilles) ; seule, rien n'est posé.
Ambiance.start();

// Tuesday ne tourne que dans Grist (widget personnalisé) : la page est un cadre et l'objet `grist` existe. Ailleurs, un écran dit comment l'ouvrir ; rien d'autre n'est lancé.
const dansGrist = typeof window.grist === 'object' && window.parent !== window;

async function demarrer() {
  await GfsLink.ready;
  const racine = document.getElementById('tuesday');
  const contexte = GfsLink.context();
  if (!dansGrist) { racine.replaceChildren(ecranHorsGrist()); return; }
  window.grist.ready({ requiredAccess: 'full' });
  const port = creerPortGrist(window.grist, { lectureSeule: Boolean(contexte?.lectureSeule) });
  const nom = (await port.nomDocument?.()) ?? contexte?.document ?? port.document;
  const app = new App(port, { document: String(contexte?.document ?? nom ?? 'seul') });
  app.suivreIdentite();
  brancherFermeture(GfsLink, app); // `fermer` de GFS : enregistrer ce qui attend avant de laisser la place (consigne 013)
  app.moduleCalendrier = await chargerModule(); // le calendrier du kit (Calendar+) ; s'il ne se charge pas, la vue Calendrier le dit
  monter(racine, app);
  app.attendreAcces();
  await app.demarrer();
  // GFS demande d'ouvrir un projet de Tuesday (lié par une autre app, ou choisi dans l'explorateur) : on ouvre le projet désigné, rien d'autre.
  GfsLink.onOpen(requete => app.liens.ouvrirDemande(requete));
  if (GfsLink.opening()) await app.liens.ouvrirDemande(GfsLink.opening());
}

demarrer();
