# Tuesday

Un widget de gestion de projet pour [Grist](https://www.getgrist.com), fait pour [Grist Factory Suite (GFS)](https://github.com/lombre33/grist-widget-GFS). Inspiré de monday.com pour sa clarté, volontairement bien plus simple : **on le branche sur une table Grist existante** et on voit son travail comme un projet (tableau, kanban, calendrier, chronologie), sans rien recréer.

> État : **cahier des charges et maquette V1** (02/11/2026). Aucun code de l'app pour l'instant.

## Lire

| Quoi | Où |
|---|---|
| Cahier des charges | [`docs/cahier-des-charges.md`](docs/cahier-des-charges.md) |
| Étude de l'existant (widgets Grist, Monday, ClickUp) | [`docs/etude-existant.md`](docs/etude-existant.md) |
| Maquette V1 (page à ouvrir, captures) | [`maquettes/`](maquettes/LISEZ-MOI.md) |

## Principes

- **UX d'abord** : quatre vues au premier jour, une action principale par écran, aucun réglage inutile.
- **Avec la donnée, pas à la place** : une correspondance de colonnes choisie dans l'interface ; statuts, couleurs et personnes viennent de Grist.
- **Dans la suite GFS** : un projet est un fichier de l'explorateur ; kit commun, langue et barre de GFS, grisé jamais masqué.
- **Pas de calcul dans le widget** ; pas de formulaires, d'automatisations ni de tableaux de bord riches (ils sont dans Form+, Automation+, Grist-BI).

## Déploiement

Pages statiques sur GitHub Pages (`.nojekyll` à la racine), sans étape de construction. Utilisé surtout sur l'instance Grist de la DINUM.

## Dépôt

`kit/` est un sous-module : le kit commun de GFS (`lombre33/grist-factory-kit`, commit `c0c8660`, v0.2.0). Après un clone : `git submodule update --init`.

Licence : GNU GPL 3.0 (voir `LICENSE`).
