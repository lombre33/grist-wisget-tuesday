/* Maquette V1 de Tuesday : données d'exemple fictives, aucun accès à Grist, aucun réseau. */
'use strict';

// ---------- Données d'exemple ----------
const TODAY = '2026-11-02';
const ME = 'L. Bernard';
const STATUS = [
  { k: 'todo', n: 'À faire' }, { k: 'doing', n: 'En cours' }, { k: 'review', n: 'En revue' },
  { k: 'blocked', n: 'Bloqué' }, { k: 'done', n: 'Terminé' },
];
const PRIO = { 1: 'Normale', 2: 'Haute', 3: 'Urgente' };
const GROUPS = ['Cadrage', 'Conception', 'Développement', 'Déploiement'];
const TASKS = [
  { id: 1, t: 'Atelier de cadrage avec les métiers', g: 'Cadrage', s: 'done', w: 'L. Bernard', b: '2026-10-19', e: '2026-10-23', p: 2, tags: ['Atelier'], pr: 100 },
  { id: 2, t: 'Rédiger le cahier des charges', g: 'Cadrage', s: 'done', w: 'L. Bernard', b: '2026-10-21', e: '2026-10-30', p: 2, tags: [], pr: 100 },
  { id: 3, t: 'Arbitrage budgétaire', g: 'Cadrage', s: 'review', w: 'M. Petit', b: '2026-10-28', e: '2026-10-30', p: 3, tags: ['Budget'], pr: 70 },
  { id: 4, t: "Maquettes des pages d'accueil", g: 'Conception', s: 'doing', w: 'S. Durand', b: '2026-10-27', e: '2026-11-13', p: 2, tags: ['Design'], pr: 55 },
  { id: 41, t: 'Maquette mobile', g: 'Conception', s: 'doing', w: 'S. Durand', b: '2026-10-29', e: '2026-11-06', p: 2, tags: [], pr: 40, par: 4 },
  { id: 42, t: 'Maquette bureau', g: 'Conception', s: 'done', w: 'S. Durand', b: '2026-10-27', e: '2026-10-30', p: 2, tags: [], pr: 100, par: 4 },
  { id: 43, t: "Revue d'accessibilité", g: 'Conception', s: 'todo', w: 'L. Bernard', b: '2026-11-09', e: '2026-11-13', p: 1, tags: [], pr: 0, par: 4 },
  { id: 5, t: 'Charte graphique et composants', g: 'Conception', s: 'doing', w: 'S. Durand', b: '2026-11-02', e: '2026-11-20', p: 1, tags: ['Design'], pr: 30 },
  { id: 6, t: 'Tests utilisateurs', g: 'Conception', s: 'todo', w: 'L. Bernard', b: '2026-11-16', e: '2026-11-27', p: 1, tags: [], pr: 0 },
  { id: 7, t: "Choix de l'hébergement", g: 'Développement', s: 'blocked', w: 'M. Petit', b: '2026-11-02', e: '2026-11-09', p: 3, tags: ['Budget'], pr: 20 },
  { id: 8, t: 'Intégration des gabarits', g: 'Développement', s: 'todo', w: 'K. Moreau', b: '2026-11-09', e: '2026-12-04', p: 2, tags: [], pr: 0 },
  { id: 9, t: 'API de recherche', g: 'Développement', s: 'todo', w: 'K. Moreau', b: '2026-11-23', e: '2026-12-11', p: 1, tags: [], pr: 0 },
  { id: 10, t: 'Migration des contenus', g: 'Déploiement', s: 'todo', w: 'R. Girard', b: '2026-12-01', e: '2026-12-18', p: 1, tags: [], pr: 0 },
  { id: 11, t: 'Recette et corrections', g: 'Déploiement', s: 'todo', w: 'L. Bernard', b: '2026-12-14', e: '2027-01-08', p: 2, tags: [], pr: 0 },
  { id: 12, t: 'Mise en production', g: 'Déploiement', s: 'todo', w: 'M. Petit', b: '2027-01-12', e: '2027-01-12', p: 3, tags: [], pr: 0 },
  { id: 13, t: 'Former les contributeurs', g: 'Déploiement', s: 'todo', w: 'R. Girard', b: '', e: '', p: 1, tags: [], pr: 0 },
  { id: 14, t: 'Plan de communication', g: 'Cadrage', s: 'doing', w: 'L. Bernard', b: '', e: '', p: 1, tags: ['Atelier'], pr: 10 },
];
const EXTRA = [['Direction', 'Direction du numérique'], ['Budget (k€)', '48'], ['Lien', 'Marché 2026-14']];

// ---------- Utilitaires ----------
const $ = (s, r = document) => r.querySelector(s);
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
const day = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
const iso = (n) => new Date(n * 864e5).toISOString().slice(0, 10);
const fmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const fdate = (s) => (s ? fmt.format(new Date(day(s) * 864e5)) : '—');
const isoWeek = (n) => { const dt = new Date(n * 864e5); const d = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())); const wd = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - wd + 3); const y = d.getUTCFullYear(); const jan4 = new Date(Date.UTC(y, 0, 4)); return 1 + Math.round(((d - jan4) / 864e5 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7); };
const initials = (n) => n.replace(/[^A-Za-zÀ-ÿ ]/g, '').split(' ').map((p) => p[0]).join('').slice(0, 2);
const ICONS = {
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
  kanban: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  timeline: '<path d="M4 6h9M8 12h11M6 18h8"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2"/>',
  filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
  group: '<path d="M12 4l9 5-9 5-9-5z"/><path d="M3 14l9 5 9-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', down: '<path d="M6 9l6 6 6-6"/>', right: '<path d="M9 6l6 6-6 6"/>', left: '<path d="M15 6l-6 6 6 6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>', folder: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
  apps: '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  move: '<path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
  open: '<path d="M14 4h6v6M20 4l-9 9M10 6H5v13h13v-5"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 010 8"/>', check: '<path d="M5 12l5 5 9-10"/>', lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  slides: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M12 17v4M8 21h8"/>',
  doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>', grid: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 10h16M4 14.5h16M10 5v14"/>',
  form: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>', bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>', project: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 13h5M8 16h8"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', pin: '<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v7"/>',
};
const ic = (n, extra = '') => `<svg class="i ${extra}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
const stOf = (k) => STATUS.find((s) => s.k === k);
const pill = (k, tag = 'span', attr = '') => `<${tag} class="pill st-${k}" ${attr}><i></i>${esc(stOf(k).n)}</${tag}>`;
const prio = (p) => `<span class="prio p${p}"><b><i></i><i></i><i></i></b>${PRIO[p]}</span>`;
const who = (w) => (w ? `<span class="who"><span class="avatar" aria-hidden="true">${esc(initials(w))}</span><span>${esc(w)}</span></span>` : '<span class="muted">—</span>');
const isLate = (t) => t.e && t.s !== 'done' && day(t.e) < day(TODAY);
const due = (t) => (t.e ? `<span class="due ${isLate(t) ? 'late' : ''}">${fdate(t.e)}${isLate(t) ? ' · En retard' : ''}</span>` : '<span class="muted">—</span>');

// ---------- État ----------
const S = {
  screen: 'tableau', groupBy: 'g', collapsed: new Set(), expanded: new Set([4]), sel: 1, filters: { mine: false, late: false }, q: '',
  zoom: 'mois', month: { y: 2026, m: 10 }, menu: null, ro: false, noStart: false, undo: [], searching: false, size: '700x400', bar: 'left', theme: 'light',
};

// ---------- Données dérivées ----------
function visible() {
  const q = norm(S.q).split(' ').filter(Boolean);
  return TASKS.filter((t) => (!S.filters.mine || t.w === ME) && (!S.filters.late || isLate(t)) && q.every((w) => norm(t.t + ' ' + t.w + ' ' + t.g).includes(w)));
}
function groups(list) {
  const top = list.filter((t) => !t.par);
  if (S.groupBy === 's') return STATUS.map((s) => ({ key: s.k, label: s.n, cls: 'st-' + s.k, tasks: top.filter((t) => t.s === s.k) })).filter((g) => g.tasks.length);
  if (S.groupBy === 'w') return [...new Set(top.map((t) => t.w))].map((w) => ({ key: w, label: w, tasks: top.filter((t) => t.w === w) }));
  return GROUPS.map((g) => ({ key: g, label: g, tasks: top.filter((t) => t.g === g) })).filter((g) => g.tasks.length);
}

// ---------- Barre du haut ----------
function toolbar() {
  const tab = (id, icon, label) => {
    const off = id === 'chronologie' && S.noStart;
    return `<button class="tab ${off ? 'is-off' : ''}" role="tab" data-act="screen" data-v="${id}" aria-selected="${S.screen === id}" title="${label}${off ? ' : reliez une colonne Début' : ''}">${ic(icon)}<span class="lbl">${label}</span></button>`;
  };
  const nf = Object.values(S.filters).filter(Boolean).length;
  const dis = S.ro ? 'disabled' : '';
  return `<div class="tb">
    <button class="btn proj" data-act="menu" data-v="projet" aria-haspopup="menu" title="Refonte du site de la direction">${ic('project')}<span class="ellipsis">Refonte du site de la direction</span>${ic('down')}</button>
    <div class="tabs" role="tablist">${tab('tableau', 'table', 'Tableau')}${tab('kanban', 'kanban', 'Kanban')}${tab('calendrier', 'calendar', 'Calendrier')}${tab('chronologie', 'timeline', 'Chronologie')}</div>
    <span class="spacer"></span><span class="tb-gap"></span>
    ${S.searching ? `<label class="search">${ic('search')}<input id="q" value="${esc(S.q)}" placeholder="Rechercher…" aria-label="Rechercher"></label>` : `<button class="btn icon" data-act="search" title="Rechercher" aria-label="Rechercher">${ic('search')}</button>`}
    <button class="btn has-lbl" data-act="menu" data-v="filtre" aria-haspopup="menu" title="Filtrer">${ic('filter')}<span class="lbl">Filtrer</span>${nf ? `<span class="badge">${nf}</span>` : ''}</button>
    <button class="btn has-lbl" data-act="menu" data-v="groupe" aria-haspopup="menu" title="Grouper" ${S.screen === 'kanban' || S.screen === 'calendrier' ? 'disabled' : ''}>${ic('group')}<span class="lbl">Grouper</span></button>
    <button class="btn primary has-lbl" data-act="add" ${dis} title="${S.ro ? 'Lecture seule : ajout impossible' : 'Nouvelle tâche'}">${ic('plus')}<span class="lbl">Tâche</span></button>
  </div>${chipsRow()}${S.ro ? `<div class="ro-note">${ic('lock')}Lecture seule : vous pouvez tout voir, rien ne se modifie.</div>` : ''}`;
}
function chipsRow() {
  const c = [];
  if (S.filters.mine) c.push(['mine', 'Mes tâches']);
  if (S.filters.late) c.push(['late', 'En retard']);
  if (S.q) c.push(['q', `« ${esc(S.q)} »`]);
  if (!c.length) return '';
  return `<div class="chips">${c.map(([k, l]) => `<span class="chip">${l}<button data-act="unchip" data-v="${k}" aria-label="Retirer ${l}">${ic('close')}</button></span>`).join('')}</div>`;
}

// ---------- Vues ----------
function viewTableau(list) {
  const rows = [];
  for (const g of groups(list)) {
    const open = !S.collapsed.has(g.key);
    rows.push(`<button class="grp ${g.cls || ''}" data-act="fold" data-v="${esc(g.key)}" aria-expanded="${open}">${ic('down')}<span class="bar"></span>${esc(g.label)}<span class="count">${g.tasks.length}</span></button>`);
    if (!open) continue;
    for (const t of g.tasks) {
      const subs = list.filter((x) => x.par === t.id);
      const ex = S.expanded.has(t.id);
      rows.push(rowHtml(t, false, subs.length, ex));
      if (ex) subs.forEach((x) => rows.push(rowHtml(x, true, 0, false)));
    }
    rows.push(`<button class="tbl-add" data-act="add" ${S.ro ? 'disabled title="Lecture seule"' : ''}>${ic('plus')}Ajouter une tâche</button>`);
  }
  if (!rows.length) return `<div class="center"><div class="empty"><h2>Aucune tâche ne correspond</h2><p>Retirez un filtre pour revoir les ${TASKS.length} tâches.</p></div></div>`;
  return `<div class="zone"><div class="tbl"><div class="tbl-head"><span>Tâche</span><span>Statut</span><span>Responsable</span><span>Échéance</span><span>Priorité</span></div>${rows.join('')}</div></div>`;
}
function rowHtml(t, sub, nsub, ex) {
  const tw = nsub ? `<button class="twist" data-act="twist" data-v="${t.id}" aria-label="${ex ? 'Replier' : 'Déplier'} les sous-tâches" aria-expanded="${ex}">${ic(ex ? 'down' : 'right')}</button>` : (sub ? '' : '<span style="width:18px;flex:none"></span>');
  return `<div class="tbl-row ${sub ? 'sub' : ''} ${S.sel === t.id ? 'sel' : ''}" data-act="open" data-v="${t.id}" tabindex="0">
    <span class="t">${tw}<span class="ellipsis">${esc(t.t)}</span>${nsub ? `<span class="nsub" title="${nsub} sous-tâches" aria-label="${nsub} sous-tâches">${nsub}</span>` : ''}</span>
    ${pill(t.s, S.ro ? 'span' : 'button', S.ro ? '' : `data-act="menu" data-v="statut:${t.id}" aria-haspopup="menu"`)}
    ${who(t.w)}${due(t)}${prio(t.p)}</div>`;
}
function viewKanban(list) {
  const top = list.filter((t) => !t.par);
  const cols = STATUS.map((s) => {
    const cards = top.filter((t) => t.s === s.k).map((t) => `<div class="card" draggable="${!S.ro}" data-act="open" data-v="${t.id}" data-id="${t.id}">
      <div class="ttl">${esc(t.t)}</div>
      ${t.tags.length ? `<div>${t.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join(' ')}</div>` : ''}
      <div class="meta"><div>${prio(t.p)}${t.e ? due(t) : ''}</div>${t.w ? `<span class="avatar" title="${esc(t.w)}">${esc(initials(t.w))}</span>` : ''}</div></div>`).join('');
    return `<section class="col st-${s.k}" data-col="${s.k}" aria-label="${esc(s.n)}"><h3>${pill(s.k)}<span class="count">${top.filter((t) => t.s === s.k).length}</span></h3>
      <div class="cards">${cards}</div><button class="tbl-add col-add" data-act="add" ${S.ro ? 'disabled' : ''}>${ic('plus')}Ajouter</button></section>`;
  }).join('');
  return `<div class="zone" style="overflow:auto"><div class="kan">${cols}</div></div>`;
}
function viewCalendrier(list) {
  const { y, m } = S.month;
  const first = Date.UTC(y, m, 1) / 864e5;
  const start = first - ((new Date(first * 864e5).getUTCDay() + 6) % 7);
  const label = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(first * 864e5));
  const nodate = list.filter((t) => !t.e && !t.par).length;
  let cells = ['<div class="wd"></div>', ...['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => `<div class="wd">${d}</div>`)];
  for (let w = 0; w < 6; w++) {
    cells.push(`<div class="wk">S${isoWeek(start + w * 7)}</div>`);
    for (let d = 0; d < 7; d++) {
      const n = start + w * 7 + d; const s = iso(n);
      const ev = list.filter((t) => t.e === s && !t.par);
      const out = new Date(n * 864e5).getUTCMonth() !== m;
      const num = new Date(n * 864e5).getUTCDate();
      cells.push(`<div class="day ${out ? 'out' : ''} ${s === TODAY ? 'today' : ''}" data-date="${s}"><div class="dn"><b>${num}</b>${ev.length > 2 ? `<span class="more">+${ev.length - 2}</span>` : ''}</div>${ev.slice(0, 2).map((t) => `<button class="ev st-${t.s}" data-act="open" data-v="${t.id}" data-id="${t.id}" draggable="${!S.ro}" title="${esc(t.t)}"><span class="ellipsis" style="display:block">${esc(t.t)}</span></button>`).join('')}</div>`);
    }
  }
  return `<div class="cal-head"><button class="btn icon" data-act="month" data-v="-1" aria-label="Mois précédent">${ic('left')}</button><h2>${label[0].toUpperCase() + label.slice(1)}</h2><button class="btn icon" data-act="month" data-v="1" aria-label="Mois suivant">${ic('right')}</button><button class="btn line" data-act="today">Aujourd'hui</button><span class="tag" title="Le calendrier est un widget à part que Tuesday intègre">Widget Calendrier</span><span class="spacer"></span><div class="seg"><button aria-pressed="true">Mois</button><button aria-pressed="false" class="is-off" title="Semaine : même vue en V1, détail dans le cahier">Semaine</button></div><button class="btn line" data-act="menu" data-v="sansdate" aria-haspopup="menu">Sans date <span class="badge">${nodate}</span></button></div><div class="zone" style="padding-top:0"><div class="cal">${cells.join('')}</div></div>`;
}
const ZOOM = { semaine: 20, mois: 8, trimestre: 4 };
function viewChrono(list) {
  if (S.noStart) {
    return `<div class="center"><div class="empty">${ic('timeline', 'big')}<h2>La chronologie a besoin d'une colonne Début</h2><p>Votre table n'a pas de colonne de début reliée. Reliez-en une pour voir les durées ; le tableau, le kanban et le calendrier continuent de marcher.</p><div class="row"><button class="btn primary" data-act="screen" data-v="correspondance">Relier une colonne Début</button><button class="btn line" data-act="screen" data-v="tableau">Retour au tableau</button></div></div></div>`;
  }
  const dw = ZOOM[S.zoom];
  const t0 = day('2026-10-12'); const t1 = day('2027-01-18'); const total = (t1 - t0) * dw; const lw = S.bar === 'left' ? 236 : 190; const todayN = day(TODAY);
  let scale = '';
  for (let d = t0; d < t1; d++) {
    const dt = new Date(d * 864e5);
    if (dt.getUTCDate() === 1 || d === t0) scale += `<div class="m" style="left:${(d - t0) * dw}px">${new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' }).format(dt)}</div>`;
    if (dt.getUTCDay() === 1) scale += `<div class="w" style="left:${(d - t0) * dw}px;width:${7 * dw}px">${dw >= 8 && !(d <= todayN && todayN < d + 7) ? 'S' + isoWeek(d) : ''}</div>`;
  }
  const today = (day(TODAY) - t0) * dw;
  const rows = [];
  for (const g of groups(list)) {
    rows.push(`<div class="tl-row g"><div class="tl-label">${esc(g.label)} <span class="muted">${g.tasks.length}</span></div><div class="tl-track" style="width:${total}px;--dw:${dw}px;--off:0px"></div></div>`);
    for (const t of g.tasks) rows.push(tlRow(t, t0, dw, total));
  }
  const left = Math.max(0, today - 70);
  return `<div class="tl-wrap" id="tlw" data-left="${left}"><div class="tl" style="width:${lw + total}px;--tlw:${lw}px">
    <div class="tl-head"><div class="tl-corner">${esc('Tâche')}</div><div class="tl-scale" style="width:${total}px">${scale}</div></div>
    ${rows.join('')}<div class="today-line" style="left:${lw + today}px"></div><div class="today-flag" style="left:${lw + today}px">Aujourd'hui</div></div></div>
    <div style="position:absolute;right:12px;bottom:10px;z-index:8;display:flex;gap:8px" class="zone-free"><div class="seg" style="box-shadow:var(--shadow-card)">${Object.keys(ZOOM).map((z) => `<button aria-pressed="${S.zoom === z}" data-act="zoom" data-v="${z}">${z[0].toUpperCase() + z.slice(1)}</button>`).join('')}</div><button class="btn line is-off" disabled title="Dépendances : prévues en V2">Dépendances</button></div>`;
}
function tlRow(t, t0, dw, total) {
  const has = t.b && t.e;
  let bar = '';
  if (has) {
    const x = (day(t.b) - t0) * dw; const w = (day(t.e) - day(t.b) + 1) * dw;
    if (t.b === t.e) bar = `<span class="miles" style="left:${x + dw / 2}px" title="${esc(t.t)} (jalon)"></span>`;
    else bar = `<button class="bar-t st-${t.s}" style="left:${x}px;width:${w}px" data-act="open" data-v="${t.id}" title="${esc(t.t)} · ${fdate(t.b)} → ${fdate(t.e)}"><span class="fill" style="width:${t.pr}%"></span><span>${w > 90 ? esc(t.t) : ''}</span></button>`;
  }
  return `<div class="tl-row"><div class="tl-label"><span class="ellipsis" style="flex:1">${t.par ? '↳ ' : ''}${esc(t.t)}</span>${!has ? '<span class="tag">Sans date</span>' : ''}${t.w ? `<span class="avatar" title="${esc(t.w)}">${esc(initials(t.w))}</span>` : ''}</div><div class="tl-track" style="width:${total}px;--dw:${dw}px;--off:0px">${bar}</div></div>`;
}

// ---------- Fiche ----------
function drawer() {
  const t = TASKS.find((x) => x.id === S.sel) || TASKS[0];
  const subs = TASKS.filter((x) => x.par === t.id);
  const ro = S.ro ? 'disabled' : '';
  return `<aside class="drawer" aria-label="Fiche de la tâche"><div class="dr-head"><input class="ttl" value="${esc(t.t)}" aria-label="Titre" ${ro}><button class="btn icon" data-act="menu" data-v="plus" aria-haspopup="menu" aria-label="Plus d'actions">${ic('more')}</button><button class="btn icon" data-act="closedrawer" aria-label="Fermer la fiche">${ic('close')}</button></div>
  <div class="dr-body">
    <div class="fld"><label>Statut</label><div class="v">${pill(t.s, S.ro ? 'span' : 'button', S.ro ? '' : `data-act="menu" data-v="statut:${t.id}"`)}</div></div>
    <div class="fld"><label>Responsable</label><div class="v"><button class="lnk" data-act="noop" title="Ouvre la ligne liée (table Équipe)">${who(t.w)}</button></div></div>
    <div class="fld"><label>Début</label><div class="v">${S.noStart ? '<span class="badge-lock">' + ic('lock') + 'Colonne non reliée</span>' : fdate(t.b)}</div></div>
    <div class="fld"><label>Échéance</label><div class="v">${due(t)}</div></div>
    <div class="fld"><label>Priorité</label><div class="v">${prio(t.p)}</div></div>
    <div class="fld"><label>Étiquettes</label><div class="v">${t.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join('') || '<span class="muted">—</span>'}</div></div>
    <div class="fld"><label>Avancement</label><div class="v"><div class="prog" role="progressbar" aria-valuenow="${t.pr}" aria-valuemin="0" aria-valuemax="100"><i style="width:${t.pr}%"></i></div><span class="muted">${t.pr} %</span></div></div>
    <div class="fld block"><label>Description</label><textarea class="field-input" ${ro}>Cadrer le périmètre avec les métiers et valider les priorités.</textarea></div>
    <h4>Sous-tâches (${subs.length})</h4>
    <ul class="subs">${subs.map((x) => `<li><input type="checkbox" ${x.s === 'done' ? 'checked' : ''} ${ro} aria-label="${esc(x.t)}"><span class="${x.s === 'done' ? 'done' : ''} ellipsis">${esc(x.t)}</span></li>`).join('') || '<li class="muted">Aucune sous-tâche</li>'}
    <li><button class="tbl-add" style="padding-left:0;border:0;background:transparent" ${ro}>${ic('plus')}Ajouter une sous-tâche</button></li></ul>
    <h4>Fichiers liés (2)</h4>
    <ul class="subs files">
      <li>${ic('doc', 'ty-doc')}<span class="ellipsis" style="flex:1">Compte rendu de l'atelier<span class="muted"> · Publipostage+</span></span><button class="btn line" ${S.ro ? '' : ''}>Ouvrir</button></li>
      <li>${ic('slides', 'ty-slides')}<span class="ellipsis" style="flex:1">Présentation de cadrage<span class="muted"> · Publipostage+</span></span><button class="btn line">Ouvrir</button></li>
      <li><button class="tbl-add" style="padding-left:0;border:0;background:transparent" ${ro} title="Ouvre l'explorateur de GFS pour choisir un fichier">${ic('plus')}Lier un fichier…</button></li></ul>
    <h4>Autres champs de la table</h4>
    ${EXTRA.map(([k, v]) => `<div class="fld"><label>${esc(k)}</label><div class="v">${esc(v)}</div></div>`).join('')}
  </div>
  <div class="dr-foot"><button class="btn line" title="Place le curseur de Grist sur cette ligne">${ic('open')}Ouvrir dans Grist</button><span class="spacer"></span><button class="btn danger" ${ro}>${ic('trash')}Supprimer</button></div></aside>`;
}

// ---------- Fenêtre de correspondance ----------
function mappingWindow() {
  const R = [
    ['Titre', true, 'Titre', 'Texte', 1], ['Statut', true, 'Statut', 'Choix', 1], ['Responsable', false, 'Responsable', 'Référence', 1],
    ['Début', false, S.noStart ? '' : 'Début', 'Date', !S.noStart], ['Échéance', false, 'Échéance', 'Date', 1], ['Priorité', false, 'Priorité', 'Choix', 1],
    ['Étiquettes', false, 'Étiquettes', 'Liste de choix', 1], ['Tâche parente', false, 'Tâche parente', 'Référence', 1], ['Groupe', false, 'Phase', 'Choix', 0],
    ['Avancement', false, 'Avancement', 'Numérique', 1], ['Ordre', false, '', 'Numérique', 0], ['Description', false, 'Description', 'Texte', 1],
  ];
  const hints = { Début: 'Sans cette colonne, la Chronologie est grisée.', Ordre: 'Sans cette colonne, on ne peut pas réordonner les cartes dans une colonne du kanban.', Groupe: 'Proposée d\'après son nom et son type : à confirmer.' };
  const rows = R.map(([role, req, col, ty, rec]) => `<div class="map-row"><div class="role">${role}${req ? '<span class="req" title="Obligatoire">*</span>' : ''}</div>
    <button class="sel ${col ? '' : 'empty'}">${col ? esc(col) : '— Choisir … —'}<span class="ty">${col ? ty : ''}</span>${rec ? `<span class="badge-ok">${ic('check')}Reconnue</span>` : ''}${ic('down')}</button>${!col && hints[role] ? `<div class="hint">${hints[role]}</div>` : ''}${col && !rec && hints[role] ? `<div class="hint">${hints[role]}</div>` : ''}</div>`).join('');
  return `<div class="scrim"><div class="win" role="dialog" aria-modal="true" aria-labelledby="wt"><div class="win-h"><h2 id="wt">Relier votre tableau</h2><button class="btn icon" data-act="screen" data-v="tableau" aria-label="Fermer">${ic('close')}</button></div>
  <div class="win-b"><p>Tuesday s'adapte à votre table : choisissez-la, puis vérifiez quelle colonne joue quel rôle. Rien n'est recopié.</p>
    <div class="map-row" style="border-bottom:0"><div class="role">Table</div><button class="sel">${ic('search')}Tâches du projet<span class="ty">42 lignes</span>${ic('down')}</button></div>${rows}
    <div class="note">${ic('info')} Tuesday pourra modifier : Statut, Responsable, Début, Échéance, Priorité, Avancement. Les autres colonnes ne sont que lues.</div></div>
  <div class="win-f"><button class="btn line" data-act="screen" data-v="tableau">Annuler</button><button class="btn primary" data-act="screen" data-v="tableau">Enregistrer le projet</button></div></div></div>`;
}

// ---------- Démarrage et explorateur GFS ----------
function startScreen() {
  return `<div class="tb"><span class="proj" style="display:flex;align-items:center;gap:6px;padding:0 9px">${ic('project')}Tuesday</span></div><div class="center"><div class="empty">
  <h2>Aucun projet dans ce document</h2><p>Reliez une table que vous avez déjà : vos données restent où elles sont. Rien n'est créé sans votre accord.</p>
  <div class="tables"><div>${ic('table')}<span>Tâches du projet</span><span class="muted">42 lignes</span><button class="btn primary" data-act="screen" data-v="correspondance">Relier</button></div><div>${ic('table')}<span>Actions de la direction</span><span class="muted">118 lignes</span><button class="btn line" data-act="screen" data-v="correspondance">Relier</button></div><div>${ic('table')}<span>Équipe</span><span class="muted">6 lignes</span><button class="btn line" data-act="screen" data-v="correspondance">Relier</button></div></div>
  <div class="row"><button class="btn line" title="Crée une table de tâches après votre accord">Créer un modèle de départ…</button></div></div></div>`;
}
function explorer() {
  const r = (icon, cls, name, type, app, when, me) => `<div class="ex-row ${me ? 'me' : ''}"><span class="${cls}">${ic(icon, 'ex-ico')}</span><span class="ellipsis"><b>${name}</b></span><span class="typ">${type}</span><span class="muted ellipsis">${app}</span><span class="muted">${when}</span></div>`;
  return `<div class="ex-head"><h2>Fichiers</h2><label class="search">${ic('search')}<input placeholder="Rechercher un fichier…" aria-label="Rechercher un fichier"></label><span class="spacer"></span><div class="seg"><button aria-pressed="true">Tous</button><button aria-pressed="false">Projets</button><button aria-pressed="false">Documents</button></div></div>
  <div class="zone ex-list"><div class="ex-row head"><span></span><span>Nom</span><span>Type</span><span>Application</span><span>Modifié</span></div>
  ${r('project', 'ty-neutral', 'Refonte du site de la direction', 'Projet', 'Tuesday', 'il y a 2 h', true)}${r('project', 'ty-neutral', 'Suivi des marchés 2026', 'Projet', 'Tuesday', 'hier')}
  ${r('doc', 'ty-doc', 'Courrier de relance', 'Document', 'Publipostage+', '30 oct.')}${r('grid', 'ty-grid', 'Tableau des élus', 'Grille', 'Publipostage+', '28 oct.')}${r('form', 'ty-neutral', 'Inscriptions au séminaire', 'Formulaire', 'Form+', '27 oct.')}${r('bolt', 'ty-neutral', 'Relance automatique', 'Automatisme', 'Automation+', '22 oct.')}</div>`;
}

// ---------- Menus ----------
function menuHtml() {
  const m = S.menu; if (!m) return '';
  const it = (label, act, v, checked, extra = '') => `<button class="it" role="menuitem" ${checked != null ? `role="menuitemradio" aria-checked="${checked}"` : ''} data-act="${act}" data-v="${v}" ${extra}>${label}</button>`;
  let body = ''; let pos = 'top:44px;right:8px';
  if (m.startsWith('statut:')) { const id = +m.split(':')[1]; const t = TASKS.find((x) => x.id === id); body = STATUS.map((s) => it(pill(s.k), 'setstatus', `${id}:${s.k}`, t.s === s.k)).join(''); pos = `top:${S.menuY || 120}px;left:${S.menuX || 240}px`; }
  if (m === 'projet') { body = `<h5>Projets du document</h5>${it('Refonte du site de la direction', 'noop', '', true)}${it('Suivi des marchés 2026', 'noop', '', false)}<hr>${it('Relier les colonnes…', 'screen', 'correspondance')}${it('Nouveau projet…', 'screen', 'demarrage', null, S.ro ? 'disabled' : '')}`; pos = 'top:44px;left:10px'; }
  if (m === 'filtre') { body = `<h5>Filtres rapides</h5>${it('Mes tâches', 'filter', 'mine', S.filters.mine)}${it('En retard', 'filter', 'late', S.filters.late)}<hr><h5>Ajoutés à ceux de la vue Grist, jamais à leur place</h5>`; pos = 'top:44px;right:90px'; }
  if (m === 'groupe') { body = `<h5>Grouper par</h5>${it('Phase', 'group', 'g', S.groupBy === 'g')}${it('Statut', 'group', 's', S.groupBy === 's')}${it('Responsable', 'group', 'w', S.groupBy === 'w')}`; pos = 'top:44px;right:50px'; }
  if (m === 'sansdate') { body = `<h5>À planifier : glissez sur un jour</h5>${TASKS.filter((t) => !t.e && !t.par).map((t) => it(esc(t.t), 'open', t.id)).join('')}`; pos = 'top:88px;right:12px'; }
  if (m === 'plus') { body = `${it('Dupliquer', 'noop', '', null, S.ro ? 'disabled' : '')}${it('Ouvrir dans Grist', 'noop', '')}${it('Insérer la carte dans un document… <span class="tag">V2</span>', 'noop', '', null, 'disabled')}<hr>${it('Supprimer…', 'noop', '', null, S.ro ? 'disabled' : '')}`; pos = 'top:40px;right:40px'; }
  return `<div class="menu" role="menu" style="${pos}">${body}</div>`;
}

// ---------- Rendu ----------
function render() {
  const f = $('#frame'); const [w, h] = S.size.split('x');
  f.style.width = w + 'px'; f.style.height = h + 'px'; f.dataset.bar = S.bar;
  document.documentElement.dataset.theme = S.theme;
  let inner = '';
  const list = visible();
  const sc = S.screen;
  if (typeof ONB !== 'undefined' && ONB.has(sc)) inner = ONB.render(sc); // écrans du premier lancement : onboarding.js
  else if (sc === 'demarrage') inner = startScreen();
  else if (sc === 'explorateur') inner = explorer();
  else {
    const base = sc === 'fiche' || sc === 'correspondance' ? 'tableau' : sc;
    const v = base === 'kanban' ? viewKanban(list) : base === 'calendrier' ? viewCalendrier(list) : base === 'chronologie' ? viewChrono(list) : viewTableau(list);
    inner = toolbar().replace(/aria-selected="true"/g, (m0) => m0) + `<div class="body">${v}${sc === 'fiche' ? drawer() : ''}${sc === 'correspondance' ? mappingWindow() : ''}${menuHtml()}${S.toast || ''}</div>`;
  }
  const bar = `<div class="gfs-bar" aria-label="Barre de Grist Factory Suite (simulation)"><button title="Fichiers" data-act="screen" data-v="explorateur">${ic('folder')}</button><button title="Apps et extensions">${ic('apps')}</button><button title="Langue">${ic('globe')}</button><button title="Position de la barre" data-act="nextbar">${ic('move')}</button></div>`;
  f.innerHTML = `<div class="app">${inner}</div>${bar}`;
  const tl = $('#tlw'); if (tl) tl.scrollLeft = +tl.dataset.left;
  document.querySelectorAll('[data-screen]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.screen === S.screen)));
  document.querySelectorAll('[data-size]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === S.size)));
  document.querySelectorAll('[data-bar]').forEach((b) => { if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.dataset.bar === S.bar)); });
  document.querySelectorAll('[data-theme-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeBtn === S.theme)));
  const q = $('#q'); if (q && S.searching) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
}
function toast(msg, undo) { S.toast = `<div class="toast" role="status"><span>${esc(msg)}</span>${undo ? '<button data-act="undo">Annuler</button>' : ''}</div>`; S.undo = undo ? [undo] : []; render(); clearTimeout(S.tt); S.tt = setTimeout(() => { S.toast = ''; render(); }, 5000); }

// ---------- Actions ----------
const A = {
  screen: (v) => { S.screen = v; S.menu = null; if (v === 'fiche' && !S.sel) S.sel = 1; },
  menu: (v, e) => { if (S.menu === v) { S.menu = null; return; } S.menu = v; if (v.startsWith('statut:')) { const r = e.target.closest('button').getBoundingClientRect(); const fr = $('#frame').getBoundingClientRect(); S.menuX = Math.min(r.left - fr.left, fr.width - 210); S.menuY = Math.min(r.bottom - fr.top + 2, fr.height - 200); } },
  search: () => { S.searching = true; },
  unchip: (v) => { if (v === 'q') { S.q = ''; S.searching = false; } else S.filters[v] = false; },
  filter: (v) => { S.filters[v] = !S.filters[v]; },
  group: (v) => { S.groupBy = v; S.menu = null; },
  fold: (v) => { S.collapsed.has(v) ? S.collapsed.delete(v) : S.collapsed.add(v); },
  twist: (v) => { const n = +v; S.expanded.has(n) ? S.expanded.delete(n) : S.expanded.add(n); },
  open: (v) => { S.sel = +v; S.screen = 'fiche'; S.menu = null; },
  closedrawer: () => { S.screen = 'tableau'; S.menu = null; },
  setstatus: (v) => { const [id, k] = v.split(':'); const t = TASKS.find((x) => x.id === +id); const old = t.s; t.s = k; S.menu = null; toast(`« ${t.t} » est passée à « ${stOf(k).n} »`, () => { t.s = old; }); },
  add: () => { if (!S.ro) toast('La ligne est ajoutée dans Grist (maquette : rien n\'est écrit)', null); },
  month: (v) => { S.month.m += +v; if (S.month.m > 11) { S.month.m = 0; S.month.y++; } if (S.month.m < 0) { S.month.m = 11; S.month.y--; } },
  today: () => { S.month = { y: 2026, m: 10 }; },
  zoom: (v) => { S.zoom = v; },
  undo: () => { (S.undo.pop() || (() => {}))(); S.toast = ''; },
  nextbar: () => { const o = ['left', 'top', 'right', 'bottom']; S.bar = o[(o.indexOf(S.bar) + 1) % 4]; },
  noop: () => { S.menu = null; },
};

document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-screen],[data-size],[data-bar],[data-theme-btn]');
  if (c && c.tagName === 'BUTTON' && c.closest('.mq-top')) {
    if (c.dataset.screen) { S.screen = c.dataset.screen; S.menu = null; }
    if (c.dataset.size) S.size = c.dataset.size;
    if (c.dataset.bar) S.bar = c.dataset.bar;
    if (c.dataset.themeBtn) S.theme = c.dataset.themeBtn;
    return render();
  }
  const el = e.target.closest('[data-act]');
  if (!el) { if (S.menu && !e.target.closest('.menu')) { S.menu = null; render(); } return; }
  if (el.matches('.tbl-row') && e.target.closest('button[data-act="menu"],button[data-act="twist"]')) return handle(e.target.closest('button[data-act]'), e);
  handle(el, e);
});
function handle(el, e) { const fn = A[el.dataset.act]; if (!fn) return; e.stopPropagation(); fn(el.dataset.v, e); if (el.dataset.act !== 'setstatus' && el.dataset.act !== 'add' && el.dataset.act !== 'undo') render(); else if (el.dataset.act === 'undo') render(); }
document.addEventListener('input', (e) => { if (e.target.id === 'q') { S.q = e.target.value; render(); } });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (S.menu) S.menu = null; else if (S.screen === 'fiche' || S.screen === 'correspondance') S.screen = 'tableau'; else if (S.searching && !S.q) S.searching = false; render(); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.tbl-row')) { e.preventDefault(); A.open(e.target.dataset.v); render(); }
  if (e.key === 'z' && (e.ctrlKey || e.metaKey) && S.undo.length) { A.undo(); render(); }
});
// glisser-déposer (kanban et calendrier)
let dragId = null;
document.addEventListener('dragstart', (e) => { const c = e.target.closest('[data-id]'); if (!c || S.ro) return; dragId = +c.dataset.id; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(dragId)); });
document.addEventListener('dragend', () => { dragId = null; document.querySelectorAll('.dragging,.over').forEach((n) => n.classList.remove('dragging', 'over')); });
document.addEventListener('dragover', (e) => { const t = e.target.closest('.col,.day'); if (t && dragId) { e.preventDefault(); document.querySelectorAll('.over').forEach((n) => n.classList.remove('over')); t.classList.add('over'); } });
document.addEventListener('drop', (e) => {
  const t = e.target.closest('.col,.day'); if (!t || !dragId) return; e.preventDefault();
  const task = TASKS.find((x) => x.id === dragId); dragId = null;
  if (t.dataset.col) { const old = task.s; task.s = t.dataset.col; toast(`« ${task.t} » est passée à « ${stOf(task.s).n} »`, () => { task.s = old; }); }
  if (t.dataset.date) { const ob = task.b; const oe = task.e; const span = task.b && task.e ? day(task.e) - day(task.b) : 0; task.e = t.dataset.date; if (task.b) task.b = iso(day(task.e) - span); toast(`« ${task.t} » est replanifiée au ${fdate(task.e)}`, () => { task.b = ob; task.e = oe; }); }
});

// pupitre
const url = new URLSearchParams(location.search);
for (const k of ['screen', 'size', 'bar', 'theme']) if (url.get(k)) S[k === 'screen' ? 'screen' : k] = url.get(k);
if (url.get('ro') === '1') { S.ro = true; $('#ro').checked = true; }
if (url.get('nostart') === '1') { S.noStart = true; $('#nostart').checked = true; }
if (url.get('zoom')) S.zoom = url.get('zoom');
$('#ro').addEventListener('change', (e) => { S.ro = e.target.checked; render(); });
$('#nostart').addEventListener('change', (e) => { S.noStart = e.target.checked; render(); });
render();
