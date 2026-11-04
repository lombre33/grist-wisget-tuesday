// Le menu des filtres rapides et la ligne d'étiquettes qui les montre (chacune se retire d'un clic). Ils s'ajoutent à ceux de la vue Grist, jamais à leur place.
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { icone } from './icones.js';
import { ouvrirMenu } from './menu.js';
import { FILTRES_VIDES } from '../core/regroupement.js';

const t = (cle, vars) => I18n.t(cle, vars);
const bascule = (liste, v) => (liste.includes(v) ? liste.filter(x => x !== v) : [...liste, v]);

function personnes(app) {
  const vues = new Map();
  for (const tache of app.taches) for (const r of tache.responsables) vues.set(r.id, r.label);
  return [...vues.entries()].map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}

function items(app) {
  const f = app.reglages.filtres;
  const sortie = [];
  const moiOk = app.moi !== null;
  sortie.push({ label: t('filtre.mes'), valeur: ['mesTaches'], coche: f.mesTaches, grise: !moiOk, raison: moiOk ? null : t('filtre.mesRaison'), aide: moiOk ? null : t('filtre.jeSuis') });
  sortie.push({ label: t('filtre.retard'), valeur: ['retard'], coche: f.retard });
  if (app.mapping.statut) sortie.push({ separateur: true }, { titre: t('filtre.statuts') }, ...app.choix('statut').map(c => ({ label: c.valeur, valeur: ['statuts', c.valeur], coche: f.statuts.includes(c.valeur) })));
  const gens = personnes(app);
  if (app.mapping.responsable && gens.length) sortie.push({ separateur: true }, { titre: t('filtre.responsables') }, ...gens.map(g => ({ label: g.label, valeur: ['responsables', g.id], coche: f.responsables.includes(g.id) })));
  if (app.mapping.priorite) sortie.push({ separateur: true }, { titre: t('filtre.priorites') }, ...app.choix('priorite').map(c => ({ label: c.valeur, valeur: ['priorites', c.valeur], coche: f.priorites.includes(c.valeur) })));
  if (Object.entries(f).some(([k, v]) => k !== 'recherche' && (Array.isArray(v) ? v.length : v))) sortie.push({ separateur: true }, { label: t('filtre.effacer'), valeur: ['effacer'] });
  return sortie;
}

function appliquer(app, valeur) {
  const f = app.reglages.filtres;
  const [cle, v] = valeur;
  if (cle === 'effacer') app.regler({ filtres: { ...FILTRES_VIDES, recherche: f.recherche } });
  else if (cle === 'retard' || cle === 'mesTaches') app.regler({ filtres: { ...f, [cle]: !f[cle] } });
  else app.regler({ filtres: { ...f, [cle]: bascule(f[cle], v) } });
}

export function menuFiltres(ancre, app) {
  ouvrirMenu(ancre, () => items(app), it => it.valeur && appliquer(app, it.valeur), { gardeOuvert: true, large: true, etiquette: t('barre.filtres') });
}

// Les étiquettes visibles : on voit ce qui filtre et on le retire d'un clic.
export function etiquettesFiltres(app) {
  const f = app.reglages.filtres;
  const liste = [];
  const ajout = (texte, retirer) => liste.push(h('button', { type: 'button', class: 'tu-etiquette-filtre', title: t('filtre.retirer'), on: { click: retirer } }, texte, icone('croix', 12)));
  if (f.mesTaches) ajout(t('filtre.mes'), () => appliquer(app, ['mesTaches']));
  if (f.retard) ajout(t('filtre.retard'), () => appliquer(app, ['retard']));
  for (const s of f.statuts) ajout(s, () => appliquer(app, ['statuts', s]));
  for (const p of f.priorites) ajout(p, () => appliquer(app, ['priorites', p]));
  for (const id of f.responsables) ajout(personnes(app).find(g => g.id === id)?.label ?? String(id), () => appliquer(app, ['responsables', id]));
  if (f.recherche) ajout(`« ${f.recherche} »`, () => app.regler({ filtres: { ...f, recherche: '' } }));
  return liste.length ? h('div', { class: 'tu-filtres-actifs', role: 'list', 'aria-label': t('filtre.actifs') }, liste) : null;
}
