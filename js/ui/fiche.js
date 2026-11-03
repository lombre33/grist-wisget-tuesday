// La fiche d'une tâche, à droite, non modale : la vue reste sous les yeux. Chaque champ s'enregistre à sa validation ; les colonnes non reliées restent consultables et modifiables (« Autres champs »).
import { h } from '../../kit/js/dom.js';
import { I18n } from '../../kit/js/i18n.js';
import { icone } from './icones.js';
import { ouvrirMenu } from './menu.js';
import { barreAvancement } from './pastille.js';
import { celluleStatut, celluleResponsables, celluleDate, cellulePriorite, caseTermine } from './champs.js';
import { baseType, estReference } from '../core/colonnes.js';
import { etiquette } from '../core/dates.js';
import { descendants } from '../core/taches.js';

const t = (cle, vars) => I18n.t(cle, vars);

const champ = (libelle, contenu, cle) => h('div', { class: 'tu-champ', dataset: { champ: cle } }, h('label', { class: 'tu-champ-libelle' }, libelle), h('div', { class: 'tu-champ-valeur' }, contenu));

function saisie(app, valeur, enregistrer, { multiligne = false, cle, etiquetteAria, type = 'text', placeholder = '' } = {}) {
  const el = h(multiligne ? 'textarea' : 'input', { class: `tu-saisie${multiligne ? ' est-multiligne' : ''}`, type: multiligne ? null : type, rows: multiligne ? '4' : null, placeholder, 'aria-label': etiquetteAria, dataset: { focus: cle }, autocomplete: 'off',
    on: {
      focus: () => { app.enSaisie = () => true; },
      blur: e => { app.enSaisie = null; if (e.target.value !== String(valeur ?? '')) enregistrer(e.target.value); if (app.enAttente) app.rafraichir(); },
      keydown: e => { if (e.key === 'Enter' && !multiligne) { e.preventDefault(); e.target.blur(); } else if (e.key === 'Escape') { e.stopPropagation(); e.target.value = valeur ?? ''; e.target.blur(); } },
    } });
  el.value = valeur ?? '';
  if (app.lectureSeule) { el.setAttribute('readonly', ''); el.title = t('refus.lectureSeule'); }
  return el;
}

function menuParent(app, tache) {
  const exclus = new Set([tache.id, ...descendants(app.arbre, tache.id).map(x => x.id)]);
  const bouton = h('button', { type: 'button', class: 'tu-cellule-bouton', 'aria-haspopup': 'menu', 'aria-disabled': app.lectureSeule ? 'true' : null, dataset: { champ: 'parent' },
    on: { click: e => app.lectureSeule ? app.notifier({ cle: 'refus.lectureSeule', type: 'info' }) : ouvrirMenu(e.currentTarget, [{ label: t('champ.aucune'), valeur: 0 }, { separateur: true }, ...app.taches.filter(x => !exclus.has(x.id)).map(x => ({ label: x.titre || t('champ.sansTitre'), valeur: x.id, actif: x.id === tache.parentId }))],
      it => app.modifier(tache.id, { parent: it.valeur }, t('msg.parent')), { large: true, etiquette: t('role.parent') }) } },
  tache.parentId ? (app.tache(tache.parentId)?.titre || t('champ.sansTitre')) : t('champ.aucune'), icone('bas', 12));
  return bouton;
}

function menuEtiquettes(app, tache) {
  return h('button', { type: 'button', class: 'tu-cellule-bouton', 'aria-haspopup': 'menu', dataset: { champ: 'etiquettes' },
    on: { click: e => app.lectureSeule ? app.notifier({ cle: 'refus.lectureSeule', type: 'info' }) : ouvrirMenu(e.currentTarget, () => app.choix('etiquettes').map(c => ({ label: c.valeur, valeur: c.valeur, coche: app.tache(tache.id).etiquettes.includes(c.valeur) })),
      it => { const cur = app.tache(tache.id).etiquettes; app.modifier(tache.id, { etiquettes: cur.includes(it.valeur) ? cur.filter(x => x !== it.valeur) : [...cur, it.valeur] }, t('msg.etiquettes')); }, { gardeOuvert: true, etiquette: t('role.etiquettes') }) } },
  tache.etiquettes.length ? tache.etiquettes.join(', ') : t('champ.aucune'), icone('bas', 12));
}

function sousTaches(app, tache, actions) {
  const liste = app.arbre.enfants.get(tache.id) ?? [];
  const ajout = app.lectureSeule ? null : h('input', { class: 'tu-ajout-champ', type: 'text', placeholder: t('champ.ajouterSous'), 'aria-label': t('champ.ajouterSous'), autocomplete: 'off', dataset: { ajout: `sous:${tache.id}` },
    on: { keydown: async e => { if (e.key !== 'Enter' || !e.target.value.trim()) return; const titre = e.target.value.trim(); e.target.value = ''; actions.garderFocus(`sous:${tache.id}`); await app.ajouter({ titre, parent: tache.id }, t('msg.ajoutee')); },
      focus: () => { app.enSaisie = () => true; }, blur: () => { app.enSaisie = null; if (app.enAttente) app.rafraichir(); } } });
  return h('section', { class: 'tu-fiche-section' }, h('h3', null, t('champ.sousTachesTitre'), h('span', { class: 'tu-groupe-compte' }, String(liste.length))),
    liste.map(s => h('div', { class: 'tu-fiche-sous', dataset: { id: s.id } }, caseTermine(app, s), h('button', { type: 'button', class: `tu-lien${s.termine ? ' est-termine' : ''}`, on: { click: () => actions.ouvrirFiche(s.id) } }, s.titre || t('champ.sansTitre')), s.fin ? h('span', { class: 'tu-vide' }, etiquette(s.fin, I18n.language)) : null)), ajout);
}

function editeurBrut(app, tache, col) {
  const valeur = tache.brut[col.id];
  const base = baseType(col.type);
  const ecrire = v => app.modifierColonne(tache.id, { [col.id]: v }, t('msg.champ'));
  if (col.formule) return h('span', { class: 'tu-lecture', title: t('refus.formule') }, valeur === null || valeur === undefined ? '—' : String(valeur));
  if (base === 'Bool') return h('input', { type: 'checkbox', checked: Boolean(valeur) || null, 'aria-label': col.libelle, on: { change: e => ecrire(e.target.checked) } });
  if (base === 'Choice') return h('select', { class: 'tu-saisie', 'aria-label': col.libelle, on: { change: e => ecrire(e.target.value) } }, [h('option', { value: '' }, '—'), ...col.choix.map(c => h('option', { value: c.valeur, selected: c.valeur === valeur || null }, c.valeur))]);
  if (base === 'Numeric' || base === 'Int') return saisie(app, valeur ?? '', v => ecrire(v === '' ? null : Number(v)), { type: 'number', etiquetteAria: col.libelle, cle: `autre:${col.id}` });
  if (base === 'Text') return saisie(app, valeur ?? '', ecrire, { etiquetteAria: col.libelle, cle: `autre:${col.id}` });
  if (estReference(col.type) && col.table) {
    const ids = Array.isArray(valeur) ? valeur.slice(1) : valeur ? [valeur] : [];
    return h('span', { class: 'tu-lecture' }, ids.map(id => app.refs[col.id]?.get(id) ?? `#${id}`).join(', ') || '—');
  }
  return h('span', { class: 'tu-lecture' }, valeur === null || valeur === undefined || valeur === '' ? '—' : Array.isArray(valeur) ? valeur.slice(1).join(', ') : String(valeur));
}

function autresChamps(app, tache) {
  const reliees = new Set(Object.values(app.mapping).filter(Boolean));
  const autres = app.colonnes.filter(c => !reliees.has(c.id) && !['Attachments'].includes(baseType(c.type)));
  if (!autres.length) return null;
  return h('section', { class: 'tu-fiche-section' }, h('h3', null, t('champ.autres')), autres.map(c => champ(c.libelle, editeurBrut(app, tache, c), `autre:${c.id}`)));
}

// Fichiers liés : chaque lien se voit toujours ; « Ouvrir » et « Lier un fichier » sont grisés avec leur raison quand Tuesday est seul, en lecture seule, ou quand le fichier est introuvable.
function fichiersLies(app, tache, actions) {
  const L = app.liens;
  const bouton = (geste, libelle, raison, clic, lien = null) => h('button', { type: 'button', class: 'tu-btn', 'aria-disabled': raison ? 'true' : null, title: raison ? t(raison) : null, dataset: { geste, ...(lien ? { lien: String(lien.id) } : {}) },
    on: { click: () => (raison ? app.notifier({ texte: t(raison), type: 'info' }) : clic()) } }, libelle);
  const liste = L.de(tache.id).map(lien => {
    const perdu = L.estIntrouvable(lien);
    return h('li', { class: `tu-lien${perdu ? ' est-introuvable' : ''}`, dataset: { lien: String(lien.id) } },
      icone('lien', 14), h('span', { class: 'tu-lien-nom', title: `${lien.app} · ${lien.type}` }, lien.nom || lien.fichier),
      bouton('lien-ouvrir', t('liens.ouvrir'), L.raison('ouvrir', lien), () => actions.ouvrirLien(lien), lien),
      bouton('lien-retirer', t('liens.retirer'), L.raison('retirer'), () => actions.retirerLien(lien.id), lien));
  });
  return h('section', { class: 'tu-fiche-section' }, h('h3', null, t('liens.titre')),
    liste.length ? h('ul', { class: 'tu-liens' }, liste) : h('p', { class: 'tu-vide' }, t('liens.vide')),
    bouton('lier', t('liens.lier'), L.raison('lier'), () => actions.lierFichier(tache.id)));
}

export function vueFiche(app, actions) {
  const tache = app.selection !== null ? app.tache(app.selection) : null;
  if (!tache) return null;
  const m = app.mapping;
  const bloqueePar = tache.bloqueePar.map(id => app.tache(id)).filter(Boolean);
  return h('aside', { class: 'tu-fiche', role: 'complementary', 'aria-label': t('fiche.titre'), dataset: { id: tache.id }, on: { keydown: e => { if (e.key === 'Escape') actions.fermerFiche(); } } },
    h('header', { class: 'tu-fiche-tete' },
      caseTermine(app, tache),
      saisie(app, tache.titre, v => app.modifier(tache.id, { titre: v }, t('msg.titre')), { cle: 'fiche:titre', etiquetteAria: t('role.titre'), placeholder: t('champ.sansTitre') }),
      h('button', { type: 'button', class: 'tu-btn tu-btn-icone', 'aria-label': t('fiche.fermer'), title: t('fiche.fermer'), on: { click: () => actions.fermerFiche() } }, icone('croix'))),
    h('div', { class: 'tu-fiche-corps', dataset: { defile: 'fiche' } },
      m.statut ? champ(t('role.statut'), celluleStatut(app, tache), 'statut') : null,
      m.responsable ? champ(t('role.responsable'), celluleResponsables(app, tache), 'responsable') : null,
      m.debut ? champ(t('role.debut'), celluleDate(app, tache, 'debut'), 'debut') : null,
      m.echeance ? champ(t('role.echeance'), celluleDate(app, tache, 'echeance'), 'echeance') : null,
      m.priorite ? champ(t('role.priorite'), cellulePriorite(app, tache), 'priorite') : null,
      m.etiquettes ? champ(t('role.etiquettes'), menuEtiquettes(app, tache), 'etiquettes') : null,
      m.parent ? champ(t('role.parent'), menuParent(app, tache), 'parent') : null,
      m.avancement && tache.avancement !== null ? champ(t('role.avancement'), barreAvancement(tache.avancement), 'avancement') : null,
      bloqueePar.length ? champ(t('champ.bloquee'), h('span', { class: 'tu-lecture' }, bloqueePar.map(x => x.titre || t('champ.sansTitre')).join(', ')), 'bloquee') : null,
      m.description ? h('section', { class: 'tu-fiche-section' }, h('h3', null, t('role.description')), saisie(app, tache.description, v => app.modifier(tache.id, { description: v }, t('msg.description')), { multiligne: true, cle: 'fiche:description', etiquetteAria: t('role.description') })) : null,
      m.parent ? sousTaches(app, tache, actions) : null,
      fichiersLies(app, tache, actions),
      autresChamps(app, tache)),
    app.lectureSeule ? null : h('footer', { class: 'tu-fiche-pied' }, h('button', { type: 'button', class: 'tu-btn est-danger', on: { click: () => actions.supprimer(tache.id) } }, icone('corbeille'), t('fiche.supprimer'))));
}
