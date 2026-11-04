// Vue Chronologie : une barre par tâche sur une échelle de jours, jalons en losange, ligne du jour, sous-tâches sous leur tâche, glisser pour déplacer et poignées pour redimensionner.
// Les tâches sans date sont listées dessous, jamais perdues et jamais rangées sur une date fictive.
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { icone } from './icones.js';
import { couleurTache } from './couleurs.js';
import { echelle, barre, entetes, deplacer, redimensionner, xDe, ZOOMS } from '../core/chronologie.js';
import { lignesTableau } from '../core/vue.js';

const t = (cle, vars) => I18n.t(cle, vars);

function barreTache(app, ech, ligne, actions) {
  const { tache } = ligne;
  const b = barre(tache, ech);
  const c = couleurTache(app, tache);
  const peutEcrire = !app.lectureSeule && (app.mapping.debut || app.mapping.echeance);
  const el = h('div', {
    class: `tu-barre-tache${b.jalon ? ' est-jalon' : ''}${tache.termine ? ' est-terminee' : ''}${tache.enRetard ? ' est-retard' : ''}${tache.incoherente ? ' est-incoherente' : ''}`, role: 'button', tabindex: '0', dataset: { id: tache.id },
    vars: { '--x': `${b.x}px`, '--l': `${b.largeur}px`, ...(c?.fond ? { '--c-fond': c.fond } : {}) }, title: tache.titre,
    on: { keydown: e => { if (e.key === 'Enter') actions.ouvrirFiche(tache.id); } },
  }, b.jalon ? null : h('span', { class: 'tu-barre-texte' }, b.largeur > 70 ? tache.titre : ''),
  tache.avancement !== null && !b.jalon ? h('span', { class: 'tu-barre-avance', vars: { '--p': `${Math.round(tache.avancement * 100)}%` } }) : null,
  peutEcrire && !b.jalon ? [h('span', { class: 'tu-poignee est-debut', dataset: { bord: 'debut' } }), h('span', { class: 'tu-poignee est-fin', dataset: { bord: 'fin' } })] : null);
  brancherGlisser(app, el, tache, ech, actions, Boolean(peutEcrire));
  return el;
}

function brancherGlisser(app, el, tache, ech, actions, ecriture) {
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    const bord = e.target.dataset?.bord ?? null;
    const x0 = e.clientX;
    let delta = 0;
    let bouge = false;
    const base = Number.parseFloat(el.style.getPropertyValue('--x'));
    const largeur = Number.parseFloat(el.style.getPropertyValue('--l'));
    el.setPointerCapture?.(e.pointerId);
    if (ecriture) app.enSaisie = () => true;
    const move = ev => {
      delta = Math.round((ev.clientX - x0) / ech.px);
      if (Math.abs(ev.clientX - x0) > 3) bouge = true;
      if (!ecriture || !bouge) return;
      if (!bord) el.style.setProperty('--x', `${base + delta * ech.px}px`);
      else if (bord === 'fin') el.style.setProperty('--l', `${Math.max(ech.px, largeur + delta * ech.px)}px`);
      else { el.style.setProperty('--x', `${base + delta * ech.px}px`); el.style.setProperty('--l', `${Math.max(ech.px, largeur - delta * ech.px)}px`); }
    };
    const fin = async () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', fin);
      el.removeEventListener('pointercancel', fin);
      app.enSaisie = null;
      if (!bouge) { actions.ouvrirFiche(tache.id); return; }
      if (!ecriture || delta === 0) { app.rafraichir(); return; }
      const parRole = bord ? redimensionner(tache, bord, delta) : deplacer(tache, delta);
      const ok = await app.modifier(tache.id, parRole, bord ? t('msg.redimensionnee') : t('msg.deplacee'));
      if (!ok) app.rafraichir();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', fin);
    el.addEventListener('pointercancel', fin);
  });
}

function etiquetteLigne(app, ligne, actions) {
  const { tache } = ligne;
  return h('div', { class: `tu-ch-label${ligne.contexte ? ' est-contexte' : ''}`, vars: { '--niveau': ligne.profondeur }, on: { click: () => actions.ouvrirFiche(tache.id) } },
    h('span', { class: `tu-titre${tache.termine ? ' est-termine' : ''}` }, tache.titre || t('champ.sansTitre')),
    tache.bloqueePar.length ? h('span', { class: 'tu-bloquee', title: t('champ.bloquee') }, icone('cadenas', 12)) : null);
}

function ligneChrono(app, ech, ligne, actions) {
  const b = ligne.tache.debutEff ? barreTache(app, ech, ligne, actions) : null;
  return h('div', { class: `tu-ch-ligne${app.selection === ligne.tache.id ? ' est-selectionnee' : ''}`, dataset: { id: ligne.tache.id } }, etiquetteLigne(app, ligne, actions), h('div', { class: 'tu-ch-piste' }, b));
}

function enteteEchelle(ech, langue) {
  const e = entetes(ech, langue);
  const cellule = (c, classe) => h('div', { class: `tu-ch-cel ${classe}${c.weekend ? ' est-weekend' : ''}`, vars: { '--x': `${c.x}px`, '--l': `${c.largeur}px` } }, c.label);
  return h('div', { class: 'tu-ch-entete' },
    h('div', { class: 'tu-ch-label tu-ch-coin' }, ''),
    h('div', { class: 'tu-ch-piste' }, h('div', { class: 'tu-ch-niveau' }, e.haut.map(c => cellule(c, 'est-haut'))), h('div', { class: 'tu-ch-niveau' }, e.bas.map(c => cellule(c, 'est-bas')))));
}

function controles(app, actions) {
  return h('div', { class: 'tu-chrono-tete' },
    h('div', { class: 'tu-seg', role: 'group', 'aria-label': t('chrono.zoom') }, ZOOMS.map(z => h('button', { type: 'button', class: `tu-onglet${app.reglages.zoom === z ? ' est-actif' : ''}`, 'aria-pressed': String(app.reglages.zoom === z), dataset: { zoom: z }, on: { click: () => app.regler({ zoom: z }) } }, t(`zoom.${z}`)))),
    h('button', { type: 'button', class: 'tu-btn', on: { click: () => actions.versAujourdhui() } }, t('chrono.aujourdhui')));
}

export function vueChronologie(app, actions) {
  const ech = echelle(app.taches, app.reglages.zoom, app.aujourdhui);
  const groupes = lignesTableau({ taches: app.taches, arbre: app.arbre, reglages: app.reglagesVue, choix: { statut: app.choix('statut'), priorite: app.choix('priorite'), groupe: app.choix('groupe') }, sans: { statut: t('statut.sans'), priorite: t('priorite.sans'), responsable: t('responsable.sans'), groupe: t('groupe.sans') } });
  const corps = [];
  const sansDate = [];
  for (const g of groupes) {
    const avecDate = g.lignes.filter(l => l.tache.debutEff);
    sansDate.push(...g.lignes.filter(l => !l.tache.debutEff));
    if (app.reglages.regroupement !== 'aucun' && avecDate.length) corps.push(h('div', { class: 'tu-ch-groupe' }, g.label || t('groupe.toutes')));
    corps.push(...avecDate.map(l => ligneChrono(app, ech, l, actions)));
  }
  if (sansDate.length) corps.push(h('div', { class: 'tu-ch-groupe' }, t('chrono.sansDate'), h('span', { class: 'tu-groupe-compte' }, String(sansDate.length))), ...sansDate.map(l => ligneChrono(app, ech, l, actions)));
  const dessus = h('div', { class: 'tu-ch-auj', vars: { '--x': `${xDe(app.aujourdhui, ech)}px` }, 'aria-hidden': 'true' });
  const grille = h('div', { class: 'tu-ch-grille', vars: { '--px': ech.px, '--total': `${ech.jours * ech.px}px` }, dataset: { auj: xDe(app.aujourdhui, ech) } }, enteteEchelle(ech, I18n.language), h('div', { class: 'tu-ch-corps' }, corps, dessus));
  return h('div', { class: 'tu-chrono' }, controles(app, actions), h('div', { class: 'tu-ch-defile', dataset: { defile: 'chrono' } }, grille));
}
