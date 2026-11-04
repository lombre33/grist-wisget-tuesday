// Le pop-up de mise en place : un petit tutoriel en trois étapes au plus (accès, table, colonnes), avec un schéma par étape. Il s'ouvre au lancement tant que rien n'est relié, se ferme sans
// rien faire (« Plus tard »), et se rouvre tout seul quand la personne veut ajouter une tâche. L'état vit dans l'app (`app.miseEnPlace`), ce module ne fait que le dessiner.
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { ModalBase } from '../../kit/js/modal-base.js';
import { Dialogs } from '../../kit/js/dialogs.js';
import { TABLE_PROJETS, COLONNES_PROJETS } from '../core/projet.js';
import { icone } from './icones.js';
import { figure } from './figures.js';
import { ROLES, accepte } from '../core/mapping.js';
import { etapesVisibles, recommandation } from '../core/miseenplace.js';
import { STATUTS_DEPART } from '../core/modele-depart.js';

const t = (cle, vars) => I18n.t(cle, vars);
const ESSENTIELS = ['titre', 'statut'];

// ---------- étape « table » ----------
function resume(app) {
  const m = app.miseEnPlace;
  const colonnes = app.modele.tables[m.table]?.colonnes ?? [];
  const noms = ESSENTIELS.concat(['echeance']).filter(r => m.mapping?.[r]).map(r => `${t(`role.${r}`)} : ${colonnes.find(c => c.id === m.mapping[r])?.libelle ?? m.mapping[r]}`);
  return noms.length ? t('mep.table.reconnu', { liste: noms.join(' · ') }) : t('mep.table.rien');
}

const sur = app => { const m = app.miseEnPlace; return Boolean(m.mapping?.titre && m.mapping?.statut && !m.ambigus?.titre && !m.ambigus?.statut); };

function carteExistante(app) {
  const m = app.miseEnPlace;
  const tables = app.tablesPossibles();
  const actif = m.choix === 'existante';
  const options = tables.map(tb => h('option', { value: tb.id, selected: tb.id === m.table || null }, `${tb.id} (${t('mep.table.nbColonnes', { n: tb.colonnes })})`));
  const select = h('select', { class: 'tu-saisie', 'aria-label': t('mep.table.existante'), dataset: { mep: 'table' }, on: { change: e => app.choisirTableMiseEnPlace(e.target.value) } }, options);
  select.value = m.table ?? '';
  return carte('existante', actif, !tables.length, t('mep.table.existante'), tables.length ? null : t('mep.table.aucune'), actif && tables.length ? [select, h('p', { class: 'tu-mep-aide' }, resume(app))] : null, () => app.choisirTableMiseEnPlace(m.table ?? tables[0].id), reco(app) === 'existante');
}

function carteCreer(app) {
  const m = app.miseEnPlace;
  const actif = m.choix === 'creer';
  const nom = h('input', { class: 'tu-saisie', type: 'text', value: m.nom, 'aria-label': t('mep.table.nom'), autocomplete: 'off', spellcheck: 'false', dataset: { mep: 'nom' },
    on: { input: e => { m.nom = e.target.value; majPrincipal(app); }, keydown: e => { if (e.key === 'Enter') { e.preventDefault(); agir(app); } } } });
  const exemples = h('label', { class: 'tu-mep-case' }, h('input', { type: 'checkbox', checked: m.exemples || null, dataset: { mep: 'exemples' }, on: { change: e => { m.exemples = e.target.checked; } } }), t('mep.table.exemples'));
  return carte('creer', actif, false, t('mep.table.creer'), null, actif ? [h('label', { class: 'tu-role-nom' }, t('mep.table.nom')), nom, exemples, h('p', { class: 'tu-mep-aide' }, t('mep.table.creera', { statuts: STATUTS_DEPART.length }))] : null, () => app.majMiseEnPlace({ choix: 'creer' }), reco(app) === 'creer');
}

const reco = app => recommandation(app.tablesPossibles()).choix;

function carte(id, actif, grise, titre, raison, contenu, choisir, recommande = false) {
  return h('div', { class: `tu-mep-carte${actif ? ' est-actif' : ''}${grise ? ' est-grise' : ''}`, dataset: { carte: id } },
    h('label', { class: 'tu-mep-radio' }, h('input', { type: 'radio', name: 'mep-choix', checked: actif || null, 'aria-disabled': grise ? 'true' : null, dataset: { mep: `choix-${id}` }, on: { change: () => { if (!grise) choisir(); } } }), h('span', { class: 'tu-mep-carte-titre' }, titre),
      recommande ? h('span', { class: 'tu-mep-reco' }, t('mep.recommande')) : null),
    raison ? h('p', { class: 'tu-mep-aide' }, raison) : null, contenu);
}

function etapeTable(app) {
  const m = app.miseEnPlace;
  const attente = app.tacheEnAttente?.parRole?.titre;
  const cartes = reco(app) === 'creer' ? [carteCreer(app), carteExistante(app)] : [carteExistante(app), carteCreer(app)]; // la recommandée d'abord
  return [attente ? h('p', { class: 'tu-mep-attente' }, icone('info', 14), t('mep.table.attente', { titre: attente })) : null,
    h('div', { class: 'tu-mep-cartes', role: 'radiogroup', 'aria-label': t('mep.table.titre') }, cartes),
    m.choix === 'existante' && sur(app) ? h('button', { type: 'button', class: 'tu-lien', dataset: { mep: 'verifier' }, on: { click: () => app.majMiseEnPlace({ etape: 'colonnes' }) } }, t('mep.verifier')) : null];
}

// ---------- étape « colonnes » ----------
function ligneRole(app, role) {
  const m = app.miseEnPlace;
  const colonnes = app.modele.tables[m.table]?.colonnes ?? [];
  const candidates = colonnes.filter(c => accepte(role, c, m.table));
  const erreur = (m.erreurs ?? []).find(e => e.role === role);
  const ambigu = m.ambigus?.[role] && !m.mapping[role];
  const select = h('select', { class: 'tu-saisie', 'aria-label': t(`role.${role}`), dataset: { role, mep: `role-${role}` }, on: { change: e => app.roleMiseEnPlace(role, e.target.value || null) } },
    h('option', { value: '' }, role === 'titre' ? t('demarrage.choisir') : t('demarrage.aucune')),
    candidates.map(c => h('option', { value: c.id }, c.libelle + (c.formule ? ` (${t('demarrage.formule')})` : ''))));
  select.value = m.mapping[role] ?? '';
  const aide = erreur ? t(`erreur.${erreur.raison}`, { colonne: erreur.colId ?? '' }) : ambigu ? t(`question.${role}`) : role === 'titre' && !candidates.length ? t('mep.colonnes.aucunTexte') : null;
  return h('div', { class: `tu-role${ambigu || erreur ? ' est-a-voir' : ''}`, dataset: { role } },
    h('label', { class: 'tu-role-nom' }, t(`role.${role}`), ESSENTIELS.includes(role) ? h('span', { class: 'tu-requis', 'aria-hidden': 'true' }, '*') : null), select, aide ? h('p', { class: 'tu-role-aide', role: 'status' }, aide) : null);
}

function etapeColonnes(app) {
  const m = app.miseEnPlace;
  const autres = ROLES.filter(r => !ESSENTIELS.includes(r));
  const reconnues = autres.filter(r => m.mapping[r]).length;
  const ouvert = app.autresOuverts ?? autres.some(r => m.ambigus?.[r] || (m.erreurs ?? []).some(e => e.role === r));
  const zone = h('div', { class: 'tu-roles-autres', hidden: ouvert ? null : true }, autres.map(r => ligneRole(app, r)));
  const bascule = h('button', { type: 'button', class: 'tu-lien', 'aria-expanded': String(ouvert), on: { click: e => { zone.hidden = !zone.hidden; app.autresOuverts = !zone.hidden; e.currentTarget.setAttribute('aria-expanded', String(!zone.hidden)); } } }, icone('bas', 12), t('demarrage.autresColonnes', { n: reconnues }));
  return [h('p', { class: 'tu-mep-intro' }, t('mep.colonnes.intro')), h('div', { class: 'tu-roles' }, ESSENTIELS.map(r => ligneRole(app, r))), bascule, zone];
}

// ---------- étape « accès » ----------
function etapeAcces() {
  return [h('p', { class: 'tu-mep-intro' }, t('mep.acces.intro')), h('ol', { class: 'tu-mep-pas' }, h('li', null, t('mep.acces.etape1')), h('li', null, t('mep.acces.etape2'))),
    h('p', { class: 'tu-rassurance' }, icone('info', 14), t('mep.acces.rassurance'))];
}

// ---------- boutons et déroulement ----------
// Le navigateur oublie (cache vidé, autre navigateur) : seul le document peut se souvenir de la table confirmée. Une table de plus n'est créée qu'avec l'accord de la personne ; refusée, la
// table reste mémorisée par le navigateur seulement, et la mise en place reviendra quand il oubliera.
async function proposerMemoire(app) {
  if (!app.pret || app.projet || app.lectureSeule) return;
  const cree = app.modele.tables[TABLE_PROJETS] ? t('garder.ajout') : t('garder.creation', { table: TABLE_PROJETS, colonnes: COLONNES_PROJETS.length });
  const accord = await Dialogs.confirm({ title: t('memoire.titre'), message: `${t('memoire.texte')}\n\n${cree}`, confirmLabel: t('memoire.bouton'), cancelLabel: t('garder.plusTard') });
  if (accord) await app.enregistrerProjet(app.source);
}

let enCours = false;
let echecAffiche = false;
async function agir(app) {
  const m = app.miseEnPlace;
  if (enCours) return;
  if (m.etape === 'acces') return window.location.reload();
  if (m.etape === 'table' && m.choix === 'existante' && !sur(app)) return app.majMiseEnPlace({ etape: 'colonnes' });
  const avant = app.message?.id;
  enCours = true; synchroniserBouton(app);
  try {
    const fait = await app.terminerMiseEnPlace();
    echecAffiche = !fait && app.message?.type === 'erreur' && app.message.id !== avant;
    if (fait) await proposerMemoire(app);
  } finally { enCours = false; synchroniserBouton(app); }
  if (app.miseEnPlace.ouverte) app.emettre('mep'); // redessine : les erreurs de colonnes, ou le texte de l'échec
}

function libellePrincipal(app) {
  const m = app.miseEnPlace;
  if (m.etape === 'acces') return t('mep.acces.recharger');
  if (m.etape === 'colonnes') return t('mep.terminer');
  if (m.choix === 'creer') return t('mep.creer', { nom: m.nom.trim() || t('mep.nomDefaut') });
  return sur(app) ? t('mep.utiliser') : t('mep.suivant');
}

let principal = null;
const majPrincipal = app => { if (principal) principal.textContent = libellePrincipal(app); };
const synchroniserBouton = app => { if (principal) { principal.disabled = enCours; principal.textContent = enCours ? t('mep.encours') : libellePrincipal(app); } };

function pied(app) {
  const m = app.miseEnPlace;
  principal = h('button', { type: 'button', class: 'pp-modal-primary', dataset: { geste: 'mep-principal' }, on: { click: () => agir(app) } }, libellePrincipal(app));
  const retour = m.etape === 'colonnes' ? h('button', { type: 'button', dataset: { geste: 'mep-precedent' }, on: { click: () => app.majMiseEnPlace({ etape: 'table' }) } }, t('mep.precedent')) : null;
  return [h('button', { type: 'button', dataset: { geste: 'mep-plus-tard' }, on: { click: () => app.fermerMiseEnPlace() } }, t('mep.plusTard')), h('span', { class: 'pp-modal-spacer' }), retour, principal].filter(Boolean);
}

function progression(app) {
  const m = app.miseEnPlace;
  const etapes = etapesVisibles({ attenteAcces: app.attenteAcces || m.etape === 'acces', choix: m.choix });
  const rang = etapes.indexOf(m.etape);
  return h('ol', { class: 'tu-mep-etapes', 'aria-label': t('mep.etape', { n: rang + 1, total: etapes.length }) },
    etapes.map((e, i) => h('li', { class: i === rang ? 'est-actif' : i < rang ? 'est-fait' : '', 'aria-current': i === rang ? 'step' : null }, h('span', { class: 'tu-mep-num' }, i < rang ? icone('coche', 12) : String(i + 1)), h('span', { class: 'tu-mep-etape-nom' }, t(`mep.etape.${e}`)))));
}

const TITRES = { acces: () => t('mep.acces.titre'), table: () => t('mep.table.titre'), colonnes: app => t('mep.colonnes.titre', { table: app.miseEnPlace.table ?? '' }) };
const CONTENUS = { acces: etapeAcces, table: etapeTable, colonnes: etapeColonnes };

// Le contenu, hors fenêtre : testable et redessiné à chaque changement d'état. `message` : le texte d'une erreur de la dernière tentative, dit dans le pop-up (le message du bas serait sous le voile).
export function contenuMiseEnPlace(app, message = null) {
  const m = app.miseEnPlace;
  return { titre: TITRES[m.etape](app), corps: [progression(app), h('div', { class: 'tu-mep-corps' }, figure(m.etape), h('div', { class: 'tu-mep-texte' }, CONTENUS[m.etape](app), message ? h('p', { class: 'tu-mep-erreur', role: 'alert' }, message) : null))] };
}

let fenetre = null;
export function monterMiseEnPlace(app, { texteMessage = () => '' } = {}) {
  const dessiner = () => {
    if (!app.miseEnPlace.ouverte) { if (fenetre?.isOpen()) fenetre.hide(); return; }
    if (!fenetre) fenetre = ModalBase.create({ id: 'tu-mep', titleId: 'tu-mep-titre', size: 'lg', boxClass: 'tu-mep-box', onEscape: () => app.fermerMiseEnPlace() });
    const garde = document.activeElement?.dataset?.mep ?? null;
    const dernier = echecAffiche && app.message ? texteMessage(app.message) : null;
    echecAffiche = false;
    const { titre, corps } = contenuMiseEnPlace(app, enCours ? null : dernier);
    fenetre.title.textContent = titre;
    fenetre.body.replaceChildren(...corps);
    fenetre.actions.replaceChildren(...pied(app));
    const cible = () => (garde && fenetre.body.querySelector(`[data-mep="${garde}"]`)) || fenetre.body.querySelector('input:checked, select, input, button') || principal;
    if (!fenetre.isOpen()) fenetre.show(cible); else cible()?.focus();
  };
  app.abonner(quoi => { if (quoi === 'mep') dessiner(); });
  I18n.onChange(() => { if (app.miseEnPlace.ouverte) dessiner(); });
  dessiner();
}
