// La roue des Réglages, en haut à droite (charte Grist Factory) : qui je suis, la langue et le thème, l'automatisation (grisée avec sa raison) et les crédits.
import { I18n } from '../../kit/js/i18n.js';
import { Theme } from '../../kit/js/theme.js';
import { Dialogs } from '../../kit/js/dialogs.js';
import { GfsLink } from '../../kit/js/gfs-link.js';
import { ouvrirMenu } from './menu.js';
import { personnesPossibles } from './champs.js';

const t = (cle, vars) => I18n.t(cle, vars);

export function elementsReglages(app) {
  const hebergee = GfsLink.hosted;
  const reconnue = app.moiReconnu !== null;
  const raisonMoi = reconnue ? t('projet.reconnue') : null;
  return [
    { titre: t('projet.jeSuis') },
    ...personnesPossibles(app).slice(0, 30).map(p => ({ label: p.label, valeur: ['moi', p.id], actif: app.moi === p.id, grise: reconnue, raison: raisonMoi })),
    ...(app.reglages.moi !== null || reconnue ? [{ label: t('projet.personne'), valeur: ['moi', null], grise: reconnue, raison: raisonMoi }] : []),
    { separateur: true }, { titre: t('projet.apparence') },
    { label: 'Français', valeur: ['langue', 'fr'], actif: I18n.language === 'fr', grise: hebergee, raison: hebergee ? t('projet.langueGfs') : null },
    { label: 'English', valeur: ['langue', 'en'], actif: I18n.language === 'en', grise: hebergee, raison: hebergee ? t('projet.langueGfs') : null },
    { label: t('projet.clair'), valeur: ['theme', 'light'], actif: Theme.choice === 'light' }, { label: t('projet.sombre'), valeur: ['theme', 'dark'], actif: Theme.choice === 'dark' }, { label: t('projet.systeme'), valeur: ['theme', 'system'], actif: Theme.choice === 'system' },
    { separateur: true }, { label: t('projet.automatiser'), valeur: ['automatiser'], grise: true, raison: t('projet.automatiserRaison') },
    { label: t('reglages.credits'), valeur: ['credits'] },
  ];
}

// Les crédits : version, éditeur, site, licence (le texte de la Bio de Publipostage+ est provisoire chez lui : il n'est pas repris ici sans l'accord du porteur).
export function textCredits(app, version) {
  return [
    `${t('reglages.version')} : ${version} · ${app.port.mode === 'demo' ? t('demo.titre') : 'Grist'}`,
    `${t('reglages.auteur')} : Grist Factory`,
    `${t('reglages.site')} : grist-factory.fr`,
    `${t('reglages.licence')} : GNU GPL v3.0`,
  ].join('\n');
}

export async function choisirReglage(app, [type, v], version) {
  if (type === 'moi') app.regler({ moi: v });
  else if (type === 'langue') { I18n.setLanguage(v); I18n.store(v); }
  else if (type === 'theme') { Theme.set(v); app.emettre(); }
  else if (type === 'credits') await Dialogs.notice({ title: 'Tuesday', message: textCredits(app, version) });
}

export function menuReglages(ancre, app, version) {
  ouvrirMenu(ancre, () => elementsReglages(app), it => it.valeur && choisirReglage(app, it.valeur, version), { large: true, etiquette: t('reglages.titre') });
}
