// Point d'entrée : thème et langue d'abord (sinon la page s'affiche en clair, en français, puis bascule), puis le lien avec GFS, puis le port de données (Grist, ou la démonstration hors de Grist).
import { Theme } from '../kit/js/theme.js';
import { I18n } from '../kit/js/i18n.js';
import { GfsLink } from '../kit/js/gfs-link.js';
import { TEXTES } from './textes.js';
import { App } from './app.js';
import { monter } from './ui/rendu.js';
import { creerPortGrist } from './data/grist.js';
import { creerDemo } from './data/demo.js';

Theme.init({ storageKey: 'tuesday_theme' });
I18n.add(TEXTES);
I18n.init({ storageKey: 'tuesday_lang' });
I18n.translateDom();
GfsLink.onLanguage(langue => I18n.setLanguage(langue));

// Dans Grist, la page est un cadre et l'objet `grist` existe ; ailleurs (page publique, essai), c'est la démonstration, clairement annoncée.
const dansGrist = typeof window.grist === 'object' && window.parent !== window;

async function demarrer() {
  await GfsLink.ready;
  const racine = document.getElementById('tuesday');
  const contexte = GfsLink.context();
  let port;
  if (dansGrist) {
    window.grist.ready({ requiredAccess: 'full' });
    port = creerPortGrist(window.grist, { lectureSeule: Boolean(contexte?.lectureSeule) });
  } else port = creerDemo({ variante: new URLSearchParams(window.location.search).get('demo') });
  const nom = (await port.nomDocument?.()) ?? contexte?.document ?? port.document;
  const app = new App(port, { document: String(contexte?.document ?? nom ?? 'seul') });
  window.__tuesday = app;
  monter(racine, app);
  app.attendreAcces();
  await app.init();
}

demarrer();
