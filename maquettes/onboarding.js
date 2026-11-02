/* Maquette de Tuesday : écrans du premier lancement (onboarding), voir ../docs/onboarding.md.
   Chargé après maquette.js : en réutilise l'état (S), les actions (A) et les aides d'affichage.
   Données fictives, rien n'est écrit nulle part. */
'use strict';

const OB_SCREENS = ['demarrage', 'ob-acces', 'ob-colonnes', 'ob-statut', 'ob-ouverture', 'ob-enregistrer', 'ob-sans-table', 'ob-modele', 'ob-vide'];

// ---------- Morceaux communs ----------
const obTop = () => `<div class="tb"><span class="proj ob-name">${ic('project')}<span>Tuesday</span></span><span class="spacer"></span><span class="tb-gap"></span></div>`;
const obPill = (cls, label) => `<span class="pill ${cls}"><i></i>${esc(label)}</span>`;
const obHead = (title, sub) => `<h2 class="ob-h">${esc(title)}</h2>${sub ? `<p class="ob-p">${esc(sub)}</p>` : ''}`;
const obPage = (head, body, foot) => `<div class="ob-page"><div class="ob-scroll"><div class="ob-col">${head}${body}</div></div>${foot ? `<div class="ob-foot"><div class="ob-col">${foot}</div></div>` : ''}</div>`;
const obNameRow = (label, value) => `<div class="map-row ob-name-row"><div class="role">${label}</div><input class="field-input" value="${esc(value)}" aria-label="${label}"></div>`;

// ---------- 3.0 Accès à Grist ----------
function obAcces() {
  return obTop() + `<div class="center"><div class="empty">${ic('lock', 'big')}<h2>En attente de l'accès à vos données</h2>
    <p>Tuesday a besoin de l'accès complet pour lire votre table. Rien n'est lu ni écrit avant votre accord.</p>
    <ol class="ob-steps"><li>Dans le panneau de droite de Grist, choisissez <b>Accès complet au document</b>.</li><li>Cliquez sur <b>Accepter</b>.</li></ol>
    <div class="row"><button class="btn line" data-act="screen" data-v="demarrage">Réessayer</button></div></div></div>`;
}

// ---------- 3.2 Choisir la table ----------
function obDemarrage() {
  const row = (rec, name, rows, detail, off) => `<div class="ob-tab ${rec ? 'rec' : ''} ${off ? 'off' : ''}">${ic('table')}<div class="main"><div class="n"><b class="ellipsis">${esc(name)}</b><span class="muted">${esc(rows)}</span></div><div class="sub ellipsis">${esc(detail)}</div></div>
    <button class="btn ${rec ? 'primary' : 'line'}" data-act="screen" data-v="ob-colonnes" ${off ? 'disabled' : ''}>Continuer</button></div>`;
  const body = `<div class="ob-list">
    ${row(true, 'Tâches du projet', '42 lignes', 'Titre : Tâche · Statut : État (5 choix) · Échéance : Date limite')}
    ${row(false, 'Actions de la direction', '118 lignes', 'Titre : Action · Statut : Avancement · Échéance : Pour le')}
    ${row(false, 'Équipe', '6 lignes', 'Titre : Nom · pas de colonne de statut')}
    ${row(false, 'Budget 2026', '12 lignes', 'Aucune colonne de texte pour les titres', true)}</div>`;
  const foot = `<button class="btn line" data-act="screen" data-v="ob-sans-table" title="Crée une table de tâches après votre accord">Créer un modèle de départ…</button>`;
  return obTop() + obPage(obHead('Quelle table voulez-vous suivre ?', 'Vos données restent où elles sont. Rien n\'est créé sans votre accord.'), body, foot);
}

// ---------- 3.3 Confirmer les colonnes (et la question quand une ligne est ambiguë) ----------
function obSel(name, type, badge, act) {
  return `<button class="sel" ${act ? `data-act="${act}"` : ''}>${esc(name)}<span class="ty">${esc(type)}</span>${badge ? `<span class="badge-ok">${ic('check')}${badge}</span>` : ''}${ic('down')}</button>`;
}
function obColonnes(ambiguous) {
  const pick = S.obPick === undefined ? null : S.obPick;
  let status;
  if (ambiguous && pick === null) {
    status = `<div class="map-row ob-ask"><div class="role">Statut<span class="req" title="Choix à faire">*</span><div class="ob-tobe">À choisir</div></div><div class="ob-cands" role="radiogroup" aria-label="Quelle colonne donne l'état d'avancement ?">
      <div class="ob-q">Quelle colonne donne l'état d'avancement ?</div>
      <button class="ob-cand" role="radio" aria-checked="false" data-act="obpick" data-v="Colonne A"><span class="n"><b>Colonne A</b><span class="muted">Choix</span></span><span class="pv">${obPill('st-todo', 'À faire')}${obPill('st-doing', 'En cours')}${obPill('st-done', 'Terminé')}</span></button>
      <button class="ob-cand" role="radio" aria-checked="false" data-act="obpick" data-v="Colonne B"><span class="n"><b>Colonne B</b><span class="muted">Choix</span></span><span class="pv">${obPill('st-todo', 'Basse')}${obPill('st-doing', 'Normale')}${obPill('st-blocked', 'Haute')}</span></button>
      <button class="ob-cand none" role="radio" aria-checked="false" data-act="obpick" data-v="">Aucune de celles-ci <span class="muted">· ouvrir sans statut, le kanban sera grisé</span></button></div></div>`;
  } else if (ambiguous) {
    status = `<div class="map-row"><div class="role">Statut<span class="req" title="Obligatoire">*</span></div>${pick === '' ? obSel('Aucune colonne de statut', '', '', 'obunpick') : obSel(pick, 'Choix', 'Choisie', 'obunpick')}</div>`;
  } else {
    status = `<div class="map-row"><div class="role">Statut<span class="req" title="Obligatoire">*</span></div>${obSel('État', 'Choix', 'Reconnue')}</div>`;
  }
  const blocked = ambiguous && pick === null;
  const sub = ambiguous && pick === null ? '' : 'Tuesday a rempli ce qu\'il a reconnu. Vérifiez, puis ouvrez.';
  const body = `<div class="map-row"><div class="role">Table</div>${obSel('Tâches du projet', '42 lignes', '')}</div>
    <div class="map-row"><div class="role">Titre<span class="req" title="Obligatoire">*</span></div>${obSel('Tâche', 'Texte', 'Reconnue')}</div>
    ${status}
    <div class="ob-more">${ic('check')}<span><b>4 autres colonnes reconnues</b> : Responsable, Début, Échéance, Priorité</span><button class="lnk" data-act="screen" data-v="correspondance">Tout afficher</button></div>
    <div class="note">${ic('info')} Tuesday pourra modifier : Statut, Responsable, Début, Échéance. Les autres colonnes ne sont que lues.</div>`;
  const foot = `<button class="btn line" data-act="screen" data-v="demarrage">Annuler</button><button class="btn primary" data-act="screen" data-v="ob-ouverture" ${blocked ? 'disabled title="Choisissez la colonne de statut"' : ''}>Ouvrir</button>`;
  return obTop() + obPage(obHead('Confirmez les colonnes', sub), body, foot);
}

// ---------- 3.4 Le projet s'ouvre, avec le bandeau « Garder pour l'équipe » ----------
function obOuverture(overlay) {
  const sv = S.screen; S.screen = 'tableau'; const tb = toolbar(); S.screen = sv;
  const show = !S.ro && !S.obSaved && !S.obHide;
  const banner = show ? `<div class="ob-banner">${ic('info')}<span class="ellipsis">Ce projet n'est visible que par vous.</span><button class="btn line" data-act="screen" data-v="ob-enregistrer">Garder pour l'équipe</button><button class="btn icon" data-act="obhide" aria-label="Fermer ce message">${ic('close')}</button></div>` : '';
  return tb + banner + `<div class="body">${viewTableau(visible())}${overlay || ''}${menuHtml()}${S.toast || ''}</div>`;
}

// ---------- 3.6 Garder pour l'équipe (seul moment où Tuesday crée une table) ----------
function obEnregistrer() {
  const denied = S.noSchema;
  const body = denied
    ? `<p>Grist ne permet pas de créer la table avec votre compte. Demandez à une personne propriétaire du document ; en attendant, Tuesday fonctionne en essai.</p><div class="note">${ic('lock')} Rien n'est perdu : le projet reste utilisable, pour vous seulement.</div>`
    : `<p>Tuesday va créer une table, <b>Tuesday_Projets</b>, dans ce document (une seule fois). Elle garde le nom du projet et les colonnes reliées. Vos tâches ne sont pas copiées.</p>${obNameRow('Nom du projet', 'Tâches du projet')}<div class="note">${ic('info')} « Plus tard » ne change rien : le projet reste visible pour vous seulement.</div>`;
  const foot = denied
    ? `<button class="btn line" data-act="screen" data-v="ob-ouverture">Fermer</button><button class="btn primary" disabled title="Droit de créer une table requis">Créer la table et enregistrer</button>`
    : `<button class="btn line" data-act="screen" data-v="ob-ouverture">Plus tard</button><button class="btn primary" data-act="obsave">Créer la table et enregistrer</button>`;
  return obWindow('Garder ce projet pour l\'équipe', body, foot, obOuverture);
}
function obWindow(title, body, foot, bg) {
  const win = `<div class="scrim"><div class="win" role="dialog" aria-modal="true" aria-labelledby="obwt"><div class="win-h"><h2 id="obwt">${esc(title)}</h2><button class="btn icon" data-act="screen" data-v="${bg === obOuverture ? 'ob-ouverture' : 'ob-sans-table'}" aria-label="Fermer">${ic('close')}</button></div><div class="win-b">${body}</div><div class="win-f">${foot}</div></div></div>`;
  return bg === obOuverture ? obOuverture(win) : obTop() + `<div class="center"><div class="empty">${ic('table', 'big')}<h2>Votre document n'a pas encore de table de tâches.</h2></div></div>${win}`;
}

// ---------- 3.7 Sans table, puis le modèle de départ ----------
function obSansTable() {
  return obTop() + `<div class="center"><div class="empty">${ic('table', 'big')}<h2>Votre document n'a pas encore de table de tâches.</h2>
    <p>Tuesday peut en créer une pour démarrer, après votre accord. Vous gardez la main sur ses colonnes.</p>
    <div class="row"><button class="btn primary" data-act="screen" data-v="ob-modele">Créer un modèle de départ…</button><button class="btn line" disabled title="Aucune autre table dans ce document">Choisir une autre table</button></div></div></div>`;
}
function obModele() {
  const body = `<p>Une table pour suivre un projet, créée dans votre document.</p>${obNameRow('Nom de la table', 'Tâches du projet')}
    <div class="ob-will"><b>Sera créé :</b> une table avec les colonnes
      <ul><li><b>Tâche</b> <span class="muted">texte</span></li><li><b>Statut</b> <span class="muted">choix</span> ${obPill('st-todo', 'À faire')}${obPill('st-doing', 'En cours')}${obPill('st-review', 'En revue')}${obPill('st-blocked', 'Bloqué')}${obPill('st-done', 'Terminé')}</li>
      <li><b>Responsable</b> <span class="muted">texte</span></li><li><b>Début</b> et <b>Échéance</b> <span class="muted">dates</span></li><li><b>Priorité</b> <span class="muted">choix</span></li></ul></div>
    <label class="ob-chk"><input type="checkbox" checked><span>Ajouter trois tâches d'exemple <span class="muted">(vous pourrez les supprimer d'un geste)</span></span></label>`;
  const foot = `<button class="btn line" data-act="screen" data-v="ob-sans-table">Annuler</button><button class="btn primary" data-act="screen" data-v="ob-colonnes">Créer et ouvrir</button>`;
  const win = `<div class="scrim"><div class="win" role="dialog" aria-modal="true" aria-labelledby="obwt"><div class="win-h"><h2 id="obwt">Créer un modèle de départ</h2><button class="btn icon" data-act="screen" data-v="ob-sans-table" aria-label="Fermer">${ic('close')}</button></div><div class="win-b">${body}</div><div class="win-f">${foot}</div></div></div>`;
  return obTop() + `<div class="center"><div class="empty">${ic('table', 'big')}<h2>Votre document n'a pas encore de table de tâches.</h2></div></div>${win}`;
}

// ---------- 3.8 La première tâche ----------
function obVide() {
  const sv = S.screen; S.screen = 'tableau'; const tb = toolbar(); S.screen = sv;
  setTimeout(() => { const i = $('#ob-first'); if (i) i.focus(); }, 0);
  return tb + `<div class="body"><div class="zone"><div class="tbl"><div class="tbl-head"><span>Tâche</span><span>Statut</span><span>Responsable</span><span>Échéance</span><span>Priorité</span></div>
    <div class="ob-first"><input id="ob-first" class="field-input" placeholder="Nom de la première tâche" aria-label="Nom de la première tâche" ${S.ro ? 'disabled' : ''}></div>
    <p class="ob-hint">Appuyez sur Entrée : la ligne est créée dans Grist.</p></div></div>${S.toast || ''}</div>`;
}

// ---------- Branchement sur maquette.js ----------
const ONB = {
  has: (sc) => OB_SCREENS.includes(sc),
  render: (sc) => ({
    'demarrage': obDemarrage, 'ob-acces': obAcces, 'ob-colonnes': () => obColonnes(false), 'ob-statut': () => obColonnes(true), 'ob-ouverture': () => obOuverture(),
    'ob-enregistrer': obEnregistrer, 'ob-sans-table': obSansTable, 'ob-modele': obModele, 'ob-vide': obVide,
  }[sc])(),
};
Object.assign(A, {
  obpick: (v) => { S.obPick = v; },
  obunpick: () => { S.obPick = null; },
  obhide: () => { S.obHide = true; },
  obsave: () => { S.obSaved = true; S.screen = 'tableau'; toast('Projet enregistré. Votre équipe le retrouvera.', () => { S.obSaved = false; }); },
});
// repartir de zéro quand on rouvre un écran depuis le pupitre
document.querySelectorAll('.mq-top [data-screen^="ob-"]').forEach((b) => b.addEventListener('click', () => { S.obPick = null; S.obHide = false; S.obSaved = false; }));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'ob-first' && e.target.value.trim()) toast('La ligne est ajoutée dans Grist (maquette : rien n\'est écrit)', null);
});
const obUrl = new URLSearchParams(location.search);
if (obUrl.get('noschema') === '1') { S.noSchema = true; const c = $('#noschema'); if (c) c.checked = true; }
const obBox = $('#noschema'); if (obBox) obBox.addEventListener('change', (e) => { S.noSchema = e.target.checked; render(); });
if (ONB.has(S.screen)) render();
