# 0004 — Stratégie de cache

Statut : Acceptée
Date : 2026-10-10

## Contexte

Next.js 16 propose un nouveau modèle de cache, les Cache Components (directive `"use cache"`), à côté des anciens réglages (`revalidate`, `fetch` avec options de cache).
Mélanger les deux modèles rend le comportement difficile à prévoir.

## Décision

Activer `cacheComponents` dans `next.config.ts` dès le départ et n'utiliser que ce modèle : une donnée est mise en cache uniquement si une fonction ou un composant porte explicitement `"use cache"`.

## Alternatives

- Ancien modèle (`revalidate`, options de `fetch`) : plus documenté en ligne, mais en voie de remplacement.

## Conséquences

- Par défaut, rien n'est mis en cache : on choisit consciemment ce qui l'est.
- Les données propres à un utilisateur ne doivent jamais être placées dans un cache partagé.
- Certains tutoriels en ligne ne s'appliqueront pas tels quels.

## Mise à jour du 2026-10-27

Les pages publiques appelaient l'API à chaque affichage. Sont désormais mis en cache, avec le profil `publicList` de `next.config.ts` (30 s, servi au plus 2 min pendant le renouvellement) :

- la liste des pages (filtre et carrousel de l'accueil) ;
- les campagnes en cours ;
- le fil des visiteurs sans compte. Celui d'une personne connectée reste lu à chaque fois, car il porte ce qu'elle a fait (`viewer`).

Ces lectures se font sans jeton (`anonymous`) : un cache partagé ne lit jamais de cookie. Un délai d'expiration sous 5 minutes les garde hors du build : l'API n'est pas appelée au déploiement. Les Server Actions qui changent ces données appellent `revalidatePath("/", "layout")` ou `updateTag`.
