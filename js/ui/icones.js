// Icônes au trait (charte) : des tracés SVG simples, hérités de la couleur du texte. Construites par createElementNS, jamais par une chaîne HTML.
const NS = 'http://www.w3.org/2000/svg';
const TRACES = {
  tableau: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  kanban: ['M4 5h4v14H4z', 'M10 5h4v9h-4z', 'M16 5h4v12h-4z'],
  chronologie: ['M4 7h9', 'M8 12h12', 'M6 17h8'],
  calendrier: ['M5 6h14v14H5z', 'M5 10h14', 'M9 4v4', 'M15 4v4'],
  plus: ['M12 5v14', 'M5 12h14'],
  roue: ['M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z', 'M10.3 4.3a1.7 1.7 0 0 1 3.4 0a1.7 1.7 0 0 0 2.6 1.1a1.7 1.7 0 0 1 2.4 2.4a1.7 1.7 0 0 0 1.1 2.6a1.7 1.7 0 0 1 0 3.4a1.7 1.7 0 0 0-1.1 2.6a1.7 1.7 0 0 1-2.4 2.4a1.7 1.7 0 0 0-2.6 1.1a1.7 1.7 0 0 1-3.4 0a1.7 1.7 0 0 0-2.6-1.1a1.7 1.7 0 0 1-2.4-2.4a1.7 1.7 0 0 0-1.1-2.6a1.7 1.7 0 0 1 0-3.4a1.7 1.7 0 0 0 1.1-2.6a1.7 1.7 0 0 1 2.4-2.4a1.7 1.7 0 0 0 2.6-1.1z'],
  recherche: ['M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14z', 'M16.5 16.5L21 21'],
  filtre: ['M4 5h16l-6 8v6l-4-2v-4z'],
  reglages: ['M4 7h10', 'M18 7h2', 'M4 17h2', 'M10 17h10', 'M16 5v4', 'M8 15v4'],
  annuler: ['M9 7L4 12l5 5', 'M4 12h10a6 6 0 0 1 6 6'],
  retablir: ['M15 7l5 5-5 5', 'M20 12H10a6 6 0 0 0-6 6'],
  bas: ['M6 9l6 6 6-6'],
  droite: ['M9 6l6 6-6 6'],
  gauche: ['M15 6l-6 6 6 6'],
  croix: ['M6 6l12 12', 'M18 6L6 18'],
  coche: ['M5 12.5l4.5 4.5L19 7.5'],
  corbeille: ['M5 7h14', 'M10 4h4', 'M7 7l1 13h8l1-13', 'M10 11v6', 'M14 11v6'],
  personne: ['M12 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8z', 'M5 20a7 7 0 0 1 14 0'],
  cadenas: ['M6 11h12v9H6z', 'M8 11V8a4 4 0 0 1 8 0v3'],
  plus_menu: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  lien: ['M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1', 'M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1'],
  sous: ['M6 5v10a3 3 0 0 0 3 3h9', 'M15 15l3 3-3 3'],
  info: ['M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16z', 'M12 11v5', 'M12 8h.01'],
};

export function icone(nom, taille = 16) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(taille));
  svg.setAttribute('height', String(taille));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'tu-i');
  for (const d of TRACES[nom] ?? []) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    svg.append(p);
  }
  return svg;
}

export const NOMS_ICONES = Object.keys(TRACES);
