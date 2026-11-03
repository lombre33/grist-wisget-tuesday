// Entrée de la suite rapide du navigateur (essais.cjs) : la même app, branchée sur le port de test en mémoire (test/support/demo.js) et exposée en `window.__tuesday` pour piloter les essais.
// Ce fichier n'est lu que par le serveur d'essai ; l'app livrée (js/main.js) n'a ni port de démonstration ni point d'accès global. La vérité reste test/grist/ (un vrai Grist).
import { Theme } from '../../kit/js/theme.js';
import { I18n } from '../../kit/js/i18n.js';
import { GfsLink } from '../../kit/js/gfs-link.js';
import { TEXTES } from '../../js/textes.js';
import { App } from '../../js/app.js';
import { monter } from '../../js/ui/rendu.js';
import { creerDemo } from '../support/demo.js';

Theme.init({ storageKey: 'tuesday_theme' });
I18n.add(TEXTES);
I18n.init({ storageKey: 'tuesday_lang' });
I18n.translateDom();
await GfsLink.ready;
const port = creerDemo({ variante: new URLSearchParams(window.location.search).get('demo') });
const app = new App(port, { document: 'demonstration' });
window.__tuesday = app;
monter(document.getElementById('tuesday'), app);
await app.demarrer();
