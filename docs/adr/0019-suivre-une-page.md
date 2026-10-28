# 0019 — Suivre une page

Statut : Acceptée
Date : 2026-10-28
Complète : ADR 0024 du backend (suivre une page)

## Contexte

L'API permet de suivre une page organisatrice : nombre d'abonnés public, liste des abonnés jamais exposée, onglet « Abonnements » à côté du fil général, notifications des nouveaux événements principaux. Le front doit l'afficher sans perdre le cache des pages publiques (ADR 0004) : `/p/[slug]` et les fiches d'événement sont les mêmes pour tout le monde.

## Décision

- **Dans le module `pages`** : Server Actions `followPage` et `unfollowPage` (entrées validées par Zod, compte obligatoire), composant `FollowButton` dans `presentation/components/`, lecture de mes abonnements. Les autres modules et les espaces l'utilisent par `index.ts` ou `server.ts`.
- **L'état personnel est séparé de la page** : le contenu de `/p/[slug]` et le nombre d'abonnés restent communs ; « Suivre / Suivi » est lu à part, pour la personne connectée, et n'entre jamais dans un cache partagé.
- **Où apparaît le bouton** : sur `/p/[slug]`, puis à côté du nom de l'organisateur sur la fiche et la carte d'un événement. Il s'affiche aussi pour les membres de la page. Une personne non connectée qui clique est envoyée vers la connexion, puis ramenée à la page.
- **« Pages suivies »** dans `/profile`. La liste des abonnés d'une page n'est affichée nulle part, pas même dans l'espace de gestion de la page.
- **Fil** : un onglet « Abonnements » à côté du fil général, réservé aux personnes connectées ; le fil général ne change pas. Sans abonnement, l'onglet propose des pages à suivre.
- **`robots.txt`** : toute nouvelle adresse personnelle (onglet « Abonnements » s'il a sa propre adresse) rejoint les zones interdites.

## Alternatives

- **Fil général réordonné selon les pages suivies** : écarté avec l'API (ADR 0024 du backend) ; il rendrait le fil propre à chacun.
- **État « Suivi » rendu avec la page** : plus simple, mais la page deviendrait personnelle et ne pourrait plus être mise en cache.

## Conséquences

- Le bouton peut apparaître une fraction de seconde après la page, le temps de lire l'état personnel.
- Pas de réglage des notifications page par page : on cesse de suivre la page, ou on coupe les notifications de l'appareil.
