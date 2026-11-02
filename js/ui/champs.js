// Les gestes d'édition partagés par le tableau, le kanban, la chronologie et la fiche : statut, responsables, priorité, date, case à cocher. Chacun écrit par app.modifier (optimiste, annulable).
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { ouvrirMenu } from './menu.js';
import { pastille, avatars, priorite as repere } from './pastille.js';
import { icone } from './icones.js';
import { baseType } from '../core/colonnes.js';
import { etiquette } from '../core/dates.js';

const t = (cle, vars) => I18n.t(cle, vars);

export function personnesPossibles(app) {
  const col = app.colonne('responsable');
  if (!col) return [];
  if (baseType(col.type) === 'Text') return [...new Set(app.taches.flatMap(x => x.responsables.map(r => r.label)))].sort((a, b) => a.localeCompare(b, 'fr')).map(l => ({ id: l, label: l }));
  return [...(app.refs[col.id] ?? new Map()).entries()].map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}

const grise = (app, role) => {
  if (app.lectureSeule) return t('refus.lectureSeule');
  if (!app.mapping[role]) return t('raison.relier', { role: t(`role.${role}`) });
  if (app.colonne(role)?.formule) return t('refus.formule');
  return null;
};

export function couleurStatut(app, valeur) {
  const c = app.choix('statut').find(x => x.valeur === valeur);
  return { fond: c?.fond ?? null, couleur: c?.texte ?? null, inconnu: Boolean(valeur) && !c };
}

export function celluleStatut(app, tache) {
  const raison = grise(app, 'statut');
  const texte = tache.statut || t('statut.sans');
  const c = couleurStatut(app, tache.statut);
  const ouvrir = e => {
    if (raison) return app.notifier({ texte: raison, type: 'info' });
    ouvrirMenu(e.currentTarget, app.choix('statut').map(x => ({ label: x.valeur, valeur: x.valeur, actif: x.valeur === tache.statut, pastille: x.fond ? { '--st-fond': x.fond } : null })),
      it => it.valeur !== tache.statut && app.modifier(tache.id, { statut: it.valeur }, t('msg.statut')), { etiquette: t('role.statut') });
    return null;
  };
  return pastille(texte, { ...c, bouton: true, classe: raison ? 'est-grisee' : '' }, { 'aria-haspopup': 'menu', 'aria-disabled': raison ? 'true' : null, title: raison ?? t('role.statut'), dataset: { champ: 'statut' }, on: { click: ouvrir } });
}

export function celluleResponsables(app, tache) {
  const raison = grise(app, 'responsable');
  const ouvrir = e => {
    if (raison) return app.notifier({ texte: raison, type: 'info' });
    const col = app.colonne('responsable');
    const multiple = baseType(col.type) !== 'Ref' && baseType(col.type) !== 'Text';
    const courant = () => app.tache(tache.id)?.responsables.map(r => r.id) ?? [];
    ouvrirMenu(e.currentTarget, () => personnesPossibles(app).map(p => ({ label: p.label, valeur: p.id, coche: courant().includes(p.id) })), it => {
      const ids = courant();
      let suivant;
      if (baseType(col.type) === 'Text') suivant = (ids.includes(it.valeur) ? ids.filter(x => x !== it.valeur) : [...ids, it.valeur]).join(', ');
      else if (multiple) suivant = ids.includes(it.valeur) ? ids.filter(x => x !== it.valeur) : [...ids, it.valeur];
      else suivant = ids.includes(it.valeur) ? 0 : it.valeur;
      app.modifier(tache.id, { responsable: suivant }, t('msg.responsable'));
    }, { gardeOuvert: true, etiquette: t('role.responsable') });
    return null;
  };
  return h('button', { type: 'button', class: `tu-cellule-bouton${raison ? ' est-grisee' : ''}`, 'aria-haspopup': 'menu', 'aria-disabled': raison ? 'true' : null, title: raison ?? t('role.responsable'), dataset: { champ: 'responsable' }, on: { click: ouvrir } }, avatars(tache.responsables));
}

export function cellulePriorite(app, tache) {
  const raison = grise(app, 'priorite');
  const rang = Math.max(0, app.choix('priorite').findIndex(c => c.valeur === tache.priorite));
  const ouvrir = e => {
    if (raison) return app.notifier({ texte: raison, type: 'info' });
    ouvrirMenu(e.currentTarget, [...app.choix('priorite').map(c => ({ label: c.valeur, valeur: c.valeur, actif: c.valeur === tache.priorite })), { separateur: true }, { label: t('champ.aucune'), valeur: '' }],
      it => it.valeur !== tache.priorite && app.modifier(tache.id, { priorite: it.valeur }, t('msg.priorite')), { etiquette: t('role.priorite') });
    return null;
  };
  return h('button', { type: 'button', class: `tu-cellule-bouton${raison ? ' est-grisee' : ''}`, 'aria-haspopup': 'menu', 'aria-disabled': raison ? 'true' : null, title: raison ?? t('role.priorite'), dataset: { champ: 'priorite' }, on: { click: ouvrir } }, repere(tache.priorite, rang));
}

export function celluleDate(app, tache, role) {
  const raison = grise(app, role);
  const valeur = role === 'debut' ? tache.debut : tache.fin;
  const lang = I18n.language;
  const texte = valeur ? etiquette(valeur, lang) : '—';
  const retard = role === 'echeance' && tache.enRetard;
  const bouton = h('button', { type: 'button', class: `tu-cellule-bouton tu-date${retard ? ' est-retard' : ''}${raison ? ' est-grisee' : ''}`, 'aria-disabled': raison ? 'true' : null, title: raison ?? t(`role.${role}`), dataset: { champ: role },
    on: { click: () => (raison ? app.notifier({ texte: raison, type: 'info' }) : editerDate(app, tache, role, bouton, valeur)) } },
  retard ? icone('info', 12) : null, h('span', null, texte), retard ? h('span', { class: 'tu-retard-texte' }, t('statut.retard')) : null);
  return bouton;
}

function editerDate(app, tache, role, bouton, valeur) {
  const champ = h('input', { type: 'date', class: 'tu-champ-date', value: valeur ?? '', 'aria-label': t(`role.${role}`) });
  const fin = (commit) => {
    champ.replaceWith(bouton);
    app.enSaisie = null;
    if (commit && champ.value !== (valeur ?? '')) app.modifier(tache.id, { [role]: champ.value || null }, t('msg.date'));
    if (app.enAttente) app.rafraichir();
  };
  champ.addEventListener('change', () => fin(true));
  champ.addEventListener('blur', () => fin(false));
  champ.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); fin(false); } });
  bouton.replaceWith(champ);
  app.enSaisie = () => true;
  champ.focus();
  try { champ.showPicker?.(); } catch (e) { /* le sélecteur natif peut être refusé : le champ reste utilisable au clavier */ }
}

export function caseTermine(app, tache) {
  const fait = app.estTermineChoix();
  const raison = grise(app, 'statut') ?? (fait ? null : t('raison.termine'));
  return h('button', { type: 'button', class: `tu-case${tache.termine ? ' est-cochee' : ''}${raison ? ' est-grisee' : ''}`, role: 'checkbox', 'aria-checked': String(tache.termine), 'aria-disabled': raison ? 'true' : null,
    title: raison ?? (tache.termine ? t('champ.rouvrir') : t('champ.terminer')), 'aria-label': t('champ.terminer'), dataset: { champ: 'case' },
    on: { click: e => { e.stopPropagation(); if (raison) return app.notifier({ texte: raison, type: 'info' }); return app.modifier(tache.id, { statut: tache.termine ? app.premierStatut() : fait }, tache.termine ? t('msg.rouverte') : t('msg.terminee')); } } },
  tache.termine ? icone('coche', 12) : null);
}
