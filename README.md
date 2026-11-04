# Tuesday

Un widget de gestion de projet pour [Grist](https://www.getgrist.com), fait pour [Grist Factory Suite (GFS)](https://github.com/lombre33/grist-widget-GFS). Inspiré de monday.com pour sa clarté, volontairement bien plus simple : **on le branche sur une table Grist existante** et on voit son travail comme un projet (tableau, kanban, calendrier, chronologie), sans rien recréer.

> État : **V1 codée** (03/11/2026, version 0.1.7) : tableau, kanban, chronologie, calendrier du kit (Calendar+), fiche, premier lancement. 214 essais unitaires, 32 essais navigateur et 10 essais dans un vrai Grist. **Pas encore mesurée dans un vrai Grist** : voir [`docs/etat-v1.md`](docs/etat-v1.md).

## Lire

| Quoi | Où |
|---|---|
| Cahier des charges | [`docs/cahier-des-charges.md`](docs/cahier-des-charges.md) |
| Étude de l'existant (widgets Grist, Monday, ClickUp) | [`docs/etude-existant.md`](docs/etude-existant.md) |
| Intégration à la suite (calendrier à part, tables, liens entre apps) | [`docs/integration-suite.md`](docs/integration-suite.md) |
| **État de la V1 (à lire en premier)** | [`docs/etat-v1.md`](docs/etat-v1.md) |
| Maquette V1 (page à ouvrir, captures) | [`maquettes/`](maquettes/LISEZ-MOI.md) |

## Principes

- **UX d'abord** : quatre vues au premier jour, une action principale par écran, aucun réglage inutile.
- **Avec la donnée, pas à la place** : une correspondance de colonnes choisie dans l'interface ; statuts, couleurs et personnes viennent de Grist.
- **Dans la suite GFS** : un projet est un fichier de l'explorateur ; kit commun, langue et barre de GFS, grisé jamais masqué.
- **Pas de calcul dans le widget** ; pas de formulaires, d'automatisations ni de tableaux de bord riches (ils sont dans Form+, Automation+, Grist-BI).

## Essayer

Ouvrir `index.html` servi par n'importe quel serveur statique (`python3 -m http.server`) : hors de Grist, l'app tourne en **démonstration** (données fictives en mémoire, rien d'écrit). Dans Grist : ajouter un widget personnalisé, adresse de la page GitHub Pages, accès complet au document.

```
node --test "test/*.test.mjs"      # essais unitaires (cœur, app, textes, hygiène)
node test/navigateur/essais.cjs    # essais dans Chromium à 700 × 400 (Playwright)
node outils/versionner.mjs         # après tout changement de JS ou de CSS (importmap, ?v=, CSP)
```

## Déploiement

Pages statiques sur GitHub Pages (`.nojekyll` à la racine), sans étape de construction. Utilisé surtout sur l'instance Grist de la DINUM.

## Dépôt

`kit/` est un sous-module : le kit commun de GFS (`lombre33/grist-factory-kit`, commit `c0c8660`, v0.2.0). Après un clone : `git submodule update --init`.

Licence : GNU GPL 3.0 (voir `LICENSE`).
