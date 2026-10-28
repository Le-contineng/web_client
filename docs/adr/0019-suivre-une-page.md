# 0019 — Suivre une page

Statut : Acceptée
Date : 2026-10-28
Complète : ADR 0024 du backend (suivre une page)

## Contexte

L'API permet de suivre une page organisatrice : nombre d'abonnés public, liste des abonnés jamais exposée, onglet « Abonnements » à côté du fil général, notifications des nouveaux événements principaux. Le front doit l'afficher sans jamais mettre un état personnel dans un cache partagé (ADR 0004).

## Décision

- **Dans le module `pages`** : Server Action `setFollowAction` (état voulu, jamais une bascule ; entrées validées par Zod, compte obligatoire), composant `FollowButton` dans `presentation/components/`, lecture de mes abonnements. Les autres modules et les espaces l'utilisent par `index.ts` ou `server.ts`.
- **L'état personnel n'entre jamais dans un cache partagé** : `/p/[slug]` est aujourd'hui rendue à chaque requête (elle lit déjà la session pour « Gérer la page »), si bien que « Suivre / Abonné » vient avec la lecture de la page (`viewer.following`, absent sans session). Le jour où la page sera mise en cache, cet état devra être lu à part.
- **Où apparaît le bouton** : sur `/p/[slug]`, puis à côté du nom de l'organisateur sur la fiche et la carte d'un événement. Il s'affiche aussi pour les membres de la page. Une personne non connectée qui clique est envoyée vers la connexion, puis ramenée à la page.
- **« Pages suivies »** dans `/profile`. La liste des abonnés d'une page n'est affichée nulle part, pas même dans l'espace de gestion de la page.
- **Fil** : un onglet « Abonnements » à côté du fil général, réservé aux personnes connectées ; le fil général ne change pas. Sans abonnement, l'onglet propose des pages à suivre.
- **`robots.txt`** : toute nouvelle adresse personnelle (onglet « Abonnements » s'il a sa propre adresse) rejoint les zones interdites.

## Alternatives

- **Fil général réordonné selon les pages suivies** : écarté avec l'API (ADR 0024 du backend) ; il rendrait le fil propre à chacun.
- **État « Abonné » lu à part dès maintenant** : inutile tant que la page n'est pas mise en cache, et coûterait un appel de plus.

## Conséquences

- Après « Suivre », le bouton change aussitôt (mise à jour optimiste) ; la page est relue pour mettre à jour le nombre d'abonnés.
- Suivre exige une adresse confirmée : sinon, un message invite à la confirmer.
- Pas de réglage des notifications page par page : on cesse de suivre la page, ou on coupe les notifications de l'appareil.
