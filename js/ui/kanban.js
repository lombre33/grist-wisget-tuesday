// Vue Kanban : une colonne par statut (ordre et couleurs de Grist), cartes pauvres, glisser-déposer (changer de statut, réordonner si une colonne Ordre est reliée), ajout rapide par colonne.
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { icone } from './icones.js';
import { pastille, avatars, puce } from './pastille.js';
import { couleurTache } from './couleurs.js';
import { colonnesKanban } from '../core/vue.js';
import { planDeplacement } from '../core/rang.js';
import { etiquette } from '../core/dates.js';

const t = (cle, vars) => I18n.t(cle, vars);
let enCours = null; // la carte glissée : { id }

function carte(app, tache, actions) {
  const c = couleurTache(app, tache);
  const parent = tache.parentId ? app.tache(tache.parentId) : null;
  const enfants = app.arbre.enfants.get(tache.id)?.length ?? 0;
  const prio = app.mapping.priorite && tache.priorite ? h('span', { class: `tu-prio est-rang-${Math.min(3, Math.max(0, app.choix('priorite').findIndex(x => x.valeur === tache.priorite)))}` }, h('span', { class: 'tu-prio-point', 'aria-hidden': 'true' }), tache.priorite) : null;
  return h('article', {
    class: `tu-carte${app.selection === tache.id ? ' est-selectionnee' : ''}${tache.termine ? ' est-terminee' : ''}`, draggable: app.lectureSeule ? null : 'true', tabindex: '0', dataset: { id: tache.id },
    vars: c?.fond ? { '--c-fond': c.fond } : {},
    on: {
      click: () => actions.ouvrirFiche(tache.id),
      keydown: e => { if (e.key === 'Enter') actions.ouvrirFiche(tache.id); },
      dragstart: e => { enCours = { id: tache.id }; e.dataTransfer?.setData('text/plain', String(tache.id)); if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'; e.currentTarget.classList.add('est-glissee'); },
      dragend: e => { enCours = null; e.currentTarget.classList.remove('est-glissee'); document.querySelectorAll('.est-cible').forEach(x => x.classList.remove('est-cible')); },
    },
  },
  parent ? h('div', { class: 'tu-carte-parent' }, icone('sous', 12), parent.titre || t('champ.sansTitre')) : null,
  h('div', { class: 'tu-carte-titre' }, tache.titre || t('champ.sansTitre')),
  h('div', { class: 'tu-carte-meta' },
    tache.fin ? h('span', { class: `tu-carte-date${tache.enRetard ? ' est-retard' : ''}` }, etiquette(tache.fin, I18n.language), tache.enRetard ? ` · ${t('statut.retard')}` : '') : null,
    prio, enfants ? h('span', { class: 'tu-sous' }, `${app.arbre.enfants.get(tache.id).filter(x => x.termine).length}/${enfants}`) : null,
    tache.bloqueePar.length ? h('span', { class: 'tu-bloquee', title: t('champ.bloquee') }, icone('cadenas', 12)) : null,
    tache.etiquettes.slice(0, 2).map(puce), tache.responsables.length ? h('span', { class: 'tu-carte-resp' }, avatars(tache.responsables, 2)) : null));
}

function indiceDepose(corps, y) {
  const cartes = [...corps.querySelectorAll('.tu-carte:not(.est-glissee)')];
  const i = cartes.findIndex(c => y < c.getBoundingClientRect().top + c.offsetHeight / 2);
  return i < 0 ? cartes.length : i;
}

async function deposer(app, colonne, corps, e) {
  e.preventDefault();
  const id = enCours?.id ?? Number(e.dataTransfer?.getData('text/plain'));
  enCours = null;
  const tache = app.tache(id);
  if (!tache) return;
  const index = indiceDepose(corps, e.clientY);
  const autres = colonne.taches.filter(x => x.id !== id);
  const lot = [];
  const memeColonne = (tache.statut || '') === (colonne.cle || '');
  const reordonne = app.mapping.ordre && app.reglages.tri === 'manuel';
  if (!memeColonne) lot.push({ id, parRole: { statut: colonne.cle } });
  if (reordonne) for (const m of planDeplacement(autres, id, index)) { const ex = lot.find(l => l.id === m.id); if (ex) ex.parRole.ordre = m.ordre; else lot.push({ id: m.id, parRole: { ordre: m.ordre } }); }
  else if (memeColonne) return app.notifier({ cle: app.mapping.ordre ? 'raison.triManuel' : 'raison.ordre', type: 'info' });
  if (lot.length) await app.modifierLot(lot, memeColonne ? t('msg.reordonnee') : t('msg.deplacee'));
}

function ajoutColonne(app, colonne, actions) {
  if (app.lectureSeule) return null;
  const cle = `ajout:${colonne.cle}`;
  return h('input', { class: 'tu-ajout-champ tu-ajout-colonne', type: 'text', placeholder: t('champ.ajouter'), 'aria-label': t('champ.ajouter'), autocomplete: 'off', dataset: { ajout: cle },
    on: {
      keydown: async e => {
        if (e.key !== 'Enter' || !e.target.value.trim()) return;
        const titre = e.target.value.trim();
        e.target.value = '';
        actions.garderFocus(cle);
        await app.ajouter({ titre, statut: colonne.sans ? '' : colonne.cle }, t('msg.ajoutee'));
      },
      focus: () => { app.enSaisie = () => true; }, blur: () => { app.enSaisie = null; if (app.enAttente) app.rafraichir(); },
    } });
}

function colonne(app, col, actions) {
  const ferme = app.reglages.replies.includes(`k:${col.cle}`);
  const corps = h('div', { class: 'tu-colonne-corps', dataset: { defile: `col:${col.cle}` } }, col.taches.map(x => carte(app, x, actions)));
  const el = h('section', { class: `tu-colonne${ferme ? ' est-repliee' : ''}`, dataset: { statut: col.cle }, 'aria-label': col.label,
    on: {
      dragover: e => { if (!enCours) return; e.preventDefault(); el.classList.add('est-cible'); },
      dragleave: e => { if (!el.contains(e.relatedTarget)) el.classList.remove('est-cible'); },
      drop: e => { el.classList.remove('est-cible'); deposer(app, col, corps, e); },
    } },
  h('header', { class: 'tu-colonne-tete' },
    h('button', { type: 'button', class: 'tu-colonne-repli', 'aria-expanded': String(!ferme), title: ferme ? t('champ.deplier') : t('champ.replier'), on: { click: () => actions.basculerReplie(`k:${col.cle}`) } },
      col.sans ? h('span', { class: 'tu-groupe-nom' }, col.label) : pastille(col.label, { fond: col.fond, couleur: col.texte, inconnu: col.inconnu })),
    h('span', { class: 'tu-groupe-compte' }, String(col.taches.length))),
  ferme ? null : corps, ferme ? null : ajoutColonne(app, col, actions));
  return el;
}

export function vueKanban(app, actions) {
  const cols = colonnesKanban({ taches: app.taches, reglages: app.reglagesVue, choix: { statut: app.choix('statut'), priorite: app.choix('priorite') }, sans: t('statut.sans') });
  const plus = h('div', { class: 'tu-colonne tu-colonne-plus' },
    h('button', { type: 'button', class: 'tu-btn', 'aria-disabled': 'true', title: t('raison.statutDansGrist'), on: { click: () => app.notifier({ cle: 'raison.statutDansGrist', type: 'info' }) } }, icone('plus'), t('champ.statut')));
  return h('div', { class: 'tu-kanban', dataset: { defile: 'kanban' }, role: 'group', 'aria-label': t('vue.kanban') }, cols.map(c => colonne(app, c, actions)), plus);
}
