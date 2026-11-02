// Le premier lancement : choisir la table (si besoin), confirmer les colonnes sur UN écran déjà rempli (décision du porteur : on confirme toujours d'abord), ou créer un modèle de départ.
// Rien n'est écrit avant « Ouvrir » ; une table n'est créée qu'après un accord qui nomme ce qui sera créé.
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { Dialogs } from '../../kit/js/dialogs.js';
import { icone } from './icones.js';
import { ROLES, accepte, verifier } from '../core/mapping.js';

const t = (cle, vars) => I18n.t(cle, vars);
const ESSENTIELS = ['titre', 'statut'];

function ecran(titre, sousTitre, ...enfants) {
  return h('div', { class: 'tu-demarrage' }, h('div', { class: 'tu-demarrage-carte' }, h('h1', null, titre), sousTitre ? h('p', { class: 'tu-demarrage-sous' }, sousTitre) : null, ...enfants));
}

export function ecranTables(app) {
  const tables = app.tablesPossibles();
  let choisie = tables[0]?.id;
  const liste = h('div', { class: 'tu-liste-tables', role: 'radiogroup', 'aria-label': t('demarrage.tables') }, tables.map(tb => h('button', {
    type: 'button', role: 'radio', 'aria-checked': String(tb.id === choisie), class: `tu-choix-table${tb.id === choisie ? ' est-actif' : ''}`, dataset: { table: tb.id },
    on: { click: e => { choisie = tb.id; liste.querySelectorAll('.tu-choix-table').forEach(b => { b.classList.toggle('est-actif', b === e.currentTarget); b.setAttribute('aria-checked', String(b === e.currentTarget)); }); } } },
  h('span', { class: 'tu-choix-nom' }, tb.id), h('span', { class: 'tu-vide' }, t('demarrage.nbColonnes', { n: tb.colonnes })))));
  return ecran(t('demarrage.titreTables'), t('demarrage.sousTables'), liste,
    h('div', { class: 'tu-demarrage-actions' },
      h('button', { type: 'button', class: 'tu-btn', on: { click: () => app.allerA('sans-table') } }, t('demarrage.creerModele')),
      h('button', { type: 'button', class: 'tu-btn tu-btn-principal', dataset: { geste: 'continuer' }, on: { click: () => app.proposer(choisie) } }, t('demarrage.continuer'))));
}

function ligneRole(app, role, mapping, ambigus, erreurs, maj) {
  const candidates = app.colonnes.filter(c => accepte(role, c, app.source));
  const erreur = erreurs.find(e => e.role === role);
  const ambigu = ambigus[role];
  const select = h('select', { class: 'tu-saisie', 'aria-label': t(`role.${role}`), dataset: { role }, on: { change: e => maj(role, e.target.value || null) } },
    h('option', { value: '' }, role === 'titre' ? t('demarrage.choisir') : t('demarrage.aucune')),
    candidates.map(c => h('option', { value: c.id, selected: mapping[role] === c.id || null }, c.libelle + (c.formule ? ` (${t('demarrage.formule')})` : ''))));
  select.value = mapping[role] ?? '';
  const aide = erreur ? t(`erreur.${erreur.raison}`, { colonne: erreur.colId ?? '' }) : ambigu ? t(`question.${role}`) : null;
  return h('div', { class: `tu-role${ambigu || erreur ? ' est-a-voir' : ''}`, dataset: { role } }, h('label', { class: 'tu-role-nom' }, t(`role.${role}`), ESSENTIELS.includes(role) ? h('span', { class: 'tu-requis', 'aria-hidden': 'true' }, '*') : null), select, aide ? h('p', { class: 'tu-role-aide', role: 'status' }, aide) : null);
}

export function ecranColonnes(app) {
  const p = app.proposition;
  const mapping = { ...p.mapping };
  const ambigus = p.ambigus ?? {};
  const erreurs = p.erreurs ?? [];
  const autres = ROLES.filter(r => !ESSENTIELS.includes(r));
  const reconnues = autres.filter(r => mapping[r]).length;
  const ouvertParDefaut = app.autresOuverts ?? autres.some(r => ambigus[r] || erreurs.some(e => e.role === r));
  const maj = (role, colId) => { mapping[role] = colId; app.proposition = { ...p, mapping: { ...mapping }, erreurs: [] }; app.emettre(); };
  const v = verifier(mapping, app.colonnes, app.source);
  const bloque = v.erreurs.filter(e => e.role === 'titre' || e.raison === 'formule' || e.raison === 'type');
  const autresEl = h('div', { class: 'tu-roles-autres', hidden: ouvertParDefaut ? null : true }, autres.map(r => ligneRole(app, r, mapping, ambigus, erreurs, maj)));
  const bascule = h('button', { type: 'button', class: 'tu-lien', 'aria-expanded': String(ouvertParDefaut), on: { click: e => { autresEl.hidden = !autresEl.hidden; app.autresOuverts = !autresEl.hidden; e.currentTarget.setAttribute('aria-expanded', String(!autresEl.hidden)); } } }, icone('bas', 12), t('demarrage.autresColonnes', { n: reconnues }));
  return ecran(t('demarrage.titreColonnes'), t('demarrage.sousColonnes', { table: app.source }),
    h('div', { class: 'tu-roles' }, ESSENTIELS.map(r => ligneRole(app, r, mapping, ambigus, erreurs, maj))), bascule, autresEl,
    h('p', { class: 'tu-rassurance' }, icone('info', 14), t('demarrage.rien')),
    h('div', { class: 'tu-demarrage-actions' },
      app.tablesPossibles().length > 1 ? h('button', { type: 'button', class: 'tu-btn', on: { click: () => app.allerA('tables') } }, t('demarrage.changerTable')) : null,
      h('button', { type: 'button', class: 'tu-btn tu-btn-principal', dataset: { geste: 'ouvrir' }, 'aria-disabled': bloque.length ? 'true' : null, title: bloque.length ? t(`erreur.${bloque[0].raison}`, { colonne: bloque[0].colId ?? '' }) : null,
        on: { click: () => (bloque.length ? app.notifier({ cle: `erreur.${bloque[0].raison}`, vars: { colonne: bloque[0].colId ?? '' }, type: 'info' }) : app.ouvrir(app.source, { ...mapping }, null)) } }, t('demarrage.ouvrir'))));
}

export function ecranAcces() {
  return ecran(t('acces.titre'), t('acces.sous'),
    h('p', { class: 'tu-rassurance' }, icone('info', 14), t('acces.etape')),
    h('div', { class: 'tu-demarrage-actions' }, h('button', { type: 'button', class: 'tu-btn', dataset: { geste: 'recharger' }, on: { click: () => window.location.reload() } }, t('acces.reessayer'))));
}

export function ecranSansTable(app) {
  const grise = app.lectureSeule;
  return ecran(t('demarrage.titreSansTable'), t('demarrage.sousSansTable'),
    h('p', { class: 'tu-rassurance' }, icone('info', 14), t('demarrage.modeleExplique')),
    h('div', { class: 'tu-demarrage-actions' },
      app.tablesPossibles().length ? h('button', { type: 'button', class: 'tu-btn', on: { click: () => app.allerA('tables') } }, t('demarrage.choisirExistante')) : null,
      h('button', { type: 'button', class: 'tu-btn tu-btn-principal', dataset: { geste: 'modele' }, 'aria-disabled': grise ? 'true' : null, title: grise ? t('refus.lectureSeule') : null,
        on: { click: async () => {
          if (grise) return app.notifier({ cle: 'refus.lectureSeule', type: 'info' });
          const nom = await Dialogs.prompt({ title: t('demarrage.nomTable'), label: t('demarrage.nomTableLabel'), value: t('demarrage.nomTableDefaut'), confirmLabel: t('demarrage.suivant') });
          if (!nom?.trim()) return null;
          const ok = await Dialogs.confirm({ title: t('demarrage.accordTitre'), message: t('demarrage.accordMessage', { nom: nom.trim() }), confirmLabel: t('demarrage.creer') });
          return ok ? app.creerModele(nom.trim().replace(/[^\p{L}\p{N}_]/gu, '_')) : null;
        } } }, t('demarrage.creerModele'))));
}

export function bandeauGarder(app, actions) {
  if (app.projet || app.lectureSeule || app.bandeauFerme) return null;
  return h('div', { class: 'tu-bandeau', role: 'status' }, icone('info', 14), h('span', { class: 'tu-bandeau-texte' }, app.port.mode === 'demo' ? `${t('demo.titre')} · ${t('demo.explique')}` : t('garder.texte')),
    h('button', { type: 'button', class: 'tu-btn tu-btn-principal', dataset: { geste: 'garder' }, on: { click: () => actions.garder() } }, t('garder.bouton')),
    h('button', { type: 'button', class: 'tu-btn', on: { click: () => { app.bandeauFerme = true; app.emettre(); } } }, t('garder.plusTard')));
}
